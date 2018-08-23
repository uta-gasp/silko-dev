// ts-check-only
import { SyllabOptions, SpeechOptions } from '@/model/session/feedbacks.js';
import { TextPageImage } from '@/model/task/textPageImage.js';

export class TaskCreateParams {

  constructor() {
    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.alignment = '';
    /** @type {string} */
    this.fontname = '';
    /** @type {string} */
    this.intro = '';
    /** @type {string} */
    this.text = '';
    /** @type {SyllabOptions} */
    this.syllab = null;
    /** @type {SpeechOptions} */
    this.speech = null;
    /** @type {object[]} */
    this.questionnaire = null;
    /** @type {string} */
    this.syllabExceptions = null;
    /** @type {TextPageImage[]} */
    this.images = null;
    /** @type {boolean} */
    this.useTimeout = false;
    /** @type {number} */
    this.timeout = 5;
  }

}

export class StudentCreateParams {

  constructor() {
    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.email = '';
    /** @type {string} */
    this.password = '';
    /** @type {string} */
    this.grade = '';
  }

}

export class IntroCreateParams {

  constructor() {
    /** @type {string} */
    this.calibInstruction = '';
    /** @type {string} */
    this.calibStart = '';
    /** @type {string} */
    this.calibSkip = '';
    /** @type {string} */
    this.startInstruction = '';
    /** @type {string} */
    this.startRun = '';
    /** @type {string} */
    this.startCancel = '';
    /** @type {string} */
    this.firstPage = '';
    /** @type {string} */
    this.next = '';
    /** @type {string} */
    this.finish = '';
    /** @type {string} */
    this.finished = '';
  }

}
