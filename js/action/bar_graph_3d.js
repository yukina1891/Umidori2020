function main_barGraph_3d() {
    map.flyTo({
        center: [141.313730, 44.427621], //中心（天売島）の座標
        zoom: 4,
        pitch: 70,
        essential: true
    });
    document.getElementById("3color-legend").style.display = 'none';
    document.getElementById("2color-legend").style.display = 'none';
    document.getElementById("rgbPoint").style.display = 'none';
  
    const geojson = {
        "type": "FeatureCollection",
        "features": combi.slice(0).map(function(d) {
            return {
                type: "Feature",
                properties: {
                date: d[0],
                name: d[1],
                flying: parseFloat(d[4]),
                feeding: parseFloat(d[5]),
                rest: parseFloat(d[6]),
                },
                geometry: {
                type: "Point",
                coordinates: [
                    parseFloat(d[2]),
                    parseFloat(d[3])
                ]
                }
            }
        })
    }

    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    map.addSource("data", {
        type: "geojson",
        data: geojson,
    });

    map.addLayer({
        'id': 'tower_points',
        'type': 'circle',
        'source': 'data',
        'paint': {
            'circle-opacity': 0
        }
    });

    map.addSource('extrusion_source', {
        "type": "geojson",
        "data": {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addSource('extrusion_source2', {
        "type": "geojson",
        "data": {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addSource('extrusion_source3', {
        "type": "geojson",
        "data": {
            type: 'FeatureCollection',
            features: []
        }
    });

    // 飛翔
    map.addLayer({
        'id': 'extrusion',
        'type': 'fill-extrusion',
        'source': 'extrusion_source',
        'paint': {
            'fill-extrusion-color': 'darkorange',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 1.0
        }
    });

    // 採餌
    map.addLayer({
        'id': 'extrusion2',
        'type': 'fill-extrusion',
        'source': 'extrusion_source2',
        'paint': {
            'fill-extrusion-color': 'white',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 1.0
        }
    });

    // 休息
    map.addLayer({
        'id': 'extrusion3',
        'type': 'fill-extrusion',
        'source': 'extrusion_source3',
        'paint': {
            'fill-extrusion-color': 'blue',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 1.0
        }
    });

    function update() {

        const qfs = map.queryRenderedFeatures({
            layers: ['tower_points']
        });
        const data = {
            "type": "FeatureCollection",
            "features": []
        }
        const data2 = {
            "type": "FeatureCollection",
            "features": []
        }
        const data3 = {
            "type": "FeatureCollection",
            "features": []
        }
        const radiusPX = 4;

        // full_height stack
        qfs.forEach(function (object, i) {

            const center = object.geometry.coordinates;

            let xy = map.project(center);
            xy.x += radiusPX;

            let LL = map.unproject(xy);
            LL = turf.point([LL.lng, LL.lat]);

            const radius = turf.distance(center, LL, {
            units: 'meters'
            }) + 0.00000001;

            object.properties.height = (object.properties.flying + object.properties.feeding + object.properties.rest) * 800;
            object.properties.base = (object.properties.feeding + object.properties.rest) * 800;
            object.properties.index = i;

            const options = {
            steps: 16,
            units: 'meters',
            properties: object.properties
            };

            const feature = turf.circle(center, radius, options);
            feature.id = i;

            data.features.push(feature);
        })

        map.getSource('extrusion_source').setData(data);

        // observatory_height stack
        qfs.forEach(function (object, i) {

            const center = object.geometry.coordinates;

            let xy = map.project(center);
            xy.x += radiusPX;

            let LL = map.unproject(xy);
            LL = turf.point([LL.lng, LL.lat]);

            const radius = turf.distance(center, LL, {
            units: 'meters'
            }) + 0.00000001;

            object.properties.height = (object.properties.feeding + object.properties.rest) * 800;
            object.properties.base = object.properties.rest * 800;
            object.properties.index = i;

            const options = {
            steps: 16,
            units: 'meters',
            properties: object.properties
            };

            const feature = turf.circle(center, radius, options);
            feature.id = i;

            data2.features.push(feature);
        })

        map.getSource('extrusion_source2').setData(data2);

        qfs.forEach(function (object, i) {

            const center = object.geometry.coordinates;

            let xy = map.project(center);
            xy.x += radiusPX;

            let LL = map.unproject(xy);
            LL = turf.point([LL.lng, LL.lat]);

            const radius = turf.distance(center, LL, {
            units: 'meters'
            }) + 0.00000001;

            object.properties.height = object.properties.rest * 800;
            object.properties.base = 0;
            object.properties.index = i;

            const options = {
            steps: 16,
            units: 'meters',
            properties: object.properties
            };

            const feature = turf.circle(center, radius, options);
            feature.id = i;

            data3.features.push(feature);
        })

        map.getSource('extrusion_source3').setData(data3);
    }

    map.on('data', function(e) {
        if (e.sourceId !== 'data') return
        update()
    })
}