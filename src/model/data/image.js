import TextPageImage from '@/model/task/textPageImage.js'

export default class Image {

  // @image: TaskPageImage
  constructor( image, ts ) {
    this.src = image.src;
    this.location = image.location;
    this.on = image.on.name;
    this.off = image.off.name;

    this.shown = ts;
    this.hidden = 0;
  }

  get isCurrent() {
    return !this.hidden;
  }

  hide( ts ) {
    this.hidden = ts;
  }
}