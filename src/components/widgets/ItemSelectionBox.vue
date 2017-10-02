<template lang="pug">
  #item-select-box
    header.tabs.is-centered.is-boxed(v-if="items.length > 0")
      ul.ul
        li(:class="{ 'is-active': isItemSelected( item ) }" v-for="item in items" :key="item.id")
          a(@click="selectItem( item )") {{ item.text }}
    main.subitems
      .has-text-centered(v-if="!isItemSelected()")
        i Select a {{ itemName }}
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
              :class="{ 'is-selected' : subitem.selected }"
              v-for="(subitem, index) in group.items"
              :key="subitem.id")
              .card-content(@click="selectSubitem( subitem, index, $event )") {{ subitem.text }}
        .has-text-centered(v-if="!hasSubitems( currentItem )")
          i No available {{ subitemName }}
    footer.field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(:disabled="!hasItemsSelected" @click="accept") Select
            .level-item
          .level-right
            .level-item
              button.button(v-if="multiple && !singleGroup" :disabled="!hasSubitems()" @click="selectAllSubitems") Select all
            .level-item
              button.button(v-if="multiple" :disabled="!hasSubitems()" @click="removeAllSubitems") Remove all selections
</template>

<script>
export default {
  name: 'item-select-box',

  data() {
    return {
      currentItem: null,
      groups: null,

      lastSelectionIndex: -1,
      lastSelectionGroup: '',
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
    hasItemsSelected() {
      return this.items.some( item => item.subitems.some( subitem => subitem.selected ) );
    },
  },

  methods: {
    groupedSubitems() {
      if ( !this.currentItem ) {
        return null;
      }

      const groups = { '_': { items: [], hidden: false } };

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

    selectItem( item, e ) {
      this.currentItem = item;
      this.groups = this.groupedSubitems();
    },

    isItemSelected( item ) {
      if ( !this.currentItem ) {
        return false;
      }

      return item ? this.currentItem.id === item.id : !!this.currentItem;
    },

    hasSubitems( item ) {
      item = item || this.currentItem;
      return item && item.subitems ? !!item.subitems.length : false;
    },

    isGroupVisible( group ) {
      return !group.hidden;
    },

    toggleItemsVisibility( group, e ) {
      group.hidden = !group.hidden;
    },

    selectMultipleSubitems( subitem, event ) {
      if ( event.shiftKey ) {
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

    selectSubitem( subitem, index, e ) {
      if ( !this.multiple ) {
        this.items.forEach( item => {
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

    selectAllSubitems( e ) {
      this.currentItem.subitems.forEach( subitem => {
        subitem.selected = true;
      } );
    },

    removeAllSubitems( e ) {
      this.currentItem.subitems.forEach( subitem => {
        subitem.selected = false;
      } );
    },

    accept( e ) {
      const selected = {};
      let selectedOnly = null;

      this.items.forEach( item => {
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
      this.selectItem( this.items[0] );
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
