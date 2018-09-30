<template>
  <div class="cloudConfig-wrapper">
    <div style="margin-bottom: 20px;padding-bottom: 10px;border-bottom: 1px solid #E4E7ED;font-size: 14px;">
      <div><i class="el-icon-info" style="color: #409EFF;"></i> {{$t('cloudConfig.cloudFeatureConfigurationTips1')}}</div>
      <div style="padding: 20px 0 0 18px;">{{$t('cloudConfig.cloudFeatureConfigurationTips2')}}</div>
      <div style="padding: 20px 0 0 18px;color: #999;">{{$t('cloudConfig.cloudFeatureConfigurationTips3')}}</div>
    </div>

    <div>
      <div style="color: #666;font-size: 15px;margin-bottom: 30px;">{{$t('cloudConfig.lastUpdateTime')}} : <span style="color: #333;padding-left: 4px;">{{lastUpdateTime | formatDateToDate}}</span></div>
      <div style="color: #696969;"><span style="margin-right: 10px;">{{$t('cloudConfig.updateConfigurationData')}}</span>
        <el-button plain @click="refresh">{{$t('cloudConfig.refresh')}}</el-button>
        <span style="padding: 0 10px;color: #999;">or</span>
        <el-button plain @click="toggleDialog('importJson')">{{$t('cloudConfig.importJson')}}</el-button>
        <span style="margin-left: 10px;font-size: 13px;color: #999;">{{$t('cloudConfig.selfBuiltServer')}}</span>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false">
      <template v-if="dialogKey === 'getError'">
        <span>{{$t('cloudConfig.failGetTips')}}</span>

        <span slot="footer" class="dialog-footer">
          <el-button plain @click="dialogVisible = false">{{$t('cloudConfig.close')}}</el-button>
          <el-button plain @click="dialogVisible = false, refresh()">{{$t('cloudConfig.refresh')}}</el-button>
          <el-button plain @click="dialogVisible = false, toggleDialog('importJson')">{{$t('cloudConfig.importJson')}}</el-button>
        </span>
      </template>

      <template v-if="dialogKey === 'importJson'">
        <div style="margin-bottom: 20px;">{{$t('cloudConfig.importJsonTips')}}</div>

        <el-input
          type="textarea"
          :rows="10"
          :placeholder="$t('cloudConfig.inputJson')"
          v-model="jsonStr"
          @blur="validateJSON">
        </el-input>

        <span slot="footer" class="dialog-footer" style="display: flex;justify-content: flex-end">
          <el-alert v-show="!!verifyFailedTips"
                    :title="verifyFailedTips"
                    type="error"
                    show-icon
                    :closable="false"
                    style="margin-right: 20px;">
          </el-alert>

          <el-button type="primary"
                     :disabled="!jsonStr.trim()"
                     :loading="submitJsonLoading"
                     @click="submitJson">{{$t('common.confirmBtn')}}</el-button>
          <el-button plain @click="dialogVisible = false">{{$t('common.cancelBtn')}}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { myMixin } from '../../assets/js/mixins';
  import { formatDate } from '@/utils'
  import { gotoCloudPlatformPage, updateApiKeyPass, importJson } from '@/api/channel'

  export default {
    name: 'cloudConfig',
    components: {  },
    mixins: [myMixin],
    data() {

      return {
        dialogVisible: false,
        dialogKey: '',
        dialogTitle: '',
        jsonStr: '',
        verifyFailedTips: '',
        isJsonFormatError: false,
        lastUpdateTime: Date.now(),
        isCancelRequest: false,
        submitJsonLoading: false,
      };
    },
    filters: {
      formatDateToDate(time){
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd');
      },
    },
    computed: {
    },
    watch: {
    },
    created() {
      gotoCloudPlatformPage().then(res => {
        console.log('进入云平台功能设置页面更新时间', res);

        this.lastUpdateTime = res.updateDate;
      }).catch(err => {
        console.log(err);
      })
    },
    mounted() {
    },
    methods: {
      refresh() {
        const loading = this.showLoading('', this.$t('cloudConfig.gettingConfigurationData'));

        $('#loadingCancelBtn').remove();
        $('.el-loading-spinner').append(`
          <button id="loadingCancelBtn" type="button" class="el-button el-button--primary" style="margin-top: 10px;" ><span>${this.$t('common.cancelBtn')}</span></button>
        `);
        $('#loadingCancelBtn').click(() => {
          loading.close();
          this.isCancelRequest = true;
        });

        updateApiKeyPass().then(res => {
          console.log('更新配置数据成功', res);

          if (this.isCancelRequest) return this.isCancelRequest = false;

          loading.close();
          this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          if (this.isCancelRequest) return this.isCancelRequest = false;

          loading.close();
          this.toggleDialog('getError');
        });
      },
      toggleDialog(key) {
        switch (key) {
          case 'getError':
            this.dialogTitle = this.$t('cloudConfig.failGet');
            break;
          case 'importJson':
            this.isJsonFormatError = false;
            this.jsonStr = '';
            this.verifyFailedTips = '';
            this.dialogTitle = this.$t('cloudConfig.importJson');
            break;
          default:
            break;
        }

        this.dialogKey = key;
        this.dialogVisible = true;
      },
      validateJSON() {
        if (!this.jsonStr.trim()) return false;

        try {
          this.jsonStr = JSON.stringify(JSON.parse(this.jsonStr), null, 4);
          this.verifyFailedTips = '';
          this.isJsonFormatError = false;
        } catch (e) {
          this.verifyFailedTips = this.$t('cloudConfig.verifyJSONTips1');
          this.isJsonFormatError = true;
        }
      },
      submitJson() {
        if (!this.jsonStr.trim() || this.isJsonFormatError) return false;

        this.submitJsonLoading = true;

        importJson({
          json: JSON.stringify(JSON.parse(this.jsonStr))
        }).then(res => {
          console.log('导入json成功', res);


          this.submitJsonLoading = false;
          this.dialogVisible = false;
          this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          this.submitJsonLoading = false;
          this.verifyFailedTips = this.$t('cloudConfig.verifyJSONTips2');
          this.$message.error(this.$t('common.operationFailure'));
        });
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.cloudConfig-wrapper {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px 10px;
}
</style>
