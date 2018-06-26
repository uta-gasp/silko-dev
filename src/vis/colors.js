/**
 * @typedef {Object} CMYK
 * @property {number} c
 * @property {number} m
 * @property {number} y
 * @property {number} k
 */

/**
 * @typedef {Object} ColorWithAlpha
 * @property {string} hex
 * @property {number} a
 */

const COLORS = [
  '#5DA5DA',
  '#FAA43A',
  '#60BD68',
  '#F17CB0',
  '#B2912F',
  '#B276B2',
  '#DECF3F',
  '#4D4D4D',
  '#F15854',

  // '#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#800000','#008000','#000080',
  // '#808000','#800080','#008080','#C0C0C0','#808080','#9999FF','#993366','#FFFFCC','#CCFFFF',
  // '#660066','#FF8080','#0066CC','#CCCCFF','#000080','#FF00FF','#FFFF00','#00FFFF','#800080',
  // '#800000','#008080','#0000FF','#00CCFF','#CCFFFF','#CCFFCC','#FFFF99','#99CCFF','#FF99CC',
  // '#CC99FF','#FFCC99','#3366FF','#33CCCC','#99CC00','#FFCC00','#FF9900','#FF6600','#666699',
  // '#969696','#003366','#339966','#003300','#333300','#993300','#993366','#333399','#333333',
];

/**
 * @param {string} color - in format '#XXXXXX' 
 * @returns {CMYK}
 */
function rgb2cmyk( color ) {
  color = color.substr( 1 );

  const compLength = color.length === 3 ? 1 : 2;
  const r = parseInt( clone( color.substr( 0 * compLength, compLength ), 3 - compLength ), 16 );
  const g = parseInt( clone( color.substr( 1 * compLength, compLength ), 3 - compLength ), 16 );
  const b = parseInt( clone( color.substr( 2 * compLength, compLength ), 3 - compLength ), 16 );
  let c = 255 - r;
  let m = 255 - g;
  let y = 255 - b;
  let k = Math.min( c, m, y );
  c = ( ( c - k ) / ( 255 - k ) );
  m = ( ( m - k ) / ( 255 - k ) );
  y = ( ( y - k ) / ( 255 - k ) );

  return {
    c: c,
    m: m,
    y: y,
    k: k / 255,
  };
}

/**
 * @param {CMYK} color 
 * @returns {string} in format '#XXXXXX'
 */
function cmyk2rgb( color ) {
  let r = color.c * ( 1.0 - color.k ) + color.k;
  let g = color.m * ( 1.0 - color.k ) + color.k;
  let b = color.y * ( 1.0 - color.k ) + color.k;
  r = Math.round( ( 1.0 - r ) * 255.0 + 0.5 );
  g = Math.round( ( 1.0 - g ) * 255.0 + 0.5 );
  b = Math.round( ( 1.0 - b ) * 255.0 + 0.5 );
  return '#' + decToHex( r ) + decToHex( g ) + decToHex( b );
}

/**
 * @param {number} value
 * @param {number} [n=2] 
 * @returns {string} n-digit hex value
 */
function decToHex( value, n ) {
  let hex = Number( value ).toString( 16 );
  n = !n && n !== 0 ? 2 : n;

  while ( hex.length < n ) {
    hex = '0' + hex;
  }

  return hex;
}

/**
 * @param {string} str 
 * @param {number} count 
 * @return {string}
 */
function clone( str, count ) {
  let result = '';
  for ( let i = 0; i < count; i += 1 ) {
    result += str;
  }
  return result;
}

/**
 * @param {number} c 
 * @return {string} 2-digit hex value
 */
function componentToHex( c ) {
  const hex = c.toString( 16 );
  return hex.length === 1 ? '0' + hex : hex;
}

// function rgbToHex( r, g, b ) {
//     return '#' + componentToHex( r ) + componentToHex( g ) + componentToHex( b );
// }

// function cssColorToHex( cssColor ) {
//     const colorRegex = /^\D+(\d+)\D+(\d+)\D+(\d+)\D+$/gim;
//     const colorComps = colorRegex.exec( cssColor );

//     return rgbToHex(
//         parseInt( colorComps[ 1 ] ),
//         parseInt( colorComps[ 2 ] ),
//         parseInt( colorComps[ 3 ] ) );
// }

/**
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @param {number} a 
 * @returns {ColorWithAlpha}
 */
function rgbaToHex( r, g, b, a ) {
  return {
    hex: '#' + componentToHex( r ) + componentToHex( g ) + componentToHex( b ),
    a: a === undefined ? 1 : a,
  };
}

export default class Colors {

  /**
   * @param {{color: string, weight: number}[]} colors 
   * @returns {string}
   */
  static mix( colors ) {
    let c = 0;
    let m = 0;
    let y = 0;
    let k = 0;
    let w = 0;
    for ( let i = 0; i < colors.length; i += 1 ) {
      const color = rgb2cmyk( colors[ i ].color );
      const weight = colors[ i ].weight;
      c += color.c * weight;
      m += color.m * weight;
      y += color.y * weight;
      k += color.k * weight;
      w += weight;
    }
    const cmyk = {
      c: c / w,
      m: m / w,
      y: y / w,
      k: k / w,
    };
    return cmyk2rgb( cmyk );
  };

  /**
   * @param {string} color - a string of #XXX or #XXXXXX}
   * @param {number | string} alpha 
   * @returns {string} 'rgba(...)'
   */
  static rgb2rgba( color, alpha ) {
    const cmyk = rgb2cmyk( color );

    let r = cmyk.c * ( 1.0 - cmyk.k ) + cmyk.k;
    let g = cmyk.m * ( 1.0 - cmyk.k ) + cmyk.k;
    let b = cmyk.y * ( 1.0 - cmyk.k ) + cmyk.k;
    r = Math.round( ( 1.0 - r ) * 255.0 );
    g = Math.round( ( 1.0 - g ) * 255.0 );
    b = Math.round( ( 1.0 - b ) * 255.0 );
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  /** @returns {string[]} */
  static get colors() {
    return COLORS;
  }

  /**
   * @param {string} color 
   * @returns {string} this color (or black, if 'color' is not a color) in format '#XXXXXX'
   */
  static validateColor( color ) {
    if ( color[0] !== '#' ) {
      return '#000000';
    }
    if ( color.length === 7 ) {
      return color;
    }
    if ( color.length === 4 ) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#000000';
  }

  /**
   * @param {string} cssColor 
   * @returns {ColorWithAlpha}
   */
  static cssColorToHex( cssColor ) {
    const colorRegex = /^\D+(\d+)\D+(\d+)\D+(\d+)\D*(\d|.+)\D+$/gim;
    const colorComps = colorRegex.exec( cssColor );

    return rgbaToHex(
      parseInt( colorComps[ 1 ] ),
      parseInt( colorComps[ 2 ] ),
      parseInt( colorComps[ 3 ] ),
      colorComps[ 4 ] ? parseFloat( colorComps[ 4 ] ) : undefined );
  }

  /**
   * @param {string} rgb - color in '#XXXXXX' 
   * @param {number} a - alpha value
   */
  static hexToRgba( rgb, a ) {
    const r = Number.parseInt( rgb.substr( 1, 2 ), 16 );
    const g = Number.parseInt( rgb.substr( 3, 2 ), 16 );
    const b = Number.parseInt( rgb.substr( 5, 2 ), 16 );
    return `rgba(${r},${g},${b},${a})`;
  }

};
