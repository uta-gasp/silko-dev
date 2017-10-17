class TextPageImageEvent {
  constructor( name ) {
    this.name = name;       // string
  }
}

class TextPageImageFixationEvent extends TextPageImageEvent {
  constructor( name, word, duration ) {
    super( name );

    this.word = word;
    this.duration = duration;
  }
}

class TextPageImageDelayEvent extends TextPageImageEvent {
  constructor( name, duration ) {
    super( name );

    this.duration = duration;
  }
}


function isGreaterThanInt( value, threshold ) {
  if (value === '' || value === null || value === undefined) {
    return false;
  }

  const int = +value;
  if (Number.isNaN( int ) || !Number.isInteger( int )) {
    return false;
  }

  return int > threshold;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const FILE_ID_SPLITTER = '_';


export default class TextPageImage {

  // src:       URL string
  // page:      -1 for all pages, <n> for a certain page
  // location:  'left', 'right', 'bottom'
  // on:        TextPageImageEvent
  // off:       TextPageImageEvent
  constructor( { src, page, location, on, off } ) {
    this.src = src;
    this.page = page,
    this.location = location;
    this.on = on;
    this.off = off;
  }

  static get EVENT() {
    return {
      none: 'none',
      fixation: 'fixation',
      image: 'image',
      delay: 'delay',
    };
  }

  static isEventValid( event ) {
    if (event.name === TextPageImage.EVENT.fixation) {
      return event.word && isGreaterThanInt( event.duration, 100 );
    }
    else if (event.name === TextPageImage.EVENT.delay) {
      return isGreaterThanInt( event.duration, 0 );
    }
    else {
      return true;
    }
  }

  get meta() {
    const result = {
      page: this.page,
      location: this.location,
      on: this.on.name,
      off: this.off.name,
    };

    if (this.on.name === TextPageImage.EVENT.fixation) {
      result[ 'on-word' ] = this.on.word;
      result[ 'on-duration' ] = this.on.duration;
    }
    else if (this.off.name === TextPageImage.EVENT.delay) {
      result[ 'off-duration' ] = this.off.duration;
    }

    return result;
  }

  static getNameFromSource( source ) {
    const parts = source.split( FILE_ID_SPLITTER );
    parts.shift();
    return parts.join( FILE_ID_SPLITTER ).split( '?' )[0];
  }

  static getPrefix() {
    const uuid = uuidv4();
    return `${uuid}${FILE_ID_SPLITTER}`;
  }
};