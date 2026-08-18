const Listing = require('../Models/listing.js');

module.exports.searchListing = async (req , res )=>{
   let {q} = req.query;
   console.log(q);

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }


    // 'i' makes the search case-insensitive
    const searchregex = new RegExp(q, 'i');

    let searchresults = await Listing.find({
        $or : [
            {title : searchregex},
            {description : searchregex},
            {location : searchregex},
            {country : searchregex}
        ]
    })

   return res.status(200).json({ searchresults , message : "Query is search is successfull"  });
}
