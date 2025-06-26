import { createRouter, createWebHistory } from 'vue-router'

import Layout        from '../views/Layout.vue'
import HomeView      from '../views/HomeView.vue'
import RecordsView   from '../views/RecordsView.vue'
import EmployeeView  from '../views/EmployeeView.vue'
import ServicesView  from '../views/ServicesView.vue'
import ReviewsView   from '../views/ReviewsView.vue'
import AboutView      from '../views/AboutCompany.vue'
import TestView      from '../views/Test.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'Главная', showMenu: true }
      },
      {
        path: 'records',
        name: 'records',
        component: RecordsView,
        meta: { title: 'Записи' }
      },
      {
        path: 'employee/:id',
        name: 'employee',
        component: EmployeeView,
        meta: { title: 'Сотрудник' }
      },
      {
        path: 'services',
        name: 'services',
        component: ServicesView,
        meta: { title: 'Услуги' }
      },
      {
        path: 'reviews',
        name: 'reviews',
        component: ReviewsView,
        meta: { title: 'Отзывы' }
      },
      {
        path: 'company',
        name: 'company',
        component: AboutView,
        meta: { title: 'О компании' }
      },
      {
        path: 'test',
        name: 'test',
        component: TestView,
        meta: { title: 'Тестовая страница' }
      }
    ]
  },
  // Fallback
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
