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
    /** @type {string} */
    this.student = args.student;
    /** @type {string} */
    this.session = args.session;
    /** @type {{ name: string, studentCount: number }} */
    this.grade = args.grade;
  }

};
