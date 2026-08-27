const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Listing = require('../Models/listing.js');
const Review = require('../Models/review.js');

const dbUrl = process.env.MongoDbCloudURL || "mongodb://127.0.0.1:27017/faradisetrip";

const userIds = [
    '668d2e2d5c2bb65666e015b4',
    '6a5bd4c645ca5d7706026e00',
    '66cda225f84758bf816ee84c',
    '66d6d55a6eb9900bacdc7c5a',
    '6a9096415d63f5be42d051e9',
    '6a74d4e299ee7fb42a70566c',
    '668c441f845e3b17ccfe13c8'
];

const sampleComments = [
    "Absolutely amazing stay! The views were breathtaking and the host was super welcoming.",
    "Decent place for a short getaway. Clean room and good amenities.",
    "Exceeded all expectations! Sparkling clean, beautiful location, highly recommend.",
    "Great location and super comfortable stay. Will definitely visit again!",
    "Wonderful atmosphere and peaceful environment. Loved every moment here.",
    "The place was clean and cozy, but parking was a little challenging.",
    "Top-notch hospitality and incredible ambiance. 10/10 recommendation!"
];

async function seedReviews() {
    try {
        console.log("Connecting to MongoDB database...");
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB database.");

        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to populate with reviews.`);

        let totalReviewsCreated = 0;

        for (let listing of listings) {
            const reviewCount = Math.floor(Math.random() * 3) + 2; // 2-4 reviews per listing
            const reviewDocs = [];

            for (let i = 0; i < reviewCount; i++) {
                const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
                const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

                reviewDocs.push({
                    rating: randomRating,
                    comment: randomComment,
                    author: randomUserId,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30))
                });
            }

            const insertedReviews = await Review.insertMany(reviewDocs);
            const reviewIds = insertedReviews.map(r => r._id);

            totalReviewsCreated += insertedReviews.length;
            await Listing.updateOne(
                { _id: listing._id },
                { $push: { reviews: { $each: reviewIds } } }
            );
        }

        console.log(`Successfully created and linked ${totalReviewsCreated} reviews across ${listings.length} listings.`);
    } catch (err) {
        console.error("Error seeding reviews:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

seedReviews();
