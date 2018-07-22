<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <!-- <router-view :key="key"></router-view> -->
      <router-view></router-view>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  data() {
    return {
    }
  },
  computed: {
    // key() {
    //   return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    // }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-main {
    min-height: calc(100vh - 50px);
    padding: 66px 32px 32px;
    background-color: #f0f2f5;
    position: relative;
    overflow: hidden;
  }
</style>
