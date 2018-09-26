<template lang="pug">
  #item-select-box
    header.tabs.is-centered.is-boxed(v-if="items.length > 0")
      ul.ul
        li(v-if="items.length > 1" v-for="item in items" :key="item.id" :class="{ 'is-active': isItemSelected( item ) }")
          a(@click="selectItem( item )") {{ item.text }}
    main.subitems
      .has-text-centered(v-if="!isItemSelected()")
        i {{ tokens[ 'lbl_select' ]( itemName ) }}
      div(v-if="currentItem")
        //- .card.subitem(
        //-   :class="{ 'is-selected' : subitem.selected }"
        //-   v-if="hasSubitems( currentItem )"
        //-   v-for="subitem in currentItem.subitems"
        //-   :key="subitem.id")
        //-   .card-content.title.is-6(@click="selectSubitem( subitem, $event )") {{ subitem.text }}
        article.message.is-primary.group(v-for="(group, name) in groups" v-if="group.items.length" :key="name")
          .message-header(v-if="name !== '_'" @click="toggleItemsVisibility( group )")
            p {{ name }}
          .message-body.is-paddingless
            .card.subitem(
              v-show="isGroupVisible( group )"
              v-for="(subitem, index) in group.items"
              :class="{ 'is-selected' : subitem.selected }"
              :key="subitem.id")
              .card-content(@click="selectSubitem( subitem, index, $event )") {{ subitem.text }}
        .has-text-centered(v-if="!hasSubitems( currentItem )")
          i {{ tokens[ 'lbl_no_avail' ]( subitemName ) }}
    footer.field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(:disabled="!hasItemsSelected" @click="accept") {{ tokens[ 'btn_select' ] }}
            .level-item
          .level-right
            .level-item
              button.button(v-if="multiple && !singleGroup" :disabled="!hasSubitems()" @click="selectAllSubitems") {{ tokens[ 'btn_select_all' ] }}
            .level-item
              button.button(v-if="multiple" :disabled="!hasSubitems()" @click="removeAllSubitems") {{ tokens[ 'btn_remove_all' ] }}
</template>

<script>
import { i10n } from '@/utils/i10n.js';

// ts-check-only
import Subitem from '@/utils/selectionBoxItem.js';

/**
 * @typedef Item
 * @property {string} id 
 * @property {string} text 
 * @property {Subitem[]} subitems 
 */

/**
 * @typedef Group
 * @property {Item[]} items 
 * @property {boolean} hidden
 */

/**
 * @typedef {Record<string, Group>} Groups
 */

 /** @type {Item} */
const __needed_only_to_make_vscode_happy_happy_about_Item__ = null;

/**
 * @fires accept
 */
export default {
  name: 'item-select-box',

  data() {
    return {
      /** @type {Item} */
      currentItem: null,
      /** @type {Groups} */
      groups: null,

      lastSelectionIndex: -1,
      lastSelectionGroup: '',

      tokens: i10n( 'selection_box' ),
    };
  },

  props: {
    items: {     // [{ id, text, subitems: [ /utils/SelectionBoxItem ] }]
      type: Array,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    singleGroup: {
      type: Boolean,
      default: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    subitemName: {
      type: String,
      required: true,
    },
  },

  computed: {
    /** @returns {boolean} */
    hasItemsSelected() {
      const items = /** @type {Array<Item>} */ (this.items);
      return items.some( item => item.subitems.some( subitem => subitem.selected ) );
    },
  },

  methods: {
    /** @returns {Groups} */
    groupedSubitems() {
      if ( !this.currentItem ) {
        return null;
      }

      const groups = { '_': { items: /** @type {Subitem[]} */ ([]), hidden: false } };

      this.currentItem.subitems.forEach( subitem => {
        if ( !subitem.group ) {
          groups[ '_' ].items.push( subitem );
        }
        else if ( !groups[ subitem.group ] ) {
          groups[ subitem.group ] = { items: [ subitem ], hidden: false };
        }
        else {
          groups[ subitem.group ].items.push( subitem );
        }
      } );

      return groups;
    },

    /** 
     * @param {Item} item 
     * @param {Event} e
     */
    selectItem( item, e ) {
      this.currentItem = item;
      this.groups = this.groupedSubitems();
    },

    /** 
     * @param {Item} item 
     * @returns {boolean}
     */
    isItemSelected( item ) {
      if ( !this.currentItem ) {
        return false;
      }

      return item ? this.currentItem.id === item.id : !!this.currentItem;
    },

    /** 
     * @param {Item} item 
     * @returns {boolean}
     */
    hasSubitems( item ) {
      item = item || this.currentItem;
      return item && item.subitems ? !!item.subitems.length : false;
    },

    /** 
     * @param {Group} group 
     * @returns {boolean}
     */
    isGroupVisible( group ) {
      return !group.hidden;
    },

    /** 
     * @param {Group} group 
     * @param {Event} e
     */
    toggleItemsVisibility( group, e ) {
      group.hidden = !group.hidden;
    },

    /** 
     * @param {Subitem} subitem 
     * @param {MouseEvent} e
     */
    selectMultipleSubitems( subitem, e ) {
      if ( e.shiftKey ) {
        const index = this.currentItem.subitems.indexOf( subitem );
        const delta = this.lastSelectionIndex < index ? -1 : 1;
        const edge = this.lastSelectionIndex < index ? -1 : this.currentItem.subitems.length;

        for ( let i = index + delta; i !== edge; i += delta ) {
          const si = this.currentItem.subitems[i];
          if ( si.selected ) {
            break;
          }

          si.selected = this.singleGroup ? si.group === subitem.group : true;
        }
      }
    },

    /** 
     * @param {Subitem} subitem 
     * @param {number} index 
     * @param {MouseEvent} e
     */
    selectSubitem( subitem, index, e ) {
      if ( !this.multiple ) {
        /** @type {Array<Item>} */ (this.items).forEach( item => {
          item.subitems.forEach( subitem => {
            subitem.selected = false;
          } );
        } );
      }

      subitem.selected = !subitem.selected;

      if ( this.multiple && subitem.selected ) {
        if ( this.singleGroup && this.currentItem ) {
          const group = subitem.group;
          this.currentItem.subitems.forEach( subitem => {
            if ( subitem.group !== group ) {
              subitem.selected = false;
            }
          } );

          if ( this.lastSelectionGroup !== subitem.group ) {
            this.lastSelectionIndex = -1;
          }
        }

        this.selectMultipleSubitems( subitem, e );
      }

      this.lastSelectionIndex = index;
      this.lastSelectionGroup = subitem.group;
    },

    /** @param {Event} e */
    selectAllSubitems( e ) {
      this.currentItem.subitems.forEach( subitem => {
        subitem.selected = true;
      } );
    },

    /** @param {Event} e */
    removeAllSubitems( e ) {
      this.currentItem.subitems.forEach( subitem => {
        subitem.selected = false;
      } );
    },

    /** @param {Event} e */
    accept( e ) {
      const selected = {};
      let selectedOnly = null;

      /** @type {Array<Item>} */ (this.items).forEach( item => {
        item.subitems.forEach( subitem => {
          if ( subitem.selected ) {
            selected[ subitem.id ] = subitem.text;
            if ( !this.multiple ) {
              selectedOnly = subitem;
            }
          }
        } );
      } );

      this.$emit( 'accept', {
        subitems: selected,
        selected: selectedOnly,
      } );
    },
  },

  created() {
    if ( this.items.length === 1 ) {
      this.selectItem( this.items[0], null );
    }
  },
};
</script>

<style lang="less" scoped>
  .subitems {
    min-height: 20em;
    max-height: 26em;
    margin-bottom: 1em;
    overflow-y: auto;
  }

  .tabs {
    margin-bottom: 0 !important;
  }

  .subitem {
    cursor: cell;
    user-select: none;
  }

  .is-selected {
    background-color: #cfc;
  }

  .card-content {
    padding: 1rem;
  }

  .columns {
    margin-bottom: 0;
  }

  .column {
    padding-bottom: 0;
  }

  .level:not(:last-child) {
    margin-bottom: 0;
  }

  .group {
    margin-bottom: 0.5em;
  }

  .message {
    background-color: transparent;
  }

  .message-header {
    cursor: pointer;
  }

  .message-header + .message-body {
    margin-left: 1em;
    border-left: none;
    border-bottom: none;
  }
</style>
