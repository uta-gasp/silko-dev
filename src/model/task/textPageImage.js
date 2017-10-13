class TextPageImageEvent {
  constructor( name, params ) {
    this.name = name;
    this.params = params;
  }
}

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

  meta() {
    return {
      page: this.page,
      location: this.location,
      on: this.on.name,
      onParam0: this.on.params[0],
      onParam1: this.on.params[1],
      off: this.off.name,
      offParams0: this.off.params[0],
    };
  }

};