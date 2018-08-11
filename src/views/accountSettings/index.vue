<template>
  <div class="accountSettings-wrapper">
    <template v-if="!$route_isEdit">
      <el-form label-width="80px" label-position="left">
        <el-form-item :label="$t('accountSettings.name')">
          <span>{{name}}</span>
        </el-form-item>

        <el-form-item :label="$t('accountSettings.username')">
          <span>{{loginName}}</span>
        </el-form-item>

        <el-form-item :label="$t('accountSettings.role')">
          <!--<span v-for="(item,index) in roles" :key="index">
            {{item}} &nbsp;&nbsp;
          </span>-->
          {{roles  === user ? $t('common.user') : $t('common.root')}}
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="$router.push({ path: '/accountSettings/index/modifyPswd' })">
            {{$t('accountSettings.modifyPassword')}}
          </el-button>
          <el-button @click="logout">{{$t('accountSettings.logOut')}}</el-button>
        </el-form-item>
      </el-form>
    </template>

    <router-view></router-view>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'accountSettings',
    components: {  },
    data() {
      return {
        $route_isEdit: false
      }
    },
    computed: {
      ...mapGetters([
        'roles',
        'loginName',
        'name',
      ])
    },
    watch: {
      $route($r) {
        this.$route_isEdit = $r.name==='accountSettings-modifyPswd'
      }
    },
    created() {
      this.$route_isEdit = this.$route.name==='accountSettings-modifyPswd'
    },
    mounted() {
    },
    methods: {
      logout() {
//      this.$store.dispatch('LogOut').then(() => {
        this.$store.dispatch('FedLogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
