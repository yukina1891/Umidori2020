(function () {
    "use strict";
  
    mapboxgl.accessToken = 'pk.eyJ1IjoieXVraW5hMTg5MSIsImEiOiJjazkzam1lbjcwMWZmM2ZwNW5oaGlyMmIwIn0.wTnbDZxtKcSwBomDrWA6vw';
  
    const mapObj = new mapboxgl.Map({
        container: 'mapID',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [135.68380, 36.85676],
        zoom: 5.2,
        pitch: 60.00,
        bearing: -17.60,
        interactive: true
    });
  
    const loadFiles = [
      d3.csv("tower_height.csv")
    ];
    let hoveredTowerId;
  
    Promise.all(loadFiles).then(function (csv) {
        console.log(csv[0]);
  
        const geojson = {
            "type": "FeatureCollection",
            "features": combi.map(function(d) {
            return {
                type: "Feature",
                properties: {
                date: d[0],
                name: d[1],
                full_value: parseFloat(d[4]),
                observatory_value: parseFloat(d[5])
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
  
      const position = d3.select("#position");
  
      mapObj.on('load', function() {
  
        mapObj.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
  
        mapObj.addSource("data", {
          type: "geojson",
          data: geojson,
        });
  
        mapObj.addLayer({
          'id': 'tower_points',
          'type': 'circle',
          'source': 'data',
          'paint': {
            'circle-opacity': 0
          }
        });
  
        mapObj.addSource('extrusion_source', {
          "type": "geojson",
          "data": {
            type: 'FeatureCollection',
            features: []
          }
        });
        mapObj.addSource('extrusion_source2', {
          "type": "geojson",
          "data": {
            type: 'FeatureCollection',
            features: []
          }
        });
  
        mapObj.addLayer({
          'id': 'extrusion',
          'type': 'fill-extrusion',
          'source': 'extrusion_source',
          'paint': {
            'fill-extrusion-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              'red',
              'blue'
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 0.6
          }
        });
        mapObj.addLayer({
          'id': 'extrusion2',
          'type': 'fill-extrusion',
          'source': 'extrusion_source2',
          'paint': {
            'fill-extrusion-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              'lightcoral',
              'lightskyblue'
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 0.6
          }
        });
  
        function update() {
  
          const qfs = mapObj.queryRenderedFeatures({
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
          const radiusPX = 3;
  
          // full_height stack
          qfs.forEach(function (object, i) {
  
            const center = object.geometry.coordinates;
  
            let xy = mapObj.project(center);
            xy.x += radiusPX;
  
            let LL = mapObj.unproject(xy);
            LL = turf.point([LL.lng, LL.lat]);
  
            const radius = turf.distance(center, LL, {
              units: 'meters'
            }) + 0.00000001;
  
            object.properties.height = object.properties.full_value * 600;
            object.properties.base = object.properties.observatory_value * 600;
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
  
          mapObj.getSource('extrusion_source').setData(data);
  
          // observatory_height stack
          qfs.forEach(function (object, i) {
  
            const center = object.geometry.coordinates;
  
            let xy = mapObj.project(center);
            xy.x += radiusPX;
  
            let LL = mapObj.unproject(xy);
            LL = turf.point([LL.lng, LL.lat]);
  
            const radius = turf.distance(center, LL, {
              units: 'meters'
            }) + 0.00000001;
  
            object.properties.height = object.properties.observatory_value * 600;
            object.properties.base = 0;
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
  
          mapObj.getSource('extrusion_source2').setData(data2);
        }
  
        mapObj.on('data', function(e) {
          if (e.sourceId !== 'data') return
          update()
        })
      })
  
      mapObj.on('mousemove', 'extrusion', (e) => mousemove(e));
      mapObj.on('mousemove', 'extrusion2', (e) => mousemove(e));
      mapObj.on('mouseleave', 'extrusion', () => mouseleave());
      mapObj.on('mouseleave', 'extrusion2', () => mouseleave());
  
      const updatePosition = function(props) {
        const info = 
          '<p>Name: ' + props.name + '</p>' +
          '<p>Height of tower: ' + props.full_value + 'm</p>' +
          '<p>Height of observatory: ' + props.observatory_value + 'm</p>';
  
        position.html(info);
      };
  
      const mousemove = (e) => {
        mapObj.getCanvasContainer().style.cursor = 'pointer';
  
        if (hoveredTowerId) {
          mapObj.setFeatureState(
            { source: 'extrusion_source', id: hoveredTowerId },
            { hover: false }
          );
          mapObj.setFeatureState(
            { source: 'extrusion_source2', id: hoveredTowerId },
            { hover: false }
          );
        }
  
        hoveredTowerId = e.features[0].id;
        mapObj.setFeatureState(
          { source: 'extrusion_source', id: hoveredTowerId },
          { hover: true }
        );
        mapObj.setFeatureState(
          { source: 'extrusion_source2', id: hoveredTowerId },
          { hover: true }
        );
        updatePosition(e.features[0].properties)
      }
  
      const mouseleave = () => {
        mapObj.getCanvasContainer().style.cursor = 'default';
  
        mapObj.setFeatureState(
          { source: 'extrusion_source', id: hoveredTowerId },
          { hover: false }
        );
        mapObj.setFeatureState(
          { source: 'extrusion_source2', id: hoveredTowerId },
          { hover: false }
        );
        hoveredTowerId = null;
      }
    })
  
  })();
  