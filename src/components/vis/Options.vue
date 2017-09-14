<template lang="pug">
  #options(@click="close")
      .inner
        .options-title Settings
        .options(ref="container")
          //---- example of the content
          //- .group
          //-     .name [NAME]
          //-     .row
          //-         .label [LABEL]
          //-         select.value.ID
          //-             each ITEM in LIST
          //-                 option(value="#{ITEM}") #{ITEM}
          //-     .row
          //-         .label [LABEL]
          //-         input.value.id(type="checkbox")
        .buttons
          button.button.is-primary(@click="save") Save and close
          button.button.is-primary(@click="apply") Apply
          button.button.is-danger(@click="reset") Reset
</template>

<script>
import Colors from '@/vis/colors.js';
import OptionsCreator from '@/vis/optionsCreator.js';

const ID = 'silko';

export default {
  name: 'options',

  data() {
    return {
    };
  },

  props: {
    values: {
      type: Object,
      required: true,
    },
  },

  methods: {
    close( e ) {
      if ( e.target === this.$el ) {
        this.$emit( 'close' );
      }
    },

    save( e ) {
      this.saveSettings();
      this.update();

      this.$emit( 'apply' );
      this.$emit( 'close' );
    },

    apply( e ) {
      this.update();

      this.$emit( 'apply' );
    },

    reset( e ) {
      window.localStorage.removeItem( ID );

      OptionsCreator.restoreDefaults( this.values );

      this.$emit( 'apply' );

      const container = this.$refs.container;
      container.innerHTML = '';
      this.bind();
    },

    loadSettings() {
      const options = JSON.parse( window.localStorage.getItem( ID ) );
      if ( !options ) {
        return;
      }

      const pop = ( storage, values ) => {
        for ( let name in storage ) {
          const value = values[ name ];
          const saved = storage[ name ];
          if ( !value ) {
            continue;
          }

          if ( typeof saved === 'object' ) {
            pop( saved, value );
          }
          else if ( typeof value.ref === 'function' ) {
            value.ref( saved );
          }
        }
      };

      pop( options, this.values );
    },

    saveSettings() {
      const options = {};

      const push = ( storage, values ) => {
        for ( let name in values ) {
          const value = values[ name ];
          if ( typeof value.ref === 'function' ) {
            storage[ name ] = value.ref();
          }
          else if ( typeof value === 'object' ) {
            storage[ name ] = { };
            push( storage[ name ], value );
          }
        }
      };

      push( options, this.values );

      window.localStorage.setItem( ID, JSON.stringify( options ) );
    },

    update() {
      for ( let valueID in this.values ) {
        const val = this.values[ valueID ];
        if ( typeof val.update === 'function' ) {
          val.update();
        }
      }
    },

    show( activeVisID ) {
      const container = this.$refs.container;
      const groups = container.querySelectorAll( '.group' );
      groups.forEach( group => {
        const id = group.id;
        if ( id[0] === '_' || !activeVisID || id.indexOf( activeVisID ) === 0 ) {
          group.classList.remove( 'hidden' );
        }
        else {
          group.classList.add( 'hidden' );
        }
      } );
    },

    bind() {
      const container = this.$refs.container;

      for ( let visID in this.values ) {
        const vis = this.values[ visID ];

        const group = document.createElement( 'div' );
        group.classList.add( 'group' );
        group.id = vis.id + '_group';

        const name = document.createElement( 'div' );
        name.classList.add( 'name' );
        name.textContent = vis.title;
        group.appendChild( name );

        if ( vis.options instanceof Array ) {
          vis.options.forEach( item => {
            const subGroup = this.createSubGroup( item, vis.id );
            group.appendChild( subGroup );
          } );
        }
        else {
          for ( let optionID in vis.options ) {
            const option = vis.options[ optionID ];
            const row = this.createRow( option, vis.id + '_' + optionID );
            group.appendChild( row );
          }
        }

        container.appendChild( group );
      }
    },

    createSubGroup( sub, visID ) {
      const subgroup = document.createElement( 'div' );
      subgroup.classList.add( 'subgroup' );

      const name = document.createElement( 'div' );
      name.classList.add( 'subname' );
      name.textContent = sub.title;
      subgroup.appendChild( name );

      for ( let optionID in sub.options ) {
        const option = sub.options[ optionID ];
        const row = this.createRow( option, visID + '_' + optionID );
        subgroup.appendChild( row );
      }

      return subgroup;
    },

    createRow( option, id ) {
      const row = document.createElement( 'div' );
      row.classList.add( 'row' );

      const label = document.createElement( 'div' );
      label.classList.add( 'row-label' );
      label.textContent = option.label;
      row.appendChild( label );

      if ( option.type === Array ) {
        row.appendChild( this.createSelect( option, id ) );
      }
      else if ( option.type === Boolean ) {
        row.appendChild( this.createCheckbox( option, id ) );
      }
      else if ( option.type === String ) {
        row.appendChild( this.createTextInput( option, id ) );
      }
      else if ( option.type === '#' ) {
        row.appendChild( this.createColorbox( option, id ) );
      }
      else if ( option.type === Number ) {
        row.appendChild( this.createNumberInput( option, id ) );
      }

      return row;
    },

    createSelect( option, id ) {
      const select = document.createElement( 'select' );
      select.classList.add( 'value' );
      select.classList.add( id );

      const currentValue = option.ref();
      option.items.forEach( (itemName, index) => {
        const item = document.createElement( 'option' );
        item.value = itemName;
        item.textContent = itemName;
        if (currentValue === itemName) {
          item.selected = true;
        }
        select.appendChild( item );
      } );

      select.addEventListener( 'change', e => {
        option.ref( option.items[ e.target.selectedIndex ] );
      } );

      return select;
    },

    createCheckbox( option, id ) {
      const container = document.createElement( 'span' );

      const checkbox = document.createElement( 'input' );
      checkbox.type = 'checkbox';
      checkbox.classList.add( id );

      checkbox.checked = option.ref();
      checkbox.addEventListener( 'click', e => {
        option.ref( e.target.checked );
      } );

      const label = document.createElement( 'label' );
      const div = document.createElement( 'div' );
      div.textContent = '\u2714';

      label.appendChild( div );
      container.appendChild( checkbox );
      container.appendChild( label );

      return container;
    },

    createTextInput( option, id ) {
      const input = document.createElement( 'input' );
      input.type = 'text';
      input.classList.add( 'value' );
      input.classList.add( id );

      const val = option.ref();
      input.value = val;
      input.addEventListener( 'click', e => {
        option.ref( e.target.value );
      } );

      return input;
    },

    createColorbox( option, id ) {
      const input = document.createElement( 'input' );
      input.type = 'color';
      input.classList.add( 'value' );
      input.classList.add( id );

      const val = option.ref();
      if ( val[0] === '#' ) {
        input.value = Colors.validateColor( val );
        input.addEventListener( 'change', e => {
          option.ref( e.target.value );
        } );
      }
      else {
        const color = Colors.cssColorToHex( val );
        input.value = color.hex;
        input.alpha = color.a;
        input.addEventListener( 'change', e => {
          option.ref( Colors.hexToRgba( e.target.value, e.target.alpha ) );
        } );
      }

      return input;
    },

    createNumberInput( option, id ) {
      const number = document.createElement( 'input' );
      number.type = 'number';
      if ( option.step !== undefined ) {
        number.step = option.step;
      }
      if ( option.min !== undefined ) {
        number.min = option.min;
      }
      if ( option.max !== undefined ) {
        number.max = option.max;
      }
      number.classList.add( 'value' );
      number.classList.add( id );

      number.value = option.ref();
      number.addEventListener( 'change', e => {
        option.ref( +e.target.value );
      } );

      return number;
    },

  },

  mounted() {
    this.loadSettings();
    this.bind();
  },
};
</script>

<style lang="less" scoped>
  #options {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 101;
    background-color: rgba(255, 255, 255, 0.35);

    .inner {
      font-size: 18px;
      font-family: Arial, sans-serif;
      max-width: 20em;
      max-height: 100%;
      margin: 0 0 0 auto;
      border: solid 1px #aaa;
      background-color: #ffe;
    }

    .options-title {
      font-size: 1.5em;
      font-family: 'Open Sans', sans-serif;
      padding: 4px;
      text-align: center;
    }

    .options {
      background-color: #eee;
      font-family: 'Roboto Condensed', sans-serif;
      max-height: ~"calc(100vh - 5em)";
      overflow: auto;
      border-top: solid 1px #ccc;
      border-bottom: solid 1px #ccc;
    }
  }
</style>

<style lang="less">
  #options {
    input,
    select {
      box-shadow: 2px 1px 2px 1px rgba(0, 0, 0, 0.1);
      border: solid 1px #ccc;
      border-radius: 5px;
    }

    select {
      appearance: none;

      background-image: url('data:image/png;base64,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');
      background-repeat: no-repeat;
      background-position: right;
    }

    input[type="checkbox"] {
      opacity: 0;
      height: 1.5em;
      width: 1.5em;
      position: relative;
      right: -1.8em;
      z-index: 1;
    }

    input[type="checkbox"] + label {
      text-align: center;
    }

    input[type="checkbox"] + label div {
      user-select: none;
      display: inline-block;

      line-height: 1.5em;
      font-size: 0.75em;
      height: 1.5em;
      width: 1.5em;
      position: relative;
      top: -0.5em;

      margin: 0 4px 0 0;
      color: transparent;
      background-color: #fff;

      box-shadow: 2px 1px 2px 1px rgba(0, 0, 0, 0.1);
      border: solid 1px #ccc;
      border-radius: 5px;
    }

    input[type="checkbox"]:checked + label div {
      color: black;
    }

    input[type=number] {
      appearance: textfield;
    }

    .group {
      font-weight: bold;
      margin-bottom: 0.9em;

      &.inner {
        padding-left: 2em;
      }

      &.hidden {
        display: none;
      }
    }

    .name {
      color: #ffd;
      background: #444;
      margin-bottom: 0.5em;
      padding: 0.3em 0.5em;
      position: sticky;
    }

    .subname {
      margin: 0.3em 0.5em;
      border-bottom: solid 1px #bbb;
    }

    .row {
      font-size: 12pt;
      font-weight: normal;
      height: 1.8em;
      padding: 0.2em 0.5em;

      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;

      .cell {
        display: inline-block;

        span {
          padding: 0 0.2em;
        }
      }

      .row-label {
        display: inline-block;
        white-space: pre;
      }

      .value {
        width: 4em;
        text-align: right;
      }

      input.value[type="color"] {
        width: 4.5em;
      }

      select.value,
      input.value[type="text"] {
        width: 10em;
        text-align: left;
        height: 100%;
      }

      input.value[type="number"] {
        text-align: center;
      }

      input[type="radio"] {
        margin: 0;
        padding: 0;
        height: 24px;
      }
    }
  }

</style>
