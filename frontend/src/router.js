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
      path: '/privacy',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/Privacy.vue')
    },
    {
      path: '/self-schedule',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/SelfSchedule.vue')
    },
    {
      path: '/self-payments',
      beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
      component: () => import('./views/pages/SelfPayments.vue')
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
          path: 'group-detail/:id',
          component: () => import('./views/journals/GroupDetail.vue'),
        },
        {
          path: 'personals',
          component: () => import('./views/journals/Personals.vue')
        },
        {
          path: 'instructor-schedule/:id',
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
          path: 'incomes',
          component: () => import('./views/payments/Incomes.vue')
        },
        {
          path: 'settings',
          component: () => import('./views/site/Settings.vue')
        },
        {
          path: 'customization',
          component: () => import('./views/Сustomization.vue')
        },
        {
          path: 'materials',
          component: () => import('./views/site/Materials.vue')
        },
        {
          path: 'files',
          component: () => import('./views/site/Files.vue')
        },
        {
          path: 'visits-report',
          component: () => import('./views/reports/VisitsReport.vue')
        },
        {
          path: 'instructors-report',
          component: () => import('./views/reports/InstructorsReport.vue')
        },
        {
          path: 'totals-report',
          component: () => import('./views/reports/TotalsReport.vue')
        },
        {
          path: 'transactions-report',
          component: () => import('./views/reports/TransactionsReport.vue')
        },
        {
          path: 'rules',
          component: () => import('./views/salaries/Rules.vue')
        },
        {
          path: 'calculation',
          component: () => import('./views/salaries/Calculation.vue')
        },
        {
          name: 'users',
          path: 'users',
          component: () => import('./views/users/Users.vue')
        }
      ]
    }
  ]
})