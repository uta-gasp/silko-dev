<template lang="pug">
  #results
    .container(v-if="!results.length")
      i No data was recorded yet
    .tile.is-ancestor(v-else)
      .tile.is-parent(v-for="result in results" :key="result.id")
        .tile.is-child
          .card
            header.card-header.notification.is-info.is-paddingless
              .card-header-title {{ result.cls.name }}
            .card-content
              .content
                table.table
                  thead
                    tr
                      th Tasks
                      th
                      th
                      th
                  tbody
                    tr(v-for="task in result.cls.tasks" :key="task.id")
                      td {{ task.name }}
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( task )") Durations
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( task )") Gaze replay
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( task )") Word replay

                table.table
                  thead
                    tr
                      th Students
                      th
                      th
                      th
                      th.is-pulled-right
                        button.button.is-primary(@click="showDurations( task )") Statistics
                  tbody
                    tr(v-for="student in result.cls.students" :key="student.id")
                      td {{ student.name }}
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( student )") Gaze plot
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( student )") Durations
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( student )") Gaze replay
                      td.is-narrow
                        button.button.is-primary(@click="showDurations( student )") Word replay

</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import dataUtils from '@/utils/data-utils.js';

  import Teacher from '@/model/teacher.js';

  export default {
    name: 'results',

    components: {
    },

    data() {
      return {
        teacher: null,

        results: [],
      };
    },

    computed: {
    },

    methods: {

      init() {
        this.teacher = Teacher.instance;
        if (this.teacher) {
          this.loadResults();
        }
      },

      loadResults() {
        this.teacher.getClasses( (err, classes) => {
          if (err) {
            return `Cannot retrieve classes.\n\n${err}`;
          }

          classes.sort( dataUtils.byName );

          classes.forEach( cls => {
            if (!cls.tasks) {
              return;
            }

            const tasks = [];
            for (let taskID in cls.tasks) {
              tasks.push({
                id: taskID,
                name: cls.tasks[ taskID ]
              });
            }

            const result = {
              id: cls.id,
              cls: {
                name: cls.name,
                tasks: tasks,
                students: []
              }
            };

            this.results.push( result );

            cls.getStudents( (err, students) => {
              if (err) {
                return `Cannot retrieve students.\n\n${err}`;
              }

              students.sort( dataUtils.byName );

              students.forEach( student => {
                student.getSessions( (err, sessions) => {
                  if (err) {
                    return;
                  }

                  const taskDataIDs = sessions.
                    filter( session => tasks.includes( session.task ) ).
                    map( session => session.data );

                  student.getData( taskDataIDs, (err, data) => {
                    if (err) {
                      return;
                    }

                    result.cls.students.push({
                      id: student.id,
                      name: student.name,
                      data: data
                    });
                  });
                });
              });
            });
          });
        });
      },

      checkAccess() {
        if (!Teacher.isLogged) {
          this.$router.replace( '/' );
        }
      },

      showDurations( taskID ) {

      },
    },

    created() {
      console.log('Results component created');
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
</style>