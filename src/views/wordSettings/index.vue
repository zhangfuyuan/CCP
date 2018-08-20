<template>
  <div class="wordSettings-wrapper">
    <div class="btns">
      <el-row style="margin-bottom: 20px;">
        <el-button ><a :href="serverIp + '/prm_file/lemma/替换词条模板.xlsx'" download="替换词条模板.xlsx">{{$t('wordSettings.exportWord')}}</a></el-button>
        <el-button type="primary" @click="toggleDialog('import')">{{$t('wordSettings.uploadWord')}}</el-button>
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
        <el-table-column width="100">
          <template slot-scope="{ row, column, $index }">{{$index + 1}}</template>
        </el-table-column>

        <el-table-column prop="language" :label="$t('wordSettings.language')"></el-table-column>

        <el-table-column :label="$t('wordSettings.handle')">
          <template slot-scope="{ row, column, $index }">
            <el-button
              size="mini"
              type="text"
              @click="toggleDialog('edit', row)"
              v-if="$index!==0 && $index!==1">{{$t('wordSettings.modify')}}</el-button>
            <el-button
              size="mini"
              type="text"
              @click="toggleDialog('delete', row)"
              style="color: #F56C6C;"
              v-if="$index!==0 && $index!==1">{{$t('wordSettings.del')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="dialog">
      <el-dialog :title="dialogTitle"
                 :visible.sync="dialogUploadVisible"
                 :close-on-click-modal="false"
                 @close="dialogKey = ''"
                 :width="dialogWidth"
                 :before-close="beforeCloseDialog">
        <template v-if="dialogKey==='import'">
          <div style="width: 100%;display: flex;align-items: center;margin-bottom: 30px;">
            <div style="width: 100px;font-size: 16px;white-space: nowrap;">{{$t('wordSettings.language')}} *</div>

            <div style="display: flex;flex-direction: column;justify-content: flex-start;position: relative;margin-right: 10px;">
              <div class="el-input" style="width: 250px;margin-bottom: 5px;">
                <input type="text" v-model="form.language" @input="checkName" class="el-input__inner" />
              </div>
              <span style="position: absolute;left: 0;top: 50px;color: #999;font-size: 12px;">* {{$t('wordSettings.pleaseUseSameEntry')}}</span>
            </div>

            <el-alert
              :title="formLanguageErr"
              type="error"
              show-icon
              v-show="!!formLanguageErr"
              :closable="false"
              style="width: 40%;">
            </el-alert>
          </div>

          <div style="width: 100%;display: flex;">
            <div style="width: 100px;font-size: 16px;padding-top: 24px;">{{$t('wordSettings.newEntryFile')}} *</div>

            <div>
              <el-upload ref="upload"
                         class="upload-demo"
                         drag
                         action="/prm-web/a/lemma/importLemmaFile"
                         accept=".xls,.xlsx"
                         :multiple="false"
                         :before-upload="beforeUpload"
                         :file-list="uploadList"
                         :on-change="changeUpload" :on-remove="removeUpload" :disabled="uploadLoading">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">{{$t('deviceManager.dragFileHere')}}{{$t('deviceManager.or')}}<em>{{$t('deviceManager.clickUpload')}}</em></div>
                <div class="el-upload__tip">{{$t('deviceManager.onlyUpload')}}xls/xlsx{{$t('deviceManager.file')}}</div>
              </el-upload>
            </div>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary"
                       @click="upload()"
                       :disabled="!form.language || !uploadFileInfo || !!formLanguageErr"
                       :loading="uploadLoading">{{$t('wordSettings.upload')}}
            </el-button>
          </div>
        </template>

        <template v-if="dialogKey==='edit'">
          <div style="width: 100%;display: flex;align-items: center;margin-bottom: 30px;">
            <div style="width: 100px;font-size: 16px;white-space: nowrap;">{{$t('wordSettings.language')}} *</div>

            <div style="display: flex;flex-direction: column;justify-content: flex-start;position: relative;margin-right: 10px;">
              <div class="el-input" style="width: 250px;margin-bottom: 5px;">
                <input type="text" v-model="editInfo.language" @input="checkName" class="el-input__inner" />
              </div>
              <span style="position: absolute;left: 0;top: 50px;color: #999;font-size: 12px;">* {{$t('wordSettings.pleaseUseSameEntry')}}</span>
            </div>

            <el-alert
              :title="formLanguageErr"
              type="error"
              show-icon
              v-show="!!formLanguageErr"
              :closable="false"
              style="width: 40%;">
            </el-alert>
          </div>

          <div style="width: 100%;display: flex;">
            <div style="width: 100px;font-size: 16px;padding-top: 24px;">{{$t('wordSettings.newEntryFile')}} *</div>

            <div>
              <el-upload ref="upload"
                         class="upload-demo"
                         drag
                         action="/prm-web/a/lemma/importLemmaFile"
                         accept=".xls,.xlsx"
                         :multiple="false"
                         :before-upload="beforeUpload"
                         :file-list="uploadList"
                         :on-change="changeUpload" :on-remove="removeUpload" :disabled="uploadLoading">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">{{$t('deviceManager.dragFileHere')}}{{$t('deviceManager.or')}}<em>{{$t('deviceManager.clickUpload')}}</em></div>
                <div class="el-upload__tip">{{$t('deviceManager.onlyUpload')}}xls/xlsx{{$t('deviceManager.file')}}</div>
              </el-upload>
            </div>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary"
                       @click="handleEdit"
                       :disabled="!editInfo.language || !!formLanguageErr"
                       :loading="uploadLoading">{{$t('wordSettings.upload')}}
            </el-button>
          </div>
        </template>

        <template v-if="dialogKey==='delete'">
          <div>{{$t('wordSettings.deleteWordTips')}}</div>

          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogUploadVisible = false">{{$t('common.cancel')}}</el-button>
            <el-button type="danger" plain @click="handleDelete(), dialogUploadVisible = false">{{$t('common.deleteBtn')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Webuploader from '@/components/Webuploader'
  import { getLemmaList, findContentByLemmaId, updateLemmaFileName, delLemmaFile, checkLemmaFileName } from '@/api/language'
  import axios from 'axios'

  export default {
    name: 'wordSettings',
    components: { Webuploader },
    data() {
      return {
        tableData: [
          {
            id: '1',
            language: '中文'
          }, {
            id: '2',
            language: 'English'
          }
        ],
        dialogTitle: '',
        dialogKey: '',
        dialogUploadVisible: false,
        dialogWidth: '50%',
        // 上传
        uploadFileInfo: null,
        form: {
          language: '',
        },
        uploadList: [],
        formLanguageErr: '',
        uploadLoading: false,
        // 修改数据
        editInfo: null,
        editFileInfo: null,
        // 删除数据
        deleteInfo: null,
        isSettingsChangeNoSave: false,
      }
    },
    computed: {
      ...mapGetters([
        'localeLanguage',
        'roles',
        'officeId',
        'serverIp'
      ])
    },
    watch: {
    },
    created() {
      console.log('词条模板下载地址', this.serverIp+'/prm_file/lemma/替换词条模板.xlsx')

      getLemmaList().then(res => {
        console.log(res)

        if (res.data) {
          res.data.map(item => {
            for (let key in item) {
              this.tableData.push({
                id: key,
                language: item[key]
              })
            }
          })
        }
        console.log(this.tableData)
      }).catch(err => {
        console.log(err)
      });
    },
    mounted() {
    },
    methods: {
      handleEdit() {
        if (this.editFileInfo) {
          this.uploadLoading = true;
          let fd = new FormData();
          fd.append('file', this.editFileInfo);
          fd.append('language', this.editInfo.language);
          let config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };

          axios.post('/prm-web/a/lemma/importLemmaFile', fd, config).then( response => {
            let res = response.data;
            console.log(res)

            if (res.isSuccess) {
              this.$bus.emit('change-language', 'edit', {
                i18n: this.editInfo.id,
                txt: this.editInfo.language
              });
              this.tableData = this.tableData.map(item => {
                if (item.id === this.editInfo.id) item.language = this.editInfo.language;
                return item;
              });
              this.$message({
                message: this.$t('common.operationSucceeds'),
                type: 'success'
              });
            } else {
              this.$message.error(this.$t('common.operationFailure'));
            }
            this.uploadLoading = false;
            this.dialogUploadVisible = false;
            this.dialogKey = '';
            this.isSettingsChangeNoSave = false;
          }).catch( err => {
            console.log(err)
            this.uploadLoading = false;
          })
        } else {
          this.uploadLoading = true;

          updateLemmaFileName({
            id: this.editInfo.id,
            language: this.editInfo.language
          }).then(res => {
            console.log(res)

            this.$bus.emit('change-language', 'edit', {
              i18n: this.editInfo.id,
              txt: this.editInfo.language
            });
            this.tableData = this.tableData.map(item => {
              if (item.id === this.editInfo.id) item.language = this.editInfo.language;
              return item;
            });
            this.$message({
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
            this.uploadLoading = false;
            this.dialogUploadVisible = false;
            this.dialogKey = '';
            this.isSettingsChangeNoSave = false;
          }).catch(err => {
            console.log(err)
            this.$message.error(this.$t('common.operationFailure'));
            this.uploadLoading = false;
          })
        }
      },
      handleDelete() {
        delLemmaFile({
          id: this.deleteInfo.id,
        }).then(res => {
          console.log(res)

          this.$bus.emit('change-language', 'delete', {
            i18n: this.deleteInfo.id,
            txt: this.deleteInfo.language
          });
          const index = this.tableData.findIndex(i => i.id === this.deleteInfo.id);
          this.tableData.splice(index, 1);
          this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err)
          this.$message.error(this.$t('common.operationFailure'));
        })
      },
      upload() {
        if (this.uploadList.length===0) return false;

        this.uploadLoading = true;
        let fd = new FormData();
        fd.append('file', this.uploadFileInfo);
        fd.append('language', this.form.language);
        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        axios.post('/prm-web/a/lemma/importLemmaFile', fd, config).then( response => {
          let res = response.data;
          console.log(res)

          if (res.isSuccess) {
            this.tableData.push({
              id: res.id,
              language: this.form.language
            })
            this.$bus.emit('change-language', 'add', {
              i18n: res.id,
              txt: this.form.language
            });
            this.$message({
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
          } else {
            this.$message.error(this.$t('common.operationFailure'));
          }
          this.uploadLoading = false;
          this.dialogUploadVisible = false;
          this.uploadLoading = false;
          this.isSettingsChangeNoSave = false;
        }).catch( err => {
          console.log(err)
          this.uploadLoading = false;
        })
      },
      checkName() {
        this.isSettingsChangeNoSave = true;

        checkLemmaFileName({
          language: this.dialogKey==='edit' ? this.editInfo.language : this.form.language,
          id: this.dialogKey==='edit' ? this.editInfo.id : '',
        }).then(res => {
          console.log(res);

          if (this.dialogKey==='edit' && (this.editInfo.language==='中文'||this.editInfo.language==='English')) {
            this.formLanguageErr = this.$t('wordSettings.repeatLanguagesTips');
          } else if (this.dialogKey==='import' && (this.form.language==='中文'||this.form.language==='English')) {
            this.formLanguageErr = this.$t('wordSettings.repeatLanguagesTips');
          } else {
            this.formLanguageErr = '';
          }
        }).catch(err => {
          console.log(err);

          this.formLanguageErr = this.$t('wordSettings.repeatLanguagesTips');
        })
      },
      beforeUpload(file) {
        console.log(file)
        let testmsg = file.name.substring(file.name.lastIndexOf('.')+1);
        const extension = testmsg === 'xls';
        const extension2 = testmsg === 'xlsx';

        console.log(testmsg, extension, extension2, this.uploadList)

        if(!extension && !extension2) {
          this.$message({
            message: this.$t('wordSettings.fileOnlyXLS'),
            type: 'warning'
          });
          this.uploadList = [];
          return false;
        } else {
          this[(this.dialogKey==='edit'?'edit':'upload') + 'FileInfo'] = file;
        }

        console.log(this[(this.dialogKey==='edit'?'edit':'upload') + 'FileInfo']);
      },
      changeUpload(file, fileList) {
        console.log(file, fileList);
        let testmsg = file.name.substring(file.name.lastIndexOf('.')+1);
        const extension = testmsg === 'xls';
        const extension2 = testmsg === 'xlsx';

        if(!extension && !extension2) {
        } else {
          this.uploadList = fileList.slice(-1);
          console.log(this.uploadList)
        }

        this.isSettingsChangeNoSave = true;
      },
      removeUpload(file, fileList) {
        console.log('删除文件', file, fileList);
        this[(this.dialogKey==='edit'?'edit':'upload') + 'FileInfo'] = null;
      },
      toggleDialog(title, data) {
        switch (title) {
          case 'import':
            this.dialogTitle = this.$t('wordSettings.uploadEntryfile');
            this.dialogKey = 'import';
            this.formLanguageErr = '';
            this.form.language = '';
            this.uploadFileInfo = null; //uploadList uploadLoading
            this.uploadList = [];
            this.uploadLoading = false;
            this.dialogWidth = '50%';
            break;
          case 'edit':
            this.dialogTitle = this.$t('wordSettings.modifyEntry');
            this.dialogKey = 'edit';
            this.editInfo = JSON.parse(JSON.stringify(data));
            this.editFileInfo = null;
            this.uploadList = [];
            this.dialogWidth = '50%';
            break;
          case 'delete':
            this.dialogTitle = this.$t('common.notice');
            this.dialogKey = 'delete';
            this.deleteInfo = JSON.parse(JSON.stringify(data));
            this.dialogWidth = '30%';
            break;
          default:
            this.dialogTitle = '--';
            this.dialogWidth = '50%';
            break;
        }

        this.isSettingsChangeNoSave = false;
        this.dialogUploadVisible = true;
        console.log('弹窗信息', title, data);
      },
      beforeCloseDialog(done) {
        if (this.isSettingsChangeNoSave) {
          this.$confirm(this.$t('deviceManager.sureNoSaveLeaveTips'), this.$t('common.notice'), {
            confirmButtonText: this.$t('common.confirmBtn'),
            cancelButtonText: this.$t('common.cancelBtn'),
            type: 'warning'
          }).then(() => {
            done();
          }).catch(() => {
          });
        } else {
          done();
        }
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

    }
  }
}
</style>
