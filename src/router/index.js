import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/tabs/Home';
import Schools from '@/components/tabs/Schools';
import Teachers from '@/components/tabs/Teachers';
import Students from '@/components/tabs/Students';
import Instructions from '@/components/tabs/Instructions';
import Classes from '@/components/tabs/Classes';
import Results from '@/components/tabs/Results';
import Assignments from '@/components/tabs/Assignments';
import Assignment from '@/components/tabs/Assignment';

Vue.use( Router );

export default new Router( {
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
