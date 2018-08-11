<template>
  <div class="ipManager-wrapper">
    <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="150px" class="ruleForm" inline-message label-position="left">
      <el-form-item :label="$t('ipManager.serverIP')" prop="serverIP">
        <el-input v-if="isEdit" v-model="ruleForm.serverIP" auto-complete="on" style="width: 300px;"></el-input>
        <span v-else>{{ruleForm.serverIP}}</span>
      </el-form-item>
      <el-form-item :label="$t('ipManager.terminalIP')" prop="terminalIP">
        <el-input v-if="isEdit" v-model="ruleForm.terminalIP" auto-complete="on" style="width: 300px;"></el-input>
        <span v-else>{{ruleForm.terminalIP}}</span>
      </el-form-item>
      <el-form-item>
        <template v-if="isEdit">
          <el-button @click="defaultForm()" style="display: block;margin-bottom: 15px;margin-left: 10px;width: 155px;">{{$t('ipManager.default')}}</el-button>
          <el-button type="primary"
                      @click="submitForm('ruleForm')"
                      :disabled="ruleForm.serverIP.length===0 || ruleForm.terminalIP.length===0">{{$t('ipManager.confirm')}}
          </el-button>
          <el-button @click="resetForm('ruleForm')">{{$t('ipManager.cancel')}}</el-button>
        </template>
        <el-button v-else type="text" @click="isEdit=true">{{$t('ipManager.modify')}}</el-button>
      </el-form-item>
    </el-form>
  </div>

</template>

<script>
  import { validateIP } from '@/utils/validate'
  import { getIpSetting,saveIpSetting } from '@/api/ip'

  export default {
    name: 'ipManager',
    components: {  },
    data() {
      const validateServerIP = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('ipManager.notNull')));
        } else {
          if (!validateIP(value)) {
            callback(new Error(this.$t('ipManager.formatInvalid')));
          } else {
            callback();
          }
        }
      };
      const validateTerminalIP = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('ipManager.notNull')));
        } else {
          if (!validateIP(value)) {
            callback(new Error(this.$t('ipManager.formatInvalid')));
          } else {
            callback();
          }
        }
      };
      return {
        ruleForm: {
          serverIP: '',
          terminalIP: ''
        },
        rules: {
          serverIP: [{ trigger: 'blur', validator: validateServerIP }],
          terminalIP: [{ trigger: 'blur', validator: validateTerminalIP }],
        },
        isEdit: false,
        defServerIP: '',
        defTerminalIP: ''
      };
    },
    computed: {
    },
    watch: {
    },
    created() {
      getIpSetting().then(res => {
        this.ruleForm.serverIP = res.serverIp
        this.ruleForm.terminalIP = res.teIp
        this.defServerIP = res.serverIp
        this.terminalIP = res.teIp
      }).catch(err => {
        this.ruleForm.serverIP = ''
        this.ruleForm.terminalIP = ''
        console.log(err)
      })


    },
    mounted() {
    },
    methods: {

      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            saveIpSetting({
              serverIp: this.ruleForm.serverIP,
              teIp:  this.ruleForm.terminalIP,
              isDefault: false
            }).then(res => {
              this.successed()
              this.defServerIP = this.ruleForm.serverIP
              this.defTerminalIP = this.ruleForm.terminalIP
              console.log(res)

            }).catch(err => {
              this.errored()
              console.log(err)
            })
          } else {
            console.log('error submit!!')
            return false;
          }
        });
      },
      resetForm(formName) {
        this.isEdit = false
      },
      defaultForm() {
        this.ruleForm.serverIP = this.defServerIP
        this.ruleForm.terminalIP = this.defTerminalIP
      },
      successed() {
        this.$message({
          message: this.$t('ipManager.successed'),
          type: 'success'
        },
        this.isEdit = false
        );
      },
      errored() {
        this.$message.error(this.$t('ipManager.errored'));
      }

    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.ipManager-wrapper {
  .ruleForm {

  }
}
</style>
