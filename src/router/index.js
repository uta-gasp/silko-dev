import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import Schools from '@/components/Schools';
import Teachers from '@/components/Teachers';
import Students from '@/components/Students';
import Intros from '@/components/Introductions';
import Classes from '@/components/Classes';

Vue.use( Router );

export default new Router({
  routes: [
    { path: '/', component: Home },
    { path: '/schools', component: Schools },
    { path: '/teachers', component: Teachers },
    { path: '/students', component: Students },
    { path: '/intros', component: Intros },
    { path: '/classes', component: Classes }
  ],
  linkActiveClass: 'is-active',
  mode: 'history',
});
