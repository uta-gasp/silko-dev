<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //-img(src="../assets/icon-32.png")
          h1.title.logo Silko
          h2.subtitle A reading aid for students and teachers
    section.section(v-if="!user")
      login
    .message.is-info(v-else)
      .message-header
        p As {{ userTitle }}, you can
      .message-body.is-paddingless
        .panel
          .panel-block(v-if="isAdmin || isSchool") Add and list teachers
          .panel-block(v-if="isAdmin") Move teachers to other school
          .panel-block(v-if="isAdmin || isSchool || isTeacher") Add and list students
          .panel-block(v-if="isAdmin") Move students to other school
          .panel-block(v-if="isTeacher") Add, list, edit and remove instructions
          .panel-block(v-if="isTeacher") Add, list, edit and remove classes
          .panel-block(v-if="isTeacher") Add, list, edit and remove tasks
          .panel-block(v-if="isTeacher") Add students to classes, list them and remove
          .panel-block(v-if="isTeacher") Assign tasks to students
          .panel-block(v-if="isTeacher") Create visalizations from data of tasks completed by students
          .panel-block(v-if="isStudent") List tasks assigned to complete
          .panel-block(v-if="isStudent") Complete a task
          .panel-block(v-if="isStudent") Create visualizations from data of the tasks you completed

</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import login from '@/utils/login.js';

  import Login from '@/components/widgets/Login'

  export default {
    name: 'home',

    components: {
      'login': Login
    },

    data() {
      return {
        isLoginVisible: true,
        user: null
      }
    },

    computed: {
      isAdmin() { return this.user && this.user.isAdmin; },
      isSchool() { return this.user && this.user.isSchool; },
      isTeacher() { return this.user && this.user.isTeacher; },
      isStudent() { return this.user && this.user.isStudent; },
      userTitle() {
        if (this.isAdmin) { return 'an admin'; }
        else if (this.isSchool) { return 'a school'; }
        else if (this.isTeacher) { return 'a teacher'; }
        else if (this.isStudent) { return 'a student'; }
        else { return 'an anonym' }
      }
    },

    created() {
      eventBus.$on( 'login', id => {
        // this.isLoginVisible = false;
        this.user = login.user;
      });
      eventBus.$on( 'logout', id => {
        this.user = null;
        // this.isLoginVisible = true;
      });

      // this.isLoginVisible = !login.user;
      this.user = login.user;
    },

    mounted() {
    }
  }
</script>

<style lang="less" scoped>
  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
    padding-bottom: 0.5em;
  }
</style>
