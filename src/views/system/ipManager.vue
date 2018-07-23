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
          <el-button type="primary" @click="submitForm('ruleForm')">{{$t('ipManager.confirm')}}</el-button>
          <el-button @click="resetForm('ruleForm')">{{$t('ipManager.cancel')}}</el-button>
        </template>
        <el-button v-else type="text" @click="isEdit=true">{{$t('ipManager.modify')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { validateIP } from '@/utils/validate'

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
        isEdit: false
      };
    },
    computed: {
    },
    watch: {
    },
    created() {
      this.ruleForm.serverIP = '192.168.0.1'
      this.ruleForm.terminalIP = '192.168.0.1'
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
        this.isEdit = false
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
