<template lang="pug">
  #student-select-box
    div.tabs.is-centered.is-boxed
      ul.ul
        li(:class="{ 'is-active': isGradeSelected( grade ) }" v-for="grade in grades" :key="grade")
          a(@click="setCurrentGrade( grade )") {{grade.name}}
    .students
      .has-text-centered(v-if="!isGradeSelected()")
        i Select a class
      .container(v-for="grade in grades" v-if="isGradeSelected( grade )")
        .card.is-fullwidth.student(:class="{ 'is-selected' : student.selected }" v-for="student in grade.students")
          .card-content.title.is-5(@click="selectStudent( student, $event)") {{student.ref.name}}
    .field
      p.control
        a.button.is-primary(@click="accept()") Save
</template>

<script>
  export default {
    name: 'student-select-box',

    data() {
      return {
        currentGrade: null,
      };
    },

    props: {
      grades: {
        type: Array,
        default: []
      }
    },

    methods: {
      setCurrentGrade( grade ) {
        this.currentGrade = grade;
      },

      isGradeSelected( grade ) {
        if (!this.currentGrade) {
          return false;
        }

        return grade ? this.currentGrade.name === grade.name : !!this.currentGrade;
      },

      selectStudent( student ) {
        student.selected = !student.selected;
      },

      accept() {
        const selected = [];

        this.grades.forEach( grade => {
          grade.students.forEach( student => {
            if (student.selected) {
              selected.push( student.ref.id );
            }
          });
        });

        this.$emit( 'accept', { students: selected } );
      }
    }
  };
</script>

<style lang="less" scoped>
  .students {
    min-height: 50vh;
    max-height: 90vh;
    margin-bottom: 1em;
    overflow-y: auto;
  }

  .tabs {
    margin-bottom: 0 !important;
  }

  .student {
    cursor: cell;
  }

  .is-selected {
    background-color: #cfc;
  }

</style>