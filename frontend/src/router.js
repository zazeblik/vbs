import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
            component: () => import('./views/Home.vue')
        },
        {
            path: '/articles',
            beforeEnter: (to, from, next) => to.query.route ? next(`/${to.query.route}`) : next(),
            component: () => import('./views/pages/Articles.vue')
        },
        {
            path: '/auth',
            name: 'auth',
            beforeEnter: (to, from, next) => Vue.prototype.$isAuthenticated ? next({name: 'cp'}) : next(),
            component: () => import('./views/Auth.vue')
        },
        {
            path: '/cp',
            name: 'cp',
            beforeEnter: (to, from, next) => Vue.prototype.$isAuthenticated ? next() : next({name: 'auth'}),
            component: () => import('./views/ControlPanel.vue'),
            children: [
                {
                    path: '',
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
                }
            ]
        }
    ]
})