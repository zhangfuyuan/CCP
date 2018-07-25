<template>
  <div class="deviceManager-wrapper">
    <div class="tree">
      <div class="tree-wrapper">
        <div class="selected-box">
          <div :class="[ 'total', { 'total-disabled': checkedOfficeList.length===0 }]"
               @click="clickTotalBoxHandle">
            {{$t('accountManager.selected')}}
            {{checkedOfficeList.length}}
            {{$t('accountManager.offices')}}

            <i :class="[ {'el-icon-caret-bottom': !isShowCheckedOfficeList},
                         {'el-icon-caret-top': isShowCheckedOfficeList} ]"></i>
          </div>

          <el-collapse-transition>
            <div class="list" v-if="checkedOfficeList.length>0 && isShowCheckedOfficeList" style="padding: 0 10px;">
              <div class="all-clear" style="height: 30px;line-height: 30px;text-align: right;">
                <el-button type="text"
                           style="color: #F56C6C;"
                           size="mini"
                           @click="resetChecked">{{$t('accountManager.allClear')}}</el-button>
              </div>

              <div class="list-item" v-for="(item,index) in checkedOfficeList" :key="index">
                <el-button type="text"
                           style="color: #F56C6C;"
                           size="mini"
                           @click="deleteOneCheck(item.id)">{{$t('common.delete')}}</el-button>

                <div class="list-office" style="padding-left: 5px;">
                  <span>{{item.label}}</span>
                  <span v-if="item.pid" style="color: #909399;font-size: 12px">{{item.pid && getParentOfficeKey(item.pid)}}</span>
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
                placeholder="输入关键字进行过滤"
                v-model="filterText"
                suffix-icon="el-icon-search"
                clearable>
              </el-input>
            </div>
          </el-collapse-transition>
        </div>

        <div class="tree-box">
          <el-tree
            :data="officeList"
            show-checkbox
            node-key="id"
            ref="officeTree"
            highlight-current
            :props="treeProps"
            :filter-node-method="filterNode"
            :load="lazyLoadOfficeTree"
            lazy
            :expand-on-click-node="false"
            check-strictly
            @node-click="clickOfficeHandle"
            @check="checkOfficeHandle"
            :default-expanded-keys="[1]"
            class="tree-container">
          </el-tree>
        </div>
      </div>
    </div>

    <div class="table">
      <complex-table :checkedOfficeId="checkedOfficeIdList"></complex-table>
    </div>
  </div>
</template>

<script>
import ComplexTable from './components/complexTable.vue'
import { getTreeData } from '@/datas'
import { BFS } from '@/utils'

export default {
  name: 'deviceManager',
  components: { ComplexTable },
  data() {
    return {
      filterText: '', // 机构树搜索框文本
      officeList: [], // 机构树的数据
      treeProps: { // 机构数属性设置
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      checkedOfficeList: [], // 已选择机构的信息数组
      isShowCheckedOfficeList: false, // 是否显示已选机构列表
      curClickOfficeId: -1, // 当前点击高亮的机构id（仅一个）
      curClickOfficeInfo: null, // 当前点击高亮的机构信息（仅一个）
      checkedOfficeIdList: [], // 已勾选机构的id数组（多个）
      isShowSearchBox: false, // 是否显示搜索框
      firstLazyLoadChildren: [], // 第一次请求时，根节点的仅下一级节点
      isShowDeselectAllBtn: false, // 是否显示取消全选（默认显示全选）
    }
  },
  computed: {
    curClickOfficeAndChildrenId() {
      console.time('递归遍历树用时：')
      let checkList = BFS(this.curClickOfficeInfo, 'id', 'childNodes');
      console.log(`当前点击机构及其所有下级id：${checkList}`);
      console.timeEnd('递归遍历树用时：')

      return checkList;
    }
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    },
  },
  created() {
    this.fetchOfficeData(true)
  },
  mounted() {

  },
  methods: {
    fetchOfficeData(isFirst) {
      if (isFirst) {
        const data = [
          {
            id: 1,
            label: '顶级 0',
            children: [
              {
                id: 2,
                label: '一级 1',
                pid: 1,
                leaf: true
              }, {
                id: 3,
                label: '一级 2',
                pid: 1,
                leaf: false
              }, {
                id: 4,
                label: '一级 3',
                pid: 1,
                leaf: false
              }
            ]
          }
        ]

        setTimeout(() => {
          this.officeList = data;
          this.firstLazyLoadChildren = data[0].children
        }, 50)
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data['label'].indexOf(value) !== -1;
    },
    getParentOfficeKey(pid, key) {
      if (pid && this.$refs.officeTree.getNode(pid)) {
        let curNode = this.$refs.officeTree.getNode(pid).data;
        if (pid === curNode.pid) {
          console.log('机构树id重复，陷入死循环...');
          return '/--';
        }

        return '/' + curNode[key||'label'] + this.getParentOfficeKey(curNode.pid, key||'label')
      } else {
        return '';
      }
    },
    lazyLoadOfficeTree(node, resolve) { // 树懒加载执行方法
      console.log(`当前请求机构id：${node.data.id} - ${node.label}`);
      if (node.level === 1) {
        setTimeout(() => {
          resolve(this.firstLazyLoadChildren);
        }, 500);
      } else if (node.level === 2) {
        setTimeout(() => {
          resolve([
            {
              id: 5,
              label: '二级 2-1',
              pid: node.data.id,
            }, {
              id: 6,
              label: '二级 2-2',
              pid: node.data.id
            }
          ]);
        }, 500);
      } else if (node.level === 3) {
        setTimeout(() => {
          resolve([
            {
              id: 7,
              label: '三级 3-2-1',
              pid: node.data.id,
            }, {
              id: 8,
              label: '三级 3-2-2',
              pid: node.data.id,
            }, {
              id: 9,
              label: '三级 3-2-3',
              pid: node.data.id,
            }
          ]);
        }, 500);
      } else if (node.level > 3) {
        setTimeout(() => {
          resolve([
            {
              id: 10,
              label: '四级 3-2-1',
              pid: node.data.id,
              leaf: true,
            }, {
              id: 11,
              label: '四级 3-2-2',
              pid: node.data.id,
            }, {
              id: 12,
              label: '四级 3-2-3',
              pid: node.data.id,
              leaf: true,
            }
          ]);
        }, 500);
      }
    },
    clickOfficeHandle(data, node, component) {
      console.log(`当前点击的机构id是：${data.id} - ${node.label}`)
      this.curClickOfficeId = data.id
      this.curClickOfficeInfo = node
      this.toggleDeselectAllBtn()
    },
    checkOfficeHandle(data, status) {
      console.log(`当前勾选的机构id：${data.id} - ${data.label}`)
      console.log(`已勾选的所有机构id：${status.checkedKeys}`)
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
        this.$refs.officeTree.setCheckedKeys(this.curClickOfficeAndChildrenId);
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
      this.isShowDeselectAllBtn = this.checkedOfficeIdList.some(i => this.curClickOfficeAndChildrenId.indexOf(i) > -1)
      console.log(this.isShowDeselectAllBtn)
    },
    updateCheckedOffice() {
      this.checkedOfficeIdList = this.$refs.officeTree.getCheckedKeys()
      this.checkedOfficeList = this.$refs.officeTree.getCheckedNodes()

      if (this.checkedOfficeIdList.length === 0) this.isShowCheckedOfficeList = false;
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.deviceManager-wrapper {
  width: 100%;
  display: flex;
  .tree {
    width: 20%;
  }

  .tree-wrapper {
    width: 100%;
    min-height: calc(100vh - 54px);
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
    overflow-x: auto;
  }

  .table {
    width: 80%;
  }
}
</style>
