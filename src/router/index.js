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

const path = process.env.URL_PATH;

export default new Router({
  routes: [
    { path: `${path}/`, component: Home },
    { path: `${path}/schools`, component: Schools },
    { path: `${path}/teachers`, component: Teachers },
    { path: `${path}/students`, component: Students },
    { path: `${path}/instructions`, component: Instructions },
    { path: `${path}/classes`, component: Classes },
    { path: `${path}/results`, component: Results },
    { path: `${path}/assignments`, component: Assignments },
    { path: `${path}/assignment/:id`, component: Assignment },
  ],
  linkActiveClass: 'is-active',
  mode: 'history',
});
