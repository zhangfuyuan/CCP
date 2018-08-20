<template>
  <div class="accountSettings-wrapper">
    <template v-if="!$route_isEdit">
      <el-form label-width="80px" label-position="left">
        <el-form-item :label="$t('accountSettings.name')">
          <span v-if="!isModifyName">{{name}}</span>

          <template v-else>
            <div class="el-input" style="width: 300px;">
              <input type="text"
                     @input="() => { if(accountForm.name.length===0 || accountForm.name.length>24) { showNameErrMsg=$t('accountManager.nameLengthTips'); }
                                     else { showNameErrMsg=''; }}"
                     v-model="accountForm.name"
                     class="el-input__inner"/>
            </div>
            <el-alert
              :title="showNameErrMsg"
              type="error"
              show-icon
              :closable="false"
              v-show="!!showNameErrMsg"
              style="position: absolute;top: 0;left: 400px;padding: 0 16px;margin-left: 16px;width: auto;white-space: nowrap;border: 1px solid #FEDDCC;">
            </el-alert>
          </template>
        </el-form-item>

        <el-form-item :label="$t('accountSettings.username')">
          <span>{{loginName}}</span>
        </el-form-item>

        <el-form-item :label="$t('accountSettings.role')">
          <!--<span v-for="(item,index) in roles" :key="index">
            {{item}} &nbsp;&nbsp;
          </span>-->
          {{roles.indexOf('root')>-1 ? $t('common.root') : $t('common.user')}}
        </el-form-item>

        <el-form-item>
          <template v-if="!isModifyName">
            <el-button type="primary" @click="isModifyName=true">
              {{$t('accountSettings.modifyName')}}
            </el-button>
            <el-button type="primary" @click="$router.push({ path: '/accountSettings/index/modifyPswd' })">
              {{$t('accountSettings.modifyPassword')}}
            </el-button>
            <el-button @click="logout">{{$t('accountSettings.logOut')}}</el-button>
          </template>

          <template v-else>
            <el-button type="primary"
                       @click="submitForm('nameForm')"
                       :disabled="!!showNameErrMsg">{{$t('accountSettings.confirm')}}
            </el-button>
            <el-button @click="isModifyName = false">{{$t('accountSettings.cancel')}}</el-button>
          </template>
        </el-form-item>
      </el-form>
    </template>

    <router-view></router-view>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { saveAccountInfo } from '@/api/account'

  export default {
    name: 'accountSettings',
    components: {  },
    data() {
      return {
        $route_isEdit: false,
        isModifyName: false,
        accountForm: {
          id: '',
          loginName: '',
          name: '',
          roleIds: '',
          officeId: ''
        },
        showNameErrMsg: ''
      }
    },
    computed: {
      ...mapGetters([
        'id',
        'loginName',
        'name',
        'officeId',
        'identity',
        'roles',
      ])
    },
    watch: {
      $route($r) {
        this.$route_isEdit = $r.name==='accountSettings-modifyPswd'
      }
    },
    created() {
      this.$route_isEdit = this.$route.name==='accountSettings-modifyPswd'

      this.accountForm.id = this.id;
      this.accountForm.loginName = this.loginName;
      this.accountForm.name = this.name;
      this.accountForm.roleIds = this.identity[0].id==='1' ? '1' : '2';
      this.accountForm.officeId = this.officeId;

      console.log(this.id+this.loginName+this.name+this.identity[0].id+this.officeId);
    },
    mounted() {
    },
    methods: {
      logout() {
//      this.$store.dispatch('LogOut').then(() => {
        this.$store.dispatch('FedLogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      },
      submitForm(type) {
        if (type === 'nameForm') {
          saveAccountInfo(this.accountForm).then(res => {
            console.log(res)

            this.$store.commit('SET_NAME', this.accountForm.name);
            this.isModifyName = false;
            this.$message({
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
          }).catch(err => {
            console.log(err)

            this.$message.error(this.$t('common.operationFailure'));
          });
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
