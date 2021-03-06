function main_piechart3d() {
    color_3d1 = document.getElementById("flying_3d").value;
    color_3d2 = document.getElementById("feeding_3d").value;
    color_3d3 = document.getElementById("rest_3d").value;

    birdColors_3d = [color_3d1, color_3d2, color_3d3];
    
    document.getElementById("3color-legend").style.display = 'block';
    document.getElementById("2color-legend").style.display = 'none';
    document.getElementById("rgbPoint").style.display = 'none';

    color_3d1 = document.getElementById("flying_3d").value;
    color_3d2 = document.getElementById("feeding_3d").value;
    color_3d3 = document.getElementById("rest_3d").value;
    birdColors_3d = [color_3d1, color_3d2, color_3d3];
    
    clear_action()

    features = combi.slice(0).map(record => ({
        'type': 'Feature',
        'properties': {
            'id': record[1],
            'flying': Math.round(144 * record[4]),
            'feeding': Math.round(144 * record[5]),
            'rest': Math.round(144 * record[6]),
            'hoge': 0,
			'color': record.slice(4, 7).map(value => 255 * value / 100),
			'description':'<strong>'+record[1]+'</strong><p><div>time:'+record[0]+'</div><div>flying:'+Math.round(record[4])+'%</div><div>feeding:'+record[5]+'%</div><div>rest:'+record[6]+'%</div></p>'
        },
        'geometry': {
            'type': 'Point',
            'coordinates': record.slice(2, 4)
        }
    }));

    jsondata = {
        'type': 'FeatureCollection',
        'features': features
    };

    map.addSource('birdsData', {
        'type': 'geojson',
        'data': jsondata
    });

    map.addLayer({
        'id': 'bird',
        'source': 'birdsData',
        'type': 'circle',
        'paint': {
            'circle-color': ['get', 'color'],
            'circle-opacity': 0,
            'circle-radius': 8
        }
	});
	
	map.on('click', 'bird', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
         
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
         
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });
         
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'bird', function () {
    map.getCanvas().style.cursor = 'pointer';
    });
        
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'bird', function () {
    map.getCanvas().style.cursor = '';
    });

    function updateMarkers_3d() {
        
        featureData = map.querySourceFeatures('birdsData');

        for (var i = 0; i < featureData.length; i++) {
            var coords = featureData[i].geometry.coordinates;
            var props = featureData[i].properties;
            el = createDonutChart_3d(props);
            marker = new mapboxgl.Marker({
                element: el
            }).setLngLat(coords);
        
            marker.addTo(map);
        }
    }

    map.on('data', function (e) {
        if (e.sourceId !== 'birdsData' || !e.isSourceLoaded) return;
        updateMarkers_3d();
    });
}

// const birdColors_3d = ["#ff0000", "#00ff00", "#0000ff"];

function createDonutChart_3d(props) {
    var offsets = [];
    counts = [
        props.flying,
        props.feeding,
        props.rest
    ];
    var total = 0;
    for (var i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
    }
    var fontSize = 16;
    var r = 10; //18
    var r0 = Math.round(r * 0.6);
    var w = r * 2;

    html =
        '<div id="svg"><svg width="' +
        w +
        '" height="' +
        w +
        '" viewbox="0 0 ' +
        w +
        ' ' +
        w +
        '" text-anchor="middle" style="font: ' +
        fontSize +
        'px sans-serif; display: block">';

    for (i = 0; i < counts.length; i++) {
        html += donutSegment_3d(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            0,
            birdColors_3d[i]
        );
    }

    html += '</svg></div>';

    el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild;
}

function donutSegment_3d(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    var a0 = 2 * Math.PI * (start - 0.25);
    var a1 = 2 * Math.PI * (end - 0.25);
    var x0 = Math.cos(a0),
        y0 = Math.sin(a0);
    var x1 = Math.cos(a1),
        y1 = Math.sin(a1);
    var largeArc = end - start > 0.5 ? 1 : 0;

    return [
        '<path d="M',
        r + r0 * x0,
        r + r0 * y0,
        'L',
        r + r * x0,
        r + r * y0,
        'A',
        r,
        r,
        0,
        largeArc,
        1,
        r + r * x1,
        r + r * y1,
        'L',
        r + r0 * x1,
        r + r0 * y1,
        'A',
        r0,
        r0,
        0,
        largeArc,
        0,
        r + r0 * x0,
        r + r0 * y0,
        '" fill="' + color + '" />'
    ].join(' ');
}