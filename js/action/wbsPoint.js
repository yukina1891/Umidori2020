//鳥の行動：3次元の行動を白と黒と円の大きさで表現
//flying:white, feeding:black, rest:size

//問題点：flying:0%, feeding:0%, rest:100%に近い値の時、何色にすればいいのか
//正確な値を認識できない可能性

var wbsPoint;
var wbsPoint_data = [];

function main_wbsPoint(data_number) {

    for (var i = 0; i < data.length-2; i++) {
        const record = data[i];
        const pos = [record[2], record[3]];
        // const data3d = [parseFloat(record[4]), parseFloat(record[5]), parseFloat(record[6])];
        // const total = data3d[0] + data3d[1] + data3d[2];
        const data1d = [parseFloat(record[6])];
        const data2d = [parseFloat(record[4]), parseFloat(record[5])];
        const total2 = data2d[0] + data2d[1];
        const wb = [0, 0, data2d[0]/total2];
        // const rgb = data3d.map(value => 255 * value / total);

        wbsPoint_data[i] = {
            'type': 'Feature',
            'properties':{
                'id': 'wbsPoint'+i,
                'color': rgb2hex(hsvtorgb(wb)),
                'radius': 5+8*data1d[0]/100,
                'description':'<strong>'+record[1]+'</strong><p><div>time:'+record[0]+'</div><div>flying:'+data2d[0]+'%</div><div>feeding:'+data2d[1]+'%</div><div>rest:'+data1d[0]+'%</div></p>'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [pos[0], pos[1]]
            }
        };
        // console.log(rgb2hex(hsvtorgb(wb)));
    }  
    draw_wbsPoint(data_number);
}

function draw_wbsPoint(data_number){

    wbsPoint = {
        'type': 'FeatureCollection',
        'features': wbsPoint_data
    };

    map.addSource('wbsPoint' + data_number, {
        'type': 'geojson',
        'data': wbsPoint
    });

    map.addLayer({
        'id': 'wbsPoint' + data_number,
        'source': 'wbsPoint' + data_number,
        'type': 'circle',
        'paint': {
            'circle-color': ['get', 'color'],
            'circle-radius': ['get', 'radius']
        }
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
     
    map.on('mouseenter', 'wbsPoint' + data_number, function (e) {
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
     
    map.on('mouseleave', 'wbsPoint' + data_number, function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}

