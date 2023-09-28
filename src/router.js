import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'swap',
        component: () => import(/* webpackChunkName: "about" */ '@/views/swap.vue')
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
    },
    {
        path: '/Assets',
        name: 'Assets',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/Assets.vue')
    },
    {
        path: '/myAccount',
        name: 'myAccount',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/myAccount.vue')
    },
    {
        path: '/pair',
        name: 'pair',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/pair.vue')
    },
    {
        path: '/IssueToken',
        name: 'IssueToken',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/IssueToken.vue')
    },
    {
        path: '/pdfView',
        name: 'pdfView',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/pdfView.vue')
    },
    {
        path: '/ImgView',
        name: 'ImgView',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/ImgView.vue')
    },
    {
        path: '/pdfHelp',
        name: 'pdfHelp',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/pdfHelp.vue')
    },
    {
        path: '/AddLiquidity',
        name: 'AddLiquidity',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/AddLiquidity.vue')
    },
    {
        path: '/LoanContract',
        name: 'LoanContract',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/LoanContract.vue')
    },
    {
        path: '/AddLoanLiquidity',
        name: 'AddLoanLiquidity',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/AddLoanLiquidity.vue')
    },
    {
        path: '/Faucet',
        name: 'Faucet',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/Faucet.vue')
    },
    {
        path: '/Issue',
        name: 'Issue',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/Issue.vue')
    },
    {
        path: '/Community',
        name: 'Community',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/Community.vue')
    },
    {
        path: '/Pledge',
        name: 'Pledge',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/Pledge.vue')
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
    }
]

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes
})

export default router
