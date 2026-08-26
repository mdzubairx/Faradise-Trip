let wishlistBtn = document.getElementById('wishlist-btn');

wishlistBtn.addEventListener('click', async () => {
    const isWishlisted = wishlistBtn.getAttribute('data-wishlisted') === 'true';

    try {
        if (isWishlisted) {
            // Api call to remove wishlist from session store
            const response = await axios.delete('/wishlist/remove', {
                data: { Listingid: ListingData.id }
            });

            if (response.status === 200) {
                wishlistBtn.setAttribute('data-wishlisted', 'false');
                wishlistBtn.innerHTML = '<i class="fa-regular fa-heart" style="font-size: x-large;"></i> &nbsp; <span>Wishlist</span>';
            }
        } else {
            // Api call to save wishlist to session store
            const response = await axios.post('/wishlist/add', {
                imageurl: ListingData.image.url,
                Listingid: ListingData.id,
                title: ListingData.title,
                description: ListingData.description,
                price: ListingData.price,
                location: ListingData.location,
                country: ListingData.country
            });

            if (response.status === 200) {
                wishlistBtn.setAttribute('data-wishlisted', 'true');
                wishlistBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #da1249; font-size: x-large"></i> &nbsp; <span>Wishlisted!</span>';
            }
        }
    } catch (error) {
        console.error("Error updating wishlist:", error);
        alert("Failed to update wishlist. Please try again.");
    }
});
