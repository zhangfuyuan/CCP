<template>
  <div class="deviceManager-wrapper">
    <template v-if="!isSubRoute">
      <div class="tree">
        <div class="tree-wrapper">
          <div class="selected-box">
            <div :class="[ 'total', { 'total-disabled': checkedOfficeList.length===0 }]"
                 @click="clickTotalBoxHandle">
              {{$t('deviceManager.selected')}}
              {{checkedOfficeList.length}}
              {{$t('deviceManager.offices')}}

              <i :class="[ {'el-icon-caret-bottom': !isShowCheckedOfficeList},
                         {'el-icon-caret-top': isShowCheckedOfficeList} ]"></i>
            </div>

            <el-collapse-transition>
              <div class="list" v-if="checkedOfficeList.length>0 && isShowCheckedOfficeList">
                <div class="all-clear" style="height: 30px;line-height: 30px;text-align: right;">
                  <el-button type="text"
                             style="color: #F56C6C;"
                             size="mini"
                             @click="resetChecked">{{$t('deviceManager.allClear')}}</el-button>
                </div>

                <div class="list-item" v-for="(item,index) in checkedOfficeList" :key="index">
                  <el-button type="text"
                             style="color: #F56C6C;"
                             size="mini"
                             @click="deleteOneCheck(item.id)">{{$t('common.delete')}}</el-button>

                  <div class="list-office" style="padding-left: 10px;">
                    <span>{{item.name}}</span>
                    <span v-if="item.parentId" style="color: #909399;font-size: 12px">{{item.parentId && getParentOfficeKey(item.parentId)}}</span>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <div class="all-and-filter-box">
            <div class="btns">
              <el-button type="primary"
                         :disabled="curClickOfficeId===-1"
                         @click="checkAllHandle"
                         v-if="!isShowDeselectAllBtn">{{$t('common.checkAll')}}</el-button>
              <el-button :disabled="curClickOfficeId===-1"
                         @click="allNotCheckHandle"
                         v-if="isShowDeselectAllBtn"
                         plain>{{$t('common.deselectAll')}}</el-button>
              <el-button icon="el-icon-search" @click="isShowSearchBox=!isShowSearchBox"></el-button>
            </div>

            <el-collapse-transition>
              <div v-show="isShowSearchBox" style="margin-top: 10px">
                <el-input
                  :placeholder="$t('deviceManager.searchOfficeName')"
                  v-model="filterText"
                  suffix-icon="el-icon-search"
                  clearable>
                </el-input>
              </div>
            </el-collapse-transition>
          </div>

          <div class="tree-box">
            <el-tree :data="officeList"
                     show-checkbox
                     node-key="id"
                     ref="officeTree"
                     highlight-current
                     :props="treeProps"
                     :filter-node-method="filterNode"
                     :expand-on-click-node="false"
                     check-strictly
                     @node-click="clickOfficeHandle"
                     @check="checkOfficeHandle"
                     :default-expanded-keys="[officeId]"
                     class="tree-container"
                     :style="{ 'height': treeHeight + 'px' }"
                     :empty-text="$t('common.noData')">
            </el-tree>
          </div>
        </div>
      </div>

      <div class="table">
        <complex-table :checkedOfficeIds="checkedOfficeIdList"></complex-table>
      </div>
    </template>

    <router-view :curCheckedDeviceList="subRoute_curCheckedDeviceList" ref="subRoute"></router-view>
  </div>
</template>

<script>
import ComplexTable from './components/complexTable.vue'
import { getTreeData } from '@/datas'
import { BFS, treeify } from '@/utils'
import { mapGetters } from 'vuex'
import {  } from '@/api/device'
import { getOfficeList } from '@/api/office'

export default {
  name: 'deviceManager',
  components: { ComplexTable },
  data() {
    return {
      filterText: '', // 机构树搜索框文本
      officeList: [], // 机构树的数据
      treeProps: { // 机构数属性设置
        children: 'children',
        label: 'name'
      },
      checkedOfficeList: [], // 已选择机构的信息数组
      isShowCheckedOfficeList: false, // 是否显示已选机构列表
      curClickOfficeId: -1, // 当前点击高亮的机构id（仅一个）
      curClickOfficeInfo: null, // 当前点击高亮的机构信息（仅一个）
      checkedOfficeIdList: [], // 已勾选机构的id数组（多个）
      isShowSearchBox: false, // 是否显示搜索框
      isShowDeselectAllBtn: false, // 是否显示取消全选（默认显示全选）
      treeHeight: document.documentElement.clientHeight - 275,
      isSubRoute: false, // 判断当前是二级还是三级路由（true为三级路由，即屏幕画面）
      subRoute_curCheckedDeviceList: null,
    }
  },
  computed: {
    curClickOfficeAndChildrenId() {
      console.time('递归遍历树用时')
      let checkList = []
      try {
        checkList = BFS(this.curClickOfficeInfo, 'id', 'childNodes');
      } catch (err){
        this.$message({
          message: err,
          type: 'warning'
        })
      }
      console.log(`当前点击机构及其所有下级id：${checkList}`);
      console.timeEnd('递归遍历树用时')

      return checkList;
    },
    ...mapGetters([
      'officeId',
      'officeName',
    ]),
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    },
    $route($r) {
      this.isSubRoute = $r.name==='deviceManager-screen';
    },
  },
  created() {
    this.fetchOfficeData();
    this.isSubRoute = this.$route.name==='deviceManager-screen';
    this.curClickOfficeId = -1;
    this.curClickOfficeInfo = null;
    this.$bus.on('screen', (devices) => {
      this.subRoute_curCheckedDeviceList = devices;
      this.$router.push({ path: '/device/deviceManager/screen' });
    });
  },
  mounted() {
  },
  beforeDestroy() {
    this.$bus.off('screen');
  },
  methods: {
    fetchOfficeData() {
      // todo 获取机构树原始数据
      getOfficeList().then(res => {
        console.log(res);
        if (res.currentOffice.parentId) {
          this.rootParentId = res.currentOffice.parentId;
          delete res.currentOffice.parentId; // 不能有parentId
        }
        let arr = [res.currentOffice].concat(res.officeMsg);
        let tree = treeify(arr, 'id', 'parentId', 'children');

        tree.parentId = this.rootParentId;

        this.officeList = JSON.parse(JSON.stringify([tree]))
      }).catch(err => {
        console.log(err);
        this.$message.error(this.$t('common.getOfficeListError'));
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data['name'].indexOf(value)!== -1 || data['organizationCode'].indexOf(value)!==-1;
    },
    getParentOfficeKey(parentId, key) {
      if (parentId && this.$refs.officeTree.getNode(parentId)) {
        let curNode = this.$refs.officeTree.getNode(parentId).data;
        if (parentId === curNode.parentId) {
          console.log('机构树id重复，陷入死循环...');
          return '/--';
        }

        return '/' + curNode[key||'name'] + this.getParentOfficeKey(curNode.parentId, key||'name')
      } else {
        return '';
      }
    },
    clickOfficeHandle(data, node, component) {
      console.log(`当前点击的机构id是：${data.id} - ${node.label}`)
      this.curClickOfficeId = data.id
      this.curClickOfficeInfo = node
      this.toggleDeselectAllBtn()
    },
    checkOfficeHandle(data, status) {
      console.log(`当前勾选的机构id：${data.id} - ${data.name}`)
      console.log(`已勾选的所有机构id：${status.checkedKeys}`)
      this.$refs.officeTree.setCurrentKey(data.id);
      this.curClickOfficeId = data.id;
      this.curClickOfficeInfo = this.$refs.officeTree.getNode(data.id);
      this.updateCheckedOffice();
      this.toggleDeselectAllBtn()

    },
    clickTotalBoxHandle() {
      if (this.checkedOfficeList.length===0) return false;

      this.isShowCheckedOfficeList = !this.isShowCheckedOfficeList;
    },
    checkAllHandle() { // 机构树全选处理
      if (this.curClickOfficeInfo) {
        console.log(`全选全部子节点的此节点id：${this.curClickOfficeId}`)
        let oldCheckedList = this.$refs.officeTree.getCheckedKeys();
        this.$refs.officeTree.setCheckedKeys([...this.curClickOfficeAndChildrenId, ...oldCheckedList]);
        this.updateCheckedOffice();
        this.toggleDeselectAllBtn();
      }
    },
    allNotCheckHandle() { // 机构树全不选处理
      if (this.curClickOfficeInfo) {
        console.log(`全不选全部子节点的此节点id：${this.curClickOfficeId}`)
        this.curClickOfficeAndChildrenId.map(id => {
          this.$refs.officeTree.setChecked(id, false);
        })
        this.updateCheckedOffice();
        this.toggleDeselectAllBtn();
      }
    },
    resetChecked() {
      this.$refs.officeTree.setCheckedKeys([]);
      this.updateCheckedOffice();
      this.toggleDeselectAllBtn();
    },
    deleteOneCheck(id) {
      if (!id && id!==0) return false;

      const index = this.checkedOfficeIdList.indexOf(id);
      this.checkedOfficeIdList.splice(index, 1);
      this.$refs.officeTree.setCheckedKeys(this.checkedOfficeIdList);
      this.updateCheckedOffice();
      this.toggleDeselectAllBtn();
    },
    toggleDeselectAllBtn() {
      if (this.curClickOfficeId !== -1) {
        this.isShowDeselectAllBtn = this.curClickOfficeAndChildrenId.every(i => this.checkedOfficeIdList.indexOf(i) > -1);
      }
    },
    updateCheckedOffice() {
      this.checkedOfficeIdList = this.$refs.officeTree.getCheckedKeys()
      this.checkedOfficeList = this.$refs.officeTree.getCheckedNodes()

      if (this.checkedOfficeIdList.length === 0) this.isShowCheckedOfficeList = false;
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* reset element-ui css */
  .deviceManager-wrapper {
    .el-tree-node>.el-tree-node__children {
      overflow: inherit;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.deviceManager-wrapper {
  width: 100%;
  display: flex;
  .tree {
    width: 300px;
  }

  .tree-wrapper {
    width: 100%;
    /*min-height: calc(100vh - 140px);*/
    background-color: #fff;
    border: 1px solid #EBEEF5;
    padding: 10px;
  }

  .selected-box {
    width: 100%;
    position: relative;
    z-index: 2;
    border: 1px solid #DCDFE6;
    .total {
      width: 100%;
      color: #606266;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      &-disabled {
        background-color: #ccc;
        color: #fff !important;
        cursor: not-allowed !important;
      }
    }

    .list {
      @include scrollBar;
      width: calc(100% + 2px);
      max-height: 531px;
      position: absolute;
      left: -1px;
      top: 40px;
      background-color: #fff;
      border: 1px solid #DCDFE6;
      border-top: none;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 3px 4px 5px rgba(0, 0, 0, 0.4);
      padding: 0 10px;
    }

    .list-item {
      width: 100%;
      display: flex;
      align-items: center;
      color: #303133;
      height: 50px;
      border-bottom: 1px solid #F2F6FC;
      .list-office {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
        &>span {
          width: calc(100% - 30px);
          white-space: nowrap;		/*禁止文本自动换行*/
          text-overflow: ellipsis;		/*超出文本省略号处理*/
          overflow: hidden;
          &:nth-child(2) {
            padding-top: 5px;
          }
        }
      }

      &:last-of-type {
        border-bottom: none;
      }
    }
  }

  .all-and-filter-box {
    width: 100%;
    padding: 20px 0;
    border-bottom: 1px solid #F2F6FC;
    .btns {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .tree-container {
    @include scrollBar;
    width: 100%;
    overflow: auto;
  }

  .table {
    width: calc(100% - 300px);
  }
}
</style>
