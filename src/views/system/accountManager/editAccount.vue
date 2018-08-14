<template>
  <div class="accountManager-editAccount-wrapper">
    <el-form :model="accountForm"
             :rules="rules"
             ref="accountForm"
             label-width="110px"
             inline-message
             label-position="left">
      <el-form-item :label="$t('common.username')" prop="username">
        <!--<el-input v-model="accountForm.username" :maxlength="12" style="width: 400px;" autofocus></el-input>-->
        <span>{{accountForm.loginName}}</span>
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
        <el-input :type="isEditPassword ? 'text' : 'password'"
                  v-model="accountForm.password"
                  :maxlength="12"
                  style="width: 400px;"
                  :disabled="!isEditPassword"></el-input>
        <el-button type="text"
                   style="color: #F56C6C;margin-left: 10px;"
                   @click="isEditPassword = true">{{$t('common.modifyPassword')}}</el-button>
        <el-alert
          :title="showErrMsg.password"
          type="error"
          show-icon
          :closable="false"
          v-show="!!showErrMsg.password"
          style="position: absolute;top: 0;left: 470px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
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

      <el-form-item :label="$t('accountManager.accountRole') + ' *'" prop="roleIds">
        <el-radio-group v-model="accountForm.roleIds">
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
          :default-expanded-keys="[accountForm.officeId]"
          :filter-node-method="filterNode"
          :default-checked-keys="[accountForm.officeId]"
          default-expand-all
          ref="officeTree"
          show-checkbox
          highlight-current
          node-key="id"
          check-on-click-node
          :expand-on-click-node="false"
          @node-click="clickOfficeHandle"
          @check="checkOfficeHandle"
          check-strictly
          style="width: 400px;min-height: 400px;height: 400px;overflow: auto">
        </el-tree>
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
                   @click="submitForm('accountForm')"
                   :disabled="!accountForm.name || !accountForm.password || accountForm.password.length<6 ||
                              !accountForm.roleIds || (accountForm.officeId!==0&&!accountForm.officeId) ||
                              accountForm.officeId===-1">{{$t('common.confirmBtn')}}
        </el-button>
        <el-button @click="cancelHandle">{{$t('common.cancelBtn')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
 //import { getTreeData } from '@/datas'
  import { myMixin } from '@/assets/js/mixins';
  import { getAccountList,saveAccountInfo,deleteAccount,checkAccountName,modifyAccountPwd } from '@/api/account'
  import { getOfficeList } from '@/api/office'
  import { mapGetters } from 'vuex'
  import { treeify } from '@/utils'

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
          id: '',
          loginName: '',
          name: '',
          password: '888888',
          mark: '',
          role: '',
          roleIds: '',
          officeId: ''
        },
        rules: {
          name: [
            { trigger: 'change', validator: validateName },
            { trigger: 'blur', validator: validateName },
          ],
          password: [
            { trigger: 'change', validator: validatePassword },
            { trigger: 'blur', validator: validatePassword },
          ],
          mark: [
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
        subRoute_curAccountInfo: null,
        isEditPassword: false
      }
    },
    computed: {
      ...mapGetters([
        'language',
        'officeId'
      ]),
    },
    watch: {
      filterText(val) {
        this.$refs.officeTree.filter(val);
      }
    },
    created() {
      console.log(this.curAccountInfo)
      if (this.curAccountInfo) { // 不为null，则是从上一级路由进入此页面
        this.subRoute_curAccountInfo = JSON.parse(JSON.stringify(this.curAccountInfo)); // 拷贝备份，互不影响
        console.log( this.subRoute_curAccountInfo.role)
        this.accountForm.id = this.subRoute_curAccountInfo.id;
        this.accountForm.loginName = this.subRoute_curAccountInfo.loginName;
        this.accountForm.name = this.subRoute_curAccountInfo.name;
        this.accountForm.mark = this.subRoute_curAccountInfo.remarks;
        this.accountForm.roleIds = this.curAccountInfo.roleArray[0].id==='1' ? '1' : '2';
        this.accountForm.officeId = this.subRoute_curAccountInfo.officeId || 1;

      } else {  // 若为null，则是刷新此路由页面，因为没数据，所以需回到上一级路由页面
        this.isTriggerBeforeRouteLeave = false;
        this.$router.push({ path: '/system/accountManager' });
      }
      getOfficeList().then(res => {
        console.log(res);
        if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId
        let arr = [res.currentOffice].concat(res.officeMsg);
        let tree = treeify(arr, 'id', 'parentId', 'children');
        this.treeData = JSON.parse(JSON.stringify([tree]))
      }).catch(err => {
        console.log(err)
      })
    },
    mounted() {
      this.$refs['officeTree'].setCheckedKeys([this.accountForm.officeId]);
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const loading = this.showLoading();
            if(this.isEditPassword){
              saveAccountInfo({
                id: this.accountForm.id,
                name: this.accountForm.name,
                loginName: this.accountForm.loginName,
                password: this.accountForm.password,
                remarks: this.accountForm.mark,
                roleIds: this.accountForm.roleIds,
                officeId: this.accountForm.officeId
              }).then(res => {
                loading.close();
                this.successed()
              }).catch(err =>{
                loading.close();
                this.errored()
              })
            }else {
              saveAccountInfo({
                id: this.accountForm.id,
                name: this.accountForm.name,
                loginName: this.accountForm.loginName,
                remarks: this.accountForm.mark,
                roleIds: this.accountForm.roleIds,
                officeId: this.accountForm.officeId
              }).then(res => {
                loading.close();
                this.successed()
                console.log(res)
              }).catch(err =>{
                loading.close();
                this.errored()
                console.log(err)
              })
            }



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
      successed() {
        this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          },
          this.isTriggerBeforeRouteLeave = false,
          this.$router.push({ path: '/system/accountManager' })
        );
      },
      errored() {
        this.$message.error(this.$t('common.operationFailure'));
      }
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
