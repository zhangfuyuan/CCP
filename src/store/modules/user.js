import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    id: '',
    loginName: '',
    token: getToken(),
    name: '',
    roles: [], // 即 power
    officeId: '',
    officeName: '',
    serverIp: '',
    identity: [] // 即 roleArray
  },

  mutations: {
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_LOGINNAME: (state, loginName) => {
      state.loginName = loginName
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_OFFICEID: (state, officeId) => {
      state.officeId = officeId
    },
    SET_OFFICENAME: (state, officeName) => {
      state.officeName = officeName
    },
    SET_SERVERIP: (state, serverIp) => {
      state.serverIp = serverIp
    },
    SET_IDENTITY: (state, identity) => {
      state.identity = identity
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        if (userInfo) {
          let username = '';
          let password = '';
          let validateCode = '';

          if (userInfo.username) username = userInfo.username.trim();
          if (userInfo.password) password = userInfo.password;
          if (userInfo.code) validateCode = userInfo.code;

          login(username, password, validateCode).then(res => {
            // 请不要登录成功就将角色权限托管于 state 中
            setToken('f778738c-e4f8-4870-b634-56703b4acafe');
            commit('SET_TOKEN', 'f778738c-e4f8-4870-b634-56703b4acafe');

            resolve(res)
          }).catch(err => {
            reject(err)
          })

        } else {
          // 第一次获取加密key，传空值会报错
          login(' ', ' ').then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          if (res.power && res.power.length > 0) {
            commit('SET_ROLES', res.power.split(','));
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_ID', res.id);
          commit('SET_LOGINNAME', res.loginName);
          commit('SET_NAME', res.name);
          commit('SET_OFFICEID', res.officeId);
          commit('SET_OFFICENAME', res.officeName);
          commit('SET_SERVERIP', res.serverIp);
          commit('SET_IDENTITY', res.roleArray);
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
