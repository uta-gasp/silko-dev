<template lang="pug">
  #assignments
    nav.panel
      p.panel-heading Assignments
      .panel-block
        .container(v-if="!hasAssignment")
          i No assignments at this moment
        .tile.is-ancestor(v-else)
          .tile.is-parent(v-for="assignment in assignments")
            .tile.is-child
              .card
                header.card-header
                  p.card-header-title.notification.is-info {{assignment.cls.name}}
                .card-content
                  .content {{assignment.task.name}}
                .card-footer
                  a.card-footer-item(@click="start( assignment )") Start;
</template>

<script>
  import { EventBus }  from '@/model/event-bus.js';
  import Admin from '@/model/users/admin.js';
  import School from '@/model/school.js';
  import Student from '@/model/student.js';
  import Teacher from '@/model/teacher.js';

  export default {
    name: 'assignments',

    data() {
      return {
        student: null,
        assignments: [],  // {cls, task}
        assignment: '',
      };
    },

    computed: {

      hasAssignment() {
        return !!this.assignments.length;
      },
    },

    methods: {

      init() {
        this.student = Student.instance;
        if (this.student) {
          this.loadAssignments();
        }
      },

      loadAssignments() {
        this.student.loadAssignments( (err, assignments) => {
          if (err) {
            return console.log( 'TODO Handle err' );
          }

          this.assignments = assignments;
        });
      },

      checkAccess() {
        if (!Student.isLogged) {
          this.$router.replace( '/' );
        }
      },

      start( assignment ) {

      }
    },

    created() {
      console.log('Assignments component created');
      EventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      EventBus.$on( 'login', () => {
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
</style>