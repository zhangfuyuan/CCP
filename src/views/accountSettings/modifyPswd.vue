<template>
  <div class="accountSettings-modifyPswd-wrapper">
    <el-form :model="pswdForm" status-icon :rules="rules" ref="pswdForm" label-width="80px" inline-message label-position="left">
      <el-form-item :label="$t('accountSettings.oldPassword')" prop="old">
        <el-input type="password" v-model="pswdForm.old" auto-complete="off" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item :label="$t('accountSettings.newPassword')" prop="pass">
        <el-input type="password" v-model="pswdForm.pass" auto-complete="off" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item :label="$t('accountSettings.confirmPassword')" prop="checkPass">
        <el-input type="password" v-model="pswdForm.checkPass" auto-complete="off" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('pswdForm')">{{$t('accountSettings.confirm')}}</el-button>
        <el-button @click="$router.push({ path: '/accountSettings' })">{{$t('accountSettings.cancel')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { modifyAccountPwd } from '@/api/account'

  export default {
    name: 'accountSettings-modifyPswd',
    data() {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('accountSettings.notNull')));
        } else {
          if (this.pswdForm.checkPass !== '') {
            this.$refs.pswdForm.validateField('checkPass');
          }
          callback();
        }
      };
      const validateCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('accountSettings.notNull')));
        } else if (value !== this.pswdForm.pass) {
          callback(new Error(this.$t('accountSettings.notMatch')));
        } else {
          callback();
        }
      };
      return {
        pswdForm: {
            old:'',
          pass: '',
          checkPass: ''
        },
        rules: {
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validateCheckPass, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
           /* alert('submit!');*/
           console.log(this.pswdForm.old,this.pswdForm.checkPass)
            modifyAccountPwd(this.pswdForm.old,this.pswdForm.checkPass).then(res =>{
                this.$store.dispatch('FedLogOut').then(() => {
                  location.reload() // Ϊ������ʵ����vue-router���� ����bug
                })
            }).catch(err => {
              this.$message.error(this.$t('common.operationFailure'));
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
    }
  }
</script>

