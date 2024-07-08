const Listing = require('./Models/listing.js');
const {listingSchema} = require('./schema.js');
const expressError = require('./utils/expressError.js')
const Review = require('./Models/review.js');



module.exports.isLoggedin = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You are not logged in");
       return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectPage =(req, res , next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if( res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing")
       return res.redirect(`/listings/${id}`);
    }
    next();
}



module.exports.validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body); // Server side validation 
     console.log(error);
     if(error){
      throw new expressError(400, error);
      }
    }




module.exports.isReviewAuthor = async(req, res, next)=>{
        let {id , reviewId} = req.params;
        let review = await Review.findById(reviewId);
        if( res.locals.currUser && !review.author.equals(res.locals.currUser._id)){ //we can review.author or review.author._id, its the same thing
            req.flash("error", "You are not the owner of this Review")
           return res.redirect(`/listings/${id}`);
        }
        next();
 }    