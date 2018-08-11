<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { verifyMd5 } from '@/api/uploader'

export default {
  name: 'App',
  data() {
    return {
    }
  },
  created() {
    // todo 只能在这里 register 注册 WebUploader，否则会重复注册！
    let self = this;

    // WebUploader.Uploader.register 内必须备份外层 this 为 self
    WebUploader.Uploader.register({
      'before-send-file': 'beforeSendFile',
    }, {
      beforeSendFile(file) {
        let deferred = WebUploader.Deferred();

        (new WebUploader.Uploader()).md5File(file).then((val) => {
          console.log(`${file.name} md5：${val}`);

          file.md5 = val;
          verifyMd5({ md5: val }).then(res => {
            console.log('请求后台进行文件md5校验结果...', res);
            deferred.resolve(res);
          }).catch(err => {
            console.log(err);
            deferred.reject(err);
          });
          return deferred.promise();
        });

        return deferred.promise();
      }
    });
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  #uploadArea>div, #uploadApkArea>div{
    height: 180px !important;
  }
</style>
