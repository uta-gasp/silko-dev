export default class Params {

  /**
   * @param {Object} [args]
   * @param {string} [args.student] 
   * @param {string} [args.session]
   * @param {{name: string, studentCount: number}} [args.grade] 
   */
  constructor( args = {} ) {
    this.student = args.student;    // String
    this.session = args.session;    // String
    this.grade = args.grade;        // { name: String, studentCount: Number }
  }

};
