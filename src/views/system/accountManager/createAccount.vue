<template>
  <div class="accountManager-createAccount-wrapper">
    <el-form :model="accountForm"
             :rules="rules"
             ref="accountForm"
             label-width="110px"
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
        <el-radio-group v-model="accountForm.roleId">
          <el-radio label="1">{{$t('common.rootRole')}}</el-radio>
          <el-radio label="2">{{$t('common.userRole')}}</el-radio>
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
          style="width: 400px;margin-bottom: 5px;"
          suffix-icon="el-icon-search"
          clearable
          :closable="false">
        </el-input>

        <el-tree
          class="filter-tree"
          :data="treeData"
          :props="defaultProps"
          :default-expanded-keys="[officeId]"
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
                   :disabled="!accountForm.username || accountForm.username.length<6 || showErrMsg.username.length>0 ||
                              !accountForm.name || !accountForm.password || accountForm.password.length<6 ||
                              !accountForm.roleId || !accountForm.officeId">{{$t('common.confirmBtn')}}
        </el-button>
        <el-button @click="cancelHandle">{{$t('common.cancelBtn')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { getAccountList,saveAccountInfo,deleteAccount,checkAccountName,modifyAccountPwd } from '@/api/account'
  import { getOfficeList } from '@/api/office'
  import { mapGetters } from 'vuex'
  import { treeify } from '@/utils'

  export default {
    name: 'accountManager-createAccount',
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
        } else if (value.trim().length < 6) {
          this.showErrMsg.password = this.$t('accountManager.passwordLengthTips');
          callback(new Error(' '));
        } else {
          this.showErrMsg.password = '';
          callback()
        }
      }
      const validateMark = (rule, value, callback) => {
        if (value && value.trim().length>48) {
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
          password: '',
          mark: '',
          roleId: '1',
          officeId: ''
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
        treeData: null,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        showErrMsg: {
          username: '',
          name: '',
          password: '',
          mark: '',
        },
        isTriggerBeforeRouteLeave: true,
      }
    },
    computed: {
      ...mapGetters([
        'language',
        'officeId'
      ]),
    },
    created(){
      getOfficeList().then(res => {
        console.log(res);
        if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId
        let arr = [res.currentOffice].concat(res.officeMsg);
        let tree = treeify(arr, 'id', 'parentId', 'children');
        this.treeData = JSON.parse(JSON.stringify([tree]))
        this.accountForm.officeId = this.officeId;
      }).catch(err => {
        console.log(err)
      })
    },
    watch: {
      filterText(val) {
          console.log(val)
        this.$refs.officeTree.filter(val);
      }
    },
    mounted() {
      this.$refs['officeTree'].setCheckedKeys([this.officeId]);
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            saveAccountInfo({
              name: this.accountForm.name,
              loginName: this.accountForm.username,
              password: this.accountForm.password,
              remarks: this.accountForm.mark,
              roleIds: this.accountForm.roleId,
              officeId: this.accountForm.officeId
            }).then(res => {
            this.successed()
                console.log(res)
            }).catch(err =>{
                this.errored()
                console.log(err)
            })
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
        return data.name.indexOf(value) !== -1;
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
          this.accountForm.officeId = ''
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
          this.isTriggerBeforeRouteLeave = false
          this.$router.push({ path: '/system/accountManager' })
        });
      },
      //检查用户名是否存在
      queryUsernameIsExist() {
        return new Promise((resolve, reject) => {
          console.log(this.accountForm.username)
          checkAccountName(this.accountForm.username).then(res => {
              console.log(res)
            resolve();
          }).catch(err => {
            reject();
            console.log(err)
          })

        })
      },

      successed() {
        this.$message({
            message: this.$t('accountManager.createdSuccess'),
            type: 'success'
          },
          this.isTriggerBeforeRouteLeave = false,
          this.$router.push({ path: '/system/accountManager' })
        );
      },
      errored() {
        this.$message.error(this.$t('accountManager.createdError'));
      }
    },
    // 组件内的守卫
    beforeRouteLeave (to, from, next) {
      if (this.isTriggerBeforeRouteLeave) {
        this.$confirm(this.$t('accountManager.leavePagePrompt'), this.$t('common.notice'), {
          confirmButtonText: this.$t('common.cancelBtn'),
          cancelButtonText: this.$t('common.confirmBtn'),
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
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
