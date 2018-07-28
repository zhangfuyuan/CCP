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
          <i v-if="data.id===1" class="el-icon-circle-plus-outline" style="font-size: 16px;" @click="toggleDialogInfo('new')"></i>

          <span v-else v-popover:popoverBox @click="showPopover(data.id, data, $event)">
            <svg-icon icon-class="more" style="font-size: 16px;" />
          </span>
        </span>
      </span>
      </el-tree>
    </div>

    <!--右侧动态视图-->
    <div class="view" :style="{ 'height': viewHeight + 'px' }">
      <div style="margin-bottom: 10px;">
        <i class="el-icon-info" style="color: #409EFF;cursor: pointer;"></i>
        <span style="color: #909399;padding-left: 5px;">{{$t('officeManager.intelligentAllocationPointsMode')}}</span>
      </div>

      <div class="view-tree" v-if="!$route_isPoints">
        <template v-if="curClickOfficeId>-1 && curClickOfficeInfo">
          <template v-if="curClickOfficeParentInfo">
            <el-card class="box-card parent-card" shadow="never" style="width: 40%;">
              <div class="card-container" @click.stop.prevent="clickCardHandle(curClickOfficeParentInfo)">
                <div class="name">
                  {{curClickOfficeParentInfo.label}}
                </div>

                <div class="info">
                  <div class="id">{{$t('officeManager.id')}} &nbsp; {{curClickOfficeParentInfo.id}}</div>

                  <div class="points">
                    机构总点数 22 | 设备数 20
                  </div>
                </div>

                <div class="btns">
                  <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.distributionPoints')}}</el-button>
                  <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.modifyName')}}</el-button>
                </div>
              </div>
            </el-card>
          </template>

          <el-card class="box-card cur-card"
                   shadow="always"
                   style="width: 60%;height: 230px;">
            <div class="card-container">
              <div class="name">{{curClickOfficeInfo.label}}</div>

              <div class="info">
                <div class="id">{{$t('officeManager.id')}} &nbsp; {{curClickOfficeInfo.id}}</div>

                <div class="points">
                    机构总点数 22 = 可分配点数 2 + 已分配点数 20 | 设备数 20
                    </div>
              </div>

              <div class="btns">
                <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.distributionPoints')}}</el-button>
                <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.modifyName')}}</el-button>
                <el-button type="text" @click.stop.prevent="toggleDialogInfo('new')">{{$t('officeManager.newSubOffice')}}</el-button>
                <el-button type="text" @click.stop.prevent="aaa">{{$t('common.move')}}</el-button>
                <el-button type="text" style="color: #F56C6C;" @click.stop.prevent="aaa">{{$t('common.delete')}}</el-button>
              </div>
            </div>
          </el-card>

          <template v-if="curClickOfficeChildren && curClickOfficeChildren.length>0">
            <div class="view-tree-children" style="width: 100%;">
              <el-card class="box-card children-card"
                       shadow="never"
                       v-for="(item, index) in curClickOfficeChildren"
                       :key="index"
                       :style="{ 'width': '40%', 'margin-left': curClickOfficeParentInfo ? '50%' : '30%'}">
                <div class="card-container" @click.stop.prevent="clickCardHandle(item)">
                  <div class="name">{{item.label}}</div>

                  <div class="info">
                    <div class="id">{{$t('officeManager.id')}} &nbsp; {{item.id}}</div>

                    <div class="points">
                    机构总点数 22 | 设备数 20
                    </div>
                  </div>

                  <div class="btns">
                    <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.distributionPoints')}}</el-button>
                    <el-button type="text" @click.stop.prevent="aaa">{{$t('officeManager.modifyName')}}</el-button>
                  </div>
                </div>
              </el-card>
            </div>
        </template>
        </template>

        <template v-else>
          <el-card class="box-card" shadow="never" style="width: 40%;">
            <div style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
              {{$t('officeManager.pleaseSelectMechanism')}}
            </div>
          </el-card>
        </template>
      </div>

      <router-view></router-view>
    </div>

    <!--对话弹框-->
    <el-dialog :title="dialogInfo.title"
               :visible.sync="isShowDialog"
               :width="dialogInfo.width">
      <template v-if="dialogInfo.key === 'new'">
        <div>
          <el-input v-model="newOfficeForm.name"
                    :placeholder="$t('officeManager.organizationNameNotExceed24')"
                    :maxlength="24"
                    :autofocus="true"></el-input>
        </div>
        <div v-if="curClickOfficeId === 1"
             style="display: flex;justify-content: space-between;align-items: center;color: #606266;padding-top: 20px;font-size: 16px;">
          <span>
            {{$t('officeManager.totalPoints')}}: &nbsp; <span style="color: #409EFF;">{{testInputNumber}}</span>
          </span>

          <span>
            <el-input-number size="small" v-model="inputNumberVal" :min="0" :max="testTotalPoints"></el-input-number>
          </span>
        </div>
        <div v-else style="color: #909399;padding-top: 20px;">
          {{$t('officeManager.intelligentAllocationPointsMode')}}
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="append(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <template v-if="dialogInfo.key === 'remove'">
        <span>{{$t('officeManager.afterRemovingMechanism')}}</span>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
          <el-button type="danger" plain @click="remove(), isShowDialog = false">{{$t('common.deleteBtn')}}</el-button>
        </div>
      </template>

      <template v-if="dialogInfo.key === 'edit'">
        <span>这是一段信息</span>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="edit(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <template v-if="dialogInfo.key === 'move'">
        <span>这是一段信息</span>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="move(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <template v-if="dialogInfo.key === 'anti'">
        <span>这是一段信息</span>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="anti(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>
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
                   @click="toggleDialogInfo('new')"
                   style="color: #fff;">
          {{$t('officeManager.newSubOffice')}}
        </el-button>

        <span style="padding: 0 5px;">|</span>

        <el-button type="text"
                   size="mini"
                   @click="toggleDialogInfo('move')"
                   style="color: #fff;">
          {{$t('common.move')}}
        </el-button>

        <span style="padding: 0 5px;">|</span>

        <el-button type="text"
                   size="mini"
                   @click="toggleDialogInfo('remove')"
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
              id: 2,
              label: '二级 1-1',
              isWisdom: true,
              pid: 1,
              children: [{
                id: 3,
                label: '三级 1-1-1',
                pid: 2,
                children: [],
              }, {
                id: 4,
                label: '三级 1-1-2',
                pid: 2,
                children: [],
              }]
            }]
          }, {
            id: 5,
            label: '一级 2',
            children: [{
              id: 6,
              label: '二级 2-1',
              pid: 5,
              children: [],
            }, {
              id: 7,
              label: '二级 2-2',
              pid: 5,
              children: [{
                id: 8,
                label: '三级 2-2-1',
                pid: 7,
                children: [{
                  id: 9,
                  label: '四级 2-2-1-1',
                  pid: 8,
                  children: [], // 叶子结点 [] 不能少
                }, {
                  id: 10,
                  label: '四级 2-2-1-2',
                  pid: 8,
                  children: [],
                }, {
                  id: 11,
                  label: '四级 2-2-1-3',
                  pid: 8,
                  children: [],
                }]
              }, {
                id: 12,
                label: '三级 2-2-2',
                pid: 7,
                children: [],
              }]
            }]
          }, {
            id: 13,
            label: '一级 3',
            children: [{
              id: 14,
              label: '二级 3-1',
              isWisdom: true,
              pid: 13,
              children: [],
            }, {
              id: 15,
              label: '二级 3-2',
              pid: 13,
              children: [],
            }]
          }, {
            id: 16,
            label: '一级 4',
            children: [],
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
        curClickOfficeId: -1, // 当前选中机构节点id
        curClickOfficeInfo: null, // 当前选中机构节点信息
        isClickMoreIcon: false, // 当前是否点击更多图标
        viewHeight: document.documentElement.clientHeight - 125, // 初始化右侧视图高度
        isShowDialog: false, // Dialog 是否可见
        dialogInfo: { // 公用 Dialog 显示信息
          key: '--',
          title: '--',
          width: '30%'
        },
        newOfficeForm: { // 新建子机构表单
          name: ''
        },
        g_loading: null, // loading 全局单例
        inputNumberVal: 0, // 计数器的值
        testTotalPoints: 12, // 测试：总可分配点数
      }
    },
    computed: {
      curClickOfficeParentInfo() {

        return this.curClickOfficeInfo&&this.curClickOfficeInfo.pid ?
                this.$refs.officeTree.getNode(this.curClickOfficeInfo.pid).data :
                null
      },
      curClickOfficeChildren() {
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.children ?
                this.curClickOfficeInfo.children :
                []
      },
      testInputNumber() {
        return this.testTotalPoints - this.inputNumberVal;
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
        const newChild = { id: id++, label: this.newOfficeForm.name, children: [] };
        const loading = this.showLoading();

        setTimeout(() => {
          this.$refs['officeTree'].append(newChild, this.curClickOfficeId);
          loading.close();
        }, 2000);
      },
      remove() {
        const loading = this.showLoading();

        setTimeout(() => {
          this.$refs['officeTree'].remove(this.curClickOfficeId);
          this.updateCurClickOffice(-1, null);
          loading.close();
        }, 2000);
      },
      move() {
        const loading = this.showLoading();

        setTimeout(() => {
          this.updateCurClickOffice(-1, null);
          loading.close();
        }, 2000);
      },
      edit() {

      },
      anti() {

      },
      filterNode(value, data) {
        if (!value) return true;

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
      },
      aaa() {
        console.log('点了按钮')
      },
      clickCardHandle(info) {
        console.log('点了白板')
        if (!info || !info.id) return false;

        this.$refs.officeTree.setCurrentNode(info)
        this.updateCurClickOffice(info.id, info)
      },
      toggleDialogInfo(key) {
        switch (key) {
          case 'new':
            this.dialogInfo = {
              key: key,
              title: this.$t('officeManager.newSubOffice'),
              width: '35%',
            }
            break;
          case 'remove':
            this.dialogInfo = {
              key: key,
              title: this.$t('common.notice'),
              width: '30%',
            }
            break;
          case 'edit':
            this.dialogInfo = {
              key: key,
              title: this.$t('officeManager.changeOrganizationName'),
              width: '30%',
            }
            break;
          case 'move':
            this.dialogInfo = {
              key: key,
              title: this.$t('officeManager.will') + ' ' + this.curClickOfficeInfo.label + ' ' + this.$t('officeManager.moveTo'),
              width: '30%',
            }
            break;
          case 'anti':
            this.dialogInfo = {
              key: key,
              title: this.$t('common.notice'),
              width: '30%',
            }
            break;
          default:
            this.dialogInfo = {
              key: '--',
              title: '--',
              width: '30%',
            }
            break;
        }
        this.isShowDialog = true
      },
      showLoading(txt, target, isLock) {
        return this.$loading({
          text: txt || this.$t('common.processing'),
          target: target || '#appMain',
          lock: isLock || true,
        });
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import "src/styles/mixin.scss";

  /* reset element-ui css */
  .officeManager-wrapper {
    .el-tree-node>.el-tree-node__children {
      overflow: inherit;
    }

    .el-card__body {
      @include scrollBar;
      padding: 15px;
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      position: relative;
      background-color: #fff;
      border-radius: 4px;
    }

    .cur-card {
      .el-card__body {
        border: 2px solid rgba(65,185,255,.9);
      }
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
    overflow: auto;
  }

  .box-card {
    height: 178px;
    margin-bottom: 20px;
    position: relative;
    overflow: inherit;
    &:first-of-type {
      margin-left: 10%;
    }

    &:nth-child(2) {
      margin-left: 30%;
    }

    &::before {
      content: '';
      position: absolute;
    }

    &:first-of-type {
      &.parent-card::before {
        top: 50%;
        left: -25%;
        width: 75%;
        border-top: 3px solid #909399;
        border-left: 3px solid #909399;
        border-bottom: 3px solid #909399;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        height: calc(50% + 138px);
      }

      &.cur-card::before {
        top: 50%;
        left: -16.67% ;
        width: 50% ;
        border-top: 3px solid #909399;
        border-left: 3px solid #909399;
        border-bottom: 3px solid #909399;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        height: calc(50% + 112px);
      }

      &.cur-card + .view-tree-children {
        &>.children-card::before {
          top: 50%;
          left: -75%;
          width: 75%;
          border-top: 3px solid #909399;
          border-bottom: 3px solid #909399;
          border-left: 3px solid #909399;
          border-bottom-left-radius: 5px;
          border-top-left-radius: 5px;
          height: calc(50% + 112px);
        }
      }
    }

    &:nth-child(2) {
      &.cur-card::before {
        top: 50%;
        left: -33.33% ;
        width: 66.66% ;
        border-top: 2px solid #909399;
        border-bottom: 2px solid #909399;
        border-left: 2px solid #909399;
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
        height: calc(50% + 112px);
      }

      &.cur-card + .view-tree-children {
        &>.children-card::before {
          top: 50%;
          left: -100%;
          width: 100%;
          border-top: 2px solid #909399;
          border-bottom: 2px solid #909399;
          border-left: 2px solid #909399;
          border-bottom-left-radius: 5px;
          border-top-left-radius: 5px;
          height: calc(50% + 112px);
        }
      }
    }

    &:only-child::before {
      display: none;
    }

    &:last-of-type::before {
      display: none;
    }

    .text {
      font-size: 14px;
    }
    .item {
      padding: 18px 0;
    }
  }

  .card-container {
    cursor: pointer;
    white-space: nowrap;
    .name {
      border-bottom: 1px solid #DCDFE6;
      color: #303133;
      padding-bottom: 15px;
    }

    .info {
      padding: 15px 0;
      border-bottom: 1px solid #DCDFE6;
      color: #606266;
      .id {
        margin-bottom: 15px;
      }
    }

    .btns {
      padding-top: 2px;
    }
  }

  .cur-card {
    .card-container {
      cursor: auto;
    }
    .name {
      padding: 5px 0 20px 0;
      font-size: 20px;
      font-weight: bold;
    }

    .info {
      padding: 20px 0;
      font-size: 18px;
      .id {
        margin-bottom: 20px;
      }
    }

    .btns {
      padding-top: 8px;
    }
  }

  .dialog-footer {
    text-align: left;
  }

}
</style>
