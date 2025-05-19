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
          name: 'personals',
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
          path: 'instructors',
          component: () => import('./views/database/Instructors.vue')
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
          path: 'customization',
          component: () => import('./views/Сustomization.vue')
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
          path: 'activity-report',
          component: () => import('./views/reports/ActivityReport.vue')
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