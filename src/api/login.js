import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

// 1.前端询问后台用户是否已经登录  /prm-web/a/login  method=get
export function getInfo() {
  return request({
    url: '/a/login',
    method: 'get'
  })
}

/* 2.登录验证  /prm-web/a/login  method=post
 username      String  //用户名  必传
 password      String  //密码      必传
 validateCode  String  //验证码    需要验证码的时候必传
*/
export function login(username, password, validateCode) {
  let data = {};

  if (username) data.username = username;
  if (password) data.password = password;
  if (validateCode) data.validateCode = validateCode;

  return request({
    url: '/a/login',
    method: 'post',
    data
  })
}

// 3.退出登录  /prm-web/a/logout  method=get|post
export function logout() {
  return request({
    url: '/a/logout',
    method: 'post'
  })
}
