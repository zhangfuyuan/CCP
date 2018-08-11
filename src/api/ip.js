import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

// 1.获取当前IP设置  /prm-web/a/sys/sysSetting/list  method=get|post
export function getIpSetting() {
  return request({
    url: '/a/sys/sysSetting/list',
    method: 'get'
  })
}

/* 2.保存ip设置  /prm-web/a/sys/sysSetting/save  method=get|post
 serverIp          String         http://119.23.61.139        服务器 IP / 域名          非必传  默认不传
 teIp                String         http://119.23.61.139     与设备通信IP / 域名     非必传   默认不传
 isDefault        String         是否默认               true 为默认    false为非默认  必传
*/
export function saveIpSetting(info) {
  let data = {
    isDefault: info.isDefault
  };

  if (info['serverIp']) data.serverIp = info['serverIp'];
  if (info['teIp']) data.teIp = info['teIp'];

  return request({
    url: '/a/sys/sysSetting/save',
    method: 'post',
    data
  })
}



