<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>

    <!--<breadcrumb></breadcrumb>-->

    <div class="logo-container">
      <!--<a href="" class="logo-box"><img src="@/assets/img/logo.png" alt="logo" width="100%" height="100%" /></a>-->
      <a href=""><span class="logo-txt">{{$t('common.platformName')}}</span></a>
    </div>

    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <svg-icon icon-class="avatar" style="font-size: 24px;" />
        <!--<img class="user-avatar" :src="avatar+'?imageView2/1/w/80/h/80'">-->
        <span class="username" style="margin-left: 10px">{{name}}</span>
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <el-dropdown-item @click.native="$router.push({ path: '/accountSettings' })">
          {{$t('common.accountSettings')}}
        </el-dropdown-item>
        <el-dropdown-item divided @click.native="logout">
          {{$t('common.logOut')}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dropdown class="language-container" trigger="click" @command="handleLangCommand">
      <div class="language-wrapper">
        Language
      </div>
      <el-dropdown-menu class="language-dropdown" slot="dropdown">
        <template v-for="item in canSwitchLanguage">
          <el-dropdown-item :command="item.i18n" :class="{ 'cur-lang': localeLanguage===item.i18n }">
            {{item.txt}}
          </el-dropdown-item>
        </template>
        <el-dropdown-item command=""
                          divided
                          @click.native="$router.push({ path: '/wordSettings' })"
                          v-if="roles.indexOf('root')>-1 && officeId==='1'">
            <span style="display:block;text-align: center">+</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getLemmaList, findContentByLemmaId, importLemmaFile, updateLemmaFileName, delLemmaFile, checkLemmaFileName } from '@/api/language'

export default {
  data() {
    return {
      canSwitchLanguage: [
        {
          i18n: 'zh',
          txt: '中文'
        },
        {
          i18n: 'en',
          txt: 'English'
        }
      ]
    }
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'localeLanguage',
      'roles',
      'officeId',
    ])
  },
  created() {
    getLemmaList().then(res => {
      console.log(res)

      if (res.data) {
        res.data.map(item => {
          for (let key in item) {
            this.canSwitchLanguage.push({
              i18n: key,
              txt: item[key]
            })
          }
        })
      }
      console.log(this.canSwitchLanguage)
    }).catch(err => {
      console.log(err)
    });

    this.$bus.on('change-language', (action, language) => {
      console.log('动态改动词条', language);

      if (action === 'add') {
        this.canSwitchLanguage.push({
          i18n: language.i18n,
          txt: language.txt
        });
      } else if (action === 'edit') {
        this.canSwitchLanguage = this.canSwitchLanguage.map(item => {
          if (item.i18n === language.i18n) item.txt = language.txt;
          return item;
        });
      } else if (action === 'delete') {
        const index = this.canSwitchLanguage.findIndex(i => i.i18n === language.i18n);
        this.canSwitchLanguage.splice(index, 1);
      }

    });

    console.log('当前所属机构id', this.officeId)
  },
  beforeDestroy() {
    this.$bus.off('change-language');
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    handleLangCommand(lang) {
      if (!lang) return false;

      const loading = this.$loading({
        lock: true,
        text: this.$t('common.processing'),
      });

      if (lang==='zh' || lang==='en') {
        this.$i18n.locale = lang
        this.$store.dispatch('setLanguage', lang)
        this.$store.dispatch('setLocaleLanguage', lang);
//        this.$message({
//          message: this.$t('common.switchLanguageSuccess'),
//          type: 'success'
//        });
        loading.close();
        location.reload();
      } else {
        this.$store.dispatch('setLocaleLanguage', lang);
        loading.close();
        location.reload();

//        findContentByLemmaId({
//          id: lang
//        }).then(res => {
//          console.log(res)
//
//          this.$i18n.setLocaleMessage(lang, res.content);
//          this.$i18n.locale = lang;
//          this.$store.dispatch('setLocaleLanguage', lang);
//          this.$message({
//            message: this.$t('common.switchLanguageSuccess'),
//            type: 'success'
//          });
//          loading.close();
//          location.reload();
//        }).catch(err => {
//          console.log(err);
//          this.$message.error(this.$t('common.operationFailure'));
//        })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* reset element-ui css */
  .language-dropdown {
    .cur-lang {
      background-color: #F0F7FF;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/variables.scss";

.navbar {
  width: 100%;
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1002;
  background-color: #304156;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 18px;
  }

  .logo-container {
    float: left;
    display: flex;
    height: 50px;
    align-items: center;
    margin-left: 5%;
    .logo-box {
      width: 38px;
      height: 38px;
    }

    .logo-txt {
      color: #fff;
      /*margin-left: 10px;*/
    }
  }

  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 135px;
    .avatar-wrapper {
      display: flex;
      height: 100%;
      align-items: center;
      cursor: pointer;
      color: #fff;
      /*position: relative;*/
      &:hover {
        color: $hoverColor;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      /*.el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }*/
    }
  }

  .language-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    .language-wrapper {
      display: flex;
      height: 100%;
      align-items: center;
      cursor: pointer;
      color: #fff;
      &:hover {
        color: $hoverColor;
      }
    }
  }
}
</style>

