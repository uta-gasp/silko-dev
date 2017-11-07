export class OptionItem {
  /**
   * @param {Object} p
   * @param {Function | string} p.type
   * @param {string} p.label 
   * @param {string[]} [p.items] 
   * @param {number} [p.step] 
   */
  constructor( { type = {}, label = '', items = [''], step = 0 } ) {
    this.type = type;
    this.label = label;
    this.items = items;
    this.step = step;
    /** @type {object} */
    this.ref = undefined;
  }
}

/**
 * @typedef {Record<string, OptionItem>} OptionItems
 */

export class OptionGroup {
  /**
   * @param {Object} p
   * @param {string} [p.id]
   * @param {string} p.title 
   * @param {OptionItems | OptionGroup[]} p.options 
   * @param {any[]} [p.defaults] 
   */
  constructor( { id = '', title = '', options = {}, defaults = [{}] } ) {
    this.title = title;
    this.options = options;
    this.defaults = defaults;
    this.id = id;
  }
}

export class OptionsCreator {

  /**
   * @param {OptionItems | OptionGroup[]} options 
   * @param {object} [receiver] 
   * @returns {OptionItems | OptionGroup[]}
   */
  static createOptions( options, receiver ) {
    let result;
    if ( options instanceof Array ) {
      result = options.map( item => {
        return new OptionGroup({
          title: item.title,
          options: OptionsCreator.createOptions( item.options, receiver ),
          defaults: item.defaults,
        });
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

  /**
   * @param {Record<string, any>} source - list of name-value pairs
   * @param {string[]} [subKeys] 
   * @param {string} [header] 
   * @returns {object}
   */
  static createDefaults( source, subKeys, header ) {
    const result = {};
    for ( let key in source ) {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      if ( subKeys && !subKeys.includes( targetKey ) ) {
        continue;
      }

      if ( typeof source[ key ] === 'object' ) {
        copyPlaneKeys( result, source, key, header );
      }
      else {
        if ( header ) {
          targetKey = header + '.' + targetKey;
        }
        result[ targetKey ] = source[ key ];
      }
    }

    return result;
  }

  /**
   * @param {Record<string, OptionGroup>} chapters 
   */
  static restoreDefaults( chapters ) {
    for ( let id in chapters ) {
      const chapter = chapters[ id ];
      if ( chapter.defaults ) {
        clone( chapter.defaults, chapter.options );
      }
      else if ( Array.isArray( chapter.options ) ) {
        OptionsCreator.restoreDefaults( chapter.options );
      }
    }
  }

}

/**
 * @param {string} id 
 * @param {object} receiver 
 * @returns {function}
 */
function createOptionReference( id, receiver ) {
  return /** @param {any} value */ value => {
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

/**
 * 
 * @param {object} result 
 * @param {object} source 
 * @param {string} id 
 * @param {string} header 
 */
function copyPlaneKeys( result, source, id, header ) {
  const ref = source[ id ];
  for ( let key in ref ) {
    if ( ref[ key ] === 'object' ) {
      copyPlaneKeys( result, ref, id + '.' + key, header );
    }
    else {
      let targetKey = key[0] === '_' ? key.substr( 1 ) : key;
      let targetID = id[0] === '_' ? id.substr( 1 ) : id;
      if ( header ) {
        targetID = header + '.' + targetID;
      }
      result[ targetID + '.' + targetKey ] = ref[ key ];
    }
  }
}

/**
 * @param {object} from 
 * @param {object} to 
 */
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
