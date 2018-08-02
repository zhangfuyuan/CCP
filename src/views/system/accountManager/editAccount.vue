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
        <span>{{accountForm.username}}</span>
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

      <el-form-item :label="$t('accountManager.accountRole') + ' *'" prop="role">
        <el-radio-group v-model="accountForm.role">
          <el-radio label="root">{{$t('common.rootRole')}}</el-radio>
          <el-radio label="user">{{$t('common.userRole')}}</el-radio>
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
                   :disabled="!accountForm.name || !accountForm.password || accountForm.password.length<6 ||
                              !accountForm.role || (accountForm.officeId!==0&&!accountForm.officeId) ||
                              accountForm.officeId===-1">{{$t('common.confirmBtn')}}
        </el-button>
        <el-button @click="cancelHandle">{{$t('common.cancelBtn')}}</el-button>
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
          password: '888888',
          mark: '',
          role: 'root',
          officeId: 1
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
        isEditPassword: false
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
        this.accountForm.username = this.subRoute_curAccountInfo.username;
        this.accountForm.name = this.subRoute_curAccountInfo.name;
        this.accountForm.mark = this.subRoute_curAccountInfo.mark || '占位符';
        this.accountForm.role = this.subRoute_curAccountInfo.role==='超级管理员' ? 'root' : 'user';
        this.accountForm.officeId = this.subRoute_curAccountInfo.officeId || 1;

        console.log('当前账号信息', this.subRoute_curAccountInfo)
      } else {  // 若为null，则是刷新此路由页面，因为没数据，所以需回到上一级路由页面
        this.isTriggerBeforeRouteLeave = false;
        this.$router.push({ path: '/system/accountManager' });
      }
    },
    mounted() {
      this.$refs['officeTree'].setCheckedKeys([this.accountForm.officeId]);
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const loading = this.showLoading();

            setTimeout(()=>{
              // todo 对象合并时需要区分 isEditPassword 若没修改千万别传给后台替换掉原来的密码！！！
              this.$bus.emit('edit-account', Object.assign(this.subRoute_curAccountInfo, this.accountForm)); //Object.assign()第一个参数对象重复属性会被覆盖
              loading.close();
              this.isTriggerBeforeRouteLeave = false;
              this.$router.push({ path: '/system/accountManager' });
            }, 2000)
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
