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
          defaults: item.defaults,
        };
      } );
      // result = options.map( item => Object.assign( {}, item,
      //     { options: OptionsCreator.createOptions( item.options, receiver ) }
      // ) );
    }
    else {
      for ( let id in options ) {
        options[ id ].ref = createOptionReference( id, receiver );
      }

      result = options;
    }

    return result;
  }

  static createDefaults( source, subKeys, header ) {
    const result = {};
    for (let key in source) {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      if (subKeys && !subKeys.includes( targetKey ) ) {
        continue;
      }

      if ( typeof source[ key ] === 'object') {
        copyPlaneKeys( result, source, key, header );
      }
      else {
        if (header) {
          targetKey = header + '.' + targetKey;
        }
        result[ targetKey ] = source[ key ];
      }
    }

    return result;
  }

  static restoreDefaults( chapters ) {
    for ( let id in chapters ) {
      const chapter = chapters[ id ];
      if (chapter.defaults) {
        clone( chapter.defaults, chapter.options );
      }
      else if (Array.isArray( chapter.options )) {
        OptionsCreator.restoreDefaults( chapter.options );
      }
    }
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

function copyPlaneKeys( result, source, id, header ) {
  const ref = source[ id ];
  for (let key in ref) {
    if ( ref[ key ] === 'object') {
      copyPlaneKeys( result, ref, id + '.' + key, header );
    }
    else {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      let targetID = id[0] === '_' ? id.substr( 1 ) : id;
      if (header) {
        targetID = header + '.' + targetID;
      }
      result[ targetID + '.' + targetKey ] = ref[ key ];
    }
  }
}

function clone( from, to ) {
  for ( let key in from ) {
    if ( typeof from[ key ] === 'object' ) {
      clone( from[ key ], to[ key ] );
    }
    else {
      to[ key ].ref( from[ key ] );
    }
  }
}
