if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require('express')
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Models/listing.js');
const path = require('path');
const { render } = require('ejs');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { log } = require('console');
const wrapAsync = require('./utils/wrapAsync.js')
const expressError = require('./utils/expressError.js')
const {listingSchema} = require('./schema.js');
const Review = require('./Models/review.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./Models/user.js');
const {isLoggedin} = require('./middleware.js');
const { register } = require('module');
const {savedRedirectPage, isOwner , validateListing , isReviewAuthor} = require('./middleware.js');
const { index , renderNewListingsForm , createNewListing , showListing , editListingForm , editListingRequest, deleteListing} = require('./controllers/listings.js');
const { createNewReview , deleteReview } = require('./controllers/reviews.js');
const { renderSignUpForm , signUp , renderLoginForm , login , logout} = require('./controllers/users.js');
const multer  = require('multer');
const {storage} = require('./cloudCongig.js');
const upload = multer({ storage })


// const MongooseConnect = "mongodb://127.0.0.1:27017/faradisetrip";
const MongoDbCloudURL = "mongodb+srv://zubair01rke:Rz8GO7xer9oiWuUv@cluster0.9rfxzdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

main().then((res)=>{
    console.log("The connection to database is formed");
}).catch((err)=>{
    console.log(err);   
})
async function main(){
    await mongoose.connect(MongoDbCloudURL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded( {extended: true} ));
app.use(methodOverride('_method'))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: MongoDbCloudURL,
    crypto: {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600,
})

store.on("error", ()=>{
    console.log("Error in mongo Session store",  err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET , resave: false , saveUninitialized : true ,
    cookie :{
     expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxAge : 7 * 24 * 60 * 60 * 1000,
     httpOnly : true,
  }, 
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req ,res , next)=>{
    res.locals.success = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/", (req, res)=>{
//     res.send("this route is live ")
// })



//Authentication Routes
app.get("/signUp", renderSignUpForm)

app.post("/signUp", signUp);

app.get("/login", renderLoginForm);

app.post("/login",savedRedirectPage, passport.authenticate('local', 
    { failureRedirect : '/login' , failureFlash: true } ) , login);


app.get("/logout", logout)






// Index route
app.get("/listings", wrapAsync( index ));


// create new Listing route 
app.get("/listings/new", isLoggedin, renderNewListingsForm)

app.put("/listings",  isLoggedin, upload.single('listing[image]'),     //validateListing, 
     wrapAsync( createNewListing));


// SHow route 
app.get("/listings/:id", wrapAsync( showListing ));


//Edit Listing Form
app.get("/listings/:id/edit", isLoggedin, isOwner,  wrapAsync(editListingForm ))

//Edit listing request
app.put("/listings/:id", isLoggedin, isOwner, upload.single('listing[image]'),  //validateListing ,
      wrapAsync(editListingRequest ));

//delete Listing Route
app.delete("/listings/:id",isLoggedin, isOwner, wrapAsync(deleteListing ))




//reviews Section 
app.post("/listings/:id/reviews", isLoggedin, createNewReview)

//reviews delete api
app.delete("/listings/:id/reviews/:reviewId", isLoggedin, isReviewAuthor, deleteReview)




//All request for which there are no APIs created but user sends request on them
app.all("*", (req, res, next)=>{
    throw new expressError(400, "Page Not Found");
});

app.use((err, req , res , next)=>{
    let {statusCode =500 , message ="something went wrong" } = err;
    res.status(statusCode).render("error.ejs" , {message});
})

app.listen(8080, (req, res)=>{
    console.log("The server is live at 8080");
});
