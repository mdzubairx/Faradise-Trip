const Listing = require('../Models/listing.js');
const Booking = require('../Models/booking.js');



module.exports.mybookings = async (req, res)=>{

    const userId = req.user._id;

    if(!userId){
        req.flash("error", "User Id not found");
        res.redirect("/listings");
    }

    const userBookings = await Booking.find({
        user : userId,
        status : "confirmed"
    }).populate("listing").populate("payment", "amount currency paymentMethod status paidAt").sort({ createdAt : -1 });


    // console.log(userBookings);
    
    res.render("bookings/mybookings.ejs", { userBookings });
}