/**
 * @external SGWM
 * @see {@link https://uta-gasp.github.com/sgwm/}
 */

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';

// ts-check-only
import Rect from '@/model/data/rect';
import DataPage from '@/model/data/dataPage';

/**
 * @typedef {Object} _SGWMSettings
 * @property {SGWMFixationProcessorSettings} [FixationProcessorSettings]
 * @property {SGWMSplitToProgressionsSettings} [SplitToProgressionsSettings]
 * @property {SGWMProgressionMergerSettings} [ProgressionMergerSettings]
 * @property {SGWMWordMapperSettings} [WordMapperSettings]
 */

/** @type {_SGWMSettings} */
const _SGWM = {};

export default class sgwmController {

  /** @returns {_SGWMSettings} */
  static initializeSettings() {
    let settings;

    settings = new SGWM.FixationProcessorSettings();
    _SGWM.FixationProcessorSettings = settings;
    if ( !settings.isInitialized ) {
      settings.location.enabled = true;
      settings.location.marginX = 290;
      settings.location.marginY = 290;
      settings.duration.enabled = false;
      settings.save();
    }

    settings = new SGWM.SplitToProgressionsSettings();
    _SGWM.SplitToProgressionsSettings = settings;
    if ( !settings.isInitialized ) {
      settings.bounds = { // in size of char height
        left: -0.5,
        right: 8,
        verticalChar: 2,
        verticalLine: 0.6,
      };
      settings.angle = Math.sin( 15 * Math.PI / 180 );
      settings.save();
    }

    settings = new SGWM.ProgressionMergerSettings();
    _SGWM.ProgressionMergerSettings = settings;
    if ( !settings.isInitialized ) {
      settings.minLongSetLength = 3;
      settings.fitThreshold = 0.14;       // fraction of the interline distance
      settings.maxLinearGradient = 0.15;
      settings.removeSingleFixationLines = false;
      settings.correctForEmptyLines = true;
      settings.currentLineSupportInCorrection = 0.15;
      settings.emptyLineDetectorFactor = 1.6;
      settings.intelligentFirstLineMapping = true;
      settings.save();
    }

    settings = new SGWM.WordMapperSettings();
    _SGWM.WordMapperSettings = settings;
    if ( !settings.isInitialized ) {
      settings.wordCharSkipStart = 3;
      settings.wordCharSkipEnd = 6;
      settings.scalingDiffLimit = 0.9;
      settings.rescaleFixationX = false;
      settings.partialLengthMaxWordLength = 2;
      settings.effectiveLengthFactor = 0.7;
      settings.ignoreTransitions = false;
      settings.save();
    }

    return _SGWM;
  }

  /** @returns {OptionGroup} */
  static createOptions() {
    return new OptionGroup({
      id: '_sgwm',
      title: 'Data mapping',
      options: OptionsCreator.createOptions( [
        new OptionGroup({
          title: 'Fixation processing',
          options: OptionsCreator.createOptions( {
            'FixationProcessorSettings.location.enabled': new OptionItem({ type: Boolean, label: 'By location' }),
            'FixationProcessorSettings.location.marginX': new OptionItem({ type: Number, step: 10, label: '\tmargin X, px' }),
            'FixationProcessorSettings.location.marginY': new OptionItem({ type: Number, label: '\tmargin Y, px' }),
            'FixationProcessorSettings.duration.enabled': new OptionItem({ type: Boolean, label: 'By duration' }),
            'FixationProcessorSettings.duration.mergingDurationThreshold': new OptionItem({ type: Number, label: '\tmerging threshold, ms' }),
            'FixationProcessorSettings.duration.mergingDistanceThreshold': new OptionItem({ type: Number, label: '\tmerging distance, px' }),
            'FixationProcessorSettings.duration.removingDurationThreshold': new OptionItem({ type: Number, label: '\tmin duration, ms' }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.FixationProcessorSettings, [ 'location', 'duration' ], 'FixationProcessorSettings' ),
        }),
        new OptionGroup({
          title: 'Splitter',
          options: OptionsCreator.createOptions( {
            'SplitToProgressionsSettings.bounds.left': new OptionItem({ type: Number, step: 0.1, label: 'Left margin, chars' }),
            'SplitToProgressionsSettings.bounds.right': new OptionItem({ type: Number, step: 0.1, label: 'Right margin, chars' }),
            'SplitToProgressionsSettings.bounds.verticalChar': new OptionItem({ type: Number, step: 0.1, label: 'Vertical margin, chars' }),
            'SplitToProgressionsSettings.bounds.verticalLine': new OptionItem({ type: Number, step: 0.1, label: 'Vertical margin, lines' }),
            'SplitToProgressionsSettings.angle': new OptionItem({ type: Number, step: 0.1, label: 'Max incline, rad' }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.SplitToProgressionsSettings, [ 'bounds', 'angle' ], 'SplitToProgressionsSettings' ),
        }),
        new OptionGroup({
          title: 'Merger',
          options: OptionsCreator.createOptions( {
            'ProgressionMergerSettings.minLongSetLength': new OptionItem({ type: Number, label: 'Shortest progression, fixations' }),
            'ProgressionMergerSettings.fitThreshold': new OptionItem({ type: Number, step: 0.01, label: 'Line separation threshold, lines' }),
            'ProgressionMergerSettings.maxLinearGradient': new OptionItem({ type: Number, step: 0.01, label: 'Max line incline, rad' }),
            'ProgressionMergerSettings.removeSingleFixationLines': new OptionItem({ type: Boolean, label: 'Remove unmerged single fixations' }),
            'ProgressionMergerSettings.correctForEmptyLines': new OptionItem({ type: Boolean, label: 'Account for empty lines' }),
            'ProgressionMergerSettings.currentLineSupportInCorrection': new OptionItem({ type: Number, step: 0.05, label: '\tsupport current line by' }),
            'ProgressionMergerSettings.emptyLineDetectorFactor': new OptionItem({ type: Number, step: 0.05, label: '\tempty line factor, lines' }),
            'ProgressionMergerSettings.intelligentFirstLineMapping': new OptionItem({ type: Boolean, label: 'Intelligent first reading line search' }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.ProgressionMergerSettings, [
            'minLongSetLength', 'fitThreshold', 'maxLinearGradient', 'removeSingleFixationLines',
            'correctForEmptyLines', 'currentLineSupportInCorrection', 'emptyLineDetectorFactor',
            'intelligentFirstLineMapping' ], 'ProgressionMergerSettings' ),
        }),
        new OptionGroup({
          title: 'Word mapper',
          options: OptionsCreator.createOptions( {
            'WordMapperSettings.wordCharSkipStart': new OptionItem({ type: Number, label: 'Skip from start, chars' }),
            'WordMapperSettings.wordCharSkipEnd': new OptionItem({ type: Number, label: 'Skip from end, chars' }),
            'WordMapperSettings.scalingDiffLimit': new OptionItem({ type: Number, step: 0.1, label: 'Scaling diff limit' }),
            'WordMapperSettings.rescaleFixationX': new OptionItem({ type: Boolean, label: 'Rescale fixations horizontally' }),
            'WordMapperSettings.partialLengthMaxWordLength': new OptionItem({ type: Number, label: '\tshort word, chars' }),
            'WordMapperSettings.effectiveLengthFactor': new OptionItem({ type: Number, step: 0.1, label: '\tlimit to' }),
            'WordMapperSettings.ignoreTransitions': new OptionItem({ type: Boolean, label: 'Ignore transitions' }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.WordMapperSettings, [
            'wordCharSkipStart', 'wordCharSkipEnd', 'scalingDiffLimit',
            'rescaleFixationX', 'partialLengthMaxWordLength',
            'effectiveLengthFactor', 'ignoreTransitions' ], 'WordMapperSettings' ),
        }),
      ], _SGWM ),
    });
  }

  static save() {
    for ( let name in _SGWM ) {
      /** @type {SGWMSettings} */
      const settings = /** @type {Object.<string, SGWMSettings>} */ (_SGWM)[ name ];
      settings.save();
    }
  }

  /** @returns {_SGWMSettings} */
  static get settings() {
    return _SGWM;
  }

  /**
   * @param {DataPage} page 
   * @returns {{fixations: SGWMFixation[], words: SGWMWord[]}}
   */
  static map( page ) {
    const sgwmSession = {
      fixations: page.fixations,
      words: page.text.map( word => {
        return {
          id: word.id,
          x: word.rect.x,
          y: word.rect.y,
          width: word.rect.width,
          height: word.rect.height,
          text: word.text,
        };
      } ),
    };

    const sgwm = new SGWM();
    const result = sgwm.map( sgwmSession );

    return result;
  }

};
