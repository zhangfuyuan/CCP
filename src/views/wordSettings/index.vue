<template>
  <div class="wordSettings-wrapper">
    <div class="btns">
      <el-row style="margin-bottom: 20px;">
        <el-button>{{$t('wordSettings.exportWord')}}</el-button>
        <el-button type="primary" @click="dialogUploadVisible = true, uploadList = []">{{$t('wordSettings.uploadWord')}}</el-button>
      </el-row>
    </div>

    <div class="table">
      <el-table stripe
                border
                fit
                highlight-current-row
                :data="tableData"
                style="width: 50%"
                :default-sort="{ prop: 'id' }">
        <el-table-column prop="id" width="100"></el-table-column>

        <el-table-column prop="language" :label="$t('wordSettings.language')"></el-table-column>

        <el-table-column :label="$t('wordSettings.handle')">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleEdit(scope.$index, scope.row)">{{$t('wordSettings.modify')}}</el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleDelete(scope.$index, scope.row)" style="color: #F56C6C;">{{$t('wordSettings.del')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="dialog">
      <el-dialog title="上传词条文件"
                 :visible.sync="dialogUploadVisible"
                 :close-on-click-modal="false">
        <div class="upload-box">
          <div class="upload-wrapper">
            <div tabindex="0" class="el-upload el-upload--text">
              <div id="uploadArea" class="el-upload-dragger">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              </div>

              <webuploader ref="webuploader"
                           accept="xls"
                           url="http://localhost:3000/webuploader"
                           uploadButton="#uploadArea"
                           dndEle="#uploadArea"
                           @beforeFileQueued="webuploader_beforeFileQueued"
                           @fileQueued="webuploader_fileQueued"
                           @fileDequeued="webuploader_fileDequeued"
                           @uploadFinished="webuploader_uploadFinished"
                           @uploadStart="webuploader_uploadStart"
                           @uploadBeforeSend="webuploader_uploadBeforeSend"
                           @uploadProgress="webuploader_uploadProgress"
                           @uploadSuccess="webuploader_uploadSuccess"
                           @uploadError="webuploader_uploadError"
                           @uploadComplete="webuploader_uploadComplete"
                           @error="webuploader_error">
              </webuploader>
            </div>

            <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>

            <ul class="el-upload-list el-upload-list--text">
              <li :class="['el-upload-list__item', { 'is-success': uploadPercentageMap[item.name]===100}]"
                  v-for="(item, index) in uploadList" :key="index">
                <a class="el-upload-list__item-name">
                  <i class="el-icon-document"></i>{{item.name}}
                </a>

                <i class="el-icon-close"></i>

                <el-progress :percentage="item.percentage"
                             :status="item.status"></el-progress>
              </li>
            </ul>
          </div>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogUploadVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogUploadVisible = false">确 定</el-button>
        </div>
      </el-dialog>
    </div>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Webuploader from '@/components/Webuploader';

  export default {
    name: 'wordSettings',
    components: { Webuploader },
    data() {
      return {
        tableData: [
          {
            id: '3',
            language: '--'
          }, {
            id: '4',
            language: '--'
          }, {
            id: '1',
            language: '中文'
          }, {
            id: '2',
            language: 'English'
          }
        ],
        dialogUploadVisible: false,
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px',
        uploadList: [], // 记录上传队列中的文件信息
        uploadPercentageMap: { aa: 50 }, // 记录每个文件当前进度数值
      }
    },
    computed: {
    },
    watch: {
    },
    mounted() {
    },
    methods: {
      handleEdit(index, row) {
        this.dialogUploadVisible = true
      },
      handleDelete(index, row) {
        alert(index + row + '施工中...')
      },
      webuploader_beforeFileQueued(file) {
        console.log('beforeFileQueued', file)

      },
      // fileQueued -> 每个入队列文件均进入预览列表
      webuploader_fileQueued(file) {
        console.log('fileQueued', file)
        const index = this.uploadList.findIndex(item => item.name === file.name)

        if (index > -1) {
          console.log('文件名重复！')
          this.$refs['webuploader'].removeFile(file, true);
        } else {
          this.uploadList.push({
            name: file.name,
            percentage: 0,
            status: ''
          })
        }
      },
      webuploader_fileDequeued(file) {
        console.log('fileDequeued', file)
      },
      webuploader_uploadFinished() {
        console.log('uploadFinished')
      },
      webuploader_uploadStart(file) {
        console.log('uploadStart', file)
      },
      webuploader_uploadBeforeSend(object, data, headers) {
        console.log('uploadBeforeSend', object, data, headers)
      },
      webuploader_uploadProgress(file, percentage) {
        console.log('uploadProgress', file, percentage)

        const index = this.uploadList.findIndex(item => item.name === file.name)
        this.uploadList[index].percentage = 50
        setTimeout(() => {
          this.uploadList[index].percentage = 100
          this.uploadList[index].status = 'success'
        }, 1000)
      },
      webuploader_uploadSuccess(file, response) {
        console.log('uploadSuccess', file, response)
      },
      webuploader_uploadError(file, reason) {
        console.log('uploadError', file, reason)

        const index = this.uploadList.findIndex(item => item.name === file.name)
        setTimeout(() => {
          this.uploadList[index].percentage = 95
          this.uploadList[index].status = 'exception'
        }, 5000)
      },
      webuploader_uploadComplete(file) {
        console.log('uploadComplete', file)

      },
      webuploader_error(errorMessage) {
        console.log('uploadComplete', errorMessage)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  /* reset element-ui css */
  .wordSettings-wrapper {
  }
  </style>

<style rel="stylesheet/scss" lang="scss" scoped>
.wordSettings-wrapper {

  .upload-box {
    padding: 24px;
    .upload-wrapper {
      width: 360px;
      /*.el-upload {
        display: inline-block;
        text-align: center;
        cursor: pointer;
        outline: none;
      }

      .el-upload-dragger {
        background-color: #fff;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        .el-icon-upload {
          font-size: 67px;
          color: #c0c4cc;
          margin: 40px 0 16px;
          line-height: 50px;
        }

        .el-upload__text {
          color: #606266;
          font-size: 14px;
          text-align: center;
          em {
            color: #409eff;
            font-style: normal;
          }
        }
      }

      .el-upload__tip {
        font-size: 12px;
        color: #606266;
        margin-top: 7px;
      }

      .el-upload-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .el-upload-list__item {
        transition: all .5s cubic-bezier(.55,0,.1,1);
        font-size: 14px;
        color: #606266;
        line-height: 1.8;
        margin-top: 5px;
        position: relative;
        box-sizing: border-box;
        border-radius: 4px;
        width: 100%;
        &:first-child {
          margin-top: 10px;
        }

        .el-icon-close {
          position: absolute;
          top: 5px;
          right: 5px;
          cursor: pointer;
          opacity: .75;
          color: #606266;
        }

        .el-icon-close-tip {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 12px;
          cursor: pointer;
          opacity: 1;
          color: #409eff;
        }
      }

      .el-upload-list__item-name {
        color: #606266;
        display: block;
        margin-right: 40px;
        overflow: hidden;
        padding-left: 4px;
        text-overflow: ellipsis;
        transition: color .3s;
        white-space: nowrap;
        [class^=el-icon] {
          height: 100%;
          margin-right: 7px;
          color: #909399;
          line-height: inherit;
        }
      }

      .el-upload-list__item-status-label {
        display: block;
        position: absolute;
        right: 5px;
        top: 0;
        line-height: inherit;
      }*/
    }
  }
}
</style>
