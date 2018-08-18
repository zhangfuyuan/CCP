<template>
  <div class="app-wrapper" :class="classObj">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"></div>
    <navbar></navbar>
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <tags-view></tags-view>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapGetters } from 'vuex'
import { findContentByLemmaId } from '@/api/language'
import { myMixin } from '@/assets/js/mixins';

export default {
  name: 'layout',
  data() {
    return {
    }
  },
  components: {
    Navbar,
    Sidebar,
    AppMain,
    TagsView
  },
  mixins: [ResizeMixin, myMixin],
  created() {
    if (this.localeLanguage && this.localeLanguage!=='zh' && this.localeLanguage!=='en') {
      const loading = this.showLoading('document.body', 'loading...');

      this.getLocaleLanguage().then(() => {
        loading.close();
      }).catch(() => {
        loading.close();
        this.$message.error(this.$t('common.switchLanguageError'));
      })
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    ...mapGetters([
      'localeLanguage',
    ])
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
    },
    getLocaleLanguage() {
      return new Promise((resolve, reject) => {
        findContentByLemmaId({
          id: this.localeLanguage
        }).then(res => {
          console.log(res);

          res.content.el.datepicker.weeks = {};
          res.content.el.datepicker.weeks.sun = res.content.el.datepicker.weeks_sun;
          res.content.el.datepicker.weeks.mon = res.content.el.datepicker.weeks_mon;
          res.content.el.datepicker.weeks.tue = res.content.el.datepicker.weeks_tue;
          res.content.el.datepicker.weeks.wed = res.content.el.datepicker.weeks_wed;
          res.content.el.datepicker.weeks.thu = res.content.el.datepicker.weeks_thu;
          res.content.el.datepicker.weeks.fri = res.content.el.datepicker.weeks_fri;
          res.content.el.datepicker.weeks.sat = res.content.el.datepicker.weeks_sat;
          res.content.el.datepicker.months = {};
          res.content.el.datepicker.months.jan = res.content.el.datepicker.months_jan;
          res.content.el.datepicker.months.feb = res.content.el.datepicker.months_feb;
          res.content.el.datepicker.months.mar = res.content.el.datepicker.months_mar;
          res.content.el.datepicker.months.apr = res.content.el.datepicker.months_apr;
          res.content.el.datepicker.months.may = res.content.el.datepicker.months_may;
          res.content.el.datepicker.months.jun = res.content.el.datepicker.months_jun;
          res.content.el.datepicker.months.jul = res.content.el.datepicker.months_jul;
          res.content.el.datepicker.months.aug = res.content.el.datepicker.months_aug;
          res.content.el.datepicker.months.sep = res.content.el.datepicker.months_sep;
          res.content.el.datepicker.months.oct = res.content.el.datepicker.months_oct;
          res.content.el.datepicker.months.nov = res.content.el.datepicker.months_nov;
          res.content.el.datepicker.months.dec = res.content.el.datepicker.months_dec;
          res.content.el.transfer.titles = [];
          res.content.el.transfer.titles[0] = res.content.el.transfer.titles__1;
          res.content.el.transfer.titles[1] = res.content.el.transfer.titles__2;

          this.$i18n.setLocaleMessage(this.localeLanguage, res.content);
          this.$i18n.locale = this.localeLanguage;
          this.$store.dispatch('setLocaleLanguage', this.localeLanguage);

          resolve();
        }).catch(err => {
          console.log(err);

          reject();
        })
      })
    },
  },
//  beforeRouteEnter(to, from, next) {
//    next(vm => {
//      if (vm.localeLanguage && vm.localeLanguage!=='zh' && vm.localeLanguage!=='en') {
//        vm.getLocaleLanguage().then(() => {
//        }).catch(() => {
//          vm.$message.error(vm.$t('common.switchLanguageError'));
//        })
//      }
//    });
//  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }
</style>
