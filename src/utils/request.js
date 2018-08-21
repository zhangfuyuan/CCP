import Qs from 'qs'
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import i18n from '@/lang'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 1000*100, // 请求超时时间100s
  transformRequest: [function (data) {
		data = Qs.stringify(data);
		return data;
  }],
  headers:{'Content-Type':'application/x-www-form-urlencoded'} // 若需要 'multipart/form-data' 则不要使用此统一接口
})

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;

    if (res.isLogout === true) {
      /**
       * isLogout为后台session失效 自动退出
       */
      store.dispatch('FedLogOut').then(() => {
        location.reload()// 为了重新实例化vue-router对象 避免bug
      });
    } else if (res.isSuccess === true) {
      return Promise.resolve(res);
    } else {
      return Promise.reject(res);
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
