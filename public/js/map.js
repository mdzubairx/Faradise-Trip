
  let AccessToken = MAP_API;
  let center =  [77.2088, 28.6139 ];
  // tt.setProductInfo("<your-product-name>", "<your-product-version>")
 const map =  tt.map({
    key: MAP_API,
    container: "map",
    center : center,
    zoom : 9,
  })

  // map.on('load', ()=>{
    // new tt.maker().setLngLat(center).addTo(map)
  // })
