import { createRouter, createWebHistory } from 'vue-router'

import Layout        from '../views/Layout.vue'
import HomeView      from '../views/HomeView.vue'
import RecordsView   from '../views/RecordsView.vue'
import ProfileView   from '../views/ProfileView.vue'
import ReviewsView   from '../views/ReviewsView.vue'
import AboutView      from '../views/AboutCompany.vue'
import ShopView from '../views/ShopView.vue' 
import WalletView from '../views/WalletView.vue' 
import StaffView from '../views/AboutStaff.vue'
import MakeAppointmant from '../views/MakeAppointmant.vue'
import ChoiceStaffView from '../views/ChoiceStaff.vue'
import DateTime from '../views/DateTime.vue'
import ServicesView from '../views/ServicesView.vue'
import CreateVisitView from '../views/CreateVisitView.vue'
import RecordView from '../views/RecordView.vue'
import TestView from '../views/TestView.vue'

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
        meta: { title: 'Мои записи' }
      },
     {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { title: 'Профиль клиента' }
      },
      // {
      //   path: 'reviews',
      //   name: 'reviews',
      //   component: ReviewsView,
      //   meta: { title: 'Отзывы' }
      // },
      {
        path: 'company',
        name: 'company',
        component: AboutView,
        meta: { title: 'О компании' }
      },
      {
        path: 'shop',
        name: 'shop',
        component: ShopView,
        meta: { title:"Магазин"}
        },
    
      {
        path: 'wallet',
        name: 'wallet',
        component: WalletView,
        meta: { title:"Кошелёк"}
      },
    
      {
        path: 'staff/:id',
        name: 'staff',
        component: StaffView,
        meta: { title:"О сотруднике"}
      },

      {
        path: 'choicestaff',
        name: 'choicestaff',
        component: ChoiceStaffView,
        meta: { title:"Сотрудник"}
      },
    
      {
        path: 'appointmant',
        name: 'appointmant',
        component: MakeAppointmant,
        meta: { title:"Записаться"}
      },
    
      {
        path: 'datetime',
        name: 'datetime',
        component: DateTime,
        meta: { title:"Дата и время"}
      },
    
      {
        path: 'services',
        name: 'services',
        component: ServicesView,
        meta: { title:"Услуги"}
      },
      {
        path: 'createvisit',
        name: 'createvisit',
        component: CreateVisitView,
        meta: { title:"Оформление записи"}
      },
      {
        path: 'record/:id',
        name: 'record',
        component: RecordView,
        meta: { title: "Запись" }
      },
      {
        path: 'test',
        name: 'test',
        component: TestView,
        meta: { title:"Test"}
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
