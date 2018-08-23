import Cookies from 'js-cookie'

const navigatorLanguage = navigator.language || navigator.userLanguage;

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    language: Cookies.get('language') ? (Cookies.get('language')==='zh' ? 'zh' : 'en') : (navigatorLanguage==='zh-CN' ? 'zh' : 'en'),
    process_env: process.env.NODE_ENV,
    localeLanguage: Cookies.get('localeLanguage') || (navigatorLanguage==='zh-CN' ? 'zh' : 'en'),
    publicKeyJson: {
      isLandingEncryption: false,
      exponent: '',
      modulus: '',
    },
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    },
    SET_LOCALELANGUAGE: (state, language) => {
      state.language = language;
      Cookies.set('localeLanguage', language, { expires: 365 })
    },
    SET_PUBLICKEYJSON: (state, json) => {
      if (json.isLandingEncryption) {
        state.publicKeyJson.isLandingEncryption = json.isLandingEncryption;
        state.publicKeyJson.exponent = json.exponent;
        state.publicKeyJson.modulus = json.modulus;
      }
    },
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    setLocaleLanguage({ commit }, language) {
      commit('SET_LOCALELANGUAGE', language)
    }
  }
}

export default app
