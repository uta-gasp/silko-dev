import Vue from 'vue';
import jsdom from 'jsdom';
import ItemSelectionBox from 'widgets/ItemSelectionBox';

const renderer = require( 'vue-server-renderer' ).createRenderer();

describe( 'Test suite for ItemSelectionBox', () => {
  it( 'Dummy testing...', () => {
    const ClonedComponent = Vue.extend( ItemSelectionBox );
    const NewComponent = new ClonedComponent( {
      data() {
        return {
        };
      },
    } ).$mount();

    renderer.renderToString( NewComponent, ( err, str ) => {
      const dom = new jsdom.JSDOM( str );
      const selectButton = dom.window.document.querySelector( '.level-left button' );
      expect( selectButton.textContent ).toContain( 'Select' );
    } );
  } );
} );
