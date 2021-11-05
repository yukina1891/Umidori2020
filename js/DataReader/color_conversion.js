//RGB→HEX変換
function rgb2hex ( rgb ) {
    function hex(num) {
        // 10進数を16進数に変換する
        var hex = num.toString(16);
        if (num < 16) hex = "0" + hex;
        return hex;
    }
    var r = parseInt(rgb[0]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2]);
    var color = "#" + hex(r) + hex(g) + hex(b);
    return color;
}

//HEX→RGB変換
function hex2rgb ( hex ) {
	if ( hex.slice(0, 1) == "#" ) hex = hex.slice(1) ;
	if ( hex.length == 3 ) hex = hex.slice(0,1) + hex.slice(0,1) + hex.slice(1,2) + hex.slice(1,2) + hex.slice(2,3) + hex.slice(2,3) ;

	return [ hex.slice( 0, 2 ), hex.slice( 2, 4 ), hex.slice( 4, 6 ) ].map( function ( str ) {
		return parseInt( str, 16 ) ;
	} ) ;
}

//RGB→HSV変換(0〜255のRGB値を指定して、H(0〜360)、S(0-1)、V(0-1)の値を取得)
function rgbtohsv ( rgb ) {
	var r = rgb[0] / 255 ;
	var g = rgb[1] / 255 ;
	var b = rgb[2] / 255 ;

	var max = Math.max( r, g, b ) ;
	var min = Math.min( r, g, b ) ;
	var diff = max - min ;

	var h = 0 ;

	switch( min ) {
		case max :
			h = 0 ;
		break ;

		case r :
			h = (60 * ((b - g) / diff)) + 180 ;
		break ;

		case g :
			h = (60 * ((r - b) / diff)) + 300 ;
		break ;

		case b :
			h = (60 * ((g - r) / diff)) + 60 ;
		break ;
	}

	var s = max == 0 ? 0 : diff / max ;
	var v = max ;

	return [ h, s, v ] ;
}

//HSV→RGB変換(H(0〜360)、S(0〜1)、V(0〜1)を指定して、0〜255のRGB値を取得)
function hsvtorgb ( hsv ) {
	var h = hsv[0] / 60 ;
	var s = hsv[1] ;
	var v = hsv[2] ;
	if ( s == 0 ) return [ v * 255, v * 255, v * 255 ] ;

	var rgb ;
	var i = parseInt( h ) ;
	var f = h - i ;
	var v1 = v * (1 - s) ;
	var v2 = v * (1 - s * f) ;
	var v3 = v * (1 - s * (1 - f)) ;

	switch( i ) {
		case 0 :
		case 6 :
			rgb = [ v, v3, v1 ] ;
		break ;

		case 1 :
			rgb = [ v2, v, v1 ] ;
		break ;

		case 2 :
			rgb = [ v1, v, v3 ] ;
		break ;

		case 3 :
			rgb = [ v1, v2, v ] ;
		break ;

		case 4 :
			rgb = [ v3, v1, v ] ;
		break ;

		case 5 :
			rgb = [ v, v1, v2 ] ;
		break ;
	}

	return rgb.map( function ( value ) {
		return value * 255 ;
	} ) ;
}