// 地図表示
mapboxgl.accessToken = 'pk.eyJ1IjoieXVraW5hMTg5MSIsImEiOiJjazkzam1lbjcwMWZmM2ZwNW5oaGlyMmIwIn0.wTnbDZxtKcSwBomDrWA6vw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [141.313730, 44.427621], //中心（天売島）の座標
    zoom: 4
});
map.addControl(new mapboxgl.NavigationControl());

// 中央値
let N_med = 0;
document.getElementById('median').innerHTML = 0;

document
    .getElementById('slider')
    .addEventListener('input', function(e) {
        N_med = parseInt(e.target.value, 10);
        document.getElementById('median').innerHTML = N_med;
    });

// 凡例表示
let color_2d1;
let color_2d2;
let color_3d1;
let color_3d2;
let color_3d3;
let birdColors_2d = [];
let birdColors_3d = [];

document.getElementById("3color-legend").style.display = 'none';
document.getElementById("2color-legend").style.display = 'none';
document.getElementById("rgbPoint").style.display = 'none';

// アニメーションボタン
const animationButton = document.getElementById('replay');
animationButton.style.display = 'none';

// チェックボックス
$(function(){
	const uniquecheck = $('input[type=checkbox]');
	uniquecheck.click(function() {
		const group = $(this).attr('data-scgroup');

		uniquecheck.filter(function() {
			return $(this).attr('data-scgroup') == group;
		}).not(this).removeAttr('checked');

	});
});

// 変数定義
let route = null;
let jsondata = null;
let fileNumber;
let trajectoryType;
let actionType;
let geojson = null;
let el = null;
let html;
let counts;
let featureData = null;

function main_read(read_data) {
	fileNumber = read_data.id;
	const checkedData = document.getElementById(fileNumber);
	if(checkedData.checked) {
		select_data('../data/2-day-median/te_rhau_'+fileNumber+'_2016_2017_2days_Median.csv');
		select_data('../data/2017_Activity_TE_CSV/te_rhau_'+fileNumber+'.csv');
	}else {
        clear_action()
	}
}

function main_trajectory(trajectory_data) {
	trajectoryType = trajectory_data.id;
	if(document.getElementById(trajectoryType).checked) {
		mediator_trajectory();
	}else {
		map.removeLayer('route');
        map.removeSource('route');
        route = null;
	}
}

function main_action(action_data) {
	actionType = action_data.id;
	const checkedActionType = document.getElementById(actionType);
	if(checkedActionType.checked) {
		mediator_action();
	} else {
        console.log("チェックが外れました")
		clear_action();
    }
}

function mediator_trajectory(){
    if(document.getElementById('trajectory1').checked){
        main_saturation();
    }else if(document.getElementById('trajectory2').checked){
        main_gradation();
    }else if(document.getElementById('trajectory3').checked){
        main_animation(9);
    }
}

// 行動パターン選択・表示
function mediator_action(){
    if(document.getElementById('action1').checked){
        main_piechart3d();
    }else if(document.getElementById('action2').checked){
        main_piechart2d();
    }else if(document.getElementById('action3').checked){
        main_rgbPoint(0);
    }else if(document.getElementById('action4').checked){
        main_barGraph_2d();
    }else if(document.getElementById('action5').checked){
        main_barGraph_3d();
    }
}

function clear_action() {
    if(featureData != null){
        // console.log(document.getElementsByClassName("mapboxgl-canvas-container mapboxgl-interactive mapboxgl-touch-drag-pan mapboxgl-touch-zoom-rotate")[0])
        // console.log(featureData)
        while (document.getElementById("svg") !== null) {
            document.getElementById("svg").remove()
        }
        // document.getElementsByClassName("mapboxgl-canvas-container mapboxgl-interactive mapboxgl-touch-drag-pan mapboxgl-touch-zoom-rotate")[0].remove()
        // document.getElementById("map").remove()
        map.removeLayer('bird');
        map.removeSource('birdsData');
        featureData = null;
    }
    if(rgbPoint != null){
        map.removeLayer('rgbPoint0');
        map.removeSource('rgbPoint0');
        rgbPoint = null;
    }
    if(geojson !== null){
        map.removeLayer('sky');
        map.removeLayer('tower_points');
        map.removeLayer('extrusion');
        map.removeLayer('extrusion2');
        map.removeLayer('extrusion3');
        map.removeSource('data');
        map.removeSource('extrusion_source');
        map.removeSource('extrusion_source2');
        map.removeSource('extrusion_source3');
        geojson = null;
    }
}
