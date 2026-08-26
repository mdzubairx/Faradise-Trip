import { Map, NavigationControl, FullscreenControl,  Popup, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

document.addEventListener('DOMContentLoaded', async () => {
  const mapContainer = document.getElementById('input-map');
  if (!mapContainer) return;

  const mapApiKey = mapContainer.dataset.apiKey || window.mapApiKey;

  // Default coordinates (e.g. New Delhi fallback)
  let center = [77.2090, 28.6139];

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
      container: 'input-map',
      style: style,
      center: center,
      zoom: 5
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new FullscreenControl(), 'top-left');


    const mapcenter = map.getCenter();

    let marker = new Marker({ color: "#ff0000ff", draggable: true })
    .setLngLat(mapcenter)
    .addTo(map);

  
    let longitudeinput = document.querySelector("#longitude");
    let latitudeinput = document.querySelector("#latitude");

    function onDragEnd() {
    const {lng , lat} = marker.getLngLat();
    longitudeinput.value = lng;
    latitudeinput.value = lat;
    }

    marker.on('dragend', onDragEnd);


  } catch (err) {
    console.error('Error initializing TomTom map:', err);
  }
});
