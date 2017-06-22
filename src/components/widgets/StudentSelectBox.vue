<template lang="pug">
  #student-select-box
    div.tabs.is-centered.is-boxed
      ul.ul
        li(:class="{ 'is-active': isGradeSelected( grade ) }" v-for="grade in grades" :key="grade")
          a(@click="selectGrade( grade )") {{ grade.name }}
    .students
      .has-text-centered(v-if="!isGradeSelected()")
        i Select a grade
      div(v-for="grade in grades" v-if="isGradeSelected( grade )")
        .card.student(
          :class="{ 'is-selected' : student.selected }"
          v-if="hasStudents( grade )"
          v-for="student in grade.students")
          .card-content.title.is-6(@click="selectStudent( student )") {{ student.ref.name }}
        .has-text-centered(v-if="!hasStudents( grade )")
          i No available students
    .field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(@click="accept") Save
            .level-item
          .level-right
            .level-item
              button.button(:disabled="!hasStudents()" @click="selectAllStudents") Select all
            .level-item
              button.button(:disabled="!hasStudents()" @click="removeAllStudents") Remove all selections
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

      selectGrade( grade, e ) {
        this.currentGrade = grade;
      },

      isGradeSelected( grade ) {
        if (!this.currentGrade) {
          return false;
        }

        return grade ? this.currentGrade.name === grade.name : !!this.currentGrade;
      },

      hasStudents( grade ) {
        grade = grade || this.currentGrade;
        return grade && grade.students ? !!grade.students.length : false;
      },

      selectStudent( student, e ) {
        student.selected = !student.selected;
      },

      selectAllStudents( e ) {
        this.currentGrade.students.forEach( student => {
          student.selected = true;
        });
      },

      removeAllStudents( e ) {
        this.currentGrade.students.forEach( student => {
          student.selected = false;
        });
      },

      accept( e ) {
        const selected = {};

        this.grades.forEach( grade => {
          grade.students.forEach( student => {
            if (student.selected) {
              selected[ student.ref.id ] = student.ref.name;
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
    min-height: 20em;
    max-height: 26em;
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