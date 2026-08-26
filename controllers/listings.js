const Listing = require('../Models/listing.js')


module.exports.index =   async(req, res)=>{
    let allListings = await Listing.find({});
    res.render("listing/index.ejs", {allListings});
 }


 module.exports.renderNewListingsForm = (req, res)=>{
    res.render("listing/newListing.ejs", { mapApiKey: process.env.MAP_API });
}

module.exports.createNewListing = async (req, res)=>{              
    let url = req.file.path;
    let {longitude , latitude } = req.body.geometry;
    let filename = req.file.filename;
    let newList = new Listing({...(req.body.listing), geometry : { type: "Point", coordinates: [longitude , latitude] }});
    newList.owner = req.user._id;
    newList.image = { url , filename};

   await newList.save();
   req.flash("success", "New Listing Created sucessfully!!");
   res.redirect("/listings");
}


// let response = await geocodingClient.forwardGeocode({
//     query: 'Paris, France',
//     limit: 1
//   }).send()

//   console.log(response.body.features[0]);
//   res.send("done");


module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    let ListingData = await Listing.findById(id).populate( 
                                                {path : "reviews", populate : {path : "author"},}
                                                 ).populate("owner");
    if(!ListingData){
        req.flash("error", "Listing you requested Does not Exist ");
        res.redirect("/listings");    
    }
    
    res.render("listing/show.ejs", { ListingData, mapApiKey: process.env.MAP_API });
}

module.exports.editListingForm = async (req, res)=>{
    let {id} = req.params;
    let prevListing = await Listing.findById(id);
    res.render("listing/edit.ejs", {prevListing, mapApiKey: process.env.MAP_API} )
};


module.exports.editListingRequest = async (req, res)=>{    
    let {id} = req.params;
    let updatedvalues = req.body.listing;
    let {longitude , latitude } = req.body.geometry;
    // let url = req.file.path;
    // let filename = req.file.filename;
    let NewListing =  await Listing.findByIdAndUpdate(id, {...(updatedvalues), geometry : { type: "Point", coordinates: [longitude , latitude] } }, {new: true});
    if(typeof req.file !== "undefined"){
        NewListing.image.url = req.file.path;
        NewListing.image.filename = req.file.filename;
        NewListing.save(); 
    }
    req.flash("success", "Listing Edited sucessfully!!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted sucessfully!!");
    res.redirect("/listings");
}