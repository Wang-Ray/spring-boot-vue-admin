import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/token'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000, // 请求超时时间
  // 所有请求都以Json形式传送
  headers: {
    'Content-type': 'application/json;charset=UTF-8'
  }
})

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    // 让每个请求携带自定义token 请根据实际情况自行修改
    config.headers['Authorization'] = getToken()
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// response拦截器
service.interceptors.response.use(
  response => {
    const result = response.data
    if (result.status === 200) {
      return response.data
    } else {
      Message({
        message: result.data,
        type: 'error',
        duration: 5 * 1000
      })

      // 401:需要认证
      if (result.status === 401) {
        MessageBox.confirm('需要认证', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogout').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject('error')
    }
  },
  error => {
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