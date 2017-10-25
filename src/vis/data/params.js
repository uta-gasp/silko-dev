/**
 * @typedef {Object} ParamArg
 * @property {string} student
 * @property {string} [session]
 * @property {{name: string, studentCount: number}} [grade]
 */
export default class Params {

  /**
   * @param {ParamArg} args
   */
  constructor( args ) {
    this.student = args.student;    // String
    this.session = args.session;    // String
    this.grade = args.grade;        // { name: String, studentCount: Number }
  }

};
