<template lang="pug">
  .bulma-checkbox(@click="toggle")
    .button.is-primary.is-inverted(:disabled="disabled")
      .icon(v-show="checked")
        i.fa.fa-check
    label(:disabled="disabled") {{ label }}
</template>

<script>
  export default {
    name: 'bulma-checkbox',

    data() {
      return {
        checked: !!this.value || false
      };
    },

    props: {
      value: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },

    methods: {

      toggle( e ) {
        if (this.disabled) {
          return;
        }

        this.checked = !this.checked;
        this.$emit( 'input', this.checked );
      }

    }
  }
</script>

<style lang="less" scoped>
  .bulma-checkbox {
    position: relative;
    line-height: 2.25em;
    height: 2.25em;

    .button {
      position: absolute;
      left: 0;
      top: 0;
      height: 2.25em;
      width: 2.25em;

      border: 1px solid #dbdbdb;
      border-radius: 3px;

      &[disabled] {
        cursor: not-allowed;
        background-color: white;
        border-color: #dbdbdb;
        box-shadow: none;
        opacity: 0.5;
      }
    }

    label {
      display: inline-block;

      line-height: 1.75em;
      padding: 0.25em;
      padding-left: 2.5em;
      cursor: pointer;

      &[disabled] {
        cursor: not-allowed;
        color: #7a7a7a;
      }
    }
  }

</style>