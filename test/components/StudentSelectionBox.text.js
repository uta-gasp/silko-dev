import Vue from 'vue';
import jsdom from 'jsdom';
import StudentSelectionBox from '../../src/components/widgets/StudentSelectionBox.vue';

const renderer = require('vue-server-renderer').createRenderer();

describe('Test suite for StudentSelectionBox', () => {

  it('Test data msg', () => {

    const ClonedComponent = Vue.extend( StudentSelectionBox );
    const NewComponent = new ClonedComponent({
      data() {
        return {
          msg: 'I am a cool message',
        };
      },
    }).$mount();

    renderer.renderToString( NewComponent, (err, str) => {
      const dom = new jsdom.JSDOM( str );
      const selectButton = dom.window.document.querySelector( '.level-left button' );
      expect( selectButton.textContent ).toContain( 'Select' );
    });

  });

});