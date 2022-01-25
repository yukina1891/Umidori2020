var N; //N日間の中央値をとる
var k = 1;
var t = 0;
var n = 0;

//両方のデータに存在する最初の日付を探す
function start(){
    var day_k;
    var day_t;
    while(true){
        day_k = new Date(kiseki[k][1].split('-').join('/'));
        day_t = new Date(tyakusui[t][1].split('-').join('/'));
        if(day_k.getTime() == day_t.getTime()) break;
        else if(day_k < day_t) k++;
        else if(day_k > day_t) t++;
    }
}

//N日間の行動の割合を出力
function smooth_tyakusui(N){
	var count = 0;
	var flying = 0;
	var feeding = 0;
	var rest = 0;

    var day = strToDate(tyakusui[t][1]);

    var d = 0;
    var j = 0;

	for (var i = t; i < tyakusui.length; i++) {
        var new_day = strToDate(tyakusui[i][1]);
        if (day.getTime() < new_day.getTime()) {
            j++;
            day = new_day;
        }

        if(j == N){
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
            j = 0;
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

    //最後に余った日付分の処理（data.length%N）
    if(j != 0){
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
        j = 0;
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

//軌跡データのN日間の中央値を出力
function smooth_kiseki(N) {
    var med_lon = [];
    var med_lat = [];
	var day1;
    // var day2;
    var dayN;
    var n = 0;
    var p = 0;
    var kara = 0;
    
    dayN = new Date(kiseki[k][1].split('-').join('/'));
    dayN.setDate(dayN.getDate() + (N-1));

	for(var i = k; i < kiseki.length; i++) {
        day1 = new Date(kiseki[i][1].split('-').join('/'));
        while(day1.getTime() > dayN.getTime()){
            if(kara > 0 && med_lon.length > 0 && p > 0){
                var med_tmp = [];
                med_tmp[0] = median(med_lon);
                med_tmp[1] = median(med_lat);

                var before_lon = new_kiseki[p-1][0];
                var before_lat = new_kiseki[p-1][1];
                
                var diff_lon = (Math.abs(before_lon - med_tmp[0]))/(kara+1);
                var diff_lat = (Math.abs(before_lat - med_tmp[1]))/(kara+1);

                for(var j = 0; j < kara; j++){
                    var kara_tmp = [];
                    kara_tmp[0] = Math.min(before_lon, med_tmp[0]) + diff_lon*(j+1);
                    kara_tmp[1] = Math.min(before_lat, med_tmp[1]) + diff_lat*(j+1);
                    if(day1.getMonth() > 6 || day1.getMonth() < 2){
                        new_kiseki[p] = kara_tmp;
                        p++;
                    }
                }
                kara = 0;

                if(day1.getMonth() > 6 || day1.getMonth() < 2){
                    new_kiseki[p] = med_tmp;
                    p++;
                }
                med_lon = [];
                med_lat = [];
                n = 0;
            }else if(med_lon.length == 0){
                kara++;
                n = 0;
            }else{
                if(day1.getMonth() > 6 || day1.getMonth() < 2){
                    var med_tmp = [];
                    med_tmp[0] = median(med_lon);
                    med_tmp[1] = median(med_lat); 
                    new_kiseki[p] = med_tmp;
                    p++;
                }
                med_lon = [];
                med_lat = [];
                n = 0;
            }
            dayN.setDate(dayN.getDate() + N); 
        }
        if(day1.getTime() <= dayN.getTime()){
            med_lon[n] = parseFloat(kiseki[i][2]);
            med_lat[n] = parseFloat(kiseki[i][3]);
            n++;
        }
    }
        
    if(n != 0){
        var med_tmp = [];
        med_tmp[0] = median(med_lon);
        med_tmp[1] = median(med_lat); 
        new_kiseki[p] = med_tmp;
        p++;
        med_lon = [];
        med_lat = [];
        n = 0;

        dayN.setDate(dayN.getDate() + N);
    }        
}

var median = function (array) {
    if (array.length === 0) {
        return 0;
    }

    array.sort(function(a, b){
        return a - b;
    });

    var half = Math.floor(array.length / 2);

    if (array.length % 2) {
        return array[half];
    } else {
        return (array[half - 1] + array[half]) / 2;
    }
};

function smooth_combination() {
    var k = 0;
    var t = 0;
    var p = 0;

	while(k < new_kiseki.length && t < new_tyakusui.length){
        var tmp = [];
        tmp[0] = new_tyakusui[t][0];
        tmp[1] = fileNumber;
		tmp[2] = new_kiseki[k][0];
		tmp[3] = new_kiseki[k][1];
		tmp[4] = new_tyakusui[t][1];
		tmp[5] = new_tyakusui[t][2];
		tmp[6] = new_tyakusui[t][3];
        combi[p] = tmp;
        k++;
        t++;
        p++;
    }
}
