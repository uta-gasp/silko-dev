// ts-check-only
import Record from './record.js';
import Params from './params.js';

export default class Data {

  /**
   * @param {string} name 
   * @param {Record[]} records 
   * @param {Params} params 
   */
  constructor( name, records, params ) {
    /** @type {string} */
    this.name = name;
    /** @type {Record[]} */
    this.records = records;
    /** @type {Params} */
    this.params = params;
  }

};
