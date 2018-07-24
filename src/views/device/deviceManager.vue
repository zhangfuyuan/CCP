<template>
  <div class="deviceManager-wrapper">
    <div class="tree">
      <div class="tree-wrapper">
        <div class="selected-box">
          <div :class="[ 'total', { 'total-disabled': selectedOfficeList.length===0 }]"
               @click="clickTotalBoxHandle">
            {{$t('accountManager.selected')}}
            {{selectedOfficeList.length}}
            {{$t('accountManager.offices')}}

            <i class="el-icon-caret-bottom" v-show="!isShowSelectedOfficeList"></i>
            <i class="el-icon-caret-top" v-show="isShowSelectedOfficeList"></i>
          </div>

          <el-collapse-transition>
            <div class="list" v-if="selectedOfficeList.length>0 && isShowSelectedOfficeList" style="padding: 0 10px;">
              <div class="all-clear" style="height: 30px;line-height: 30px;text-align: right;">
                <el-button type="text" style="color: #F56C6C;" size="mini">{{$t('accountManager.allClear')}}</el-button>
              </div>

              <div class="list-item" v-for="(item,index) in selectedOfficeList" :key="index">
                <el-button type="text" style="color: #F56C6C;">{{$t('common.delete')}}</el-button>

                <div class="list-office" style="padding-left: 5px;">
                  <span>{{item.label}}</span>
                  <span v-if="item.pid" style="color: #909399;font-size: 12px">{{item.pid&&'/66666666666666666666666666666666666666666666666'}}</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <div class="all-and-filter-box">
          <div class="btns">
            <el-button type="primary" :disabled="curClickOfficeId===-1" @click="checkAllHandle">{{$t('common.checkAll')}}</el-button>
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
            :default-expanded-keys="[1]">
          </el-tree>
        </div>
      </div>
    </div>

    <div class="table">
      <complex-table></complex-table>
    </div>
  </div>
</template>

<script>
import ComplexTable from './components/complexTable.vue'
import { getTreeData } from '@/datas'

export default {
  name: 'deviceManager',
  components: { ComplexTable },
  data() {
    return {
      filterText: '',
      officeList: [],
      treeProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      selectedOfficeList: [],
      isShowSelectedOfficeList: false,
      curClickOfficeId: -1,
      curCheckOfficeIdList: [],
      isShowSearchBox: false,
      isLazyLoadTree: false,
      firstLazyLoadChildren: []
    }
  },
  computed: {
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    }
  },
  created() {
    this.getOfficeData(true)
  },
  mounted() {
//    console.log(this.getParentOfficeKey(12)); // -> '/二级 3-2/一级 3'
  },
  methods: {
    getOfficeData(isFirst) {
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
    getParentOfficeKey(pid, key, res) {
      let curRes = res || '/';
      let curKey = key || 'label';

      if (pid) {
        let curNode = this.$refs.officeTree.getNode(pid);
        curRes += curNode[curKey];

        if (curNode.pid && this.$refs.officeTree.getNode(curNode.pid)) {
          this.getParentOfficeKey(curNode.pid, curKey, curRes);
        } else {
          return curRes;
        }
      } else {
        return curRes;
      }
    },
    lazyLoadOfficeTree(node, resolve) { // 树懒加载执行方法
      console.log('node.level：', node.level);
      console.log('当前请求机构id：', node.id, node.label);
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
              pid: node.id,
            }, {
              id: 6,
              label: '二级 2-2',
              pid: node.id
            }
          ]);
        }, 500);
      } else if (node.level === 3) {
        setTimeout(() => {
          resolve([
            {
              id: 7,
              label: '三级 3-2-1',
              pid: node.id,
            }, {
              id: 8,
              label: '三级 3-2-2',
              pid: node.id,
            }, {
              id: 9,
              label: '三级 3-2-3',
              pid: node.id,
            }
          ]);
        }, 500);
      } else if (node.level > 3) {
        setTimeout(() => {
          resolve([
            {
              id: 10,
              label: '四级 3-2-1',
              pid: node.id,
              leaf: true,
            }, {
              id: 11,
              label: '四级 3-2-2',
              pid: node.id,
            }, {
              id: 12,
              label: '四级 3-2-3',
              pid: node.id,
              leaf: true,
            }
          ]);
        }, 500);
      }
    },
    clickOfficeHandle(data, node, component) {
      console.log(`当前点击的机构id是：${data.id}`)
      this.curClickOfficeId = data.id
    },
    checkOfficeHandle(data, status) {
      console.log(`当前勾选的机构id是：${data.id}`)
      console.log(`目前已勾选的所有机构id数组为：`, status.checkedKeys)
      this.curCheckOfficeIdList = status.checkedKeys
      this.selectedOfficeList = status.checkedNodes
    },
    clickTotalBoxHandle() {
      if (this.selectedOfficeList.length===0) return false;

      this.isShowSelectedOfficeList = !this.isShowSelectedOfficeList;
    },
    checkAllHandle() {

    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
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

  .table {
    width: 80%;
  }
}
</style>
