var colors = [
    '#000000',      // 黒
    '#ff0000',      // 赤
    '#0000ff',      // 青
    '#ffa500',      // オレンジ
    '#800080',      // 紫
    '#800000',      // 茶
    '#ffff00',      // 黄
    '#00ff00',      // 黄緑
    '#ffc0cb',      // ピンク
    '#808080',      // 灰
    '#00ffff'       // 水
];

function main_animation(counter) {
    animationButton.style.display = 'block';
    if(route != null){
        map.removeLayer('route');
        map.removeSource('route');
        route = null;
    }
	const r = combi
		// .slice(1, combi.length - 1)  // 最初と最後を取り除く
		.map(record => [record[2], record[3]])  // 緯度経度の組に変える
	draw_animation(r, counter);
}

function draw_animation(r, counter) {
	route = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': r
                }
            }
        ]
    };
    
    const point = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': origin
                }
            }
        ]
    };

    var lineDistance = turf.lineDistance(route.features[0], 'kilometers');
    var arc = [];
    var steps = 2000; //default 8000

    for (var i = 0; i < lineDistance; i += lineDistance / steps) {
        var segment = turf.along(route.features[0], i, 'kilometers');
        arc.push(segment.geometry.coordinates);
    }

    route.features[0].geometry.coordinates = arc;

    var count = 0;

	
    map.addSource('route' + counter, {
        'type': 'geojson',
        'lineMetrics': true,
        'data': route
    });

    map.addSource('point', {
        'type': 'geojson',
        'data': point
    });

    map.addLayer({
        'id': 'route' + counter,
        'source': 'route' + counter,
        'type': 'line',
        'paint': {
            'line-width': 2.0,
            'line-color': colors[counter]
        }
    });

    map.addLayer({
        'id': 'point',
        'source': 'point',
        'type': 'symbol',
        'layout': {
            'icon-image': 'airport-15',
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        }
    });

    function animate() {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.
        point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[count];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculate between the current point and the next point, except
        // at the end of the arc use the previous point and the current point
        point.features[0].properties.bearing = turf.bearing(
            turf.point(
                route.features[0].geometry.coordinates[
                    count >= steps ? count - 1 : count
                ]
            ),
            turf.point(
                route.features[0].geometry.coordinates[
                    count >= steps ? count : count + 1
                ]
            )
        );

        // Update the source with this new data.
        map.getSource('point').setData(point);

        // Request the next frame of animation so long the end has not been reached.
        if (count < steps) {
            requestAnimationFrame(animate);
        }

        count = count + 1;
    }

    document
        .getElementById('replay')
        .addEventListener('click', function () {
            // Set the coordinates of the original point back to origin
            point.features[0].geometry.coordinates = origin;

            // Update the source layer
            map.getSource('point').setData(point);

            // Reset the counter
            count = 0;

            // Restart the animation.
            animate(count);
        });

    // Start the animation.
    animate(count);
}