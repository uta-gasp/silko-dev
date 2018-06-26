<template lang="pug">
  nav.panel.notification.is-paddingless#task-text-formatting-instructions
    p.panel-block
      h4.heading.is-4.has-text-centered Rules
    p.panel-block
      code Empty line
      span.explanation page separator
    p.panel-block
      code |
      span.explanation applies comma-separated styles listed afterward for
        span.explanation.is-inline-block a word:
          .example
            i Iso koulupiha|bold
            span &#61; Iso
            b koulupiha
        span.explanation.is-inline-block a line:
          .example
            i Iso koulupiha |bold
            span &#61;
            b Iso koulupiha
    p.panel-block
      code
        a(href="https://www.w3schools.com/cssref/css_colors.asp" target="_blank") red
        span
        a(href="https://www.w3schools.com/colors/colors_rgb.asp") #22aaff
        span
        abbr(title="25% lighter than the normal text") light
        span
        abbr(title="25% darker than the normal text") dark
      span.explanation font color
    p.panel-block
      code 22pt
      span.explanation font size
    p.panel-block
      code italic regular
      span.explanation font style
    p.panel-block
      code normal bold
      span.explanation font weight
    p.panel-block
      span.has-text-centered
        h4.heading.is-4.is-inline.has-text-centered Example
        i.is-block A big grey line with blue|#22aaff &amp; italic|italic words |grey,18pt
        .is-block(style="color: grey; font-size: 18pt")
          span A big grey line with
          span(style="color: #22aaff") blue
          span &amp;
          span(style="font-style: italic") italic
          span words
</template>

<script>
export default {

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
