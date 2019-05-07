// set up maxbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoibmljb2xlbXVyZG9jaCIsImEiOiJjanV4MHpkcGkwaTllNDNzMGY1dWM5OXdvIn0.L10-eZL5K7-c8d7WemjfVg';

// instantiate the map
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-14.732666,14.232438],
  zoom: 6,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// a little object for looking up neighborhood center points
var regionLookup = {
  'saint-louis': [-16.456146,15.986414],
  'dakar': [-17.457790,14.725579],
  'kedougou': [-12.170105,12.868037],
  'nyc': [-73.986740,40.734251],
}

// we can't add our own sources and layers until the base style is finished loading
map.on('style.load', function() {
  // add a button click listener that will control the map
  // we have 4 buttons, but can listen for clicks on any of them with just one listener
  $('.flyto').on('click', function(e) {
    // pull out the data attribute for the neighborhood using query
    var region = $(e.target).data('region');

    // this is a useful notation for looking up a key in an object using a variable
    var center = regionLookup[region];

    // fly to the neighborhood's center point
    map.flyTo({center: center, zoom: 12});
  });

  // let's hack the basemap style a bit
  // you can use map.getStyle() in the console to inspect the basemap layers
  map.setPaintProperty('water', 'fill-color', '#a4bee8')

  // this sets up the geojson as a source in the map, which I can use to add visual layers
  map.addSource('senegal', {
    type: 'geojson',
    data: './data/senegal.geojson',
  });

  // add a custom-styled layer for districts
  map.addLayer({
    id: 'senegal-districts-fill',
    type: 'fill',
    source: 'senegal',
    paint: {
      'fill-opacity': 0.7,
      'fill-color': {
        type: 'categorical',
        property: 'region',
        stops: [

        ]
        }
    }
  }, 'waterway-label')

  // add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 3,
      'line-opacity': 0.9,
      'line-color': 'black',
    }
  });

  // when the mouse moves, do stuff!
  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['senegal-districts-fill'],
    });

    // get the first feature from the array of returned features.
    var lot = features[0]

    if (lot) {  // if there's a lot under the mouse, do stuff
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      // lookup the corresponding description for the land use code
      var regionDescription = regionLookup(parseInt(lot.properties.region)).description;

      // use jquery to display the address and land use description to the sidebar
      $('#region').text(lot.properties.region);
      $('#district').text(districtDescription);

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(lot.geometry);
    } else {
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  })
})
