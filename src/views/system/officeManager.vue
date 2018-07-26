<template>
  <div class="officeManager-wrapper">
    <!--左侧机构树-->
    <div class="tree">
      <div class="filter-box" style="margin-bottom: 20px;">
        <el-input
          :placeholder="$t('deviceManager.searchOfficeName')"
          v-model="filterText"
          suffix-icon="el-icon-search"
          clearable>
        </el-input>
      </div>

      <el-tree :data="officeTree"
               node-key="id"
               default-expand-all
               :expand-on-click-node="false"
               class="tree-container"
               :style="{ 'height': treeHeight + 'px' }"
               :filter-node-method="filterNode"
               ref="officeTree"
               :empty-text="$t('common.noData')"
               highlight-current
               @node-click="clickNodeHandle"
               :props="officeTreeProps">
      <span class="custom-tree-node" slot-scope="{ node, data }" >
        <span>
          <i v-if="data.isWisdom" class="el-icon-info" style="color: #409EFF;cursor: pointer;"></i>
          {{ node.label }}
        </span>
        <span>
          <i v-if="data.id===1" class="el-icon-circle-plus-outline" style="font-size: 16px;"></i>

          <span v-else v-popover:popoverBox @click="showPopover(data.id, data, $event)">
            <svg-icon icon-class="more" style="font-size: 16px;" />
          </span>
        </span>
      </span>
      </el-tree>
    </div>

    <!--右侧动态视图-->
    <div class="view" :style="{ 'height': viewHeight + 'px' }">
      <div class="view-tree" v-if="!$route_isPoints">
        <template v-if="curClickOfficeId>-1 && curClickOfficeInfo">
          <template v-if="curClickOfficeParentInfo">
            <el-card class="box-card parent-card" shadow="hover" style="width: 40%;">
              <div>
                {{curClickOfficeParentInfo.id}} - {{curClickOfficeParentInfo.label}}
              </div>
              <div v-for="o in 4" :key="o" class="text item">
                {{'列表内容 ' + o }}
              </div>
            </el-card>
          </template>

          <el-card class="box-card cur-card" shadow="hover" style="width: 60%;">
            <div>
              {{curClickOfficeInfo.id}} - {{curClickOfficeInfo.label}}
            </div>
            <div v-for="o in 4" :key="o" class="text item">
              {{'列表内容 ' + o }}
            </div>
          </el-card>

          <template v-if="curClickOfficeInfo.children">
            <el-card class="box-card children-card"
                     shadow="hover"
                     v-for="(item, index) in curClickOfficeInfo.children"
                     :key="index"
                     :style="{ 'width': '40%', 'margin-left': curClickOfficeParentInfo ? '50%' : '30%'}">
              <div>
                {{item.id}} - {{item.label}}
              </div>
              <div v-for="o in 4" :key="o" class="text item">
                {{'列表内容 ' + o }}
              </div>
            </el-card>
          </template>
        </template>

        <template v-else>
          <el-card class="box-card" shadow="hover" style="width: 40%;">
            <div style="width: 100%;height: 100px;display: flex;align-items: center;justify-content: center;">
              {{$t('officeManager.pleaseSelectMechanism')}}
            </div>
          </el-card>
        </template>
      </div>

      <router-view></router-view>
    </div>

    <!--对话弹框-->
    <el-dialog title="提示"
               :visible.sync="isShowDialog"
               width="30%">
          <span>这是一段信息</span>
          <span slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="isShowDialog = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--工具悬浮框-->
    <el-popover placement="top-end"
                trigger="click"
                :offset="-10"
                popper-class="officeManager-popover-box"
                v-model="isShowPopover"
                ref="popoverBox">
      <div style="display: flex;justify-content: space-between;align-items: center;color: #fff;">
        <el-button type="text"
                   size="mini"
                   @click="append()"
                   style="color: #fff;">
          {{$t('officeManager.newSubOffice')}}
        </el-button>

        <span style="padding: 0 5px;">|</span>

        <el-button type="text"
                   size="mini"
                   @click="move()"
                   style="color: #fff;">
          {{$t('common.move')}}
        </el-button>

        <span style="padding: 0 5px;">|</span>

        <el-button type="text"
                   size="mini"
                   @click="remove(), isShowDialog = true"
                   style="color: #F56C6C;">
          {{$t('common.delete')}}
        </el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
  let id = 1000;

  export default {
    name: 'officeManager',
    components: {  },
    data() {
      return {
        officeTree: [ // 机构树
          {
            id: 1,
            label: '一级 1',
            children: [{
              id: 4,
              label: '二级 1-1',
              isWisdom: true,
              pid: 1,
              children: [{
                id: 9,
                label: '三级 1-1-1',
                pid: 4,
              }, {
                id: 10,
                label: '三级 1-1-2',
                pid: 4,
              }]
            }]
          }, {
            id: 2,
            label: '一级 2',
            children: [{
              id: 5,
              label: '二级 2-1',
              pid: 2,
            }, {
              id: 6,
              label: '二级 2-2',
              pid: 2,
              children: [{
                id: 11,
                label: '三级 2-2-1',
                pid: 6,
                children: [{
                  id: 13,
                  label: '四级 2-2-1-1',
                  pid: 11,
                }, {
                  id: 14,
                  label: '四级 2-2-1-2',
                  pid: 11,
                }]
              }, {
                id: 12,
                label: '三级 2-2-2',
                pid: 6,
              }]
            }]
          }, {
            id: 3,
            label: '一级 3',
            children: [{
              id: 7,
              label: '二级 3-1',
              isWisdom: true,
              pid: 3,
            }, {
              id: 8,
              label: '二级 3-2',
              pid: 3,
            }]
          }
        ],
        officeTreeProps: {  // 机构树基本属性
          label: 'label',
          children: 'children'
        },
        $route_isPoints: false, // 判断当前是二级还是三级路由
        treeHeight: document.documentElement.clientHeight - 210, // 初始化机构树高度
        filterText: '', // 搜索框的输入值
        isShowPopover: false, // Popover 是否可见
        isShowDialog: false, // Dialog 是否可见
        curClickOfficeId: -1, // 当前选中机构节点id
        curClickOfficeInfo: null, // 当前选中机构节点信息
        isClickMoreIcon: false, // 当前是否点击更多图标
        viewHeight: document.documentElement.clientHeight - 125, // 初始化右侧视图高度
      }
    },
    computed: {
      curClickOfficeParentInfo() {
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.pid ?
                this.$refs.officeTree.getNode(this.curClickOfficeInfo.pid).data :
                null
      }
    },
    watch: {
      $route($r) {
        this.$route_isPoints = $r.name==='officeManager-distributionPoints'
      },
      filterText(val) {
        this.$refs.officeTree.filter(val);
      },
    },
    created() {
      this.$route_isPoints = this.$route.name==='officeManager-distributionPoints'
    },
    mounted() {
    },
    methods: {
      append() {
        const newChild = { id: id++, label: 'testtest', children: [] };

        this.$refs['officeTree'].append(newChild, this.curClickOfficeId);
      },
      remove(node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },
      move(node, data) {

      },
      filterNode(value, data) {
        if (!value) return true;

        this.isShowDialog = false
        return data['label'].indexOf(value) !== -1;
      },
      showPopover(id, info, $event) { //这里留个BUG：最后节点点击更多后会关闭Popover！
        this.isClickMoreIcon = true
        this.isShowPopover = true

        this.$nextTick(() => {
          let pop = this.$refs['popoverBox']
          pop.popperJS._reference = $event.target
          pop.popperJS.state.position = pop.popperJS._getPosition(pop.popperJS._popper, pop.popperJS._reference)
          pop.popperJS.update()
          this.isClickMoreIcon = false
        })
      },
      updateCurClickOffice(id, info) {
        this.curClickOfficeId = id
        this.curClickOfficeInfo = info
      },
      clickNodeHandle(d, n, v) {
        this.updateCurClickOffice(d.id, d);
        console.log(this.curClickOfficeId, this.curClickOfficeInfo)
        if (!this.isClickMoreIcon) this.$refs['popoverBox'].doClose();
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  /* reset element-ui css */
  .officeManager-wrapper {
    .el-tree-node>.el-tree-node__children {
      overflow: inherit;
    }
  }

  .officeManager-popover-box {
    background-color: rgba(49, 48, 51, .8) !important;
    padding: 5px 10px !important;
    border: 1px solid rgb(49, 48, 51);
    .popper__arrow {
      border-top-color: rgba(49, 48, 51, .8) !important;
      &::after {
        border-top-color: rgba(49, 48, 51, .8) !important;
      }
    }
  }

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.officeManager-wrapper {
  width: 100%;
  display: flex;
  .tree {
    width: 25%;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #EBEEF5;
  }

  .tree-container {
    @include scrollBar;
    width: 100%;
    overflow: auto;
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }
  }

  .view {
    @include scrollBar;
    width: 75%;
    padding-left: 20px;
    padding-bottom: 20px;
    overflow: auto;
  }

  .box-card {
    min-height: 100px;
    border-radius: 10px;
    margin-bottom: 30px;
    &:last-of-type {
      margin-bottom: 0;
    }

    &:first-of-type {
      margin-left: 10%;
    }

    &:nth-child(2) {
      margin-left: 30%;
    }

    .text {
      font-size: 14px;
    }
    .item {
      padding: 18px 0;
    }
  }


}
</style>
