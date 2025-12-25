import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../presentation/views/HomeView.vue';
import ParcoursListView from '@/presentation/views/ParcoursListView.vue';
import UeListeView from '@/presentation/views/UeListView.vue';
import UeDetailView from '@/presentation/views/UeDetailsView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },

    { 
      path: '/parcours', 
      name: 'parcours', 
      component: ParcoursListView 
   },

  { 
      path: '/Ue', 
      name: 'Ue', 
      component: UeListeView
 },
   {
      path: '/ue/:id', // ← AJOUTER cette route
      name: 'UeDetail',
      component: UeDetailView
    }

  ]
});

export default router;

