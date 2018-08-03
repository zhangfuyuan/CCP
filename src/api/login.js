import request from '@/utils/request'

export function test(params) {
  return request({
    url: '/test',
    method: 'get',
    data: {
      params
    }
  })
}

export function login(username, password) {
  return request({
    url: '/a/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
