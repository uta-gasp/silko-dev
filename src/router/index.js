import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/components/tabs/Home.vue';
import Schools from '@/components/tabs/Schools.vue';
import Teachers from '@/components/tabs/Teachers.vue';
import Students from '@/components/tabs/Students.vue';
import Instructions from '@/components/tabs/Instructions.vue';
import Classes from '@/components/tabs/Classes.vue';
import Results from '@/components/tabs/Results.vue';
import Assignments from '@/components/tabs/Assignments.vue';
import Assignment from '@/components/tabs/Assignment.vue';

Vue.use( VueRouter );

export default new VueRouter( {
  routes: [
    { path: '/', component: Home },
    { path: '/schools', component: Schools },
    { path: '/teachers', component: Teachers },
    { path: '/students', component: Students },
    { path: '/instructions', component: Instructions },
    { path: '/classes', component: Classes },
    { path: '/results', component: Results },
    { path: '/assignments', component: Assignments },
    { path: '/assignment/:id', component: Assignment },
  ],
  base: `${process.env.URL_PATH}/`,
  linkActiveClass: 'is-active',
  mode: 'history',
} );
