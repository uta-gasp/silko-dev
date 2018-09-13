/**
 * @external SGWM
 * @see {@link https://uta-gasp.github.com/sgwm/}
 */

import { i10n } from '@/utils/i10n.js';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';

// ts-check-only
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

const tokens = i10n( 'sgwm' );

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
      title: tokens[ 'hdr_data_map' ],
      options: OptionsCreator.createOptions( [
        new OptionGroup({
          title: tokens[ 'hdr_fix_proc' ],
          options: OptionsCreator.createOptions( {
            'FixationProcessorSettings.location.enabled': new OptionItem({ type: Boolean, label: tokens[ 'lbl_loc' ] }),
            'FixationProcessorSettings.location.marginX': new OptionItem({ type: Number, step: 10, label: '\t' + tokens[ 'lbl_margin' ]( 'X' ) }),
            'FixationProcessorSettings.location.marginY': new OptionItem({ type: Number, label: '\t' + tokens[ 'lbl_margin' ]( 'X' ) }),
            'FixationProcessorSettings.duration.enabled': new OptionItem({ type: Boolean, label: tokens[ 'lbl_dur' ] }),
            'FixationProcessorSettings.duration.mergingDurationThreshold': new OptionItem({ type: Number, label: '\t' + tokens[ 'lbl_merge_th' ] }),
            'FixationProcessorSettings.duration.mergingDistanceThreshold': new OptionItem({ type: Number, label: '\t' + tokens[ 'lbl_merge_dist' ] }),
            'FixationProcessorSettings.duration.removingDurationThreshold': new OptionItem({ type: Number, label: '\t' + tokens[ 'lbl_min_dur' ] }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.FixationProcessorSettings, [ 'location', 'duration' ], 'FixationProcessorSettings' ),
        }),
        new OptionGroup({
          title: tokens[ 'hdr_splitter' ],
          options: OptionsCreator.createOptions( {
            'SplitToProgressionsSettings.bounds.left': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_left_margin' ] }),
            'SplitToProgressionsSettings.bounds.right': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_right_margin' ] }),
            'SplitToProgressionsSettings.bounds.verticalChar': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_v_margin_char' ] }),
            'SplitToProgressionsSettings.bounds.verticalLine': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_v_margin_lines' ] }),
            'SplitToProgressionsSettings.angle': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_incline' ] }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.SplitToProgressionsSettings, [ 'bounds', 'angle' ], 'SplitToProgressionsSettings' ),
        }),
        new OptionGroup({
          title: tokens[ 'hdr_merger' ],
          options: OptionsCreator.createOptions( {
            'ProgressionMergerSettings.minLongSetLength': new OptionItem({ type: Number, label: tokens[ 'lbl_short_prog' ] }),
            'ProgressionMergerSettings.fitThreshold': new OptionItem({ type: Number, step: 0.01, label: tokens[ 'lbl_line_sep' ] }),
            'ProgressionMergerSettings.maxLinearGradient': new OptionItem({ type: Number, step: 0.01, label: tokens[ 'lbl_line_incline' ] }),
            'ProgressionMergerSettings.removeSingleFixationLines': new OptionItem({ type: Boolean, label: tokens[ 'lbl_remove_fix' ] }),
            'ProgressionMergerSettings.correctForEmptyLines': new OptionItem({ type: Boolean, label: tokens[ 'lbl_empty_lines' ] }),
            'ProgressionMergerSettings.currentLineSupportInCorrection': new OptionItem({ type: Number, step: 0.05, label: '\t' + tokens[ 'lbl_support_line' ] }),
            'ProgressionMergerSettings.emptyLineDetectorFactor': new OptionItem({ type: Number, step: 0.05, label: '\t' + tokens[ 'lbl_empty_line' ] }),
            'ProgressionMergerSettings.intelligentFirstLineMapping': new OptionItem({ type: Boolean, label: tokens[ 'lbl_first_line' ] }),
          } ),
          defaults: OptionsCreator.createDefaults( _SGWM.ProgressionMergerSettings, [
            'minLongSetLength', 'fitThreshold', 'maxLinearGradient', 'removeSingleFixationLines',
            'correctForEmptyLines', 'currentLineSupportInCorrection', 'emptyLineDetectorFactor',
            'intelligentFirstLineMapping' ], 'ProgressionMergerSettings' ),
        }),
        new OptionGroup({
          title: tokens[ 'hdr_word_map' ],
          options: OptionsCreator.createOptions( {
            'WordMapperSettings.wordCharSkipStart': new OptionItem({ type: Number, label: tokens[ 'lbl_skip_start' ] }),
            'WordMapperSettings.wordCharSkipEnd': new OptionItem({ type: Number, label: tokens[ 'lbl_skip_end' ] }),
            'WordMapperSettings.scalingDiffLimit': new OptionItem({ type: Number, step: 0.1, label: tokens[ 'lbl_scale' ] }),
            'WordMapperSettings.rescaleFixationX': new OptionItem({ type: Boolean, label: tokens[ 'lbl_rescale' ] }),
            'WordMapperSettings.partialLengthMaxWordLength': new OptionItem({ type: Number, label: '\t' + tokens[ 'lbl_short_word' ] }),
            'WordMapperSettings.effectiveLengthFactor': new OptionItem({ type: Number, step: 0.1, label: '\t' + tokens[ 'lbl_limit' ] }),
            'WordMapperSettings.ignoreTransitions': new OptionItem({ type: Boolean, label: tokens[ 'lbl_ignore_trans' ] }),
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
