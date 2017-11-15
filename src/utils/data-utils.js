/**
 * @param {number} timeComponent 
 */
function formatTimeComponent( timeComponent ) {
  let formattedTimeComponent = '' + timeComponent;
  if ( formattedTimeComponent.length < 2 ) {
    formattedTimeComponent = '0' + formattedTimeComponent;
  }
  return formattedTimeComponent;
}

/**
 * @typedef {Object.<any>} ObjectWithName
 * @property {string} name
 */

export default class DataUtils {

  /**
   * @param {object} list 
   * @returns {array}
   */
  static toArray( list ) {
    const result = [];
    for ( let id in list ) {
      result.push( {
        id,
        name: list[ id ],
      } );
    }
    return result;
  }

  /**
   * @param {ObjectWithName} a 
   * @param {ObjectWithName} b 
   * @returns {boolean}
   */
  static byName( a, b ) {
    return a.name.toLowerCase() > b.name.toLowerCase();
  }

  /**
   * @param {array} arr 
   * @param {string} name 
   * @returns {string}
   */
  static displayCount( arr, name ) {
    if ( arr === null ) {
      return '';
    }
    return `${arr.length ? arr.length : 'No'} ${name}${arr.length !== 1 ? 's' : ''}`;
  }

  /**
   * @param {string} dateString 
   * @returns {string}
   */
  static sessionDate( dateString ) {
    const date = new Date( dateString );
    const hours = formatTimeComponent( date.getHours() );
    const minutes = formatTimeComponent( date.getMinutes() );
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${hours}:${minutes} `;
  }

}
