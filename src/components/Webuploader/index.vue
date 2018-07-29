<template>
  <div class="upload">
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'web-upload',
    props: {
      accept: {
        type: String,
        default: '',
      },
      // 上传地址
      url: {
        type: String,
        default: '',
      },
      // 上传最大数量 默认为100
      fileNumLimit: {
        type: Number,
        default: 100,
      },
      // 大小限制 默认2M
      fileSingleSizeLimit: {
        type: Number,
        default: 2 * 1024 * 1024,
      },
      // 上传时传给后端的参数，一般为token，key等
      formData: {
        type: Object,
        default: null
      },
      // 生成formData中文件的key，下面只是个例子，具体哪种形式和后端商议
      keyGenerator: {
        type: Function,
        default(file) {
          const currentTime = new Date().getTime();
          const key = `${currentTime}.${file.name}`;
          return key;
        },
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      // 上传按钮ID
      uploadButton: {
        type: String,
        default: '',
      },
      // 指定Drag And Drop拖拽的容器，如果不指定，则不启动
      dndEle: {
        type: String,
        default: '',
      },
      // 是否禁掉整个页面的拖拽功能，如果不禁用，图片拖进来的时候会默认被浏览器打开
      isDisableGlobalDnd: {
        type: Boolean,
        default: true,
      }
    },
    data() {
      return {
        uploader: null
      };
    },
    computed: {
      ...mapGetters([
        'public_path',
      ])
    },
    mounted() {
      console.log(this.public_path + '/static/lib/webuploader/Uploader.swf')

      let self = this;

      // WebUploader.Uploader.register 内必须备份外层 this 为 self
      WebUploader.Uploader.register({
        'before-send-file': 'beforeSendFile',
      }, {
        beforeSendFile(file) {
          let deferred = WebUploader.Deferred();

          self.uploader.md5File(file).then((val) => {
            console.log(`${file.name} md5：${val}`)

            // api
//            verifyMD5(val).then(response => {
//              deferred.resolve();
//            }).catch(err => {
//              deferred.reject();
//            });
            setTimeout(()=>{
              console.log('请求后台进行文件md5校验结果...')
              deferred.resolve();
            }, 1000)

            return deferred.promise();
          });

          return deferred.promise();
        }
      });

      if (this.uploader) this.destroy();
      this.initWebUpload();
    },
    methods: {
      initWebUpload() {
        this.uploader = WebUploader.create({
          dnd: this.dndEle,
          disableGlobalDnd: this.isDisableGlobalDnd,
          auto: true, // 选完文件后，是否自动上传
          swf: this.public_path + '/static/lib/webuploader/Uploader.swf',  // swf文件路径
          server: this.url,  // 文件接收服务端
          pick: {
            id: this.uploadButton,     // 选择文件的按钮
            multiple: this.multiple,   // 是否多文件上传 默认false
            label: '',
          },
          prepareNextFile: true, // 是否允许在文件传输时提前把下一个文件准备好
          accept: this.getAccept(this.accept),  // 允许选择文件格式。
          threads: 3,
          fileNumLimit: this.fileNumLimit, // 限制上传个数
          fileSingleSizeLimit: this.fileSingleSizeLimit, // 限制单个上传图片的大小
          formData: this.formData,  // 上传所需参数
          chunked: true,          //分片上传
          chunkSize: 2 * 1024 * 1024,    //分片大小
          duplicate: true,  // 重复上传
        });

        // 阻止此事件可以拒绝某些类型的文件拖入进来。目前只有 chrome 提供这样的 API，且只能通过 mime-type 验证
        this.uploader.on('dndAccept', (items) => {
          this.$emit('dndAccept', items);
        });

        // 当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列
        this.uploader.on('beforeFileQueued', (file) => {
          this.$emit('beforeFileQueued', file);
        });

        // 当有文件被添加进队列的时候，添加到页面预览
        this.uploader.on('fileQueued', (file) => {
          this.$emit('fileQueued', file);
        });

        // 当一批文件添加进队列以后触发
        this.uploader.on('filesQueued', (files) => {
          this.$emit('filesQueued', files);
        });

        // 当文件被移除队列后触发
        this.uploader.on('fileDequeued', (file) => {
          this.$emit('fileDequeued', file);
        });

        // 当 uploader 被重置的时候触发
        this.uploader.on('reset', () => {
          this.$emit('reset');
        });

        // 当开始上传流程时触发
        this.uploader.on('startUpload', () => {
          this.$emit('startUpload');
        });

        // 当开始上传流程暂停时触发
        this.uploader.on('stopUpload', () => {
          this.$emit('stopUpload');
        });

        // 当所有文件上传结束时触发
        this.uploader.on('uploadFinished', () => {
          this.$emit('uploadFinished');
        });

        // 某个文件开始上传前触发，一个文件只会触发一次
        this.uploader.on('uploadStart', (file) => {
          // 在这里可以准备好formData的数据
          //this.uploader.options.formData.key = this.keyGenerator(file);
          this.$emit('uploadStart', file);
        });

        // 当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次
        this.uploader.on('uploadBeforeSend', (object, data, headers) => {
          this.$emit('uploadBeforeSend', object, data, headers);
        });

        // 当某个文件上传到服务端响应后，会派送此事件来询问服务端响应是否有效。如果此事件handler返回值为false, 则此文件将派送server类型的uploadError事件
        this.uploader.on('uploadAccept', (object, ret) => {
          this.$emit('uploadAccept', object, ret);
        });

        // 文件上传过程中创建进度条实时显示。
        this.uploader.on('uploadProgress', (file, percentage) => {
          this.$emit('uploadProgress', file, percentage);
        });

        // 当文件上传成功时触发
        this.uploader.on('uploadSuccess', (file, response) => {
          this.$emit('uploadSuccess', file, response);
        });

        // 当文件上传出错时触发
        this.uploader.on('uploadError', (file, reason) => {
          console.error(reason);
          this.$emit('uploadError', file, reason);
        });

        // 不管成功或者失败，文件上传完成时触发
        this.uploader.on('uploadComplete', (file) => {
          this.$emit('uploadComplete', file);
        });

        // 当validate不通过时，会以派送错误事件的形式通知调用者
        this.uploader.on('error', (type) => {
          let errorMessage = '';
          if (type === 'F_EXCEED_SIZE') {
            errorMessage = `文件大小不能超过${this.fileSingleSizeLimit / (1024 * 1024)}M`;
          } else if (type === 'Q_EXCEED_NUM_LIMIT') {
            errorMessage = '文件上传已达到最大上限数';
          } else if (type === 'Q_TYPE_DENIED') {
            errorMessage = '文件类型不符合要求';
          } else {
            errorMessage = `上传出错！请检查后重新上传！错误代码${type}`;
          }

          console.error(errorMessage);
          this.$emit('error', errorMessage);
        });
      },
      /**
       *  vue父组件调用子组件的方法 - $refs
       * */
      // 获取 Uploader 配置项
      getOption(key) {
        return this.uploader.option(key);
      },
      // 设置 Uploader 配置项
      setOption(key, val) {
        this.uploader.option(key, val);
      },
      // 开始上传。此方法可以从初始状态调用开始上传流程，也可以从暂停状态调用，继续上传流程。可以指定开始某一个文件
      upload(file) {
        this.uploader.upload(file);
      },
      // 暂停上传。第一个参数为是否中断上传当前正在上传的文件。如果第一个参数是文件，则只暂停指定文件
      stop(file) {
        this.uploader.stop(file);
      },
      // 取消并中断整个文件上传
      cancelFile(file) {
        this.uploader.cancelFile(file);
      },
      // 在队列中移除文件（移除某一文件, 默认只会标记文件状态为已取消，如果第二个参数为 true 则会从 queue 中移除）
      removeFile(file, bool) {
        this.uploader.removeFile(file, bool);
      },
      // 获取指定接受哪些类型的文件
      getAccept(accept) {
        switch (accept) {
          case 'doc':
            return {
              title: 'DOCs',
              exteensions: 'doc,docx',
              mimeTypes: '.doc,.docx'
            };
            break;
          case 'xls':
            return {
              title: 'XLXs',
              exteensions: 'xls,xlsx',
              mimeTypes: '.xls,.xlsx'
            };
            break;
          case 'ppt':
            return {
              title: 'PPTs',
              exteensions: 'ppt,pptx',
              mimeTypes: '.ppt,.pptx'
            };
            break;
          case 'pdf':
            return {
              title: 'PDFs',
              exteensions: 'pdf',
              mimeTypes: '.pdf'
            };
            break;
          case 'txt':
            return {
              title: 'TXTs',
              exteensions: 'txt',
              mimeTypes: '.txt'
            };
            break;
          case 'video':
            return {
              title: 'Videos',
              exteensions: 'mp4',
              mimeTypes: '.mp4'
            };
            break;
          case 'image':
            return {
              title: 'Images',
              exteensions: 'gif,jpg,jpeg,bmp,png',
              mimeTypes: '.gif,.jpg,.jpeg,.bmp,.png'
            };
            break;
          default: return accept
        }
      },
      // 生成缩略图，此过程为异步，所以需要传入callback。 通常情况在图片加入队里后调用此方法来生成预览图以增强交互效果
      makeThumb(file) {
        return new Promise((resolve, reject) => {
          this.uploader.makeThumb(file, (error, ret) => {
            if (error) {
              reject(error);
            } else {
              resolve(ret);
            }
          })
        });
      },
      // 重试上传，或重试指定文件，或者从出错的文件开始重新上传
      retry(file) {
        file ? this.uploader.retry(file) : this.uploader.retry();
      },
      // 销毁 webuploader 实例
      destroy() {
        this.uploader.destroy();
        this.uploader = null;
      }
    },
  };
</script>

<style lang="scss">
  .webuploader-container {
    position: relative;
  }
  .webuploader-element-invisible {
    position: absolute !important;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px,1px,1px,1px);
  }
  /*.webuploader-pick {
    position: relative;
    display: inline-block;
    cursor: pointer;
    background: #00b7ee;
    padding: 10px 15px;
    color: #fff;
    text-align: center;
    border-radius: 3px;
    overflow: hidden;
  }
  .webuploader-pick-hover {
    background: #00a2d4;
  }*/

  .webuploader-pick-disable {
    opacity: 0.6;
    pointer-events: none;
  }

</style>
