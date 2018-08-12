import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.认证/刷新认证  /prm-web/a/terminalOffice/updateTerminalHQTotalNumber  method=get|post
 officeUserName                               String           认证名        认证必传，刷新认证不传
 verificationCode                               String            验证码        认证必传，刷新认证不传
 */
export function updateVerification(info) {
  let data = {};

  if (info['officeUserName']) data.officeUserName = info['officeUserName'];
  if (info['verificationCode']) data.verificationCode = info['verificationCode'];

  return request({
    url: '/a/terminalOffice/updateTerminalHQTotalNumber',
    method: 'post',
    data
  })
}

// 2.反认证  /prm-web/a/terminalOffice/cancelTerminalHQTotalNumber  method=get|post
export function cancelVerification() {
  return request({
    url: '/a/terminalOffice/cancelTerminalHQTotalNumber',
    method: 'get'
  })
}

/* 3.修改机构信息(增、删、改)  prm-web/a/terminalOffice/dealOffice  method=get|post
 data：                     String           机构信息
 */
export function dealOffice(info) {
  let data = {
    data: JSON.stringify(info)
  };

  console.log('json解析：', data);

  return request({
    url: '/a/terminalOffice/dealOffice',
    method: 'post',
    data
  })
}

// 4.机构信息列表  prm-web/a/sys/office/list -> prm-web/a/terminalOffice/list   method=get|post
export function getOfficeList() {
  return request({
    url: '/a/terminalOffice/list',
    method: 'get'
  })
}
