<template lang="pug">
  #students
    modal-notification(type="danger" :show="showCreationError")
      span Failed to add a student: {{ creationError }}
    modal-notification(type="success" :show="showCreationSuccess")
      span The student was added.

    nav.panel
      p.panel-heading Add student
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email" v-model="newEmail")
          p.control
            input.input(type="text" placeholder="Grade" v-model="newGrade")
          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) School
                option(v-for="item in schoolItems" v-bind:value="item.value") {{ item.text }}
          p.control
            button.button.is-primary(:disabled="!canCreateStudent" @click="tryToCreateStudent") Create

    nav.panel
      p.panel-heading Students
      .panel-block.is-paddingless
        .container(v-if="!students.length")
          i No students exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th(v-if="isAdmin") School
              th Grade
              th(v-if="!isAdmin") Classes
          tbody
            tr(v-for="student in students")
              td {{ student.name }}
              td(v-if="isAdmin")
                span.select
                  select(:value="student.school" @input="moveStudent( student, $event )")
                    option(v-for="school in schools" :value="school.id") {{ school.name }}
              td {{ student.grade }}
              td(v-if="!isAdmin")
                span.ellipsis {{ getListOfStudentClasses( student ) }}
</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import dataUtils from '@/utils/data-utils.js';

  import Admin from '@/model/admin.js';
  import School from '@/model/school.js';
  import Student from '@/model/student.js';
  import Teacher from '@/model/teacher.js';

  import ModalNotification from '@/components/widgets/ModalNotification';

  export default {
    name: 'students',

    data() {
      return {
        teacher: null,
        school: null,

        newName: '',
        newEmail: '',
        newGrade: '',
        newSchool: '',

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        schools: [],
        students: [],
        classes: [],
      };
    },

    components: {
      'modal-notification': ModalNotification,
    },

    computed: {

      isAdmin() {
        return Admin.isLogged;
      },

      isNewNameValid() {
        return this.newName.trim().length > 2;
      },

      isNewEmailValid() {
        return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
      },

      isNewGradeValid() {
        return this.newGrade.trim().length;
      },

      isSchoolValid() {
        return !Admin.isLogged || this.newSchool;
      },

      canCreateStudent() {
        return !this.isCreating
          && this.isNewNameValid
          && this.isNewEmailValid
          && this.isNewGradeValid
          && this.isSchoolValid;
      },

      schoolItems() {
        if (!this.schools) {
          return [];
        }
        return this.schools.map( school => {
          return {
            value: school.id,
            text: school.name
          };
        });
      }
    },

    methods: {

      init() {
        if (Admin.isLogged) {
          this.loadSchools().then( () => {
            this.loadStudents();
          });
        }
        else if (School.isLogged) {
          this.school = School.instance;
          this.loadStudents();
        }
        else if (Teacher.isLogged) {
          this.teacher = Teacher.instance;
          this.loadStudents();
        }
      },

      loadSchools() {
        return School.list( (err, schools) => {
          if (err) {
            return `Cannot retrieve schools.\n\n${err}`;
          }

          this.schools = schools.sort( dataUtils.byName );
        });
      },

      loadStudents() {
        const onDone = (err, students) => {
          if (err) {
            return `Cannot retrieve students.\n\n${err}`;
          }

          this.students = students.sort( (a, b) => {
            if (a.school !== b.school) {
              return a.school > b.school;
            }
            else if (a.grade !== b.grade) {
              return a.grade > b.grade;
            }
            else {
              return a.name.toLowerCase() > b.name.toLowerCase();
            }
          });
        };

        if (this.school) {
          this.school.getStudents( onDone );
        }
        else if (this.teacher) {
          this.teacher.getSchool( (err, school) => {
            if (err) {
              return `Cannot retrieve school.\n\n${err}`;
            }
            school.getStudents( onDone );
          })
        }
        else {
          Student.list( onDone );
        }
      },

      checkAccess() {
        if (!Admin.isLogged && !Teacher.isLogged && !School.isLogged) {
          this.$router.replace( '/' );
        }
      },

      setCreationError( msg ) {
        this.creationError = msg;
        this.showCreationError = Math.random();
      },

      tryToCreateStudent( e ) {
        if (!this.canCreateStudent) {
          return;
        }

        const exists = this.students.some( student => {
          return student.email.toLowerCase() === this.newEmail.toLowerCase().trim();
        });

        if (exists) {
          this.setCreationError( 'A student with this email exists already' );
        }
        else {
          this.createStudent();
        }
      },

      createStudent() {
        this.isCreating = true;

        const onFinished = (err, id) => {
          this.isCreating = false;

          if (err) {
            this.setCreationError( err );
          }
          else {
            this.newName = '';
            this.newEmail = '';
            this.loadStudents();

            this.showCreationSuccess = Math.random();
          }
        };

        if (this.school) {
          this.school.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
        }
        else if (this.teacher) {
          this.teacher.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
        }
        else {  // admin
          School.get( this.newSchool, (err, school) => {
            if (err) {
              return onFinished( err );
            }

            school.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
          });
        }
      },

      moveStudent( student, e ) {
        Admin.moveStudent( student, e.target.value, this.schools );
      },

      getListOfStudentClasses( student ) {
        const classes = [];
        for (let id in student.classes) {
          classes.push( student.classes[ id ] );
        }
        return classes.join( ', ' );
      }
    },

    created() {
      console.log('Students component created');
      eventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      eventBus.$on( 'login', () => {
        this.init();
      });

      this.checkAccess();
    },

    mounted() {
      this.init();
    }
  }
</script>

<style lang="less" scoped>
  .ellipsis {
    text-overflow: ellipsis;
  }

  select:invalid {
    color: #999;
  }

  select {
    padding-left: 5px;
  }

  option {
    color: #222;
  }
</style>