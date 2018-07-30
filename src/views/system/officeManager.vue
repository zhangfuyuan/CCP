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
               :default-expanded-keys="[officeTree[1].id || 1]"
               :expand-on-click-node="false"
               class="tree-container"
               :style="{ 'height': treeHeight + 'px' }"
               :filter-node-method="filterNode"
               ref="officeTree"
               :empty-text="$t('common.noData')"
               highlight-current
               @node-click="clickNodeHandle"
               :props="officeTreeProps">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>
          <span v-if="data.isWisdom" :title="$t('officeManager.intelligentAllocationPointsMode')">
            <svg-icon icon-class="eglass-tag" style="font-size: 16px;cursor: pointer;" />
          </span>
          {{ node.label }}
        </span>
        <span>
          <i v-if="node.level===1"
             class="el-icon-circle-plus-outline"
             style="font-size: 16px;"
             @click="toggleDialogInfo('new')"></i>

          <span v-else
                v-popover:popoverBox
                @click="showPopover(data.id, data, $event)">
            <svg-icon icon-class="more" style="font-size: 16px;" />
          </span>
        </span>
      </span>
      </el-tree>
    </div>

    <!--右侧动态视图-->
    <div class="view" :style="{ 'height': viewHeight + 'px' }">
      <div style="margin-bottom: 10px;" v-if="!subRoute_isPoints">
        <svg-icon icon-class="eglass-tag" style="font-size: 18px;cursor: pointer;" />
        <span style="color: #909399;padding-left: 5px;">{{$t('officeManager.intelligentAllocationPointsMode')}}</span>
      </div>

      <div v-if="isNoAuth && !subRoute_isPoints"
           style="width: 60%;margin: 0 0 10px 10%;border: 1px solid #F56C6C;display: flex;align-items: center;justify-content: space-between;cursor: pointer;border-radius: 4px;background-color: #fff;padding: 0 10px;"
           @click="toggleDialogInfo('anti')">
        <span>
          <i class="el-icon-warning" style="color: #F56C6C;"></i>
          {{$t('officeManager.serverNotCertified')}}
        </span>

        <el-button type="text">{{$t('officeManager.certificationImmediately')}}</el-button>
      </div>

      <div class="view-tree" v-if="!subRoute_isPoints">
        <template v-if="curClickOfficeId>-1 && curClickOfficeInfo">
          <template v-if="curClickOfficeParentInfo">
            <el-card class="box-card parent-card" shadow="never" style="width: 40%;">
              <div class="card-container" @click.stop.prevent="clickCardHandle(curClickOfficeParentInfo)">
                <div class="name">
                  <span v-if="curClickOfficeParentInfo.isWisdom" :title="$t('officeManager.intelligentAllocationPointsMode')">
                    <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                  </span>
                  {{curClickOfficeParentInfo.label}}
                </div>

                <div class="info">
                  <div class="id">{{$t('officeManager.id')}} &nbsp; {{curClickOfficeParentInfo.id}}</div>

                  <div class="points">
                    机构总点数 22 | 设备数 20
                  </div>
                </div>

                <div class="btns">
                  <el-button type="text"
                             @click.stop.prevent="distributionPoints(curClickOfficeParentInfo.id)"
                             :disabled="isNoAuth">{{$t('officeManager.distributionPoints')}}
                  </el-button>
                  <el-button type="text"
                             @click.stop.prevent="toggleDialogInfo('edit', curClickOfficeParentInfo.id)"
                             :disabled="isNoAuth">{{$t('officeManager.modifyName')}}
                  </el-button>
                  <el-button type="text"
                             v-if="curClickOfficeParentInfo.isNoAuth"
                             @click="toggleDialogInfo('anti')">{{$t('officeManager.authentication')}}
                  </el-button>
                </div>
              </div>
            </el-card>
          </template>

          <el-card class="box-card cur-card"
                   shadow="always"
                   style="width: 60%;height: 230px;">
            <div class="card-container">
              <div class="name">
                <span v-if="curClickOfficeInfo.isWisdom" :title="$t('officeManager.intelligentAllocationPointsMode')">
                  <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                </span>
                {{curClickOfficeInfo.label}}
              </div>

              <div class="info">
                <div class="id">{{$t('officeManager.id')}} &nbsp; {{curClickOfficeInfo.id}}</div>

                <div class="points">
                    机构总点数 22 = 可分配点数 2 + 已分配点数 20 | 设备数 20
                    </div>
              </div>

              <div class="btns">
                <el-button type="text" @click.stop.prevent="distributionPoints(curClickOfficeInfo.id)"
                           :disabled="isNoAuth">{{$t('officeManager.distributionPoints')}}
                </el-button>
                <el-button type="text"
                           @click.stop.prevent="toggleDialogInfo('edit', curClickOfficeInfo.id)"
                           :disabled="isNoAuth">{{$t('officeManager.modifyName')}}
                </el-button>
                <el-button type="text"
                           @click.stop.prevent="toggleDialogInfo('new')"
                           :disabled="isNoAuth">{{$t('officeManager.newSubOffice')}}
                </el-button>
                <el-button type="text"
                           @click.stop.prevent="toggleDialogInfo('move')"
                           :disabled="isNoAuth">{{$t('common.move')}}
                </el-button>
                <el-button type="text"
                           :style="{ color: isNoAuth ? '#c0c4cc' : '#F56C6C' }"
                           @click.stop.prevent="toggleDialogInfo('remove')"
                           :disabled="isNoAuth">{{$t('common.delete')}}
                </el-button>
                <el-button type="text"
                           v-if="curClickOfficeInfo.isNoAuth"
                           @click="toggleDialogInfo('anti')">{{$t('officeManager.authentication')}}
                </el-button>
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
                  <div class="name">
                    <span v-if="item.isWisdom" :title="$t('officeManager.intelligentAllocationPointsMode')">
                      <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                    </span>
                    {{item.label}}
                  </div>

                  <div class="info">
                    <div class="id">{{$t('officeManager.id')}} &nbsp; {{item.id}}</div>

                    <div class="points">
                    机构总点数 22 | 设备数 20
                    </div>
                  </div>

                  <div class="btns">
                    <el-button type="text"
                               @click.stop.prevent="distributionPoints(item.id)"
                               :disabled="isNoAuth">{{$t('officeManager.distributionPoints')}}
                    </el-button>
                    <el-button type="text"
                               @click.stop.prevent="toggleDialogInfo('edit', item.id)"
                               :disabled="isNoAuth">{{$t('officeManager.modifyName')}}
                    </el-button>
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

      <router-view :curOfficeInfo="subRoute.curOfficeInfo"
                   :curOfficeChildren="subRoute.curOfficeChildren"
                   :curOfficeParents="subRoute.curOfficeParents"></router-view>
    </div>

    <!--对话弹框-->
    <el-dialog :title="dialogInfo.title"
               :visible.sync="isShowDialog"
               :width="dialogInfo.width"
               @open="openDialogHandle"
               @close="closeDialogHandle"
               :close-on-click-modal="false">
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

      <!--删除机构节点-->
      <template v-if="dialogInfo.key === 'remove'">
        <span>{{$t('officeManager.afterRemovingMechanism')}}</span>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
          <el-button type="danger" plain @click="remove(), isShowDialog = false">{{$t('common.deleteBtn')}}</el-button>
        </div>
      </template>

      <!--修改机构名称-->
      <template v-if="dialogInfo.key === 'edit'">
        <el-input v-model="editOfficeName" :placeholder="$t('officeManager.organizationNameNotExceed24')"></el-input>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="edit(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <!--移动所属机构-->
      <template v-if="dialogInfo.key === 'move'">
        <el-tree
          class="move-tree"
          :data="moveOfficeTree"
          :props="moveOfficeProps"
          ref="moveOfficeTree"
          show-checkbox
          highlight-current
          node-key="id"
          check-on-click-node
          :expand-on-click-node="false"
          @node-click="clickMoveOfficeHandle"
          @check="checkMoveOfficeHandle"
          check-strictly
          :default-expanded-keys="moveOfficeDefaultExpandedKeys"
          :default-checked-keys="[curClickOfficeId]">
        </el-tree>

        <div slot="footer" class="dialog-footer">
          <el-button :disabled="curCheckedMoveOfficeId===-1" type="primary" @click="move(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <!--反认证-->
      <template v-if="dialogInfo.key === 'anti'">
        <el-form :model="authForm" label-suffix=" *" label-width="100px" label-position="left">
          <el-form-item :label="$t('officeManager.certification')">
            <el-input v-model="authForm.authName" :placeholder="$t('officeManager.pleaseEnterServerAuthenticationName')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('officeManager.verificationCode')">
            <el-input v-model="authForm.authCode" :placeholder="$t('officeManager.pleaseEnterServerVerificationCode')"></el-input>
          </el-form-item>
        </el-form>

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
  import { setBFS } from '@/utils'
  import { mapGetters } from 'vuex'

  let id = 1000;
  let tree = [
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
      assignedPoints: 300, // 已分配点数
      totalPoints: 400, // 机构总点数
      deviceNumber: 100, // 设备数
      children: [{
        id: 6,
        label: '二级 2-1',
        pid: 5,
        children: [],
        assignedPoints: 100, // 已分配点数
        totalPoints: 100, // 机构总点数
        deviceNumber: 100, // 设备数
      }, {
        id: 7,
        label: '二级 2-2',
        pid: 5,
        assignedPoints: 200, // 已分配点数
        totalPoints: 220, // 机构总点数
        deviceNumber: 20, // 设备数
        children: [{
          id: 8,
          label: '三级 2-2-1',
          pid: 7,
          isWisdom: true,
          assignedPoints: 50, // 已分配点数
          totalPoints: 100, // 机构总点数
          deviceNumber: 20, // 设备数
          children: [{
            id: 9,
            label: '四级 2-2-1-1',
            pid: 8,
            assignedPoints: 10, // 已分配点数
            totalPoints: 10, // 机构总点数
            deviceNumber: 10, // 设备数
            children: [], // 叶子结点 [] 不能少
            openWisdomPid: 8,
          }, {
            id: 10,
            label: '四级 2-2-1-2',
            pid: 8,
            assignedPoints: 10, // 已分配点数
            totalPoints: 10, // 机构总点数
            deviceNumber: 10, // 设备数
            children: [],
            openWisdomPid: 8,
          }, {
            id: 11,
            label: '四级 2-2-1-3',
            pid: 8,
            assignedPoints: 10, // 已分配点数
            totalPoints: 10, // 机构总点数
            deviceNumber: 10, // 设备数
            children: [],
            openWisdomPid: 8,
          }]
        }, {
          id: 12,
          label: '三级 2-2-2',
          pid: 7,
          assignedPoints: 100, // 已分配点数
          totalPoints: 100, // 机构总点数
          deviceNumber: 100, // 设备数
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
      isNoAuth: true,
    }
  ];

  export default {
    name: 'officeManager',
    components: {  },
    data() {
      return {
        officeTree: JSON.parse(JSON.stringify(tree)),// 机构树
        officeTreeProps: {  // 机构树基本属性
          label: 'label',
          children: 'children'
        },
        subRoute_isPoints: false, // 判断当前是二级还是三级路由
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
        curCheckedMoveOfficeId: -1, // 移动机构树当前选中机构ID
        moveOfficeTree: null, // 移动机构树（同步officeTree）
        moveOfficeProps: { // 移动机构树的设置
          children: 'children',
          label: 'label'
        },
        authForm: { // 认证表单数据
          authName: '',
          authCode: ''
        },
        editOfficeName: '', // 修改名称表单数据
        editNameOfficeId: -1, // 修改名称的机构id
        subRoute: { // 子路由（分配点数）模块属性
          curOfficeInfo: null,
          curOfficeChildren: [],
          curOfficeParents: [],
        }
      }
    },
    computed: {
      ...mapGetters([
        'officeId',
        'officeName',
      ]),
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
      },
      moveOfficeDefaultExpandedKeys() {
        if (this.curClickOfficeInfo && this.curClickOfficeInfo.pid) {
          return [this.$refs.officeTree.getNode(this.curClickOfficeInfo.pid).data.id];
        } else {
          return [];
        }
      },
      isNoAuth() {
        // todo 根据根节点是否未认证
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.isNoAuth ? this.curClickOfficeInfo.isNoAuth : false;
      },
    },
    watch: {
      $route($r) {
        this.subRoute_isPoints = $r.name==='officeManager-distributionPoints'
      },
      filterText(val) {
        this.$refs.officeTree.filter(val);
      },
    },
    created() {
      this.subRoute_isPoints = this.$route.name==='officeManager-distributionPoints'
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
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }, 2000);
      },
      remove() {
        const loading = this.showLoading();

        setTimeout(() => {
          this.$refs['officeTree'].remove(this.curClickOfficeId);
          this.updateCurClickOffice(-1, null);
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }, 2000);
      },
      move() {
        const loading = this.showLoading();

        setTimeout(() => {
          this.curClickOfficeInfo.pid = this.curCheckedMoveOfficeId;
          this.$refs['officeTree'].remove(this.curClickOfficeId);
          this.$refs['officeTree'].append(this.curClickOfficeInfo, this.curCheckedMoveOfficeId);

          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }, 2000);
      },
      edit() {
        const loading = this.showLoading();

        setTimeout(() => {
          let editNode = this.$refs['officeTree'].getNode(this.editNameOfficeId).data
          editNode.label = this.editOfficeName

          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }, 2000);
      },
      anti() {
        const loading = this.showLoading();

        setTimeout(() => {
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationFailure'),
            type: 'error'
          });
        }, 2000);
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

        if (this.subRoute_isPoints) {
          if (this.subRoute.curOfficeInfo) {
            this.$confirm('此操作将退出并不保留数据, 是否继续?', '提示', {
              confirmButtonText: this.$t('common.confirm'),
              cancelButtonText: this.$t('common.cancel'),
              type: 'warning'
            }).then(() => {
              this.distributionPoints(d.id);
            }).catch(() => {
            });
          } else {
            this.distributionPoints(d.id);
          }
        }
      },
      clickCardHandle(info) {
        console.log('点了白板')
        if (!info || !info.id) return false;

        this.$refs.officeTree.setCurrentNode(info)
        this.updateCurClickOffice(info.id, info)
      },
      toggleDialogInfo(key, id) {
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
              title: this.$t('officeManager.serverAuthentication'),
              width: '35%',
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
        this.editNameOfficeId = id;
        console.log(`当前选中机构id：${this.curClickOfficeId}`)
      },
      showLoading(txt, target, isLock) {
        return this.$loading({
          text: txt || this.$t('common.processing'),
          target: target || '#appMain',
          lock: isLock || true,
        });
      },
      clickMoveOfficeHandle(data, node, component) {
        if (data.disabled) return false;

        let checkedList = this.$refs['moveOfficeTree'].getCheckedKeys();

        if (checkedList.indexOf(data.id) > -1) { // 已选 -> 去选
          this.updateMoveOfficeCurCheckedOffice([], -1);
        } else { // 无选 -> 选中
          this.updateMoveOfficeCurCheckedOffice([data.id], data.id);
        }
      },
      checkMoveOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['moveOfficeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反

        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.$refs['moveOfficeTree'].setCurrentKey(data.id);
          this.updateMoveOfficeCurCheckedOffice([data.id], data.id);
        } else { // 已选 -> 去选
          this.updateMoveOfficeCurCheckedOffice([], -1);
        }
      },
      openDialogHandle() {
        if (this.dialogInfo.key === 'move') {
          this.moveOfficeTree = JSON.parse(JSON.stringify(this.officeTree))

          this.$nextTick(() => {
            let resetTree = this.$refs['moveOfficeTree'].getNode(this.curClickOfficeId).data // 此处不能用 curClickOfficeInfo
            this.updateMoveOfficeCurCheckedOffice([this.curClickOfficeId], this.curClickOfficeId)
            this.$refs['moveOfficeTree'].setCurrentKey(this.curClickOfficeId)
            try {
              setBFS(resetTree, 'disabled', true, 'children', 'id', this.curClickOfficeId)
            } catch (err) {
              console.log('openDialogHandle', err)
            }
          })
        } else if (this.dialogInfo.key === 'edit') {
          let node = this.$refs['officeTree'].getNode(this.editNameOfficeId);

          if (node && node.data) {
            this.editOfficeName = node.data.label;
          } else {
            this.editOfficeName = '';
          }
        }
      },
      closeDialogHandle() {
        if (this.dialogInfo.key === 'move') {
        }
        this.dialogInfo.key = ''; // 重置移动机构树
      },
      updateMoveOfficeCurCheckedOffice(arr, id) {
        this.$refs['moveOfficeTree'].setCheckedKeys(arr);
        this.curCheckedMoveOfficeId = id;

        console.log(`当前移动机构树中选中的机构id是：${this.curCheckedMoveOfficeId}`)
      },
      distributionPoints(officeId) {
        let node = this.$refs['officeTree'].getNode(officeId);

        if (node && node.data) {
          try {
            this.subRoute = {
              curOfficeInfo: node.data,
              curOfficeChildren: node.data['children'] || [],
              curOfficeParents: this.getParentsOfficeInfo(node.data['pid']),
            };
            this.$refs['officeTree'].setCurrentKey(officeId);
            this.$router.push({ path: '/system/officeManager/distributionPoints', query: {
              officeId: officeId
            } });
          } catch (err) {
            console.log(`递归遍历父机构出错：${err}`)
          }
        } else {
          console.log(`无用机构id：${officeId}`)
        }
      },
      getParentsOfficeInfo(pid) {
        if (pid && this.$refs['officeTree'].getNode(pid)) {
          let curNode = this.$refs['officeTree'].getNode(pid).data;
          if (pid === curNode.pid) {
            console.log('机构树id重复，陷入死循环...');
            return [];
          }

          return [curNode].concat(this.getParentsOfficeInfo(curNode.pid))
        } else {
          return [];
        }
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

  .move-tree {
    @include scrollBar;
    width: 300px;
    min-height: 300px;
    max-height: 400px;
    overflow: auto;
    border: 1px solid #DCDFE6;
  }
}
</style>
