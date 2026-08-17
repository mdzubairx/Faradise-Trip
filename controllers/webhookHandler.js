const WebhookEvent = require('../Models/webhookEvent.js');
const Payment = require("../Models/payment.js");
const Booking = require('../Models/booking.js');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')
require('dotenv').config();



async function markEventProcessed(RazorPayEventId) {
    await WebhookEvent.findOneAndUpdate(
        {razorpayEventId : RazorPayEventId},
        {processedAt : new Date()}
    )
}




module.exports.webhookHandler = async (req, res)=>{
    try{
    const webhookBody = req.body;
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.WEBHOOK_SECRET;
    // console.log(req.headers);
    
    // console.log("webhookBody ",webhookBody, " webhookSignature : " , webhookSignature, "webhookSecret : ", webhookSecret);

    const isValidSignatuture = validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret )

    console.log("Signatuture status : ", isValidSignatuture);
    
    if(!isValidSignatuture){
        console.log("Invalid webhook signature");
        return res.status(400).json({message : "Invalid webhook signature"});
    }

    const RazorPayEventId = req.headers["x-razorpay-event-id"];
    // console.log("RazorPayEventId : ", RazorPayEventId);

    if(!RazorPayEventId){
        console.log("RazorPayEventId not found : ", RazorPayEventId);
        return res.status(400).json({message : "Event Id not received in webhook request header"});
    }

    const existingWebhookEvent = await WebhookEvent.find({
        razorpayEventId : RazorPayEventId
    })

    if(existingWebhookEvent[0]){
        console.log("existingWebhookEvent found  : ", existingWebhookEvent[0]);
        if(existingWebhookEvent[0].processedAt){
            console.log(`Event already processed- event id : ${RazorPayEventId} processed at ${existingWebhookEvent[0].processedAt}`);
            return res.status(200).json({message : `Event already processed- event id : ${RazorPayEventId} processed at ${existingWebhookEvent[0].processedAt}`});
        }

        console.log(`Duplicate event - event id : ${RazorPayEventId} -- Unprocessed`);
        
    }else{
        
        //create a new record in webhook event table if record does not exists
        const webhookevent = await WebhookEvent.create({
            razorpayEventId : RazorPayEventId,
            eventType : webhookBody.event
        })
        
        // console.log("New webhookevent record created : ", webhookevent);
    }

    
    //Check which event it is and process it accordingly
    processWebhookEvent(webhookBody);

    //mark event processed
    markEventProcessed(RazorPayEventId);

    return res.status(200).json({ success : "true", message : "webhook received and processed"});
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ status : "failed"});
    }
}



 async function processWebhookEvent(webhookBody) {
    const event = webhookBody.event;
    console.log("Event Received : ", event);
    

    switch (event){
        case "payment.authorized" : 
        handlePaymentAuthorized(webhookBody);
        break; 

        case "payment.captured" : 
        handlePaymentCaptured(webhookBody);
        break;

        case "payment.failed" : 
        handlePaymentFailed(webhookBody);
        break;

        default : 
        handleUnknownEvent(webhookBody);
    }

}

//update the tables with status as payment authorized 
async function handlePaymentAuthorized(webhookBody){
   const paymentDetails = await Payment.find({
    razorpayOrderId : webhookBody.payload.payment.entity.order_id
   })

   if(!paymentDetails){
    console.log("Payment record does not exists", paymentDetails);
    return;
   }

   const paymentRecord = paymentDetails[0];

   if(paymentRecord.status == "success"){
    console.log("Payment webhook already captured" , paymentRecord);    
    return;
   }

   await Payment.findByIdAndUpdate(paymentRecord.id , {
    paymentMethod : webhookBody.payload.payment.entity.method,
    status : "authorized",
    paidAt : new Date(),
    razorpayPaymentId : webhookBody.payload.payment.entity.id
   })

   console.log("Payment Authorized successfully");
   return;
    
}

//update the booking and payment table to completed
async function handlePaymentCaptured(webhookBody){
     const paymentDetails = await Payment.find({
    razorpayOrderId : webhookBody.payload.payment.entity.order_id
   })

   if(!paymentDetails){
    console.log("Payment record does not exists", paymentDetails);
    return;
   }

    const paymentRecord = paymentDetails[0];

    if(paymentRecord.status == "authorized"){
        console.log("Payment already authorized and now capturing it " );
        await Payment.findByIdAndUpdate(paymentRecord.id , {
            ...(paymentRecord.paymentMethod? {} : 
                { paymentMethod : webhookBody.payload.payment.entity.method }
            ),
            status : "success",
            ...(paymentRecord.paidAt? {} : 
                { paidAt : new Date() }
            ),

            ...( paymentRecord.razorpayPaymentId ? {} :
                {razorpayPaymentId : webhookBody.payload.payment.entity.id}
            )
        })
    }else{
        console.log("Payment not authorized but now capturing it directly " );
        await Payment.findByIdAndUpdate(paymentRecord.id , {
            paymentMethod : webhookBody.payload.payment.entity.method, 
            status : "success", 
            paidAt : new Date(),
            razorpayPaymentId : webhookBody.payload.payment.entity.id
        })
    }

    //update booking record to confirm once payment is captured
    await Booking.findByIdAndUpdate( paymentRecord.booking , {
        status : "confirmed"
    })

   console.log("Payment Captured successfully");
   return;
}


//update the booking and payment table to failed
async function handlePaymentFailed(webhookBody){

    const paymentDetails = await Payment.find({
    razorpayOrderId : webhookBody.payload.payment.entity.order_id
   })

   if(!paymentDetails){
    console.log("Payment record does not exists", paymentDetails);
    return;
   }


    const paymentRecord = paymentDetails[0];

   await Payment.findByIdAndUpdate(paymentRecord.id , {
    ...(paymentRecord.paymentMethod? {} : 
        { paymentMethod : webhookBody.payload.payment.entity.method }
    ),
    status : "failed",
    ...( paymentRecord.razorpayPaymentId ? {} :
        {razorpayPaymentId : webhookBody.payload.payment.entity.id}
    )
   })

    //update booking record to failed if payment is failed
    await Booking.findByIdAndUpdate( paymentRecord.booking , {
        status : "failed"
    })   

   console.log("Payment has been Failed");
   return;
}

async function handleUnknownEvent(webhookBody){
    console.log("Event body Received of unhandled event", webhookBody);
    return;
}