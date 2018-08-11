import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.获取计划列表 prm-web/a/strategy/strategyList  method=get|post
 searchKey          String          搜索关键字                      计划名   没有搜索不传
 pageNo             String           第几页                             没有传默认第一页
 pageSize           String            每页条数                         没有传系统默认条数
 type                   String            计划类型                        1 为电源  2 为音量 没有不传
 orderbyfield      String            排序字段                         name（ 计划名）   updateDate（创建时间）
 orderbytype      String            排序规则                        desc（降序）   asc（升序）
 */
export function getPlanList(info) {
  let params = {};

  if (info['searchKey']) params.searchKey = info['searchKey'];
  if (info['type']) params.type = info['type'];
  if (info['pageNo']) params.pageNo = info['pageNo'];
  if (info['pageSize']) params.pageSize = info['pageSize'];
  if (info['orderbyfield']) params.orderbyfield = info['orderbyfield'];
  if (info['orderbytype']) params.orderbytype = info['orderbytype'];

  return request({
    url: 'a/strategy/strategyList',
    method: 'get',
    params
  })
}

/* 2.增加修改计划  prm-web/a/strategy/addStrategy  method=get|post
 strategyId                   String        没有不传   传为修改
 name                          String        计划名   必传
 content                       String        计划内容   json组字符串  必传
 type                             String            计划类型                        1 为电源  2 为音量 必传
*/
export function saveStrategy(info) {
  let data = {
    name: info.name,
    content: info.content,
    type: info.type,
  };

  if (info['strategyId']) data.strategyId = info['strategyId'];

  return request({
    url: '/a/strategy/addStrategy',
    method: 'post',
    data
  })
}

/* 3.删除计划  prm-web/a/strategy/delStrategys  method=get|post
 strategyIds                  String         必传  多个,号隔开
*/
export function delStrategys(strategyIds) {
  return request({
    url: '/a/strategy/delStrategys',
    method: 'post',
    data: {
      strategyIds
    }
  })
}

/* 4.通过计划查询关联终端  prm-web/a/strategy/strategyTerminal  method=get|post
 strategyId                    String      计划id   必传
*/
export function strategyTerminal(info) {
  let data = {
    strategyId: info.strategyId
  };
  return request({
    url: '/a/strategy/strategyTerminal',
    method: 'post',
    data
  })
}

/* 5.计划增加关联终端  prm-web/a/strategy/strategyRelatedTerminal  method=get|post
 strategyId                   String        必传
 terminalIds                 String         必传  多个,号隔开
*/
export function strategyRelatedTerminal(info) {
  let data = {
    strategyId : info.strategyId,
    terminalIds:info.terminalIds
  }
  return request({
    url: '/a/strategy/strategyRelatedTerminal',
    method: 'post',
    data
  })
}

/* 6.计划删除关联终端  prm-web/a/strategy/delStrategyterminal  method=get|post
 strategyId                   String        必传
 terminalIds                 String         必传  多个,号隔开
 */
export function delStrategyterminal(info) {
  let data = {
    strategyId : info.strategyId,
    terminalIds:info.terminalIds
  }
  return request({
    url: '/a/strategy/delStrategyterminal',
    method: 'post',
    data
  })
}

/* 7.设备列表  prm-web/a/terminal/terminalPageByOffices  method=get|post
 officeIds               String            机构id  多个,号隔开      必传
 searchKey             String           搜索关键字                   没有不传
 pageNo             String           第几页                             没有传默认第一页  必传
 pageSize           String            每页条数                         没有传系统默认条数  必传
 */
export function terminalPageByOffices(info) {
  let params = {};
  params.officeIds = info['officeIds'];
  if (info['searchKey']) params.searchKey = info['searchKey'];
  if (info['pageNo']) params.pageNo = info['pageNo'];
  if (info['pageSize']) params.pageSize = info['pageSize'];

  return request({
    url: '/a/terminal/terminalPageByOffices',
    method: 'get',
    params
  })
}
