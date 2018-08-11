import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.终端截图  pprm-web/a/terminalMonitor/screenShoot  method=get|post
 terminalId                          String               终端id   必传
 */
export function getScreenShoot(info) {
  let data = {
    terminalId: info.terminalId + '',
  };

  return request({
    url: '/a/terminalMonitor/screenShoot',
    method: 'post',
    data
  })
}

/* 2.轮询获得终端截图  prm-web/a/terminalMonitor/getRltMonitor  method=get|post
 terminalId                          String               终端id   必传
 */
export function getRltMonitor(info) {
  let data = {
    terminalId: info.terminalId + '',
  };

  return request({
    url: '/a/terminalMonitor/getRltMonitor',
    method: 'post',
    data
  })
}

/* 3.通过日期获取所有截图  prm-web/a/terminalMonitor/findCaptureByTerminalIdAndDate  method=get|post
 terminalId                          String               终端id   必传
 startTime                           String               开始时间    2018-05-07
 endTime                            String               结束时间    2018-05-08
 */
export function findCaptureByTerminalIdAndDate(info) {
  let data = {
    terminalId: info.terminalId + '',
    startTime: info.startTime,
    endTime: info.endTime
  };

  if (info['startTime']) data.startTime = info['startTime'];
  if (info['endTime']) data.endTime = info['endTime'];

  return request({
    url: '/a/terminalMonitor/findCaptureByTerminalIdAndDate',
    method: 'post',
    data
  })
}
