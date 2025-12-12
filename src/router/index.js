import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import ReportMissing from '@/views/ReportMissing.vue'
import ReportSighting from '@/views/ReportSighting.vue'
import MissingList from '@/views/MissingList.vue'
import MissingProfile from '@/views/MissingProfile.vue'
import Alerts from '@/views/Alerts.vue'
import splash from '@/views/splash.vue'

// NEW AUTH PAGES
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

import { supabase } from '@/supabase'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/login', component: Login },
    { path: '/Home', component: Home },

    // AUTH ROUTES
    { path: '/register', component: Register },

    // USER APP PAGES
    {
    path: '/',
    name: 'Splash',
    component: splash,
    meta: { requiresAuth: false}
  },

    { path: '/reportmissing', component: ReportMissing},
    { path: '/reportsighting', component: ReportSighting},
    { path: '/missing', component: MissingList },
    { path: '/missingp', component: MissingProfile, props: true },
    { path: '/alerts', component: Alerts }
  ]
})

// ------------------------------
// 🔐 Route Auth Protection
// ------------------------------
router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) {
    return next()
  }

  const sessionResponse = await supabase.auth.getSession()

  // Safe check without optional chaining
  const session = sessionResponse && sessionResponse.data
    ? sessionResponse.data.session
    : null

  const user = session ? session.user : null

  if (!user) {
    return next('/login')
  }

  next()
})

export default router
