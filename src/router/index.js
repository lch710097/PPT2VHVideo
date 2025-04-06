import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AvatarCreationView from '../views/AvatarCreationView.vue'
import VoiceCloneView from '../views/VoiceCloneView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/avatar-creation',
      name: 'avatar-creation',
      component: AvatarCreationView
    },
    {
      path: '/voice-clone',
      name: 'voice-clone',
      component: VoiceCloneView
    }
  ]
})

export default router