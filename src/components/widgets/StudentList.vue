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
      item-selection-box(:items="schoolGrades" item-name="grade" subitem-name="student" @accept="addNewStudents")
</template>

<script>
import dataUtils from '@/utils/data-utils.js';

import stringification from '@/components/mixins/stringification.js';

import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
import ItemSelectionBox from '@/components/widgets/ItemSelectionBox';

export default {
  name: 'student-list',

  mixins: [ stringification ],

  components: {
    'modal-editor-container': ModalEditorContainer,
    'item-selection-box': ItemSelectionBox,
  },

  data() {
    return {
      parent: this.cls,
      students: [],
      schoolStudents: null,
      tasks: [],
      schoolGrades: [],

      isEditing: false,
      currentGrade: null,
    };
  },

  props: {
    cls: {
      type: Object,
      default: null,
    },
    teacher: {
      type: Object,
      default: null,
    },
    refresh: {
      type: Number,
      default: 0,
    },
  },

  watch: {
    refresh() {
      this.loadTasks();
    },
  },

  methods: {

    loadTasks() {
      this.parent.getTasks( ( err, tasks ) => {
        if ( err ) {
          return `Cannot retrieve tasks.\n\n${err}`;
        }

        this.tasks = tasks.sort( dataUtils.byName );

        this.loadStudents();
      } );
    },

    loadStudents() {
      this.parent.getStudents( ( err, students ) => {
        if ( err ) {
          return `Cannot retrieve students.\n\n${err}`;
        }

        this.students = students.sort( dataUtils.byName );
      } );
    },

    loadAvailableStudents() {
      this.teacher.getSchool( ( err, school ) => {
        if ( err ) {
          return `Cannot retrieve the teacher's school.\n\n${err}`;
        }

        school.getStudents( ( err, students ) => {
          if ( err ) {
            return `Cannot retrieve school's students.\n\n${err}`;
          }

          this.schoolStudents = students;
          this.schoolGrades = this.makeGrades( students );
        } );
      } );
    },

    makeGrades( students ) {
      const grades = [];
      students.forEach( student => {
        let grade = grades.find( item => {
          return item.text === student.grade.toLowerCase();
        } );

        if ( !grade ) {
          grade = {
            id: Math.random(),
            text: student.grade.toLowerCase(),
            subitems: [],
          };
          grades.push( grade );
        }

        if ( !this.students.find( item => item.id === student.id ) ) {
          grade.subitems.push( {
            id: student.id,
            text: student.name,
            selected: false,
          } );
        }
      } );

      grades.forEach( grade => {
        grade.subitems.sort( (a, b) => a.text.toLowerCase() > b.text.toLowerCase() );
      } );

      return grades.sort( ( a, b ) => {
        if ( a.text[0] <= '9' && b.text[0] > '9' ) {
          return true;
        }
        else if ( a.text[0] > '9' && b.text[0] <= '9' ) {
          return false;
        }
        return a.text > b.text;
      } );
    },

    openEditor( e ) {
      this.loadAvailableStudents();
      this.isEditing = true;
    },

    addNewStudents( e ) {
      if ( e.subitems ) {
        this.parent.addStudents( e.subitems, err => {
          if ( err ) {
            return console.log( 'TODO display the error', err );
          }

          this.loadStudents();
        } );
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
        if ( err ) {
          console.log( 'TODO display error', err );
        }
      } );
    },

    remove( student, e ) {
      /* eslint-disable handle-callback-err */
      this.parent.removeStudent( student, err => {
        this.loadStudents();
      } );
    },
  },

  mounted() {
    this.loadTasks();
    this.loadAvailableStudents();
  },
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
