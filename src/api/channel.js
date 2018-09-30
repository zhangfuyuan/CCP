import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

// 1.进入云平台功能设置页面  prm-web/a/cloudPlatform/gotoCloudPlatformPage  method=get|post
export function gotoCloudPlatformPage() {
  return request({
    url: '/a/cloudPlatform/gotoCloudPlatformPage',
    method: 'get'
  })
}

/* 2.更新配置数据  prm-web/a/cloudPlatform/updateApiKeyPass  method=get|post
 */
export function updateApiKeyPass() {
  return request({
    url: '/a/cloudPlatform/updateApiKeyPass',
    method: 'get'
  })
}

/* 3.导入json  prm-web/a/cloudPlatform/importJson  method=get|post
 json           String   json字符串   小百合云平台产品JSON格式协议
 */
export function importJson(info) {
  let data = {
    "json": info.json
  };

  return request({
    url: '/a/cloudPlatform/importJson',
    method: 'post',
    data
  })
}

/* 4.发送设置终端通道命令  prm-web/a/terminalSettings/terminalPassSetting  method=get|post
 json           String   json字符串
 */
export function terminalPassSetting(info) {
  let data = {
    "terminalPassSettingMsg": info.json
  };

  return request({
    url: '/a/terminalSettings/terminalPassSetting',
    method: 'post',
    data
  })
}

