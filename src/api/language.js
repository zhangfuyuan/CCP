import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.获取所有系统语言  prm-web/a/lemma/list  method=get|post
 */
export function getLemmaList() {
  return request({
    url: '/a/lemma/list',
    method: 'get',
  })
}

/* 2.获取id获取语言内容  prm-web/a/lemma/findContentByLemmaId  method=get|post
 id                              String               语言id   必传
 */
export function findContentByLemmaId(info) {
  let data = {
    id: info.id,
  };

  return request({
    url: '/a/lemma/findContentByLemmaId',
    method: 'post',
    data
  })
}

/* 3.导入词条数据  prm-web/a/lemma/importLemmaFile  method=get|post
 id                              String             没有为新增  有为修改
 file                            file                  excel文件
 language                 String              必传  语言
 */
export function importLemmaFile(info) { // 此方法无用！！！
  let data = {
    file: info.file,
    language: info.language
  };

  if (info['id']) data.id = info['id'];

  return request({
    url: '/a/lemma/importLemmaFile',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  })
}

/* 4.更新词条文件名  prm-web/a/lemma/updateLemmaFileName  method=get|post
 id                              String             没有为新增  有为修改
 language                 String              必传  语言
 */
export function updateLemmaFileName(info) {
  let data = {
    id: info.id,
    language: info.language
  };

  return request({
    url: '/a/lemma/updateLemmaFileName',
    method: 'post',
    data
  })
}

/* 5.删除语言  prm-web/a/lemma/delLemmaFile  method=get|post
 id                              String             没有为新增  有为修改
 */
export function delLemmaFile(info) {
  let data = {
    id: info.id,
  };

  return request({
    url: '/a/lemma/delLemmaFile',
    method: 'post',
    data
  })
}


/* 6.检测语言是否重复  prm-web/a/lemma/checkLemmaFileName  method=get|post
 id                              String             没有为新增  有为修改
 language                 String              必传  语言
 */
export function checkLemmaFileName(info) {
  let data = {
    language: info.language
  };

  if (info['id']) data.id = info['id'];

  return request({
    url: '/a/lemma/checkLemmaFileName',
    method: 'post',
    data
  })
}
