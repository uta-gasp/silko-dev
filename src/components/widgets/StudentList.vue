<template lang="pug">
  #student-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{gui.displayCount( students, 'student' )}}
        .level-right
          .level-item
            button.button.is-primary(@click="openEditor()") Add
    .panel-block(v-for="student in students" :key="parent.id+student.id")
      nav.level
        .level-left
          .level-item {{student.name}}
        .level-right
          .level-item
            span.select
              select(:value="getAssignment( student )" @input="setAssignment( student, $event )")
                option(value="") none
                option(v-for="task in tasks" :value="task.id" :key="parent.id+student.id+task.id") {{task.name}}
          .level-item
            button.button.is-danger(@click="remove( student )")
              i.fa.fa-remove

    modal-editor-container(v-if="isEditing" title="Available students" @close="closeEditor()")
      div.tabs.is-centered.is-boxed
        ul.ul
          li(:class="{ 'is-active': isGradeSelected( grade ) }" v-for="grade in schoolGrades" :key="grade")
            a(@click="setCurrentGrade( grade )") {{grade.name}}
      .students
        .has-text-centered(v-if="!isGradeSelected()")
          i Select a class
        .container(v-for="grade in schoolGrades" v-if="isGradeSelected( grade )")
          .card.is-fullwidth.student(:class="{ 'is-selected' : student.selected }" v-for="student in grade.students")
            .card-content.title.is-5(@click="selectStudent( student, $event)") {{student.ref.name}}
      .field
        p.control
          a.button.is-primary(@click="addNewStudents") Save
</template>

<script>
  import gui from '@/utils/gui.js';

  import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';

  export default {
    name: 'introductions',

    data() {
      return {
        parent: this.cls,
        students: [],
        tasks: [],
        schoolGrades: [],

        isEditing: false,
        currentGrade: null,

        gui
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
      },
      refresh: {
        type: Number,
        default: 0
      }
    },

    components: {
      'modal-editor-container': ModalEditorContainer
    },

    watch: {
      refresh() {
        this.loadTasks();
      }
    },

    methods: {

      loadTasks() {
        this.parent.getTasks( (err, tasks) => {
          if (err) {
            return `Cannot retrieve tasks.\n\n${err}`;
          }

          this.tasks = tasks.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });

          this.loadStudents();
        });
      },

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
          if (a.name[0] <= '9' && b.name[0] > '9') {
            return true;
          }
          else if (a.name[0] > '9' && b.name[0] <= '9') {
            return false;
          }
          return a.name > b.name;
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
              return console.log( 'TODO display the error', err );
            }

            this.loadStudents();
          });
        }

        this.closeEditor();
      },

      closeEditor() {
        this.isEditing = false;
      },

      getAssignment( student ) {
        return student.assignments ? student.assignments[ this.parent.id ] : '';
      },

      setAssignment( student, e ) {
        student.setAssignment( this.parent.id, e.target.value, err => {
          if (err) {
            console.log( 'TODO display error', err );
          }
        });
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
        return grade ? this.currentGrade.name === grade.name : !!this.currentGrade;
      },

      selectStudent( student ) {
        student.selected = !student.selected;
      },
    },

    mounted() {
      this.loadTasks();
      this.loadAvailableStudents();
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