<template>
  <div class="login-container">
    <el-form class="login-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
      <div style="position: relative;top: 0;transition: top .5s ease-out;" :class="{ 'show-verify-tips': isVerifyFailed }">
        <div class="logo">
          <img src="@/assets/img/logo.png" alt="logo" width="100%" height="100%" />
        </div>
        <h3 class="title">{{$t('login.title')}}</h3>
        <div v-show="isVerifyFailed">
          <el-alert
            :title="verifyFailedTips"
            type="error"
            show-icon
            :closable="false" style="width: 100%;height: 47px;position: absolute;bottom: -68px;" >
          </el-alert>
        </div>
      </div>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input name="username"
                  type="text"
                  v-model="loginForm.username"
                  autoComplete="on"
                  autofocus
                  :placeholder="$t('login.usernamePlaceholder')"
                  :class="{ 'error': isUsernameNull }"
                  @focus="clearUsername"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"></svg-icon>
        </span>
        <el-input name="password"
                  :type="pwdType"
                  @keyup.enter.native="handleLogin"
                  v-model="loginForm.password"
                  autoComplete="on"
                  :placeholder="$t('login.passwordPlaceholder')"
                  :class="{ 'error': isPasswordNull }" @focus="clearPassword"></el-input>
          <!--<span class="show-pwd" @click="showPwd"><svg-icon icon-class="eye" /></span>-->
      </el-form-item>
      <el-collapse-transition>
        <div class="code-box" v-show="verifyNum > 3">
          <el-form-item prop="code" style="width: 65%;">
                <el-input class="code-input"
                          name="code"
                          type="text"
                          v-model="loginForm.code"
                          :placeholder="$t('login.codePlaceholder')"
                          :class="{ 'error': isCodeNull }"
                          @focus="clearCode"></el-input>
          </el-form-item>
          <div class="code-img-box" style="display: flex;height: 50px;">
            <img src="" alt="验证码" style="width: 100px;height: 50px;background-color: #fff;" />
            <el-button type="text" style="height: 50px;">{{$t('login.notSeeClearly')}}</el-button>
          </div>
        </div>
      </el-collapse-transition>
      <el-form-item>
        <el-button type="primary" style="width:100%;font-size: 18px;" :loading="loading" @click.native.prevent="handleLogin">
          {{$t('login.logIn')}}
        </el-button>
      </el-form-item>
      <div class="lang-select">
        <el-button type="text" @click.native.prevent="handleSetLanguage(language==='en'?'zh':'en')">{{$t('login.language')}}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
//import { isvalidUsername } from '@/utils/validate'

export default {
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error(' '));
        this.isUsernameNull = true
        this.loginForm.username = this.$t('login.usernamePlaceholder')
      } else {
        this.isUsernameNull = false
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error(' '));
        this.isPasswordNull = true
        this.pwdType = 'text'
        this.loginForm.password = this.$t('login.passwordPlaceholder')
      } else {
        this.isPasswordNull = false
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (this.verifyNum>3 && !value.trim()) {
        callback(new Error(' '));
        this.isCodeNull = true
        this.loginForm.code = this.$t('login.codePlaceholder')
      }else {
        this.isCodeNull = false
        callback()
      }
    }
    return {
      loginForm: { // 表单元素与数据的双向绑定
        username: '',
        password: '',
        code: ''
      },
      loginRules: { // 表单检测规则
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      loading: false, // 登录按钮是否变为等待状态
      pwdType: 'password', // 密码输入框的类型
      verifyNum: 0,
      isUsernameNull: false,
      isPasswordNull: false,
      isCodeNull: false,
      isVerifyFailed: false,
      verifyFailedTips: ''
    }
  },
  computed: {
    language() { // 当前语言状态
      return this.$store.getters.language
    },
  },
  methods: {
    showPwd() { // 明文显示密码（暂无用）
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    handleLogin() { // 点击登录按钮执行方法
      if ((this.verifyNum>3 && !this.isCodeNull && !this.isPasswordNull && !this.isUsernameNull) ||
        (this.verifyNum<=3 && !this.isPasswordNull && !this.isUsernameNull)) {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.verifyNum++
            this.$store.dispatch('Login', this.loginForm).then(() => {
              this.loading = false
              this.$router.push({ path: '/' })
            }).catch(() => {
              this.loading = false
              this.isVerifyFailed = true
              this.verifyFailedTips = this.$t('login.verifyErr') || this.$t('login.verifyCodeErr')
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    },
    handleSetLanguage(lang) { // 切换语言状态执行方法
      this.$i18n.locale = lang
      this.$store.dispatch('setLanguage', lang)
      this.$message({
        message: this.$t('common.switchLanguageSuccess'),
        type: 'success'
      })
//      setTimeout(()=>{
//        this.$i18n.setLocaleMessage('aa',{
//          common: {
//            switchLanguageSuccess: '1111',
//              success: '2222'
//          },
//          login: {
//            title: '333',
//              logIn: '444',
//              username: '555',
//              usernamePlaceholder: '666',
//              password: '777',
//              passwordPlaceholder: '888',
//              language: '999',
//          }
//        })
//        this.$i18n.locale = 'aa'
//        this.$store.dispatch('setLanguage', 'aa')
//        this.$message({
//          message: this.$t('common.switchLanguageSuccess'),
//          type: 'success'
//        })
//      }, 3000)
    },
    clearUsername() {
      if(this.isUsernameNull) {
        this.loginForm.username = ''
        this.isUsernameNull = false
      }
    },
    clearPassword() {
      if(this.isPasswordNull) {
        this.loginForm.password = ''
        this.pwdType = 'password'
        this.isPasswordNull = false
      }
    },
    clearCode() {
      if(this.isCodeNull) {
        this.loginForm.code = ''
        this.isCodeNull = false
      }
    },
  },
  watch: {
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg:#2d3a4b;
$light_gray:#eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }

    &.error>input {
      color: #f56c6c;
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }

  .logo {
    width: 50px;
    height: 50px;
    margin: 0 auto 20px;
  }

  .lang-select {
    text-align: center;
    .el-button {
      color: #f0f0f0;
      &:hover {
        color: #fff;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }

  .title {
    font-size: 18px;
    font-weight: 400;
    color: $light_gray;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .code-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .show-verify-tips {
    top: -50px !important;
  }
}
</style>
