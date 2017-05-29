<template lang="pug">
  #student-list
    p.panel-heading
      nav.level
        .level-left
          .level-item {{students.length}} students
        .level-right
          .level-item
            button.button.is-primary(@click="openEditor()") Add
    .panel-block(v-for="student in students")
      nav.level
        .level-left
          .level-item {{student.name}}
        .level-right
          .level-item
            span.select
              select(:value="getAssignment( student )" @input="setAssignment( student, $event )")
                option(value="") none
                option(v-for="task in tasks" :value="task.id") {{task.name}}
          .level-item
            button.button.is-danger(@click="remove( student )")
              i.fa.fa-remove

    modal-editor-container(v-if="isEditing" title="Available students" @close="closeEditor()")
      div.tabs.is-centered.is-boxed
        ul.ul
          li(:class="{ 'is-active': isGradeSelected( grade ) }" v-for="grade in schoolGrades" )
            a(@click="setCurrentGrade( grade )") {{grade.name}}
      .section.students
        ul(v-for="grade in schoolGrades" v-if="isGradeSelected( grade )")
          li(v-for="student in grade.students" v-if="!student.selected")
            p.student.title.is-5(@click="selectStudent( student, $event)") {{student.ref.name}}
      .field
        p.control
          a.button.is-primary(@click="addNewStudents") Save
</template>

<script>
  import ModalEditorContainer from './ModalEditorContainer';

  export default {
    name: 'introductions',

    data() {
      return {
        parent: this.cls,
        students: [],
        tasks: [],
        schoolGrades: [],

        isEditing: false,
        currentGrade: null
      };
    },

    props: {
      cls: {
        type: Object,
        default: null
      },
      teacher: {
        type: Object,
        default: null
      }
    },

    components: {
      'modal-editor-container': ModalEditorContainer
    },

    methods: {

      loadStudents() {
        this.parent.getStudents( (err, students) => {
          if (err) {
            return `Cannot retrieve students.\n\n${err}`;
          }

          this.students = students.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      loadTasks() {
        this.parent.getTasks( (err, tasks) => {
          if (err) {
            return `Cannot retrieve tasks.\n\n${err}`;
          }

          this.tasks = tasks.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      loadAvailableStudents() {
        this.teacher.getSchool( (err, school) => {
          if (err) {
            return `Cannot retrieve the teacher's school.\n\n${err}`;
          }

          school.getStudents( (err, students) => {
            if (err) {
              return `Cannot retrieve school's students.\n\n${err}`;
            }

            this.schoolGrades = this.makeGrades( students );
          });
        });
      },

      makeGrades( students) {
        const grades = [];
        students.forEach( student => {
          let grade = grades.find( item => {
            return item.name === student.grade.toLowerCase();
          });

          if (!grade) {
            grade = {
              name: student.grade.toLowerCase(),
              students: []
            };
            grades.push( grade );
          }

          if (!this.students.find( item => item.id === student.id ) ) {
            grade.students.push({
              ref: student,
              selected: false
            });
          }
        })

        grades.forEach( grade => {
          grade.students.sort();
        });

        return grades.sort( (a, b) => {
          return a.name < b.name;
        });
      },

      openEditor() {
        this.loadAvailableStudents();
        this.isEditing = true;
      },

      addNewStudents() {
        const newStudents = [];

        this.schoolGrades.forEach( grade => {
          grade.students.forEach( student => {
            if (student.selected) {
              newStudents.push( student.ref.id );
            }
          });
        });

        if (newStudents.length) {
          this.parent.addStudents( newStudents, err => {
            if (err) {
              return console.log( 'TODO display the error' );
            }

            this.loadStudents();
          });
        }

        this.closeEditor();
      },

      closeEditor() {
        this.isEditing = false;
      },

      remove( student ) {
        this.parent.removeStudent( student, err => {
          this.loadStudents();
        });
      },

      // selection
      setCurrentGrade( grade ) {
        this.currentGrade = grade;
      },

      isGradeSelected( grade ) {
        if (!this.currentGrade) {
          return false;
        }
        return this.currentGrade.name === grade.name;
      },

      selectStudent( student ) {
        student.selected = !student.selected;
      },

      getAssignment( student ) {
        return student.assignments ? student.assignments[ this.parent.id ] : '';
      },

      setAssignment( student, e ) {
        student.setAssignment( this.parent.id, e.target.value, err => {
          // TODO display error
        });
      }
    },

    mounted() {
      this.loadStudents();
      this.loadTasks();
      this.loadAvailableStudents();
    }
  };
</script>


<style lang="less" scoped>
  .students {
    min-height: 20em;
    margin-bottom: 1em;
  }

  .tabs {
    margin-bottom: 0 !important;
  }

  .student {
    cursor: cell;
  }

</style>