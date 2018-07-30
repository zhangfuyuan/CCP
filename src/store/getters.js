const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  language: state => state.app.language,
  process_env: state => state.app.process_env,
  public_path: state => state.app.process_env==='production' ? '/PRM' : '',
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  username: state => state.user.username,
  roles: state => state.user.roles,
  officeId: state => state.user.officeId,
  officeName: state => state.user.officeName,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
}
export default getters
