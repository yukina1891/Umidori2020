function main_saturation() {
    if(route != null){
        map.removeLayer('route');
        map.removeSource('route');
        route = null;
    }
	const r = combi
		.map(record => [record[2], record[3]])  // 緯度経度の組に変える
	draw_saturation(r);
}

function draw_saturation(r) {
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
                0, 'white',
                1, 'black'
            ]
        }
    });
}