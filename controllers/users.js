const User = require('../Models/user.js');
const Listing = require('../Models/listing.js');
const Review = require('../Models/review.js');

module.exports.renderSignUpForm = (req, res)=>{
    res.render("Users/signUp.ejs");
}

module.exports.signUp = async(req, res)=>{
    try{
        let {username , email, password} = req.body;
        let newUser = new User({username , email  })
        let registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err){
              return next(err);
            }
            req.flash("success", "You have registered succesfully");
            res.redirect("/listings");
        })
        
    }  
    catch(error){
        req.flash("error", error.message);
        res.redirect("/signUp");
    }  
}


module.exports.renderLoginForm = (req, res)=>{
    res.render("Users/login.ejs");
}

module.exports.login = async(req , res)=>{
    req.flash("success", "You are now Loggedin");
    let RedirectUrl = res.locals.redirectUrl || "/listings";
    // console.log(res.locals.redirectUrl);  //Delete review request error
    res.redirect(RedirectUrl);
}


module.exports.logout = (req, res, err)=>{
    req.logout((err)=>{
        if(err){
        return  next(err);
        }  
        req.flash("success", "You are now logged Out")
        res.redirect("/listings");
    })
}


module.exports.userAccountdetails = async(req, res, err)=>{
    let userId = req.user._id;
    if(!userId){
        return next(err);
    }

    let userdata = await User.findById(userId);
    

    if(!userdata){
        return next(err);
    }
    
    
    let usersListingsData = await Listing.find({
            owner : userId
    })

    let userReviewsData = await Review.find({
        author : userId
    })



    console.log("users account data ", { userdata , usersListingsData , userReviewsData});
    

    return res.render("Users/userAccount.ejs", { userdata , usersListingsData , userReviewsData});
}