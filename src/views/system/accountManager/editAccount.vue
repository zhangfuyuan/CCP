<template>
  <div class="accountManager-editAccount-wrapper">
    <el-form :model="accountForm"
             :rules="rules"
             ref="accountForm"
             label-width="100px"
             inline-message
             label-position="left">
      <el-form-item :label="$t('common.username') + ' *'" prop="username">
        <el-input v-model="accountForm.username" :maxlength="12" style="width: 400px;" autofocus></el-input>
        <el-alert
          :title="showErrMsg.username"
          type="error"
          show-icon
          :closable="false"
          v-show="!!showErrMsg.username"
          style="position: absolute;top: 0;left: 400px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
        </el-alert>
      </el-form-item>

      <el-form-item :label="$t('common.name') + ' *'" prop="name">
        <el-input v-model="accountForm.name" :maxlength="24" style="width: 400px;"></el-input>
        <el-alert
          :title="showErrMsg.name"
          type="error"
          show-icon
          :closable="false"
          v-show="!!showErrMsg.name"
          style="position: absolute;top: 0;left: 400px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
        </el-alert>
      </el-form-item>

      <el-form-item :label="$t('common.password') + ' *'" prop="password">
        <el-input v-model="accountForm.password" :maxlength="12" style="width: 400px;"></el-input>
        <el-alert
          :title="showErrMsg.password"
          type="error"
          show-icon
          :closable="false"
          v-show="!!showErrMsg.password"
          style="position: absolute;top: 0;left: 400px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
        </el-alert>
      </el-form-item>

      <el-form-item :label="$t('accountManager.mark')" prop="mark">
        <el-input type="textarea" v-model="accountForm.mark" :maxlength="48" style="width: 400px;" :autosize="{ minRows: 5 }"></el-input>
        <el-alert
          :title="showErrMsg.mark"
          type="error"
          show-icon
          :closable="false"
          v-show="!!showErrMsg.mark"
          style="position: absolute;bottom: 0;left: 400px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
        </el-alert>
      </el-form-item>

      <el-form-item :label="$t('accountManager.accountRole') + ' *'" prop="role">
        <el-radio-group v-model="accountForm.role">
          <el-radio label="root"></el-radio>
          <el-radio label="user"></el-radio>
        </el-radio-group>
        <el-popover
          placement="bottom-start"
          title=""
          width="200"
          trigger="hover"
          :content="$t('accountManager.generalAdministratorPermissionStatement')">
          <i class="el-icon-info" slot="reference" style="color: #909399;cursor: pointer;margin-left: 10px;"></i>
        </el-popover>
      </el-form-item>

      <el-form-item :label="$t('accountManager.allocationOrganization') + ' *'" prop="officeId">
        <el-input
          :placeholder="$t('common.searchOrganizationName')"
          v-model="filterText"
          style="width: 400px;"
          suffix-icon="el-icon-search"
          clearable
          :closable="false">
        </el-input>

        <el-tree
          class="filter-tree"
          :data="treeData"
          :props="defaultProps"
          :default-expanded-keys="[1]"
          :default-checked-keys="[1]"
          :filter-node-method="filterNode"
          ref="officeTree"
          show-checkbox
          highlight-current
          node-key="id"
          check-on-click-node
          :expand-on-click-node="false"
          @node-click="clickOfficeHandle"
          @check="checkOfficeHandle"
          check-strictly
          style="width: 400px;min-height: 400px;">
        </el-tree>
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
                   @click="submitForm('accountForm')"
                   :disabled="!accountForm.username || !accountForm.name || !accountForm.password ||
                              !accountForm.role || (accountForm.officeId!==0&&!accountForm.officeId)">{{$t('common.confirmBtn')}}
        </el-button>
        <el-button @click="showLoading">{{$t('common.cancelBtn')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { getTreeData } from '@/datas'
  import { myMixin } from '@/assets/js/mixins';

  export default {
    name: 'accountManager-editAccount',
    mixins: [ myMixin ],
    components: {  },
    props: {
      curAccountInfo: {
        type: Object,
        default: null,
      },
    },
    data() {
      const validateUsername = (rule, value, callback) => {
        value = value.replace(/[^0-9a-zA-Z\s]/g, '');
        this.accountForm.username = value;

        if (!value.trim()) {
          this.showErrMsg.username = this.$t('accountManager.accountLengthTips');
          callback(new Error(' '));
        } else if (value.trim().length>=6 && value.trim().length<=12) {
          this.showErrMsg.username = '';

          this.queryUsernameIsExist().then(() => {
            this.showErrMsg.username = '';
            callback();
          }).catch(() => {
            this.showErrMsg.username = this.$t('accountManager.usernameExistsTips');
            callback(new Error(' '));
          });
          console.log(8126, this.showErrMsg.username);
        } else {
          this.showErrMsg.username = this.$t('accountManager.accountLengthTips');
          callback(new Error(' '));
        }
      }
      const validateName = (rule, value, callback) => {
        if (!value.trim()) {
          this.showErrMsg.name = this.$t('accountManager.nameLengthTips');
          callback(new Error(' '));
        } else {
          this.showErrMsg.name = '';
          callback()
        }
      }
      const validatePassword = (rule, value, callback) => {
        if (!value.trim()) {
          this.showErrMsg.password = this.$t('accountManager.passwordLengthTips');
          callback(new Error(' '));
        } else {
          this.showErrMsg.password = '';
          callback()
        }
      }
      const validateMark = (rule, value, callback) => {
        if (value.trim().length > 48) {
          this.showErrMsg.mark = this.$t('accountManager.markLengthTips');
          callback(new Error(' '));
        } else {
          this.showErrMsg.mark = '';
          callback()
        }
      }

      return {
        accountForm: {
          username: '',
          name: '',
          password: '888888',
          mark: '',
          role: 'root',
          officeId: 1
        },
        rules: {
          username: [
            { trigger: 'blur', validator: validateUsername },
          ],
          name: [
            { trigger: 'change', validator: validateName },
            { trigger: 'blur', validator: validateName },
          ],
          password: [
            { trigger: 'change', validator: validatePassword },
            { trigger: 'blur', validator: validatePassword },
          ],
          mark: [
            { trigger: 'change', validator: validateMark },
            { trigger: 'blur', validator: validateMark },
          ],
        },
        filterText: '',
        treeData: getTreeData(),
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        showErrMsg: {
          username: '',
          name: '',
          password: '',
          mark: '',
        },
        isTriggerBeforeRouteLeave: true,
        subRoute_curAccountInfo: null,
      }
    },
    computed: {
    },
    watch: {
      filterText(val) {
        this.$refs.officeTree.filter(val);
      }
    },
    created() {
      if (this.curAccountInfo) { // 不为null，则是从上一级路由进入此页面
        this.subRoute_curAccountInfo = JSON.parse(JSON.stringify(this.curAccountInfo)); // 拷贝备份，互不影响
      } else {  // 若为null，则是刷新此路由页面，因为没数据，所以需回到上一级路由页面
        this.isTriggerBeforeRouteLeave = false;
        this.$router.push({ path: '/system/accountManager' });
      }
    },
    mounted() {
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      clickOfficeHandle(data, node, component) {

      },
      checkOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['officeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反

        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.$refs['officeTree'].setCheckedKeys([data.id]);
          this.$refs['officeTree'].setCurrentKey(data.id);
          this.accountForm.officeId = data.id
        } else { // 已选 -> 去选
          this.$refs['officeTree'].setCheckedKeys([]);
          this.accountForm.officeId = -1
        }

        console.log('选中的机构id', this.accountForm.officeId)
      },
      cancelHandle() {
        this.$confirm(this.$t('accountManager.leavePagePrompt'), this.$t('common.notice'), {
          confirmButtonText: this.$t('common.cancelBtn'),
          cancelButtonText: this.$t('common.confirmBtn'),
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false
        }).then(() => {
        }).catch(() => { // 确认离开
          this.isTriggerBeforeRouteLeave = false;
          this.$router.push({ path: '/system/accountManager' })
        });
      },
      queryUsernameIsExist() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log(this.accountForm.username);
            if (Math.random() > 0.49) {
              resolve();
            } else {
              reject();
            }
          }, 1000)
        })
      },
    },
    // 组件内的路由守卫钩子
    beforeRouteLeave (to, from, next) {
      if (this.isTriggerBeforeRouteLeave) {
        this.$confirm(this.$t('accountManager.leavePagePrompt'), this.$t('common.notice'), {
          confirmButtonText: this.$t('common.cancelBtn'),
          cancelButtonText: this.$t('common.confirmBtn'),
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false
        }).then(() => {
        }).catch(() => { // 确认离开
          next();
        });
      } else { // 确认离开
        next();
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import "src/styles/mixin.scss";

  /* reset element-ui css */
</style>

<style rel="stylesheet/scss" lang="scss" scoped>

</style>
