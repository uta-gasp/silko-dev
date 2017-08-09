// Stores the functionality required for classes holding data to be stored in a database
export default class Recordable {

  // Extends classes to be upload/downloaded into/from a database
  static apply( cls ) {
    // Check whether the object hold all data fields defined in the target class
    cls.validate = function( obj ) {
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
    cls.from = function( snapshot ) {
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
