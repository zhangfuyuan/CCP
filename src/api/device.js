import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.设备列表  prm-web/a/terminal/terminalPageByOffices  method=get|post
 officeIds               String            机构id  多个,号隔开      必传
 searchKey             String           搜索关键字                   没有不传
 pageNo             String           第几页                             没有传默认第一页  必传
 pageSize           String            每页条数                         没有传系统默认条数  必传
 */
export function getDeviceList(info) {
  let data = {
    officeIds: info.officeIds + '',
  };

  if (info['searchKey']) data.searchKey = info['searchKey'];
  if (info['pageNo']) data.pageNo = info['pageNo'] + '';
  if (info['pageSize']) data.pageSize = info['pageSize'] + '';

  return request({
    url: '/a/terminal/terminalPageByOffices',
    method: 'post',
    data
  })
}

/* 2.修改终端信息  prm-web/a/terminal/submitTeInfo  method=get|post
 name                   String            终端名  必传
 id                         String            终端id   必传
 remarks               String           备注       没有不传
 */
export function saveDeviceInfo(info) {
  let data = {
    name: info.name,
    id: info.id
  };

  if (info['remarks']) data.remarks = info['remarks'];

  return request({
    url: '/a/terminal/submitTeInfo',
    method: 'post',
    data
  })
}

/* 3.删除终端  prm-web/a/terminal/delTerminal  method=get|post
 terminalIds                String            终端id  多个,号隔开      必传
 */
export function deleteDevice(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminal/delTerminal',
    method: 'post',
    data
  })
}

/* 4.移动终端  prm-web/a/terminal/updateTeOffice  method=get|post
 terminalIds                                         String            终端id  多个,号隔开      必传
 officeId                                               String            移动目标机构id
 */
export function moveDeviceToOffice(info) {
  let data = {
    terminalIds: info.terminalIds + '',
    officeId: info.officeId,
  };

  return request({
    url: '/a/terminal/updateTeOffice',
    method: 'post',
    data
  })
}

/* 5.获取计划列表  prm-web/a/strategy/strategyList  method=get|post
 searchKey          String          搜索关键字                      计划名   没有搜索不传
 pageNo             String           第几页                             没有传默认第一页
 pageSize           String            每页条数                         没有传系统默认条数
 type                   String            计划类型                        1 为电源  2 为音量 没有不传
 orderbyfield      String            排序字段                         name（ 计划名）   updateDate（创建时间）
 orderbytype      String            排序规则                        desc（降序）   asc（升序）
 */
export function getPlanList(info) {
  let data = {};

  if (info['searchKey']) data.searchKey = info['searchKey'];
  if (info['pageNo']) data.pageNo = info['pageNo'] + '';
  if (info['pageSize']) data.pageSize = info['pageSize'] + '';
  if (info['type']) data.type = info['type'];
  if (info['orderbyfield']) data.orderbyfield = info['orderbyfield'];
  if (info['orderbytype']) data.orderbytype = info['orderbytype'];

  return request({
    url: '/a/strategy/strategyList',
    method: 'post',
    data
  })
}

/* 6.计划增加关联终端  prm-web/a/strategy/strategyRelatedTerminal  method=get|post
 strategyId                   String        必传
 terminalIds                 String         必传  多个,号隔开
 */
export function movePlanToDevice(info) {
  let data = {
    strategyId: info.strategyId,
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/strategy/strategyRelatedTerminal',
    method: 'post',
    data
  })
}

/* 7.计划删除关联终端  prm-web/a/strategy/delStrategyterminal  method=get|post
 strategyId                   String        必传
 terminalIds                 String         必传  多个,号隔开
 */
export function removePlanOfDevice(info) {
  let data = {
    strategyId: info.strategyId,
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/strategy/delStrategyterminal',
    method: 'post',
    data
  })
}

/* 8.根据终端获取所有终端计划  prm-web/a/strategy/terminalStrategyDetail  method=get|post
 terminalId                  String         必传
 */
export function getPlanOfDevice(info) {
  let data = {
    terminalId: info.terminalId,
  };

  return request({
    url: '/a/strategy/terminalStrategyDetail',
    method: 'post',
    data
  })
}

/* 9.设置终端关机  prm-web/a/terminalSettings/shutDown  method=get|post
 terminalIds                    String         必传
 */
export function setDevice_powerOff(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminalSettings/shutDown',
    method: 'post',
    data
  })
}

/* 10.设置终端待机  prm-web/a/terminalSettings/standby  method=get|post
 terminalIds                    String         必传
 */
export function setDevice_standby(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminalSettings/standby',
    method: 'post',
    data
  })
}

/* 11.设置终端待机唤醒  prm-web/a/terminalSettings/standbyAwaken  method=get|post
 terminalIds                    String         必传
 */
export function setDevice_awake(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminalSettings/standbyAwaken',
    method: 'post',
    data
  })
}

/* 12.设置终端重启  prm-web/a/terminalSettings/reboot  method=get|post
 terminalIds                    String         必传
 */
export function setDevice_restart(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminalSettings/reboot',
    method: 'post',
    data
  })
}

/* 13.设置终端音量  prm-web/a/terminalSettings/volumeSetting  method=get|post
 terminalIds                    String         必传
 volume                          String         音量
 */
export function setDeviceVolume(info) {
  let data = {
    terminalIds: info.terminalIds + '',
    volume: info.volume + '',
  };

  return request({
    url: '/a/terminalSettings/volumeSetting',
    method: 'post',
    data
  })
}

/* 14.锁屏设置  prm-web/a/terminalSettings/sendSetLockScreen  method=get|post
 terminalIds                    String                必传
 isLockScreen                  Boolean            是否锁屏   true为锁屏  fasle为不锁屏
 lockScreenTime             String                锁屏时间
 lockingMode                 String                锁屏方式   0为默认  1为自定义图像
 fid                                  String                图片id
 */
export function setLockScreen(info) {
  let data = {
    terminalIds: info.terminalIds + '',
    isLockScreen: info.isLockScreen,
  };

  if (info['isLockScreen']) data.lockScreenTime = info['lockScreenTime'];
  if (info['isLockScreen']) data.lockingMode = info['lockingMode'];
  if (info['isLockScreen'] && info['lockingMode']==='1') data.fid = info['fid'];

  return request({
    url: '/a/terminalSettings/sendSetLockScreen',
    method: 'post',
    data
  })
}

/* 15.锁屏 自定义图像  前端询问后台   轮询  直到全部非处理状态  prm-web/a/terminalSettings/getLockScreenInfo  method=get|post
 uuid                         String      图片终端需要下载 通过这个uuid询问每台终端是否成功  见 32
 */
export function getLockScreenInfo(info) {
  let data = {
    uuid: info.uuid,
  };

  return request({
    url: '/a/terminalSettings/getLockScreenInfo',
    method: 'post',
    data
  })
}

/* 16.升级apk  prm-web/a/terminalSettings/sendDedicatedApk  method=get|post
 terminalIds                    String                必传
 fid                                  String                apk文件id
 */
export function setDedicatedApk(info) {
  let data = {
    terminalIds: info.terminalIds + '',
    fid: info.fid,
  };

  return request({
    url: '/a/terminalSettings/sendDedicatedApk',
    method: 'post',
    data
  })
}

/* 17.apk升级状态  前端询问后台   轮询  直到全部非处理状态  prm-web/a/terminalSettings/getApkUpdateInfo  method=get|post
 uuid                         String      图片终端需要下载 通过这个uuid询问每台终端是否成功  见 34
 */
export function getApkUpdateInfo(info) {
  let data = {
    uuid: info.uuid,
  };

  return request({
    url: '/a/terminalSettings/getApkUpdateInfo',
    method: 'post',
    data
  })
}

/* 18.移动终端  prm-web/a/terminal/updateTeOffice  method=get|post
 terminalIds                                         String            终端id  多个,号隔开      必传
 officeId                                               String            移动目标机构id
 */
export function updateTeOffice(info) {
  let data = {
    terminalIds: info.terminalIds + '',
    officeId: info.officeId
  };

  return request({
    url: '/a/terminal/updateTeOffice',
    method: 'post',
    data
  })
}

/* 19.删除终端  prm-web/a/terminal/delTerminal  method=get|post
 terminalIds                String            终端id  多个,号隔开      必传
 */
export function deleteTerminal(info) {
  let data = {
    terminalIds: info.terminalIds + '',
  };

  return request({
    url: '/a/terminal/delTerminal',
    method: 'post',
    data
  })
}

/* 19.修改终端信息  prm-web/a/terminal/submitTeInfo  method=get|post
 name                   String            终端名  必传
 id                         String            终端id   必传
 remarks               String           备注       没有不传
 */
export function submitTeInfo(info) {
  let data = {
    name: info.name,
    id: info.id,
  };

  if (info['remarks']) data.remarks = info['remarks'];

  return request({
    url: '/a/terminal/submitTeInfo',
    method: 'post',
    data
  })
}
