mapboxgl.accessToken = 'pk.eyJ1IjoieXVraW5hMTg5MSIsImEiOiJjazkzam1lbjcwMWZmM2ZwNW5oaGlyMmIwIn0.wTnbDZxtKcSwBomDrWA6vw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [141.313730, 44.427621], //中心（天売島）の座標
    zoom: 4
});
map.addControl(new mapboxgl.NavigationControl());

document.getElementById('median').innerHTML = 0;

document.getElementById("3color-legend").style.display = 'none';
document.getElementById("2color-legend").style.display = 'none';
document.getElementById("rgbPoint").style.display = 'none';

var N_med = 0;

document
    .getElementById('slider')
    .addEventListener('input', function(e) {
        N_med = parseInt(e.target.value, 10);
        document.getElementById('median').innerHTML = N_med;
    });

var color_2d1;
var color_2d2;
var color_3d1;
var color_3d2;
var color_3d3;
var birdColors_2d = [];
var birdColors_3d = [];

var animationButton = document.getElementById('replay');
animationButton.style.display = 'none';

$(function(){
	var uniquecheck = $('input[type=checkbox]');
	uniquecheck.click(function() {
		var group = $(this).attr('data-scgroup');
        // console.log("実行されたよ〜")

		uniquecheck.filter(function() {
			return $(this).attr('data-scgroup') == group;
		}).not(this).removeAttr('checked');

	});
});

let route = null;
let features = null;
let jsondata = null;
let fileNumber;
let trajectoryType;
let actionType;

function main_read(read_data) {
	fileNumber = read_data.id;
	const checkedData = document.getElementById(fileNumber);
	if(checkedData.checked) {
		select_data('../data/2-day-median/te_rhau_'+fileNumber+'_2016_2017_2days_Median.csv');
		select_data('../data/2017_Activity_TE_CSV/te_rhau_'+fileNumber+'.csv');
	}else {
		map.removeLayer('route');
        map.removeSource('route');
        route = null;
        map.removeLayer('bird');
        map.removeSource('birdsData');
        features = null;
        jsondata = null;
	}
}

function main_trajectory(trajectory_data) {
	trajectoryType = trajectory_data.id;
	const checkedTrajectoryType = document.getElementById(trajectoryType);
	if(checkedTrajectoryType.checked) {
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
	} else if(actionType == 'action1' || actionType == 'action2'){
		map.removeLayer('bird');
        map.removeSource('birdsData');
        features = null;
        jsondata = null;
	} else if(actionType == 'action3'){
        console.log("ここ通ってるかな〜？");
        map.removeLayer('rgbPoint0');
        map.removeSource('rgbPoint0');
        rgbPoint = null;
    }
}

const checkedTrajectory1 = document.getElementById('trajectory1');
const checkedTrajectory2 = document.getElementById('trajectory2');
const checkedTrajectory3 = document.getElementById('trajectory3');
function mediator_trajectory(){
    if(checkedTrajectory1.checked){
        main_saturation();
    }else if(checkedTrajectory2.checked){
        main_gradation();
    }else if(checkedTrajectory3.checked){
        animationButton.style.display = 'block';
        main_animation(9);
    }
}

const checkedAction1 = document.getElementById('action1');
const checkedAction2 = document.getElementById('action2');
const checkedAction3 = document.getElementById('action3');
const checkedAction4 = document.getElementById('action4');
const checkedAction5 = document.getElementById('action5');
function mediator_action(){
    if(checkedAction1.checked){
        color_3d1 = document.getElementById("flying_3d").value;
        color_3d2 = document.getElementById("feeding_3d").value;
        color_3d3 = document.getElementById("rest_3d").value;
        birdColors_3d = [color_3d1, color_3d2, color_3d3];
        main_piechart3d();
    }else if(checkedAction2.checked){
        color_2d1 = document.getElementById("flying_2d").value;
        color_2d2 = document.getElementById("rest_2d").value;
        birdColors_2d = [color_2d1, color_2d2, "#a9a9a9"];
        main_piechart2d();
    }else if(checkedAction3.checked){
        main_rgbPoint(0);
    }else if(checkedAction4.checked){
        // console.log("変わったよ〜");
        main_barGraph_2d();
    }else if(checkedAction5.checked){
        // console.log("変わったよ〜");
        main_barGraph_3d();
    }
}