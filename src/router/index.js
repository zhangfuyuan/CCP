import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', name: 'login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', name: 'page404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/401', name: 'page401', component: () => import('@/views/errorPage/401'), hidden: true },
  { path: '/', redirect: '/device/deviceManager', hidden: true },

  // 设备管理
  {
    path: '/device',
    component: Layout,
    redirect: 'noredirect',
    name: 'device',
    meta: {
      title: 'deviceManager',
      icon: 'component',
      noCache: true
    },
    children: [
      {
        path: 'deviceManager',
        name: 'deviceManager',
        component: () => import('@/views/device/deviceManager'),
        meta: { title: 'deviceManager', noCache: true }
      },
      {
        path: 'planManager',
        name: 'planManager',
        component: () => import('@/views/device/planManager'),
        meta: { title: 'planManager', noCache: true }
      }
    ]
  },
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  // 系统管理（root权限）
  {
    path: '/system',
    component: Layout,
    redirect: 'noredirect',
    name: 'system',
    meta: {
      title: 'systemManager',
      icon: 'lock',
      roles: ['root'],
      noCache: true
    },
    children: [
      {
        path: 'accountManager',
        name: 'accountManager',
        component: () => import('@/views/system/accountManager'),
        meta: { title: 'accountManager', noCache: true }
      },
      {
        path: 'officeManager',
        name: 'officeManager',
        component: () => import('@/views/system/officeManager'),
        meta: { title: 'officeManager', noCache: true }
      },
      {
        path: 'ipManager',
        name: 'ipManager',
        component: () => import('@/views/system/ipManager'),
        meta: { title: 'ipManager', noCache: true }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]
