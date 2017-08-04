<template lang="pug">
  #student-select-box
    div.tabs.is-centered.is-boxed(v-if="grades.length > 1")
      ul.ul
        li(:class="{ 'is-active': isGradeSelected( grade ) }" v-for="grade in grades" :key="grade.name")
          a(@click="selectGrade( grade )") {{ grade.name }}
    .students
      .has-text-centered(v-if="!isGradeSelected()")
        i Select a grade
      div(v-for="grade in grades" v-if="isGradeSelected( grade )")
        .card.student(
          :class="{ 'is-selected' : student.selected }"
          v-if="hasStudents( grade )"
          v-for="student in grade.students")
          .card-content.title.is-6(@click="selectStudent( student, $event )") {{ student.ref.name }}
        .has-text-centered(v-if="!hasStudents( grade )")
          i No available students
    .field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(@click="accept") Select
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
      grades: {     // [{ name, students: [{ ref=Student, selected=Boolean }] }]
        type: Array,
        default: []
      },
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

      selectMultipleStudents( student, event ) {
        if (event.shiftKey) {
          const index = this.currentGrade.students.indexOf( student );
          for (let i = index - 1; i >= 0; i--) {
            const student = this.currentGrade.students[i];
            if (student.selected) {
              break;
            }

            student.selected = true;
          }
        }
      },

      selectStudent( student, e ) {
        student.selected = !student.selected;

        if (student.selected) {
          this.selectMultipleStudents( student, e );
        }
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
    },

    mounted() {
      if (this.grades.length === 1) {
        this.selectGrade( this.grades[0] );
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
