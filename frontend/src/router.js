import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/Home.vue')
    },
    {
      path: '/articles',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Articles.vue')
    },
    {
      path: '/club',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Club.vue')
    },
    {
      path: '/prices',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Prices.vue')
    },
    {
      path: '/boss',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Boss.vue')
    },
    {
      path: '/profile',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Profile.vue')
    },
    {
      path: '/feedback',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Feedback.vue')
    },
    {
      path: '/galery',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Galery.vue')
    },
    {
      path: '/tournaments',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Tournaments.vue')
    },
    {
      path: '/halls',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Halls.vue')
    },
    {
      path: '/instructors',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Instructors.vue')
    },
    {
      path: '/schedule',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Schedule.vue')
    },
    {
      path: '/contacts',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Contacts.vue')
    },
    {
      path: '/payment-methods',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/PaymentMethods.vue')
    },
    {
      path: '/service-rules',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/ServiceRules.vue')
    },
    {
      path: '/data-transport',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/DataTransport.vue')
    },
    {
      path: '/articles/:id',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Article.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      beforeEnter: (to, from, next) => Vue.prototype.$isAuthenticated ? next({ name: 'dashboard' }) : next(),
      component: () => import('./views/Auth.vue')
    },
    {
      path: '/cp',
      name: 'cp',
      beforeEnter: (to, from, next) => Vue.prototype.$isAuthenticated ? next() : next({ name: 'auth' }),
      component: () => import('./views/ControlPanel.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('./views/Dashboard.vue'),
        },
        {
          name: 'generals',
          path: 'generals',
          component: () => import('./views/journals/Generals.vue')
        },
        {
          path: 'generals/:id',
          component: () => import('./views/journals/GeneralsDetail.vue'),
        },
        {
          path: 'personals',
          component: () => import('./views/journals/Personals.vue')
        },
        {
          path: 'personals/:id',
          component: () => import('./views/journals/InstructorSchedule.vue')
        },
        {
          path: 'persons',
          component: () => import('./views/database/Persons.vue')
        },
        {
          path: 'groups',
          component: () => import('./views/database/Groups.vue')
        },
        {
          path: 'places',
          component: () => import('./views/database/Places.vue')
        },
        {
          path: 'archive',
          component: () => import('./views/database/ArchivePersons.vue')
        },
        {
          path: 'payments',
          component: () => import('./views/payments/Payments.vue')
        },
        {
          path: 'settings',
          component: () => import('./views/site/Settings.vue')
        },
        {
          path: 'materials',
          component: () => import('./views/site/Materials.vue')
        },
        {
          path: 'files',
          component: () => import('./views/site/Files.vue')
        },
        ,
        {
          path: 'rules',
          component: () => import('./views/salaries/Rules.vue')
        },
        {
          path: 'calculation',
          component: () => import('./views/salaries/Calculation.vue')
        },
        {
          path: 'users',
          component: () => import('./views/users/Users.vue')
        }
      ]
    }
  ]
})