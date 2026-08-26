const Listing = require('../Models/listing.js');
const Booking = require('../Models/booking.js');
const Payment = require('../Models/payment.js');
const razorPay = require('../paymentConfig.js')
require('dotenv').config();
var { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const { boolean, date } = require('joi');

module.exports.createBooking = async (req, res, next)=> {

try {
    const {startDate , endDate , totalPrice, guests} =  req.body;
    const userId = req.user._id;
    const listing = await Listing.findById(req.params.id);
    
    if(!listing) {
        return res.status(404).json({message: "Listing not found"});
    }

    const rk = process.env.RAZORPAY_KEY_ID;
    const userDetails = req.user;
    const faradisetripCompany = {  name : "Faradise Trip", description : "Faradise trip: Bread n Breakfast MarketPlace", address : "Faradise Trip Pvt. Ltd. Rookree Haridwar"  }



    const checkIsDatesAlreadyBooked = await Booking.find({
     listing : listing.id, 
     status : "confirmed",
     startDate : { $lte : endDate, },
     endDate : { $gte : startDate }
    })

    if(checkIsDatesAlreadyBooked.length > 0){
        return res.status(404).json({message: "These dates are already booked on dates you have selected."});
    }


    //check wheather pending booking already exits or not
    const checkPendingbookingForUser =  await Booking.find({
        listing : listing.id,
        user : userId,
        startDate : startDate,
        endDate : endDate,
        status : "pending",
        guests : guests,
    })

    if(checkPendingbookingForUser.length > 0 ){
        //pending booking order found
        const pendingBookingDetails = checkPendingbookingForUser[0];
        let bookingdetails = pendingBookingDetails;

       const paymentDetails = await Payment.find({
            booking : pendingBookingDetails.id,
            status : "pending",
            user : userId
       })


       if(paymentDetails.length > 0){
         const PaymentRecord =  paymentDetails[0];

         return res.status(200).json({faradisetripCompany, PaymentRecord, userDetails, rk, bookingdetails, message : "Booking order fetched sucessfully which was initialized earlier"});
       }else{
            //update booking record to failed if payment is failed or does not exists
            await Booking.findByIdAndUpdate( pendingBookingDetails.id, {
                status : "failed"
            }) 
            console.log("updating booking record to failed as payment record is failed or does not exists");
       }
    }

//create new booking if pending booking does not exits
    const createdBooking = await Booking.create({
        listing : listing.id,
        user : userId,
        startDate : startDate,
        endDate : endDate,
        totalPrice : totalPrice,
        guests : guests,
        status : "pending"
    })


    // create razor pay order  
    const razorPayOrder = await razorPay.orders.create({
        amount: totalPrice *100,  // Amount is in currency subunits. 
        currency: "INR",
        notes : {
            bookingId : createdBooking.id,
            userId : userId
        }
    });

    // console.log("razorPayOrder :",  razorPayOrder);



    //create the payment record with pending state
    const PaymentRecord = await Payment.create({
        booking : createdBooking.id,
        user : userId,
        amount : totalPrice,
        currency : razorPayOrder.currency,
        razorpayOrderId : razorPayOrder.id,
        status : "pending"
    })


    // update payment Id in booking record 
    await Booking.findByIdAndUpdate(createdBooking.id, { payment : PaymentRecord.id});

    let bookingdetails = createdBooking;

    res.status(200).json({faradisetripCompany, PaymentRecord, userDetails, rk, bookingdetails, message: "Booking order initialized successful"});

}
catch(error){
    console.log("Error : ", error);
    return res.status(400).json({message : error.description || "Internal Server Error" })
 }
}



module.exports.verifyPayments = async(req, res, next )=>{
    try{
        const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body;
        const bookingId = req.params.id;
        const userId = req.user._id;

        if(!razorpay_signature && !razorpay_payment_id){
            return res.status(400).json({message : "RazorPay signature or Razorpay payment ID not received on backend"});
        }

        const PaymentRecord = await Payment.find({
            booking : bookingId,
            user : userId
        })
        
        const paymentData = PaymentRecord[0];
        

       const isValidPayment = await validatePaymentVerification({"order_id": paymentData.razorpayOrderId, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);
    
       if(isValidPayment){
        console.log("Payment verification successful");
        return res.status(200).json({ status: 'ok' });
        
       }else{
        console.log("Payment verification failed");

        await Booking.findByIdAndUpdate(bookingId , {
            status : "verification_pending"
        })

        await Payment.findByIdAndUpdate(paymentData.id, {
            status : "verification_pending"
        })


        return res.status(400).json({
            status: "verification_failed",
            message: "Payment verification failed... Booking failed. Please Contact Support if Payment has been deducted" 
        });
       }
    
    }
    catch(error){
        console.error(error);
        next(error);
    }
}


module.exports.getBookedDays = async(req, res)=>{
    try {
        let listingId = req.params.id;
        if(!listingId){
            return res.status(400).json({ message : `Listing Id is not valid or received`});
        }

        let existingListing = await Listing.findById(listingId);

        if(!existingListing){
            return res.status(400).json({ message : `Listing does not exists for which booked days were tried to fetch`});
        }

        const today = new Date();

        // Set today to 00:00:00 local time (IST)
        today.setHours(0, 0, 0, 0);

        // Create a separate date for 150 days from today
        const onefiftyDaysFromToday = new Date(today);
        onefiftyDaysFromToday.setDate(onefiftyDaysFromToday.getDate() + 150);

        const bookings = await Booking.find({
            listing : listingId,
            status : "confirmed",
            startDate : {
                $lte : onefiftyDaysFromToday
            },
            endDate : {
                $gte : today
            }
        })


        //map function on an empty array simply produces: []
        // if(bookings.length == 0){
        //     const bookedDaysRanges = [];
        //     return res.status(200).json({bookedDaysRanges, message : "Booked days fetched. No Already Booked days exists for this listing"});
        // }

        // console.log("Alreday booked Bookings : ", bookings);

        const bookedDaysRanges = bookings.map((booking)=>{

            let Sdate = new Date(booking.startDate);
            let formatedStartDate = Sdate.toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata"
            });

            let Edate = new Date(booking.endDate);
            let formatedEndDate = Edate.toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata"
            });

            return [formatedStartDate, formatedEndDate];
        })

        return res.status(200).json({bookedDaysRanges, message : "Booked days fetched successfully"});

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message : `Error while fetching Booked days : ${error}`});
    }
}



































/*
 const checkIsDatesAlreadyBooked = await Booking.find({
        $or: [
        { listing : listing.id, status : "confirmed", startDate : { $gte : startDate, $lte :  endDate }  },
        { listing : listing.id, status : "confirmed", endDate : { $gte : startDate, $lte :  endDate } },
        { listing : listing.id, status : "confirmed", startDate : { $lte : startDate}, endDate : {$gte : endDate}  }
    ]
    })
*/