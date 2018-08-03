import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 10000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
  console.log(8126.1, config)
  if (store.getters.token) {
    config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, error => {
  console.log(8126.2, error)
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    console.log(8126.1, response)
    const res = response.data;

    if (res.isLogout === true) {
      /**
       * isLogout为后台session失效 自动退出
       */
      Message({
        message: '您已被登出，即将跳转至登录页面，请重新登录',
        type: 'warning',
        duration: 2500
      });
      setTimeout(()=> {
        store.dispatch('FedLogOut').then(() => {
          location.reload()// 为了重新实例化vue-router对象 避免bug
        });
      }, 2500);
    } else if (res.isSuccess === true) {
      return Promise.resolve(res);
    } else {
      return Promise.reject(res);
    }
  },
  error => {
    console.log(8126.1, error)
    console.log('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
