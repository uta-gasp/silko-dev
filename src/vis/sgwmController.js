import OptionsCreator from '@/vis/optionsCreator.js';

const _SGWM = {};

export default class sgwm {

  static initializeSettings() {
    const SGWM = window.SGWM;
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

  static createOptions() {
    return {
      id: '_sgwm',
      title: 'Data mapping',
      options: OptionsCreator.createOptions( [
        {
          title: 'Fixation processing',
          options: OptionsCreator.createOptions( {
            'FixationProcessorSettings.location.enabled': { type: Boolean, label: 'By location' },
            'FixationProcessorSettings.location.marginX': { type: Number, step: 10, label: '\tmargin X, px' },
            'FixationProcessorSettings.location.marginY': { type: Number, label: '\tmargin Y, px' },
            'FixationProcessorSettings.duration.enabled': { type: Boolean, label: 'By duration' },
            'FixationProcessorSettings.duration.mergingDurationThreshold': { type: Number, label: '\tmerging threshold, ms' },
            'FixationProcessorSettings.duration.mergingDistanceThreshold': { type: Number, label: '\tmerging distance, px' },
            'FixationProcessorSettings.duration.removingDurationThreshold': { type: Number, label: '\tmin duration, ms' },
          } ),
        },
        {
          title: 'Splitter',
          options: OptionsCreator.createOptions( {
            'SplitToProgressionsSettings.left': { type: Number, step: 0.1, label: 'Left margin, chars' },
            'SplitToProgressionsSettings.right': { type: Number, step: 0.1, label: 'Right margin, chars' },
            'SplitToProgressionsSettings.verticalLine': { type: Number, step: 0.1, label: 'Vertical margin, lines' },
            'SplitToProgressionsSettings.angle': { type: Number, step: 0.1, label: 'Max incline, rad' },
          } ),
        },
        {
          title: 'Merger',
          options: OptionsCreator.createOptions( {
            'ProgressionMergerSettings.minLongSetLength': { type: Number, label: 'Shortest progression, fixations' },
            'ProgressionMergerSettings.fitThreshold': { type: Number, step: 0.01, label: 'Line separation threshold, lines' },
            'ProgressionMergerSettings.maxLinearGradient': { type: Number, step: 0.01, label: 'Max line incline, rad' },
            'ProgressionMergerSettings.removeSingleFixationLines': { type: Boolean, label: 'Remove unmerged single fixations' },
            'ProgressionMergerSettings.correctForEmptyLines': { type: Boolean, label: 'Account for empty lines' },
            'ProgressionMergerSettings.currentLineSupportInCorrection': { type: Number, step: 0.05, label: '\tsupport current line by' },
            // 'ProgressionMergerSettings.emptyLineDetectorFactor': { type: Number, step: 0.05, label: '\tempty line factor, lines' },
            'ProgressionMergerSettings.intelligentFirstLineMapping': { type: Boolean, label: 'Intelligent first reading line search' },
          } ),
        },
        {
          title: 'Word mapper',
          options: OptionsCreator.createOptions( {
            'WordMapperSettings.wordCharSkipStart': { type: Number, label: 'Skip from start, chars' },
            'WordMapperSettings.wordCharSkipEnd': { type: Number, label: 'Skip from end, chars' },
            'WordMapperSettings.scalingDiffLimit': { type: Number, step: 0.1, label: 'Scaling diff limit' },
            'WordMapperSettings.rescaleFixationX': { type: Boolean, label: 'Rescale fixations horizontally' },
            'WordMapperSettings.partialLengthMaxWordLength': { type: Number, label: '\tshort word, chars' },
            'WordMapperSettings.effectiveLengthFactor': { type: Number, step: 0.1, label: '\tlimit to' },
            'WordMapperSettings.ignoreTransitions': { type: Boolean, label: 'Ignore transitions' },
          } ),
        },
      ], _SGWM ),
    };
  }

  static save() {
    Object.values( _SGWM ).forEach( settings => {
      settings.save();
    } );
  }

  static get settings() {
    return _SGWM;
  }

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
