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

              .dropdown(
                  :ref="currentClass.id+student.id"
                  v-show="availableTasks( student ).length")
                .dropdown-trigger(@click.stop="")
                  button.button(aria-haspopup="true" aria-controls="dropdown-menu" @click="toggleTaskList( currentClass.id+student.id )")
                    span Add an assignment
                    span.icon.is-small
                      i.fa.fa-angle-down(aria-hidden="true")
                .dropdown-menu(role="menu")
                  .dropdown-content
                    .dropdown-item(
                      v-for="task in availableTasks( student )"
                      @click.stop="addAssignment( student, task.id, $event )" ) {{ task.name }}

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

import Loading from '@/components/widgets/Loading.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import ItemSelectionBox from '@/components/widgets/ItemSelectionBox.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

// ts-check-only
import Class from '@/model/class.js';
import Student from '@/model/student.js';
import Task from '@/model/task.js';
import School from '@/model/school.js';

/**
 * @typedef GradeSubItem
 * @property {string} id
 * @property {string} text
 * @property {boolean} selected
 */

/**
 * @typedef Grade
 * @property {number} id
 * @property {string} text
 * @property {GradeSubItem[]} subitems
 */

/** @type {Grade} */
const __needed_only_to_make_vscode_happy_about_Grade__ = null;

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
      /** @type {Class} */
      currentClass: this.cls,
      /** @type {Student[]} */
      students: null,
      /** @type {Student[]} */
      schoolStudents: null,
      /** @type {Task[]} */
      tasks: [],
      /** @type {Grade[]} */
      schoolGrades: [],

      isEditing: false,
      currentGrade: null,

      /** @type {Element} */
      activeMenu: null,

      onBodyClick: () => {
        this.hideTaskList();
      },
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
      this.currentClass.getTasks( /** @param {Error | string} err; @param {Task[]} tasks */ ( err, tasks ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load tasks' );
        }

        this.tasks = tasks.sort( dataUtils.byName );

        this.loadStudents();
      } );
    },

    loadStudents() {
      this.currentClass.getStudents( /** @param {Error | string} err; @param {Student[]} students */ ( err, students ) => {
        if ( err ) {
          this.students = [];
          return this.setError( err, 'Failed to load students' );
        }

        this.students = students.sort( dataUtils.byName );
      } );
    },

    /** @param {Callback} cb */
    loadAvailableStudents( cb ) {
      this.teacher.getSchool( /** @param {Error | string} err; @param {School} school */ ( err, school ) => {
        if ( err ) {
          this.setError( err, 'Failed to load teacher\'s school' );
          return cb( err );
        }

        school.getStudents( /** @param {Error | string} err; @param {Student[]} students */ ( err, students ) => {
          if ( err ) {
            return this.setError( err, 'Failed to load school students' );
          }

          this.schoolStudents = students;
          this.schoolGrades = this.makeGrades( students );

          cb();
        } );
      } );
    },

    /**
     * @param {Student[]} students
     * @returns {Grade[]} 
     * */
    makeGrades( students ) {
      /** @type {Grade[]}  */
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

        if ( this.students && !this.students.find( item => item.id === student.id ) ) {
          grade.subitems.push( {
            id: student.id,
            text: student.name,
            selected: false,
          } );
        }
      } );

      grades.forEach( grade => {
        grade.subitems.sort( /** @param {{text: string}} a;@param {{text: string}} b; @returns {number} */ ( a, b ) => a.text.toLowerCase() > b.text.toLowerCase() ? 1 : -1 );
      } );

      return grades.sort( /** @param {Grade} a;@param {Grade} b; @returns {number} */ ( a, b ) => {
        const gradeA = Number.parseInt( a.text, 10 );
        const gradeB = Number.parseInt( b.text, 10 );
        if ( !Number.isNaN( gradeA ) && !Number.isNaN( gradeB ) ) {
          if ( gradeA === gradeB ) {
            return a.text > b.text ? 1 : -1;
          }
          else {
            return gradeA > gradeB ? 1 : -1;
          }
        }
        else {
          return a.text > b.text ? 1 : -1;
        }
      } );
    },

    /**
     * @param {any[]} arr
     * @param {string} name
     * @returns {string}
     */
    displayCount( arr, name ) {
      return dataUtils.displayCount( arr, name );
    },

    /** @param {Event} e */
    openEditor( e ) {
      this.loadAvailableStudents( /** @param {Error | string} err */ err => {
        if ( !err ) {
          this.isEditing = true;
        }
      } );
    },

    /** @param {{subitems: Student[]}} e */
    addNewStudents( e ) {
      if ( e.subitems ) {
        this.currentClass.addStudents( e.subitems, /** @param {Error | string} err */ err => {
          if ( err ) {
            this.setError( err, 'Failed to add new student' );
          }
          else {
            this.setSuccess( 'Students were added' );
          }

          this.loadStudents();
        } );
      }

      this.closeEditor( null );
    },

    /** @param {Event} e */
    closeEditor( e ) {
      this.isEditing = false;
    },

    /**
     * @param {Student} student
     * @param {string} taskID
     * @param {Event} e
     */
    addAssignment( student, taskID, e ) {
      student.addAssignment( taskID, this.currentClass.id, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, 'Failed to add the assignment' );
        }
        else {
          this.setSuccess( 'The assignment was added' );
        }
      } );
    },

    /**
     * @param {Student} student
     * @param {string} taskID
     * @param {Event} e
     */
    removeAssignment( student, taskID, e ) {
      student.removeAssignment( taskID, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, 'Failed to remove the assignment' );
        }
        else {
          this.setSuccess( 'The assignment was removed' );
        }
      } );
    },

    // getAssignment( student ) {
    //   return student.assignments ? student.assignments[ this.currentClass.id ] : '';
    // },

    // setAssignment( student, e ) {
    //   const taskID = e.target.value;

    //   student.setAssignment( this.currentClass.id, taskID, err => {
    //     if ( err ) {
    //       this.setError( err, 'Failed to set the task to the student' );
    //     }
    //     else {
    //       this.setSuccess( `The task was ${!taskID ? 'removed' : 'set'}` );
    //     }
    //   } );
    // },

    /**
     * @param {Student} student
     * @param {Event} e
     */
    remove( student, e ) {
      this.currentClass.removeStudent( student, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, 'Failed to remove the student from the list' );
        }
        else {
          this.setSuccess( 'The student was removed' );
        }

        this.loadStudents();
      } );
    },

    /**
     * @param {Student} student
     */
    availableTasks( student ) {
      return this.tasks.filter( task => !student.assignments[ task.id ] );
    },

    /**
     * @param {string} id
     */
    toggleTaskList( id ) {
      if ( this.activeMenu ) {
        this.hideTaskList();
      }
      else {
        this.showTaskList( id );
      }
    },

    /**
     * @param {string} id
     */
    showTaskList( id ) {
      this.hideTaskList();

      this.activeMenu = /** @type {Element[]} */ (this.$refs[ id ])[0];
      this.activeMenu.classList.add( 'is-active' );
    },

    hideTaskList() {
      if ( this.activeMenu ) {
        this.activeMenu.classList.remove( 'is-active' );
        this.activeMenu = null;
      }
    },

    /**
     * @param {string} id
     */
    doesTaskBelongsToClass( id ) {
      return this.tasks.some( task => task.id === id );
    },

    /**
     * @param {string} id
     */
    getAssignmentName( id ) {
      return this.tasks.find( task => task.id === id ).name;
    },
  },

  created() {
    window.document.body.addEventListener( 'click', this.onBodyClick );
  },

  destroyed() {
    window.document.body.removeEventListener( 'click', this.onBodyClick );
  },

  mounted() {
    this.loadTasks();
    this.loadAvailableStudents( () => {} );
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

</style>
