<template lang="pug">
  #item-select-box
    div.tabs.is-centered.is-boxed(v-if="items.length > 1")
      ul.ul
        li(:class="{ 'is-active': isItemSelected( item ) }" v-for="item in items" :key="item.id")
          a(@click="selectItem( item )") {{ item.text }}
    .subitems
      .has-text-centered(v-if="!isItemSelected()")
        i Select a {{ itemName }}
      div(v-for="item in items" v-if="isItemSelected( item )")
        .card.subitem(
          :class="{ 'is-selected' : subitem.selected }"
          v-if="hasSubitems( item )"
          v-for="subitem in item.subitems"
          :key="subitem.id")
          .card-content.title.is-6(@click="selectSubitem( subitem, $event )") {{ subitem.text }}
        .has-text-centered(v-if="!hasSubitems( item )")
          i No available {{ subitemName }}
    .field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(:disabled="!hasItemsSelected" @click="accept") Select
            .level-item
          .level-right
            .level-item
              button.button(v-if="multiple" :disabled="!hasSubitems()" @click="selectAllSubitems") Select all
            .level-item
              button.button(v-if="multiple" :disabled="!hasSubitems()" @click="removeAllSubitems") Remove all selections
</template>

<script>
export default {
  name: 'item-select-box',

  data() {
    return {
      currentItem: null,
    };
  },

  props: {
    items: {     // [{ id, text, subitems: [{ id, text, selected=Boolean }] }]
      type: Array,
      required: true,
    },
    multiple: {
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
    selectItem( item, e ) {
      this.currentItem = item;
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

    selectMultipleSubitems( subitem, event ) {
      if ( event.shiftKey ) {
        const index = this.currentItem.subitems.indexOf( subitem );
        for ( let i = index - 1; i >= 0; i-- ) {
          const subitem = this.currentItem.subitems[i];
          if ( subitem.selected ) {
            break;
          }

          subitem.selected = true;
        }
      }
    },

    selectSubitem( subitem, e ) {
      if ( !this.multiple ) {
        this.items.forEach( item => {
          item.subitems.forEach( subitem => {
            subitem.selected = false;
          } );
        } );
      }

      subitem.selected = !subitem.selected;

      if ( this.multiple && subitem.selected ) {
        this.selectMultipleSubitems( subitem, e );
      }
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

  mounted() {
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
</style>
