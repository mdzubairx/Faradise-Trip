const Review = require('../Models/review.js');
const Listing = require('../Models/listing.js');

module.exports.createNewReview = async(req, res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review (req.body.review); //saving review details to review collection in database
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "review Created sucessfully!!");
    res.redirect(`/listings/${listing.id}`);
}


module.exports.deleteReview = async(req, res)=>{
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted sucessfully!!");
    res.redirect(`/listings/${id}`);
}