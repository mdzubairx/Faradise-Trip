import { Map, NavigationControl, FullscreenControl,  Popup, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

document.addEventListener('DOMContentLoaded', async () => {
  const mapContainer = document.getElementById('sdk-map');
  if (!mapContainer) return;

  const mapApiKey = mapContainer.dataset.apiKey || window.mapApiKey;
  const locationName = mapContainer.dataset.location || '';
  const countryName = mapContainer.dataset.country || '';
  const coordinates = mapContainer.dataset.coordinates;

  const lnglat =  JSON.parse(coordinates)
  
  
  let center  = lnglat.length > 0
    ? lnglat
    : [-80.189244, 25.761536]; // Default coordinates 

  console.log("center : ", center );


  if (!mapApiKey) {
    console.error('TomTom MAP_API key is missing.');
    mapContainer.innerHTML = '<p class="text-danger">Map API key missing in .env or controller.</p>';
    return;
  }


  try {
    // Standard TomTom Map Display raster tile source
    const style = {
      version: 8,
      sources: {
        'tomtom-tiles': {
          type: 'raster',
          tiles: [
            `https://a.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapApiKey}`,
            `https://b.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapApiKey}`,
            `https://c.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapApiKey}`,
            `https://d.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapApiKey}`
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.tomtom.com">TomTom</a>'
        }
      },
      layers: [
        {
          id: 'tomtom-layer',
          type: 'raster',
          source: 'tomtom-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };

    const map = new Map({
      container: 'sdk-map',
      style: style,
      center: center,
      zoom: 10
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new FullscreenControl(), 'top-left');

    const popup = new Popup({ offset: 25 }).setHTML(
      `<div style="padding: 4px;"><h6>${locationName || 'Listing Location'}</h6><p style="margin: 0; font-size: 13px;">Exact location provided after booking</p></div>`
    );

    new Marker({ color: '#fe424d' })
      .setLngLat(center)
      .setPopup(popup)
      .addTo(map);

  } catch (err) {
    console.error('Error initializing TomTom map:', err);
  }
});
