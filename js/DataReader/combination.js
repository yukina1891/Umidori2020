//座標データと着水データを結合する

var kiseki = [];
var tyakusui = [];
var new_kiseki = [];
var new_tyakusui = [];
var combi = [];

var fileInput1 = document.getElementById("csvfile1");
var fileInput2 = document.getElementById("csvfile2");
var birdID1;
var birdID2;

var btn1 = document.getElementById("button1");
changebtn1();

fileInput1.onchange = function () {
	changebtn1();      //ファイルが選択されたら実行ボタンを許可
};

fileInput2.onchange = function () {
	changebtn1();      //ファイルが選択されたら実行ボタンを許可
};

// ボタンの切り替え
function changebtn1() {
	if (fileInput1.value && fileInput2.value) {
		btn1.disabled = false;
		btn1.style.opacity = 1.0;
	} else {
		btn1.disabled = true;
		btn1.style.opacity = 0.5;
	}
}

function main_combination() {
	var file1 = fileInput1.files;
	var file2 = fileInput2.files;

	// 鳥IDをbiirdIDに入力
	filename1 = file1[0].name;
	filename2 = file2[0].name;
	var name1 = filename1.split('_');
	var name2 = filename2.split('_');
	name2 = name2[2].split('.')
	birdID1 = name1[2];
	birdID2 = name2[0];

	read(file1, 0);
	read(file2, 1);

	function read(file, p) {
		var reader = new FileReader();
		reader.readAsText(file[0]);
		reader.addEventListener('load', function () {
			if (p == 0) {
				kiseki = convertCSVtoArray(reader.result);
				verify();
			} else {
				tyakusui = convertCSVtoArray(reader.result);
				verify();
			}
		})

		// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
		function convertCSVtoArray(str) {
			var result = [];
			var tmp = str.split("\n");

			for (var i = 0; i < tmp.length; ++i) {
				result[i] = tmp[i].split(',');
			}
			return result;
		}
	}

	var count = 0;
	function verify() {
		if (count == 0) count++;
		else if (count == 1) main_combination2();
	}
}

function main_combination2() {
	conversion_kiseki();
	conversion_tyakusui();
	combination();
	outputFile();
}

function conversion_kiseki() {
	var day1;
	var day2;
	day1 = new Date(kiseki[1][1].split('-').join('/'));
	var p = 0;
	for(var i = 1; i < kiseki.length - 1; i++) {
		var tmp1 = [];
		tmp1[0] = day1;
		tmp1[1] = parseFloat(kiseki[i][2]);
		tmp1[2] = parseFloat(kiseki[i][3]);
		new_kiseki[p] = tmp1;
		p++;

		day2 = new Date(kiseki[i+1][1].split('-').join('/'));
		var d = (day2.getTime() - day1.getTime()) / 1000 / 3600 / 24;
		var keido = (parseFloat(kiseki[i+1][2]) - parseFloat(kiseki[i][2])) / d;
		var ido = (parseFloat(kiseki[i+1][3]) - parseFloat(kiseki[i][3])) / d;
		for(var j = 1; j < d; j++) {
			var tmp2 = [];
			tmp2[0] = new Date(day1.getTime() + 1000*3600*24*j);
			tmp2[1] = parseFloat(kiseki[i][2]) + keido * j;
			tmp2[2] = parseFloat(kiseki[i][3]) + ido * j;
			new_kiseki[p] = tmp2;
			p++;
		}

		day1 = day2;
	}
}

//着水回数のデータ変換（144行ずつの回数表示→1日あたりの％表示）
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
			var tmp = [];
			tmp[0] = day;
			tmp[1] = flying * 100 / count;
			tmp[2] = feeding * 100 / count;
			tmp[3] = rest * 100 / count;
			new_tyakusui[d] = tmp;

			count = 0;
			flying = 0;
			feeding = 0;
			rest = 0;
			day = new_day;
			d++;
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
		tmp[1] = birdID1;
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

function outputFile() {
	var s = [];
	for(var i = 0; i < combi.length; i++) {
		for(var j = 0; j < 7; j++) {
			if(j < 6) s += combi[i][j] + ",";
			else s += combi[i][j];
		}
		s += "\n";
	}

	let blob = new Blob([s], { type: "text/plan" });
	let link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = birdID1+'.csv';
	link.innerText = 'ダウンロードします';
	const result = document.getElementById('result');
	result.appendChild(link);

	// let blob = new Blob(['あいうえお'],{type:"text/plan"});
	// let link = document.createElement('a');
	// link.href = URL.createObjectURL(blob);
	// link.download = '作ったファイル.txt';
	// link.click();
}
