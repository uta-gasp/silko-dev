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
      .container(v-if="students === null")
        loading
      table.table(v-else)
        thead
          tr.is-subheader(v-if="students && students.length")
            th Name
            th.is-narrow
              .has-text-centered Assignments
            th.is-narrow
        tbody
          tr(v-for="student in students" :key="currentClass.id+student.id")
            td {{ student.name }}
            td.is-narrow
              .tags
                .tag.is-medium(v-for="(cls, task) in student.assignments" v-if="doesTaskBelongsToClass(task)") {{ getAssignmentName( task ) }}
                  button.delete.is-small(@click="removeAssignment( student, task )")

              //- .assignments
              //-   .assignment(v-for="(cls, task) in student.assignments")
              //-     .name {{ getAssignmentName( task ) }}
              //-     button.delete.is-small(@click="removeAssignment( student, task )")
              .dropdown(
                  :ref="currentClass.id+student.id"
                  v-show="availableTasks( student ).length"
                  @focusout="hideTaskList( currentClass.id+student.id )")
                .dropdown-trigger
                  button.button(aria-haspopup="true" aria-controls="dropdown-menu" @click="showTaskList( currentClass.id+student.id )")
                    span Add an assignment
                    span.icon.is-small
                      i.fa.fa-angle-down(aria-hidden="true")
                .dropdown-menu(role="menu")
                  .dropdown-content
                    .dropdown-item(v-for="task in availableTasks( student )" @click="addAssignment( student, task.id, $event )" ) {{ task.name }}
              //- span.select
              //-   select(:value="getAssignment( student )" @input="setAssignment( student, $event )")
              //-     option(value="") none
              //-     option(v-for="task in tasks" :value="task.id" :key="currentClass.id+student.id+task.id") {{ task.name }}
            td.is-narrow
              button.button.is-danger(title="Remove the student from this class" @click="remove( student )")
                i.fa.fa-remove

    modal-container(v-if="isEditing" title="Available students" @close="closeEditor")
      item-selection-box(
        :items="schoolGrades"
        :multiple="true"
        :single-group="false"
        item-name="grade"
        subitem-name="student"
        @accept="addNewStudents")

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}
</template>

<script>
import dataUtils from '@/utils/data-utils.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading';
import ModalContainer from '@/components/widgets/ModalContainer';
import ItemSelectionBox from '@/components/widgets/ItemSelectionBox';
import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'student-list',

  mixins: [ ActionError, ActionSuccess ],

  components: {
    'loading': Loading,
    'modal-container': ModalContainer,
    'item-selection-box': ItemSelectionBox,
    'temporal-notification': TemporalNotification,
  },

  data() {
    return {
      currentClass: this.cls,
      students: null,
      schoolStudents: null,
      tasks: [],
      schoolGrades: [],

      isEditing: false,
      currentGrade: null,

      activeMenu: null,
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
      this.currentClass.getTasks( ( err, tasks ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load tasks' );
        }

        this.tasks = tasks.sort( dataUtils.byName );

        this.loadStudents();
      } );
    },

    loadStudents() {
      this.currentClass.getStudents( ( err, students ) => {
        if ( err ) {
          this.students = [];
          return this.setError( err, 'Failed to load students' );
        }

        this.students = students.sort( dataUtils.byName );
      } );
    },

    loadAvailableStudents( cb ) {
      this.teacher.getSchool( ( err, school ) => {
        if ( err ) {
          this.setError( err, 'Failed to load teacher\'s school' );
          return cb( err );
        }

        school.getStudents( ( err, students ) => {
          if ( err ) {
            return this.setError( err, 'Failed to load school students' );
          }

          this.schoolStudents = students;
          this.schoolGrades = this.makeGrades( students );

          cb();
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
        grade.subitems.sort( ( a, b ) => a.text.toLowerCase() > b.text.toLowerCase() );
      } );

      return grades.sort( ( a, b ) => {
        const gradeA = Number.parseInt( a.text, 10 );
        const gradeB = Number.parseInt( b.text, 10 );
        if ( !Number.isNaN( gradeA ) && !Number.isNaN( gradeB ) ) {
          if ( gradeA === gradeB ) {
            return a.text > b.text;
          }
          else {
            return gradeA > gradeB;
          }
        }
        else {
          return a.text > b.text;
        }
        // if ( a.text[0] <= '9' && b.text[0] > '9' ) {
        //   return true;
        // }
        // else if ( a.text[0] > '9' && b.text[0] <= '9' ) {
        //   return false;
        // }
        // return a.text > b.text;
      } );
    },

    displayCount( arr, name ) {
      return dataUtils.displayCount( arr, name );
    },

    openEditor( e ) {
      this.loadAvailableStudents( err => {
        if (!err) {
          this.isEditing = true;
        }
      });
    },

    addNewStudents( e ) {
      if ( e.subitems ) {
        this.currentClass.addStudents( e.subitems, err => {
          if ( err ) {
            this.setError( err, 'Failed to add new student' );
          }
          else {
            this.setSuccess( 'Students were added' );
          }

          this.loadStudents();
        } );
      }

      this.closeEditor();
    },

    closeEditor( e ) {
      this.isEditing = false;
    },

    addAssignment( student, taskID, e ) {
      this.hideTaskList();

      student.addAssignment( taskID, this.currentClass.id, err => {
        if ( err ) {
          this.setError( err, 'Failed to add the assignment' );
        }
        else {
          this.setSuccess( 'The assignment was added' );
        }
      } );
    },

    removeAssignment( student, taskID, e ) {
      student.removeAssignment( taskID, err => {
        if ( err ) {
          this.setError( err, 'Failed to remove the assignment' );
        }
        else {
          this.setSuccess( 'The assignment was removed' );
        }
      } );
    },

    getAssignment( student ) {
      return student.assignments ? student.assignments[ this.currentClass.id ] : '';
    },

    setAssignment( student, e ) {
      const taskID = e.target.value;

      student.setAssignment( this.currentClass.id, taskID, err => {
        if ( err ) {
          this.setError( err, 'Failed to set the task to the student' );
        }
        else {
          this.setSuccess( `The task was ${!taskID ? 'removed' : 'set'}` );
        }
      } );
    },

    remove( student, e ) {
      this.currentClass.removeStudent( student, err => {
        if ( err ) {
          this.setError( err, 'Failed to remove the student from the list' );
        }
        else {
          this.setSuccess( 'The student was removed' );
        }

        this.loadStudents();
      } );
    },

    availableTasks( student ) {
      return this.tasks.filter( task => !student.assignments[ task.id ] );
    },

    showTaskList( id ) {
      this.hideTaskList();

      this.activeMenu = this.$refs[ id ][0];
      this.activeMenu.classList.add( 'is-active' );
    },

    hideTaskList( id ) {
      const cb = () => {
        if ( this.activeMenu ) {
          this.activeMenu.classList.remove( 'is-active' );
          this.activeMenu = null;
        }
      };

      if ( id ) {
        window.setTimeout( cb, 100 );
      }
      else {
        cb();
      }
    },

    doesTaskBelongsToClass( id ) {
      return this.tasks.some( task => task.id === id );
    },

    getAssignmentName( id ) {
      return this.tasks.find( task => task.id === id ).name;
    },
  },

  mounted() {
    this.loadTasks();
    this.loadAvailableStudents( err => {} );
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

  div.dropdown-item {
    padding-right: 3rem;
    white-space: nowrap;
    cursor: pointer;
  }

  div.dropdown-item:hover {
    background-color: whitesmoke;
    color: #0a0a0a;
  }

  div.dropdown-item.is-active {
    background-color: #00d1b2;
    color: #fff;
  }

  .tags {
    margin-bottom: 0;
  }
  .tags:not(:last-child) {
    margin-bottom: 0;
  }

  // .assignment {
  //   display: inline-block;
  //   background-color: #e8eaec;
  //   padding: 0.2em;
  //   border-radius: 3px;
  //   border: 1px solid #c0c2c4;

  //   margin-right: 0.3em;

  //   .name {
  //     display: inline-block;
  //     margin-right: 0.5em;
  //   }

  //   .delete {
  //     margin: auto 0;
  //     vertical-align: middle;
  //   }
  // }
</style>
