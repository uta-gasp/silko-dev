// Common types

interface Callback {
  ( err?: string | Error, data?: any );
}

// Extensions of build-in types

interface Array<T> {
  includes( elem: T );
}

interface Node {
  classList: any;
}

interface Window {
  Node: any;
  NodeFilter: any;
  EventEmitter: any;
  Image: any;
  GazeTargets: GazeTargets;
  SGWM: SGWM;
  responsiveVoice: ResponsiveVoice
}

// External libraries

interface EventEmitter {
  addListener( event: string, handler: function );
  removeListener( event: string, handler: function );
  emitEvent( event: string, data: any );
}

interface ResponsiveVoice {
  speak( word: string, voice: string );
}

interface ETUDriver {
  showOptions();
  calibrate();
  toggleTracking();
}

interface GTFixation {
  ts: number;
  duration: number;
  x: number;
  y: number;
}

interface GTSample {
  ts: number;
  x: number;
  y: number;
}

interface GTState {
  isServiceRunning: boolean;
  isConnected: boolean;
  isCalibrated: boolean;
  isTracking: boolean;
  isBusy: boolean;
  isStopped: boolean;
  isDisconnected: boolean;
  device: string;
}

interface GTEvents {
  state: function( GTState );
  target: function( string, HTMLElement );
  fixation: function( GTFixation );
}

interface GazeTargets {
  selection: { 
    types: { none: number, cumulativeDwell: number, simpleDwell: number, nod: number, customHeadGesture: number } 
  };

  mapping: { 
    types: { none: number, naive: number, expanded: number, reading: number },
    sources: { samples: number, fixations: number }
  };

  ETUDriver: ETUDriver;

  init( settings: object, eventHandler: GTEvents ): boolean;
  updateTargets();
  reconnect();
}

interface SGWM {
  (): void;
  FixationProcessorSettings: function(): void;
  SplitToProgressionsSettings: function(): void;
  ProgressionMergerSettings: function(): void;
  WordMapperSettings: function(): void;
}