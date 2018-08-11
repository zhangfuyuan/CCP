import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.获取用户列表  /prm-web/a/sys/user/list  method=get|post
 searchKey     String  搜索关键字     用户名|名称   没有搜索不传
 rolekey       String  角色id         没有选择角色不传
 pageNo        String  第几页         没有传默认第一页
 pageSize      String  每页条数       没有传系统默认条数
 orderbyfield  String  排序字段       loginName（用户名） name（名称）  updateDate（创建时间）
 orderbytype   String  排序规则       desc（降序）   asc（升序）
 */
export function getAccountList(info) {
  let data = {};

  if (info['searchKey']) data.searchKey = info['searchKey'];
  if (info['rolekey']) data.rolekey = info['rolekey'];
  if (info['pageNo']) data.pageNo = info['pageNo'];
  if (info['pageSize']) data.pageSize = info['pageSize'];
  if (info['orderbyfield']) data.orderbyfield = info['orderbyfield'];
  if (info['orderbytype']) data.orderbytype = info['orderbytype'];

  return request({
    url: '/a/sys/user/list',
    method: 'post',
    data
  })
}

/* 2.保存用户信息  /prm-web/a/sys/user/save  method=get|post
 id         String  用户id     新建用户不传   编辑用户必传
 loginName  String  用户名  唯一     必传
 name       String  名称                  必传
 password   String  密码    用户没有修改不传
 remarks    String  备注
 roleIds    String  角色id   多个,号隔开 必传
 officeId   String  机构id   必传
*/
export function saveAccountInfo(info) {
  let data = {
    loginName: info.loginName,
    name: info.name,
    roleIds: info.roleIds,
    officeId: info.officeId,
  };

  if (info['id']) data.id = info['id'];
  if (info['password']) data.password = info['password'];
  if (info['remarks']) data.remarks = info['remarks'];

  return request({
    url: '/a/sys/user/save',
    method: 'post',
    data
  })
}

/* 3.删除用户  /prm-web/a/sys/user/delete  method=get|post
 id                        String       用户id     必传
*/
export function deleteAccount(id) {
  return request({
    url: '/a/sys/user/delete',
    method: 'post',
    data: {
      id
    }
  })
}

/* 4.检测用户名是否存在  /prm-web/a/sys/user/checkLoginName  method=get|post
 loginName            String     用户名  必传
*/
export function checkAccountName(loginName) {
  return request({
    url: '/a/sys/user/checkLoginName',
    method: 'post',
    data: {
      loginName
    }
  })
}

/* 5.修改密码  /prm-web/a/sys/user/modifyPwd  method=get|post
 oldPassword              String      原密码
 newPassword            String      新密码
*/
export function modifyAccountPwd(oldPassword, newPassword) {
  return request({
    url: '/a/sys/user/modifyPwd',
    method: 'post',
    data: {
      oldPassword,
      newPassword
    }
  })
}
