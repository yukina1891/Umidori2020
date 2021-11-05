
function main_gradation() {
    // console.log(combi);
	const r = combi
		.slice(1, combi.length - 1)  // 最初と最後を取り除く
		.map(record => [record[2], record[3]])  // 緯度経度の組に変える
	draw_gradation(r);
}

function draw_gradation(r) {
	const route = {
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
	
    map.addSource('route', {
        'type': 'geojson',
        'lineMetrics': true,
        'data': route
    });

    map.addLayer({
        'id': 'route',
        'source': 'route',
        'type': 'line',
        'paint': {
            'line-width': 2.0,
            'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                'yellow',
                0.2,
                'lime',
                0.5,
                'cyan',
                0.7,
                'royalblue',
                1,
                'blue'
            ]
        }
    });
}