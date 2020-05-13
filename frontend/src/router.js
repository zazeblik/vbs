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
                    path: 'persons',
                    component: () => import('./views/persons/Persons.vue')
                },
                {
                    name: 'groups',
                    path: 'groups',
                    component: () => import('./views/groups/Groups.vue')
                },
                {
                    path: 'groups/:id',
                    component: () => import('./views/groups/GroupsDetail.vue'),
                },
                {
                    path: 'personals',
                    component: () => import('./views/groups/Personals.vue')
                },
                {
                    path: 'places',
                    component: () => import('./views/places/Places.vue')
                }
            ]
        }
    ]
})