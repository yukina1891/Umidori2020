function main_piechart3d() {

    const features = combi.slice(1).map(record => ({
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

    const jsondata = {
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
	
	

    function updateMarkers_3d() {
        
        var features = map.querySourceFeatures('birdsData');

        for (var i = 0; i < features.length; i++) {
            var coords = features[i].geometry.coordinates;
            var props = features[i].properties;
            var el = createDonutChart_3d(props);
           
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

const birdColors_3d = ["#ff0000", "#00ff00", "#0000ff"];

function createDonutChart_3d(props) {
    var offsets = [];
    var counts = [
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

    var html =
        '<div><svg width="' +
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

    var el = document.createElement('div');
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