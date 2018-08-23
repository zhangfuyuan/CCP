import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import enLocale from './en'
import zhLocale from './zh'

Vue.use(VueI18n)

const navigatorLanguage = navigator.language || navigator.userLanguage;

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  }
}

const i18n = new VueI18n({
  locale: Cookies.get('localeLanguage') || (navigatorLanguage==='zh-CN' ? 'zh' : 'en'), // set locale
  //locale: Cookies.get('language') ? (Cookies.get('language')==='zh' ? 'zh' : 'en') : 'zh', // set locale
  messages // set locale messages
})

export default i18n
