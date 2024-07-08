const mongoose = require('mongoose');
const Listing = require('../Models/listing.js');
const InitData = require('./data.js');

MongooseConnect = "mongodb://127.0.0.1:27017/faradisetrip";

main().then((res)=>{
    console.log("The connection to database is formed");
}).catch((err)=>{
    console.log(err);   
})
async function main(){
    await mongoose.connect(MongooseConnect);
};

async function InitializeDatabase(){
    await Listing.deleteMany({});
    InitData.data = InitData.data.map((obj)=>( {...obj , owner : "66859e5514729527b9d8d94f"}));
    await Listing.insertMany(InitData.data);
}

InitializeDatabase();

