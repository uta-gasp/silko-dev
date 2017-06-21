<template lang="pug">
  #student-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{ displayCount( students, 'student' ) }}
        .level-right
          .level-item
            button.button.is-primary(@click="openEditor") Add
    .panel-block.is-paddingless
      table.table
        thead
          tr.is-subheader
            th Name
            th.is-narrow
              .has-text-centered Assignment
            th.is-narrow
        tbody
          tr(v-for="student in students" :key="parent.id+student.id")
            td {{ student.name }}
            td.is-narrow
              span.select
                select(:value="getAssignment( student )" @input="setAssignment( student, $event )")
                  option(value="") none
                  option(v-for="task in tasks" :value="task.id" :key="parent.id+student.id+task.id") {{ task.name }}
            td.is-narrow
              button.button.is-danger(@click="remove( student )")
                i.fa.fa-remove

    modal-editor-container(v-if="isEditing" title="Available students" @close="closeEditor")
      student-select-box(:grades="schoolGrades" @accept="addNewStudents")
</template>

<script>
  import stringification from '@/components/mixins/stringification.js';

  import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
  import StudentSelectBox from '@/components/widgets/StudentSelectBox';

  export default {
    name: 'student-list',

    mixins: [ stringification ],

    components: {
      'modal-editor-container': ModalEditorContainer,
      'student-select-box': StudentSelectBox,
    },

    data() {
      return {
        parent: this.cls,
        students: [],
        tasks: [],
        schoolGrades: [],

        isEditing: false,
        currentGrade: null,
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

      makeGrades( students ) {
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

      openEditor( e ) {
        this.loadAvailableStudents();
        this.isEditing = true;
      },

      addNewStudents( e ) {
        if (e.students) {
          this.parent.addStudents( e.students, err => {
            if (err) {
              return console.log( 'TODO display the error', err );
            }

            this.loadStudents();
          });
        }

        this.closeEditor();
      },

      closeEditor( e ) {
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

      remove( student, e ) {
        this.parent.removeStudent( student, err => {
          this.loadStudents();
        });
      },
    },

    mounted() {
      this.loadTasks();
      this.loadAvailableStudents();
    }
  };
</script>


<style lang="less" scoped>
  .table {
    margin-bottom: 0;
  }

  .is-subheader {
    font-size: 12px;
    background-color: hsl(0, 0%, 98%);
    border-bottom: 1px solid #dbdbdb;
  }
</style>