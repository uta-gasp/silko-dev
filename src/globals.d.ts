interface Array<T> {
  includes( elem: T );
}

interface Node {
  classList: any;
}

interface ResponsiveVoice {
  speak( word: string, voice: string );
}

interface ETUDriver {
  showOptions();
  calibrate();
  toggleTracking();
}

interface GazeTargets {
  selection: { types: { none: number, cumulativeDwell: number, simpleDwell: number, nod: number, customHeadGesture: number } };
  mapping: { 
    types: { none: number, naive: number, expanded: number, reading: number },
    sources: { samples: number, fixations: number }
  };
  ETUDriver: ETUDriver;
  init( settings: object, eventHandler: object );
  updateTargets();
  reconnect();
}

interface Window {
  Node: any;
  NodeFilter: any;
  EventEmitter: any;
  Image: any;
  GazeTargets: GazeTargets;
  responsiveVoice: ResponsiveVoice
}
