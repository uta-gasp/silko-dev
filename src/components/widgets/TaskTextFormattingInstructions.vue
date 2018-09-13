<template lang="pug">
  nav.panel.notification.is-paddingless#task-text-formatting-instructions
    p.panel-block
      h4.heading.is-4.has-text-centered {{ tokens[ 'rules' ] }}
    p.panel-block
      code [{{ tokens[ 'empty_line' ] }}]
      span.explanation {{ tokens[ 'separator' ] }}
    p.panel-block
      code |
      span.explanation {{ tokens[ 'styles' ] }}
        span.explanation.is-inline-block {{ tokens[ 'word' ] }}:
          .example
            i Iso koulupiha|bold
            span &#61; Iso
            b koulupiha
        span.explanation.is-inline-block {{ tokens[ 'line' ] }}:
          .example
            i Iso koulupiha |bold
            span &#61;
            b Iso koulupiha
    p.panel-block
      code
        a(href="https://www.w3schools.com/cssref/css_colors.asp" target="_blank") red
        span
        a(href="https://www.w3schools.com/colors/colors_rgb.asp" target="_blank") #22aaff
        span
        abbr(:title="tokens[ 'lighter' ]") light
        span
        abbr(:title="tokens[ 'darker' ]") dark
      span.explanation {{ tokens[ 'color' ] }}
    p.panel-block
      code 22pt
      span.explanation {{ tokens[ 'size' ] }}
    p.panel-block
      code italic regular
      span.explanation {{ tokens[ 'style' ] }}
    p.panel-block
      code normal bold
      span.explanation {{ tokens[ 'weight' ] }}
    p.panel-block
      span.has-text-centered
        h4.heading.is-4.is-inline.has-text-centered {{ tokens[ 'example' ] }}
        i.is-block A big grey line with blue|#22aaff &amp; italic|italic words |grey,18pt
        .is-block(style="color: grey; font-size: 18pt")
          span A big grey line with
          span(style="color: #22aaff") blue
          span &amp;
          span(style="font-style: italic") italic
          span words
</template>

<script>
import { i10n } from '@/utils/i10n.js';

export default {
  data() {
    return {
      tokens: i10n( 'task_text_format' ),
    };
  }
};

</script>

<style lang="less" scoped>

  #task-text-formatting-instructions {
    background-color: hsl(0, 0%, 86%);
  }

  .explanation {
    padding-left: 1em;
  }

  .panel-block {
    span:before,
    span:after {
      content: " ";
    }
  }

  .example {
    display: inline-block;
    background-color: white;
    padding: 0 0.5em;
    margin: 2px 0.5em;
  }

</style>
