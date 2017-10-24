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
    this.name = name;           // String
    this.records = records;     // [ ./Record ]
    this.params = params;       // ./Params
  }

};
