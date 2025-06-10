import { createRouter, createWebHistory } from 'vue-router'
import ProfileView from '../views/ProfileView.vue'


const routes = [
  { path: '/', redirect: '/profile' },
  { path: '/profile', component: ProfileView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
