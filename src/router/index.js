import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/tabs/Home';
import Schools from '@/components/tabs/Schools';
import Teachers from '@/components/tabs/Teachers';
import Students from '@/components/tabs/Students';
import Intros from '@/components/tabs/Introductions';
import Classes from '@/components/tabs/Classes';
import Assignments from '@/components/tabs/Assignments';

Vue.use( Router );

export default new Router({
  routes: [
    { path: '/', component: Home },
    { path: '/schools', component: Schools },
    { path: '/teachers', component: Teachers },
    { path: '/students', component: Students },
    { path: '/intros', component: Intros },
    { path: '/classes', component: Classes },
    { path: '/assignments', component: Assignments },
  ],
  linkActiveClass: 'is-active',
  mode: 'history',
});
