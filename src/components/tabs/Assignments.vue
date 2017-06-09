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
                header.card-header.notification.is-info.is-paddingless
                  .card-header-title {{ assignment.cls.name }}
                  .card-header-icon
                    span.icon(v-if="assignment.task.syllab.language" title="Syllabification")
                      i.fa.fa-ellipsis-h
                    span.icon(v-if="assignment.task.speech" title="Voice")
                      i.fa.fa-headphones
                .card-content
                  .content {{ assignment.task.name }}
                .card-footer
                  a.card-footer-item(@click="start( assignment )") Start
</template>

<script>
  import eventBus  from '@/utils/event-bus.js';

  import Student from '@/model/student.js';

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
            return console.log( 'TODO loadAssignments', err );
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
        this.$router.replace( `assignment/${assignment.cls.id}` );
      }
    },

    created() {
      console.log('Assignments component created');
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
  header {
    margin-bottom: 0 !important;
  }

  .card-header-title {
    color: #fff;
  }

  .card-header-icon {
    cursor: default;
  }
</style>