module.exports.createwishList = async(req, res)=>{
   const {imageurl ,   Listingid , title ,   description , price ,  location ,country } = req.body;

   if(!req.session.wishlist){
    req.session.wishlist = [];
   }

   const exists = req.session.wishlist.some(item => item.Listingid === Listingid);
   if (!exists) {
      req.session.wishlist.push({
         imageurl ,   Listingid , title ,   description , price ,  location ,country
      });
   }

   return res.status(200).json({message : "Listing Added to WishList"});
}


module.exports.deletewishList = async(req, res)=>{
   const { Listingid } = req.body;

   if(req.session.wishlist){
      req.session.wishlist = req.session.wishlist.filter(item => item.Listingid !== Listingid);
   }


   return res.status(200).json({message : "Listing Removed from WishList"});
}

module.exports.getWishLists = async(req, res )=>{

    if(!req.session.wishlist){
      req.session.wishlist = [];
    }

   let wishlists =  req.session.wishlist;


   return res.render("wishlists/wishlists.ejs", { wishlists });

}


