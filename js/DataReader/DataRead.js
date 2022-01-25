//座標データと着水データを結合する

var kiseki = []; //変換前の軌跡データ
var tyakusui = []; //変換前の軌跡データ
var new_kiseki = []; //変換後の軌跡データ
var new_tyakusui = []; //変換後の着水データ
var combi = []; //変換後の結合データ

var checkedFile;
var fileInput1 = null;
var fileInput2 = null;
var flag = false;
var count = 0;

// ファイル読み込み
function select_data(dataPath) {
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", reqListener);
	oReq.open("GET", dataPath);
	oReq.send();
}

// ファイルを配列に変換
function reqListener () {
	if(flag == false){
		kiseki = convertCSVtoArray(this.responseText);
		flag = true
		verify()
	}else if(flag == true){
		tyakusui = convertCSVtoArray(this.responseText);
		flag = false;
		verify()
	}

	//ファイルを２個読んだら
	function verify() {
		if (count == 0) {
			count++;
		}else if (count == 1){
			count = 0;
			read_median();
		}
	}

	function convertCSVtoArray(str) {
		var result = [];
		var tmp = str.split("\n");
	
		for (var i = 0; i < tmp.length; ++i) {
			result[i] = tmp[i].split(',');
		}
		return result;
	}
}

function ff() {
	if(N_med == 0){
		conversion_kiseki();
		conversion_tyakusui();
		combination();
	}else{
		start();
		smooth_tyakusui(N_med);
		smooth_kiseki(N_med);
		smooth_combination();
	}
	mediator_trajectory();
	mediator_action();
}

//軌跡データ変換（毎日）
function conversion_kiseki() {
	var day1;
	var day2;
	day1 = new Date(kiseki[1][1].split('-').join('/'));
	var p = 0;
	for(var i = 1; i < kiseki.length - 1; i++) {
		if(day1.getMonth() > 6 || day1.getMonth() < 2){
			var tmp1 = [];
			tmp1[0] = day1;
			tmp1[1] = parseFloat(kiseki[i][2]);
			tmp1[2] = parseFloat(kiseki[i][3]);
			new_kiseki[p] = tmp1;
			p++;
		}

		day2 = new Date(kiseki[i+1][1].split('-').join('/'));
		var d = (day2.getTime() - day1.getTime()) / 1000 / 3600 / 24;
		var keido = (parseFloat(kiseki[i+1][2]) - parseFloat(kiseki[i][2])) / d;
		var ido = (parseFloat(kiseki[i+1][3]) - parseFloat(kiseki[i][3])) / d;
		for(var j = 1; j < d; j++) {
			var tmp2 = [];
			tmp2[0] = new Date(day1.getTime() + 1000*3600*24*j);
			tmp2[1] = parseFloat(kiseki[i][2]) + keido * j;
			tmp2[2] = parseFloat(kiseki[i][3]) + ido * j;

			if(tmp2[0].getMonth() > 6 || tmp2[0].getMonth() < 2){
				new_kiseki[p] = tmp2;
				p++;
			}
		}
		day1 = day2;
	}
}

//着水回数のデータ変換（毎日）
function conversion_tyakusui() {
	var count = 0;
	var flying = 0;
	var feeding = 0;
	var rest = 0;

	var day = strToDate(tyakusui[0][1]);

	var d = 0;
	for (var i = 0; i < tyakusui.length; i++) {
		var new_day = strToDate(tyakusui[i][1]);
		if (day.getTime() < new_day.getTime()) {
			if(new_day.getMonth() > 6 || new_day.getMonth() < 2){
				var tmp = [];
				tmp[0] = day;
				tmp[1] = flying * 100 / count;
				tmp[2] = feeding * 100 / count;
				tmp[3] = rest * 100 / count;
				new_tyakusui[d] = tmp;
				d++;
			}
			count = 0;
			flying = 0;
			feeding = 0;
			rest = 0;
			day = new_day;
		}

		if (tyakusui[i][3] < 3) {
			flying++;
		} else if (tyakusui[i][3] > 2 && tyakusui[i][3] < 198) {
			feeding++;
		} else if (tyakusui[i][3] > 197) {
			rest++;
		}
		count++;
	}

	function strToDate(date) {
		var x = date.split('-');
		var y = x[2] + '/' + quantify(x[1]) + '/' + x[0];
		return new Date(y);
	}

	function quantify(month) {
		switch (month) {
			case "Jan":
				return 1;
			case "Feb":
				return 2;
			case "Mar":
				return 3;
			case "Apr":
				return 4;
			case "May":
				return 5;
			case "Jun":
				return 6;
			case "Jul":
				return 7;
			case "Aug":
				return 8;
			case "Sep":
				return 9;
			case "Oct":
				return 10;
			case "Nov":
				return 11;
			case "Dec":
				return 12;
		}
	}
}

//軌跡データと着水データを結合
function combination() {
	var k_i = 0;
	var t_i = 0;
	while (true) {
		if (new_kiseki[k_i][0].getTime() == new_tyakusui[t_i][0].getTime()) break;
		else if (new_kiseki[k_i][0].getTime() > new_tyakusui[t_i][0].getTime()) t_i++;
		else if (new_kiseki[k_i][0].getTime() < new_tyakusui[t_i][0].getTime()) k_i++;
	}

	var p = 0;
	while(k_i < new_kiseki.length && t_i < new_tyakusui.length) {
		var tmp = [];
		tmp[0] = new_kiseki[k_i][0];
		tmp[1] = fileNumber;
		tmp[2] = new_kiseki[k_i][1];
		tmp[3] = new_kiseki[k_i][2];
		tmp[4] = new_tyakusui[t_i][1];
		tmp[5] = new_tyakusui[t_i][2];
		tmp[6] = new_tyakusui[t_i][3];
		combi[p] = tmp;
		k_i++;
		t_i++;
		p++;
	}
}