
var rgbPoint;
var rgbPoint_data = [];

function main_rgbPoint(data_number) {

    for (var i = 0; i < combi.length-2; i++) {
        const record = combi[i];
        const pos = [record[2], record[3]];
        const data3d = [parseFloat(record[4]), parseFloat(record[5]), parseFloat(record[6])];
        const total = data3d[0] + data3d[1] + data3d[2];
        const rgb = data3d.map(value => 255 * value / total);

        rgbPoint_data[i] = {
            'type': 'Feature',
            'properties':{
                'id': 'rgbPoint'+i,
                'color': rgb2hex(rgb),
                'description':'<strong>'+record[1]+'</strong><p><div>time:'+record[0]+'</div><div>flying:'+data3d[0]+'%</div><div>feeding:'+data3d[1]+'%</div><div>rest:'+data3d[2]+'%</div></p>'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [pos[0], pos[1]]
            }
        };
    }  
    draw_rgbPoint(data_number);
}

function draw_rgbPoint(data_number){

    rgbPoint = {
        'type': 'FeatureCollection',
        'features': rgbPoint_data
    };

    map.addSource('rgbPoint' + data_number, {
        'type': 'geojson',
        'data': rgbPoint
    });

    map.addLayer({
        'id': 'rgbPoint' + data_number,
        'source': 'rgbPoint' + data_number,
        'type': 'circle',
        'paint': {
            'circle-color': ['get', 'color'],
            'circle-radius': 8
        }
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
     
    map.on('mouseenter', 'rgbPoint' + data_number, function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
     
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
     
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
     
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });
     
    map.on('mouseleave', 'rgbPoint' + data_number, function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}

