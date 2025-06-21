import { createRouter, createWebHashHistory } from 'vue-router'

import StartView from '../views/StartView.vue'
import HomeView from '../views/HomeView.vue'
import RecordsView from '../views/RecordsView.vue'
import EmployeeView from '../views/EmployeeView.vue'
import ServicesView from '../views/ServicesView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import TestView from '../views/Test.vue'

const routes = [
  {
    path: '/',
    name: 'start',
    component: StartView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/records',
    name: 'records',
    component: RecordsView
  },
  {
    path: '/employee/:id',
    name: 'employee',
    component: EmployeeView
  },
  {
    path: '/services',
    name: 'services',
    component: ServicesView
  },
  {
    path: '/reviews',
    name: 'reviews',
    component: ReviewsView
  },
  {
    path: '/test',
    name: 'test',
    component: TestView,
    meta: { title: 'Тестовая страница' }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'start' }
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})