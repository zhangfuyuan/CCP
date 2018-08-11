import request from '@/utils/request'

/**
 *  GET请求  数据放在 params 属性内
 *  POST请求 数据放在 data   属性内
 * */

/* 1.文件上传  prm-web/a/fileInfosa/uploader  method=get|post
 md5                          String              文件MD5值
 folderName              String              上传的类型（上传到的文件夹）   img_path  图片 dedicated_apk_path 专用apk
 chunk                        String             当前分页序号   没有5M不分片 不传
 chunksSize String              分片总页数 没有5M不分片 不传
 */
export function uploaderServer(info) {
  let data = {
    md5: info.md5 + '',
    folderName: info.folderName,
  };

  if (info['chunk']) data.chunk = info['chunk'] + '';
  if (info['chunksSize']) data.chunksSize = info['chunksSize'] + '';

  return request({
    url: '/a/fileInfosa/uploader',
    method: 'post',
    data
  })
}

/* 1.校验文件是否上传  prm-web/a/fileInfosa/uploaderMD5Check  method=get|post
 md5                          String              文件MD5值
 */
export function verifyMd5(info) {
  let data = {
    md5: info.md5 + '',
  };

  return request({
    url: '/a/fileInfosa/uploaderMD5Check',
    method: 'post',
    data
  })
}
