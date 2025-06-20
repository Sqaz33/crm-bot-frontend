import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import RecordsView from '../views/RecordsView.vue'
// import ClientProfileView from '../views/ClientProfileView.vue'
// import BookingView from '../views/BookingView.vue'
import EmployeeView from '../views/EmployeeView.vue'
// import DateTimeView from '../views/DateTimeView.vue'
import ServicesView from '../views/ServicesView.vue'
import ReviewsView from '../views/ReviewsView.vue'
// import AboutEmployeeView from '../views/AboutEmployeeView.vue'
// import AboutCompanyView from '../views/AboutCompanyView.vue'
import test from '../views/Test.vue'

const routes = [
  { path: '/home', name: 'home', component: HomeView },
  { path: '/records', name: 'records', component: RecordsView },
  // { path: '/client/:id', name: 'client-profile', component: ClientProfileView },
  // { path: '/booking', name: 'booking', component: BookingView },
  { path: '/employee/:id', name: 'employee', component: EmployeeView },
  // { path: '/datetime', name: 'datetime', component: DateTimeView },
  { path: '/services', name: 'services', component: ServicesView },
  { path: '/reviews', name: 'reviews', component: ReviewsView },
  // { path: '/about/employee/:id', name: 'about-employee', component: AboutEmployeeView },
  // { path: '/about/company', name: 'about-company', component: AboutCompanyView },
  { path: '/test', name: 'test', component: test, meta: { title: 'Тестовая страница' }},
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
