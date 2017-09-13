export default class OptionsCreator {

  static get SGWM() {
    return {};
  }

  static createOptions( options, receiver ) {
    let result;
    if ( options instanceof Array ) {
      result = options.map( item => {
        return {
          title: item.title,
          options: OptionsCreator.createOptions( item.options, receiver ),
        };
      } );
    }
    else {
      for ( let id in options ) {
        options[ id ].ref = createOptionReference( id, receiver );
      }

      result = options;
    }

    return result;
  }

  static createDefaults( source, subKeys ) {
    const result = {};
    for (let key in source) {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      if (subKeys && !subKeys.includes( targetKey ) ) {
        continue;
      }

      if ( typeof source[ key ] === 'object') {
        copyPlaneKeys( result, source, key );
      }
      else {
        result[ targetKey ] = source[ key ];
      }
    }

    return result;
  }

}

function createOptionReference( id, receiver ) {
  return value => {
    const ids = id.split( '.' );
    if ( value === undefined ) {
      let v = receiver;
      ids.forEach( _ => {
        if ( !v ) { console.error( `Option GET: Path '${id} has no match in receiver` ); }
        v = v[ _ ];
      } );
      return v;
    }
    else {
      let v = receiver;
      for ( let i = 0; i < ids.length - 1; i++ ) {
        if ( !v ) { console.error( `Option SET: Path '${id} has no match in receiver` ); }
        v = v[ ids[i] ];
      }
      v[ ids[ ids.length - 1 ] ] = value;
    }
  };
};

function copyPlaneKeys( result, source, id ) {
  const ref = source[ id ];
  for (let key in ref) {
    if ( ref[ key ] === 'object') {
      copyPlaneKeys( result, ref, id + '.' + key );
    }
    else {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      let targetID = id[0] === '_' ? id.substr( 1 ) : id;
      result[ targetID + '.' + targetKey ] = ref[ key ];
    }
  }
}