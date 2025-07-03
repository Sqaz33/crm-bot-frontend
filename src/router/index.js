import { createRouter, createWebHistory } from 'vue-router'

import Layout        from '../views/Layout.vue'
import HomeView      from '../views/HomeView.vue'
import RecordsView   from '../views/RecordsView.vue'
import ProfileView   from '../views/ProfileView.vue'
import ReviewsView   from '../views/ReviewsView.vue'
import AboutView      from '../views/AboutCompany.vue'
import ShopView from '../views/ShopView.vue' 
import WalletView from '../views/WalletView.vue' 


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
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { title: 'Профиль клиента' }
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
        path: '/shop',
        name: 'shop',
        component: ShopView,
        meta: { title:"Магазин"}
        },
    
      {
        path: '/wallet',
        name: 'wallet',
        component: WalletView,
        meta: { title:"Кошелёк"}
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
