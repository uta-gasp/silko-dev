class TextPageImageEvent {
  constructor( event, param ) {
    this.event = event;
    this.param = param;
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

};