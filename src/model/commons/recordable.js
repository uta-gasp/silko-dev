/**
 * @description Stores the functionality required for classes holding data to be stored in a database
 */
export default class Recordable {

  /**
   * @param {string} [id] - ID
   */
  constructor( id ) {
    this.id = id;
  }

  // to be overriden by descendants

  /** @returns {string} */
  static get db() { return ''; }

  // to be overriden using Recordable.apply()

  /**
   * @param {any} _ - object, whose properties should match this class properties (except 'id')
   * @return {boolean}
   */
  static validate( _ ) { return false; }

  /**
   * @param {any} _ - snapshot 
   * @return {any}
   */
  static from( _ ) { return null; }

  /**
   * Extends classes to be upload/downloaded into/from a database
   * Must be called after the class definition
   * @param {object} cls 
   */
  static apply( cls ) {
    // Check whether the object hold all data fields defined in the target class
    cls.validate = /** @param {object} obj */ function( obj ) {
      return Object.getOwnPropertyNames( new cls.prototype.constructor() ).every( key => {
        // check all properties but the key
        if ( key === 'id' ) {
          return true;
        }

        if ( !obj.hasOwnProperty( key ) ) {
          return false;
        }

        return true;
      } );
    };

    // Create a class object from the snapshot received from a database
    cls.from = /** @param {object} snapshot */ function( snapshot ) {
      const record = snapshot.val();

      /* eslint-disable new-cap */
      const obj = new cls( snapshot.key );

      return Object.assign( obj, record );
    };

    // cls.prototype.update = function( object ) {
    //     for (let key in object) {
    //         if (key === 'id') {
    //             continue;
    //         }

    //         if (this.hasOwnProperty( key )) {
    //             this[ key ] = object[ key ];
    //         }
    //     }
    // };
  }

}
