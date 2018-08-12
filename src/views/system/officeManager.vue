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
               :default-expanded-keys="[officeTree ? officeTree[0].id : officeId]"
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
          <span v-if="data.type===1" :title="$t('officeManager.intelligentAllocationPointsMode')">
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
      <div style="margin-bottom: 30px;" v-if="!isSubRoute">
        <span style="color: #409EFF;font-size: 16px;">
          <svg-icon icon-class="eglass-tag" style="font-size: 16px;cursor: pointer;" /> {{$t('officeManager.intelligentAllocationPointsMode')}}
        </span>
      </div>

      <div v-if="isNoAuth && !isSubRoute"
           style="width: 538px;margin: 0 0 10px;border: 1px solid #F56C6C;display: flex;align-items: center;justify-content: space-between;cursor: pointer;border-radius: 4px;background-color: #fff;padding: 0 10px;"
           @click="toggleDialogInfo('verify')">
        <span>
          <i class="el-icon-warning" style="color: #F56C6C;"></i>
          {{$t('officeManager.serverNotCertified')}}
        </span>

        <el-button type="text">{{$t('officeManager.certificationImmediately')}}</el-button>
      </div>

      <div class="view-tree" v-if="!isSubRoute">
        <template v-if="curClickOfficeId && curClickOfficeInfo">
          <template v-if="curClickOfficeParentInfo">
            <el-card class="box-card parent-card" shadow="always" style="margin-bottom: 30px;">
              <div class="card-container" @click.stop.prevent="clickCardHandle(curClickOfficeParentInfo)">
                <div class="name">
                  <span v-if="curClickOfficeParentInfo.type===1" :title="$t('officeManager.intelligentAllocationPointsMode')">
                    <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                  </span>
                  {{curClickOfficeParentInfo.name}}
                </div>

                <div class="info">
                  <div class="id">{{$t('officeManager.id')}} &nbsp;{{curClickOfficeParentInfo.organizationCode}}</div>

                  <div class="points">
                    {{$t('officeManager.mechanismTotalPoints')}} {{curClickOfficeParentInfo.terminalTotal||0}}
                    &nbsp; | &nbsp;
                    {{$t('officeManager.deviceNumber')}} {{curClickOfficeParentInfo.terminalNum||0}}
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
                             v-if="!isNoAuth && curClickOfficeParentInfo.id===officeId"
                             @click="verify(true)">{{$t('officeManager.refreshCertification')}}
                  </el-button>
                  <el-button type="text"
                             v-if="isNoAuth && curClickOfficeParentInfo.id===officeId"
                             @click="toggleDialogInfo('verify')">{{$t('officeManager.authentication')}}
                  </el-button>
                </div>
              </div>
            </el-card>
          </template>

          <el-card class="box-card cur-card"
                   shadow="always"
                   style="width: 538px;height: 170px;margin-bottom: 30px;">
            <div class="card-container">
              <div class="name">
                <span v-if="curClickOfficeInfo.type===1" :title="$t('officeManager.intelligentAllocationPointsMode')">
                  <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                </span>
                {{curClickOfficeInfo.name}}
              </div>

              <div class="info">
                <div class="id">{{$t('officeManager.id')}} &nbsp;{{curClickOfficeInfo.organizationCode}}</div>

                <div class="points">
                  {{$t('officeManager.mechanismTotalPoints')}} {{curClickOfficeInfo.terminalTotal||0}} =
                  {{$t('officeManager.distributablePoints')}} {{(curClickOfficeInfo.terminalTotal||0) - (curClickOfficeInfo.terminalAssigned||0)}} +
                  {{$t('officeManager.assignedPoints')}} {{curClickOfficeInfo.terminalAssigned||0}}
                  &nbsp; | &nbsp;
                  {{$t('officeManager.deviceNumber')}} {{curClickOfficeInfo.terminalNum||0}}
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
                           :disabled="isNoAuth"
                           v-if="curClickOfficeInfo.id!==officeId">{{$t('common.move')}}
                </el-button>
                <el-button type="text"
                           :style="{ color: isNoAuth ? '#c0c4cc' : '#F56C6C' }"
                           @click.stop.prevent="toggleDialogInfo('remove')"
                           :disabled="isNoAuth"
                           v-if="curClickOfficeInfo.id!==officeId">{{$t('common.delete')}}
                </el-button>
                <el-button type="text"
                           v-if="!isNoAuth && curClickOfficeInfo.id===officeId"
                           @click="verify(true)">{{$t('officeManager.refreshCertification')}}
                </el-button>
                <el-button type="text"
                           v-if="isNoAuth && curClickOfficeInfo.id===officeId"
                           @click="toggleDialogInfo('verify')">{{$t('officeManager.authentication')}}
                </el-button>
                <el-button type="text"
                           v-if="!isNoAuth && curClickOfficeInfo.id===officeId"
                           :style="{ color: isNoAuth ? '#c0c4cc' : '#F56C6C' }"
                           @click="toggleDialogInfo('anti')">{{$t('officeManager.anti')}}
                </el-button>
              </div>
            </div>
          </el-card>

          <template v-if="curClickOfficeChildren && curClickOfficeChildren.length>0">
            <div class="view-tree-children" style="width: 100%;">
              <el-card class="box-card children-card"
                       shadow="always"
                       v-for="(item, index) in curClickOfficeChildren"
                       :key="index"
                       :style="{ 'margin-left': curClickOfficeParentInfo ? '100px' : '50px'}">
                <div class="card-container" @click.stop.prevent="clickCardHandle(item)">
                  <div class="name">
                    <span v-if="item.type===1" :title="$t('officeManager.intelligentAllocationPointsMode')">
                      <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                    </span>
                    {{item.name}}
                  </div>

                  <div class="info">
                    <div class="id">{{$t('officeManager.id')}} &nbsp;{{item.organizationCode}}</div>

                    <div class="points">
                      {{$t('officeManager.mechanismTotalPoints')}} {{item.terminalTotal||0}}
                      &nbsp; | &nbsp;
                      {{$t('officeManager.deviceNumber')}} {{item.terminalNum||0}}
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
          <el-card class="box-card" shadow="always" style="width: 538px;height: 170px;">
            <div style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
              {{$t('officeManager.pleaseSelectMechanism')}}
            </div>
          </el-card>
        </template>
      </div>

      <router-view :curOfficeInfo="subRoute.curOfficeInfo"
                   :curOfficeChildren="subRoute.curOfficeChildren"
                   :curOfficeParents="subRoute.curOfficeParents"
                   ref="subRoute"></router-view>
    </div>

    <!--对话弹框-->
    <el-dialog :title="dialogInfo.title"
               :visible.sync="isShowDialog"
               :width="dialogInfo.width"
               @open="openDialogHandle"
               @close="closeDialogHandle"
               :close-on-click-modal="false">
      <!--新建子机构-->
      <template v-if="dialogInfo.key === 'new'">
        <div>
          <el-input v-model="newOfficeForm.name"
                    :placeholder="$t('officeManager.organizationNameNotExceed24')"
                    :maxlength="24"
                    :autofocus="true"></el-input>
        </div>
        <div v-if="!isNoAuth && curClickOfficeInfo.type===0"
             style="display: flex;justify-content: space-between;align-items: center;color: #606266;padding-top: 20px;font-size: 16px;">
          <span>
            {{$t('officeManager.distributablePoints')}}: &nbsp; <span style="color: #409EFF;">{{newInputTotalNumber}}</span>
          </span>

          <span>
            <el-input-number size="small"
                             v-model="newOfficeForm.inputNumberVal"
                             :min="0"
                             :max="newInputTotalNumber"
                             @change="changePointsToNewOfficeHandle"
                             :precision="0"></el-input-number>
          </span>
        </div>
        <div v-if="!isNoAuth && curClickOfficeInfo.type!==0" style="color: #909399;padding-top: 20px;">
          {{$t('officeManager.intelligentAllocationPointsMode')}}
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary"
                     @click="append(), isShowDialog = false"
                     :disabled="!newOfficeForm.name || (!newOfficeForm.inputNumberVal&&newOfficeForm.inputNumberVal!==0)" >{{$t('common.confirm')}}</el-button>
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
        <el-input v-model="editOfficeName" :maxlength="24" :placeholder="$t('officeManager.organizationNameNotExceed24')"></el-input>

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
          :default-expanded-keys="moveOfficeDefaultExpandedKeys">
        </el-tree>

        <div style="color: #999;font-size: 12px;">* {{$t('officeManager.moveOfficeTips')}}</div>

        <div slot="footer" class="dialog-footer">
          <el-button :disabled="!curCheckedMoveOfficeId" type="primary" @click="move(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <!--认证-->
      <template v-if="dialogInfo.key === 'verify'">
        <el-form :model="authForm" label-suffix=" *" label-width="100px" label-position="left">
          <el-form-item :label="$t('officeManager.certification')">
            <el-input v-model="authForm.officeUserName" :placeholder="$t('officeManager.pleaseEnterServerAuthenticationName')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('officeManager.verificationCode')">
            <el-input v-model="authForm.verificationCode" :placeholder="$t('officeManager.pleaseEnterServerVerificationCode')"></el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="verify(), isShowDialog = false">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
        </div>
      </template>

      <!--反认证-->
      <template v-if="dialogInfo.key === 'anti'">
        <span>{{$t('officeManager.afterAnti')}}</span>

        <div slot="footer" class="dialog-footer">
          <el-button @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
          <el-button type="danger" plain @click="anti(), isShowDialog = false">{{$t('officeManager.anti')}}</el-button>
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
  import { setBFS, treeify, getChildrenByBFS } from '@/utils'
  import { mapGetters } from 'vuex'
  import { getOfficeList, updateVerification, cancelVerification, dealOffice } from '@/api/office'

  export default {
    name: 'officeManager',
    components: {  },
    data() {
      return {
        officeTree: null,// 机构树（但一定是个数组）
        officeTreeProps: {  // 机构树基本属性
          label: 'name',
          children: 'children'
        },
        isSubRoute: false, // 判断当前是二级还是三级路由（true为三级路由，即分配点数页面）
        treeHeight: document.documentElement.clientHeight - 210, // 初始化机构树高度
        filterText: '', // 搜索框的输入值
        isShowPopover: false, // Popover 是否可见
        curClickOfficeId: '', // 当前选中机构节点id
        curClickOfficeInfo: null, // 当前选中机构节点信息
        isClickMoreIcon: false, // 当前是否点击更多图标
        viewHeight: document.documentElement.clientHeight - 125, // 初始化右侧视图高度
        isShowDialog: false, // Dialog 是否可见
        dialogInfo: { // 公用 Dialog 显示信息
          key: '--',
          title: '--',
          width: '30%'
        },
        // 新建
        newOfficeForm: { // 新建子机构表单 newOfficeForm.inputNumberVal
          name: '',
          inputNumberVal: 0
        },
        g_loading: null, // loading 全局单例
        // 移动
        curCheckedMoveOfficeId: '', // 移动机构树当前选中机构ID
        moveOfficeTree: null, // 移动机构树（同步officeTree）（但一定是个数组）
        moveOfficeProps: { // 移动机构树的设置
          children: 'children',
          label: 'name'
        },
        // 认证
        authForm: { // 认证表单数据
          officeUserName: '',
          verificationCode: ''
        },
        // 修改
        editOfficeName: '', // 修改名称表单数据
        editNameOfficeId: '', // 修改名称的机构id
        subRoute: { // 子路由（分配点数）模块属性
          curOfficeInfo: null,
          curOfficeChildren: [],
          curOfficeParents: [],
        },
        subRoute_isOperated: false, // 子路由（分配点数）是否有进行任何操作
        isNoAuth: false,
        rootParentId: '',
      }
    },
    computed: {
      ...mapGetters([
        'officeId',
        'officeName',
      ]),
      curClickOfficeParentInfo() {
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.parentId&&this.$refs.officeTree.getNode(this.curClickOfficeInfo.parentId) ?
                this.$refs.officeTree.getNode(this.curClickOfficeInfo.parentId).data :
                null
      },
      curClickOfficeChildren() {
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.children ?
                this.curClickOfficeInfo.children :
                []
      },
      newInputTotalNumber() {
        return this.curClickOfficeInfo&&this.curClickOfficeInfo.terminalTotal ?
                this.curClickOfficeInfo.terminalTotal - this.curClickOfficeInfo.terminalAssigned:
                0;
      },
      moveOfficeDefaultExpandedKeys() {
        if (this.curClickOfficeInfo && this.curClickOfficeInfo.parentId) {
          return [this.$refs.officeTree.getNode(this.curClickOfficeInfo.parentId).data.id];
        } else {
          return [];
        }
      },
    },
    watch: {
      $route($r) {
        this.isSubRoute = $r.name==='officeManager-distributionPoints'
      },
      filterText(val) {
        this.$refs.officeTree.filter(val);
      },
    },
    created() {
      getOfficeList().then(res => {
        console.log(8126.1, res);

        if (res) {
          if (res.currentOffice.parentId) {
            this.rootParentId = res.currentOffice.parentId;
            delete res.currentOffice.parentId; // 不能有parentId
          }
          let arr = [res.currentOffice].concat(res.officeMsg);
          let tree = treeify(arr, 'id', 'parentId', 'children');
          tree.parentId = this.rootParentId;

          this.officeTree = JSON.parse(JSON.stringify([tree]))
          this.isNoAuth = !res.serverLicenseWarn;
          console.log(8126.2, arr, tree)
        }
      }).catch(err => {
        console.log(8126.3, err)
      });

      this.isSubRoute = this.$route.name==='officeManager-distributionPoints';

      this.$bus.on('distribution-points', this.updateDistributionPoints);
      this.$bus.on('distribution-points-operated', (isOperated) => {
        this.subRoute_isOperated = isOperated;
      });
    },
    mounted() {
    },
    beforeDestroy() {
      this.$bus.off('distribution-points', this.updateDistributionPoints);
      this.$bus.off('distribution-points-operated');
    },
    methods: {
      append() {
        const loading = this.showLoading();
        let newChild = {
          name: this.newOfficeForm.name,
          children: [],
          parentId: this.curClickOfficeId,
          terminalAssigned: 0, // 已分配点数
          terminalTotal: this.newOfficeForm.inputNumberVal, // 机构总点数
          terminalNum: 0, // 设备数（全上线）
          type: 0
        };
        if (this.curClickOfficeInfo.type===1) {
          newChild.intelligentOfficeId = this.curClickOfficeId;
          newChild.type = 2;
        }
        if (this.curClickOfficeInfo.type===2) {
          newChild.intelligentOfficeId = this.curClickOfficeInfo.intelligentOfficeId || this.curClickOfficeInfo.id; // todo 留个小坑
          newChild.type = 2;
        }

        let param_newChild = JSON.parse(JSON.stringify(newChild));
        param_newChild.operation = 'add';
        if (param_newChild.children) delete param_newChild.children; // 不带children

        let param_curClickOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeId).data));
        param_curClickOffice.oldTerminalTotal = param_curClickOffice.terminalTotal;
        param_curClickOffice.oldTerminalAssigned = param_curClickOffice.terminalAssigned;
        param_curClickOffice.terminalAssigned += newChild.terminalTotal;
        param_curClickOffice.operation = 'modify';
        if (param_curClickOffice.children) delete param_curClickOffice.children; // 不带children

        console.log('新建机构参数：', [param_newChild, param_curClickOffice]);
        dealOffice([param_newChild, param_curClickOffice]).then(res => {
          console.log(res);

          res.data.map(item => {
            if (item.operation === 'add') {
              newChild.id = item.id;
              newChild.organizationCode = item.organizationCode;
            }
          });
          this.$refs['officeTree'].append(newChild, this.curClickOfficeId);
          let curNode = this.$refs['officeTree'].getNode(this.curClickOfficeId).data;
          curNode.terminalAssigned += newChild.terminalTotal;
          this.updateCurClickOffice(this.curClickOfficeId, curNode);
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          loading.close();
          this.$message({
            showClose: true,
            message: ((m, d) => {
              let msg = '';
              switch (d) {
                case 'parentOfficeIsNull':
                  msg = ': ' +this.$t('officeManager.parentOfficeIsNull');
                  break;
                case 'officeIsNull':
                  msg = ': ' +this.$t('officeManager.officeIsNull');
                  break;
                case 'pointError':
                  msg = ': ' +this.$t('officeManager.pointError');
                  break;
                default:
                  msg = ': ' + this.$t('common.unknownError');
                  break;
              }

              return this.$t('common.exception') + msg;
            })(err.msg, err.data),
            type: 'error'
          });
        });
      },
      remove() {
        const loading = this.showLoading();

        let param_parentOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeInfo['parentId']).data));
        param_parentOffice.oldTerminalTotal = param_parentOffice.terminalTotal;
        param_parentOffice.oldTerminalAssigned = param_parentOffice.terminalAssigned;
        param_parentOffice.terminalAssigned -= this.curClickOfficeInfo.terminalTotal;
        param_parentOffice.operation = 'modify';
        if (param_parentOffice.children) delete param_parentOffice.children; // 不带children

        let param_curClickOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeId).data));
        param_curClickOffice.operation = 'del';
        if (param_curClickOffice.children) delete param_curClickOffice.children; // 不带children

        console.log('删除机构参数：', [param_parentOffice, param_curClickOffice]);
        dealOffice([param_parentOffice, param_curClickOffice]).then(res => {
          console.log(res);

          let parentNode = this.$refs['officeTree'].getNode(this.curClickOfficeInfo['parentId']).data;
          parentNode.terminalAssigned -= this.curClickOfficeInfo.terminalTotal;
          this.$refs['officeTree'].remove(this.curClickOfficeId);
          this.updateCurClickOffice('', null);
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          loading.close();
          this.$message({
            showClose: true,
            message: ((m, d) => {
              let msg = '';
              switch (d) {
                case 'parentOfficeIsNull':
                  msg = ': ' +this.$t('officeManager.parentOfficeIsNull');
                  break;
                case 'officeIsNull':
                  msg = ': ' +this.$t('officeManager.officeIsNull');
                  break;
                case 'pointError':
                  msg = ': ' +this.$t('officeManager.pointError');
                  break;
                default:
                  msg = ': ' + this.$t('common.unknownError');
                  break;
              }

              return this.$t('common.exception') + msg;
            })(err.msg, err.data),
            type: 'error'
          });
        });
      },
      move() {
        try {
          const loading = this.showLoading();

          let param_oldParentOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeInfo['parentId']).data));
          param_oldParentOffice.oldTerminalTotal = param_oldParentOffice.terminalTotal;
          param_oldParentOffice.oldTerminalAssigned = param_oldParentOffice.terminalAssigned;
          param_oldParentOffice.operation = 'modify';
          param_oldParentOffice.terminalAssigned -= this.curClickOfficeInfo.terminalTotal;
          if (param_oldParentOffice.children) delete param_oldParentOffice.children; // 不带children

          let param_curClickOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeId).data));
          param_curClickOffice.oldTerminalTotal = param_curClickOffice.terminalTotal;
          param_curClickOffice.oldTerminalAssigned = param_curClickOffice.terminalAssigned;
          param_curClickOffice.operation = 'modify';
          param_curClickOffice.parentId = this.curCheckedMoveOfficeId;
          param_curClickOffice.terminalTotal = 0;
          param_curClickOffice.terminalAssigned = 0;
          if (param_curClickOffice.children) delete param_curClickOffice.children; // 不带children

          let param_allChildren =  getChildrenByBFS(this.$refs['officeTree'].getNode(this.curClickOfficeId).data, 'children');
          param_allChildren = param_allChildren.map(item => {
            item.oldTerminalTotal = item.terminalTotal;
            item.oldTerminalAssigned = item.terminalAssigned;
            item.operation = 'modify';
            item.terminalTotal = 0;
            item.terminalAssigned = 0;
            if (item.children) delete item.children; // 不带children
            return item;
          });

          console.log('移动机构参数：', [param_oldParentOffice, param_curClickOffice, ...param_allChildren]);
          dealOffice([param_oldParentOffice, param_curClickOffice, ...param_allChildren]).then(res => {
            console.log(res);

            let oldParentOffice = this.$refs['officeTree'].getNode(this.curClickOfficeInfo['parentId']).data;
            oldParentOffice.terminalAssigned -= this.curClickOfficeInfo.terminalTotal;

            let curClickOffice = this.$refs['officeTree'].getNode(this.curClickOfficeId).data;
            curClickOffice.parentId = this.curCheckedMoveOfficeId;
            curClickOffice.terminalTotal = 0;
            curClickOffice.terminalAssigned = 0;

            let allChildren = getChildrenByBFS(this.$refs['officeTree'].getNode(this.curClickOfficeId).data, 'children');
            let allChildrenLen = allChildren.length;
            for (let i=0; i<allChildrenLen; i++) {
              allChildren[i].terminalTotal = 0;
              allChildren[i].terminalAssigned = 0;
            }

            this.$refs['officeTree'].remove(this.curClickOfficeId);
            this.$refs['officeTree'].append(this.curClickOfficeInfo, this.curCheckedMoveOfficeId);
            this.updateCurClickOffice(this.curClickOfficeId, curClickOffice);

            loading.close();
            this.$message({
              showClose: true,
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
          }).catch(err => {
            console.log(err);

            loading.close();
            this.$message({
              showClose: true,
              message: ((m, d) => {
                let msg = '';
                switch (d) {
                  case 'parentOfficeIsNull':
                    msg = ': ' + this.$t('officeManager.parentOfficeIsNull');
                    break;
                  case 'officeIsNull':
                    msg = ': ' + this.$t('officeManager.officeIsNull');
                    break;
                  case 'pointError':
                    msg = ': ' + this.$t('officeManager.pointError');
                    break;
                  default:
                    msg = ': ' + this.$t('common.unknownError');
                    break;
                }

                return this.$t('common.exception') + msg;
              })(err.msg, err.data),
              type: 'error'
            });
          });
        } catch (error) {
          console.log(error)
        }
      },
      edit() {
        const loading = this.showLoading();

        let param_curClickOffice = JSON.parse(JSON.stringify(this.$refs['officeTree'].getNode(this.curClickOfficeId).data));
        param_curClickOffice.oldTerminalTotal = param_curClickOffice.terminalTotal;
        param_curClickOffice.oldTerminalAssigned = param_curClickOffice.terminalAssigned;
        param_curClickOffice.operation = 'modify';
        param_curClickOffice.name = this.editOfficeName;
        if (param_curClickOffice.children) delete param_curClickOffice.children; // 不带children

        console.log('修改机构名称参数：', [param_curClickOffice]);
        dealOffice([param_curClickOffice]).then(res => {
          console.log(res);

          let node = this.$refs['officeTree'].getNode(this.curClickOfficeId).data;
          node.name = this.editOfficeName;
          this.updateCurClickOffice(this.curClickOfficeId, node);
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          loading.close();
          this.$message({
            showClose: true,
            message: ((m, d) => {
              let msg = '';
              switch (d) {
                case 'parentOfficeIsNull':
                  msg = ': ' + this.$t('officeManager.parentOfficeIsNull');
                  break;
                case 'officeIsNull':
                  msg = ': ' + this.$t('officeManager.officeIsNull');
                  break;
                case 'pointError':
                  msg = ': ' + this.$t('officeManager.pointError');
                  break;
                default:
                  msg = ': ' + this.$t('common.unknownError');
                  break;
              }

              return this.$t('common.exception') + msg;
            })(err.msg, err.data),
            type: 'error'
          });
        });
      },
      anti() {
        const loading = this.showLoading();

        cancelVerification().then(res => {
          console.log(res);

          this.$refs['officeTree'].getNode(this.officeId).data.terminalTotal = res.terminalTotal;
          this.$refs['officeTree'].getNode(this.officeId).data.terminalAssigned = res.terminalAssigned;
          this.$refs['officeTree'].getNode(this.officeId).data.serverLicenseWarn = res.serverLicenseWarn;
          this.isNoAuth = !res.serverLicenseWarn;
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          loading.close();
          this.$message({
            showClose: true,
            message: ((m, d) => {
              let msg = '';
              switch (d) {
                case 'officeNameIsNull':
                  msg = ': ' + this.$t('officeManager.organizationNameEmpty');
                  break;
                case 'verificationCodeIsNull':
                  msg = ': ' + this.$t('officeManager.authenticationCodeIsEmpty');
                  break;
                default:
                  msg = ': ' + this.$t('common.unknownError');
                  break;
              }

              return this.$t('common.exception') + msg;
            })(err.msg, err.data),
            type: 'error'
          });
        });
      },
      verify(isRefresh) {
        const loading = this.showLoading();

        updateVerification(isRefresh ? {} : this.authForm).then(res => {
          console.log(res);

          this.$refs['officeTree'].getNode(this.officeId).data.terminalTotal = res.terminalTotal;
          this.$refs['officeTree'].getNode(this.officeId).data.terminalAssigned = res.terminalAssigned;
          this.$refs['officeTree'].getNode(this.officeId).data.serverLicenseWarn = res.serverLicenseWarn;
          this.isNoAuth = !res.serverLicenseWarn;
          loading.close();
          this.$message({
            showClose: true,
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }).catch(err => {
          console.log(err);

          loading.close();
          this.$message({
            showClose: true,
            message: ((m, d) => {
              let msg = '';
              switch (d) {
                case 'officeNameIsNull':
                  msg = ': ' + this.$t('officeManager.organizationNameEmpty');
                  break;
                case 'verification code error':
                  msg = ': ' + this.$t('officeManager.authenticationCodeIsEmpty');
                  break;
                default:
                  msg = ': ' + this.$t('common.unknownError');
                  break;
              }

              return this.$t('common.exception') + msg;
            })(err.msg, err.data),
            type: 'error'
          });
        });
      },
      filterNode(value, data) {
        if (!value) return true;

        return (data['name'].indexOf(value)!==-1) || (data['organizationCode'].indexOf(value)!==-1);
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
        this.curClickOfficeId = id;
        this.curClickOfficeInfo = info;
      },
      clickNodeHandle(d, n, v) {
        this.updateCurClickOffice(d.id, d);
        console.log(this.curClickOfficeId, this.curClickOfficeInfo)
        if (!this.isClickMoreIcon) this.$refs['popoverBox'].doClose();

        if (this.isSubRoute) {
          if (this.subRoute.curOfficeInfo && this.subRoute.curOfficeInfo.id===this.curClickOfficeId) return;

          if (this.subRoute.curOfficeInfo && this.subRoute.curOfficeInfo.id!==this.curClickOfficeId && this.subRoute_isOperated) {
            this.$confirm(this.$t('officeManager.modifiedPointsSavedTips'), this.$t('common.notice'), {
              confirmButtonText: this.$t('common.confirm'),
              cancelButtonText: this.$t('common.cancel'),
              type: 'warning',
              showClose: false,
            }).then(() => {
              this.$refs['subRoute'].confirmSubmit().then(() => {
                this.distributionPoints(d.id);
              }).catch(()=>{});
            }).catch(() => {
              this.distributionPoints(d.id);
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
            };
            this.newOfficeForm = {
              name: '',
              inputNumberVal: 0
            };
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
              title: this.$t('officeManager.will') + ' ' + this.curClickOfficeInfo.name + ' ' + this.$t('officeManager.moveTo'),
              width: '40%',
            }
            break;
          case 'anti':
            this.dialogInfo = {
              key: key,
              title: this.$t('common.notice'),
              width: '30%',
            }
            break;
          case 'verify':
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
      },
      checkMoveOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['moveOfficeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反

        if (checkedList.indexOf(this.curClickOfficeId) > -1) {
          this.$message({
            message: this.$t('officeManager.cannotMoveToThisOffice'),
            type: 'warning'
          });
          this.$refs['moveOfficeTree'].setCheckedKeys([]);
          return false;
        }

        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.$refs['moveOfficeTree'].setCheckedKeys([data.id]);
          this.$refs['moveOfficeTree'].setCurrentKey(data.id);
          this.updateMoveOfficeCurCheckedOffice(data.id);
        } else { // 已选 -> 去选
          this.$refs['moveOfficeTree'].setCheckedKeys([]);
          this.updateMoveOfficeCurCheckedOffice('');
        }
      },
      openDialogHandle() {
        if (this.dialogInfo.key === 'move') {
          this.moveOfficeTree = JSON.parse(JSON.stringify(this.officeTree));

          this.$nextTick(() => {
            let resetTree = this.$refs['moveOfficeTree'].getNode(this.curClickOfficeId).data; // 此处不能用 curClickOfficeInfo

            this.$refs['moveOfficeTree'].setCheckedKeys([]);
            this.$refs['moveOfficeTree'].setCurrentKey(this.curClickOfficeId);
            this.updateMoveOfficeCurCheckedOffice('');
            try {
              setBFS(resetTree, 'disabled', true, 'children', 'id')
            } catch (err) {
              console.log('openDialogHandle', err)
            }
          })
        } else if (this.dialogInfo.key === 'edit') {
          let node = this.$refs['officeTree'].getNode(this.editNameOfficeId);

          if (node && node.data) {
            this.editOfficeName = node.data.name;
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
      updateMoveOfficeCurCheckedOffice(id) {
        this.curCheckedMoveOfficeId = id;

        console.log(`当前移动机构树中选中的机构id是：${this.curCheckedMoveOfficeId}`)
      },
      distributionPoints(officeId) {
        let node = this.$refs['officeTree'].getNode(officeId);

        if (node && node.data) {
          this.subRoute_isOperated = false;

          try {
            this.subRoute = {
              curOfficeInfo: node.data,
              curOfficeChildren: node.data['children'] || [],
              curOfficeParents: this.getParentsOfficeInfo(node.data['parentId']),
            };
            this.$refs['officeTree'].setCurrentKey(officeId);
            this.updateCurClickOffice(officeId, node.data);
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
      getParentsOfficeInfo(parentId) {
        if (parentId && this.$refs['officeTree'].getNode(parentId)) {
          let curNode = this.$refs['officeTree'].getNode(parentId).data;
          if (parentId === curNode.parentId) {
            console.log('机构树id重复，陷入死循环...');
            return [];
          }

          return [curNode].concat(this.getParentsOfficeInfo(curNode.parentId))
        } else {
          return [];
        }
      },
      updateDistributionPoints(params) {
        console.log('进行分配点数操作后的结果数组：', params)

        if (params) {
          let node = null;

          params.sunList.map(item => {
            node = this.$refs['officeTree'].getNode(item.id).data;
            node.terminalAssigned = item.terminalAssigned;
            node.terminalTotal = item.terminalTotal;
            node.intelligentOfficeId = item.intelligentOfficeId;
          });
          params.bloodList.map(item => {
            node = this.$refs['officeTree'].getNode(item.id).data;
            node.terminalAssigned = item.terminalAssigned;
            node.terminalTotal = item.terminalTotal;
            node.intelligentOfficeId = item.intelligentOfficeId || '';
          });
          node = this.$refs['officeTree'].getNode(params.curOfficeId).data;
          node.terminalAssigned = params.curOfficeInfo.terminalAssigned;
          node.terminalTotal = params.curOfficeInfo.terminalTotal;
          node.type = params.curOfficeInfo.type;

          this.updateCurClickOffice(params.curOfficeId, node);
        }
      },
      changePointsToNewOfficeHandle(val) {
        if (val >= this.newInputTotalNumber) {
          this.$message({
            message: this.$t('officeManager.cannotContinueIncreasePointTips'),
            type: 'warning'
          });
        } else if (val <= 0) {
          this.$message({
            message: this.$t('officeManager.cannotContinueReducePoints'),
            type: 'warning'
          });
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

    .el-card.is-always-shadow.cur-card {
      border: 2px solid rgba(65,185,255,.9);
    }

    .el-card__body {
      @include scrollBar;
      padding: 20px;
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      position: relative;
      /*background-color: #fff;*/
      /*border-radius: 4px;*/
    }

    .cur-card {
      .el-card__body {
        /*border: 2px solid rgba(65,185,255,.9);*/
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
    width: 300px;
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
    width: calc(100% - 300px);
    padding-left: 50px;
    overflow: auto;
  }

  .box-card {
    width: 388px;
    height: 148px;
    margin-bottom: 15px;
    position: relative;
    overflow: inherit;
    &:first-of-type {
      margin-left: 0;
    }

    &:nth-child(2) {
      margin-left: 50px;
    }

    &::before {
      content: url(../../assets/img/arrow.png);
      width: 31px;
      height: 29px;
      position: absolute;
      left: 10px;
      bottom: -39px;
    }

    &:first-of-type {
      &.parent-card::before {
        /*top: 50%;
        left: -25%;
        width: 75%;
        border-top: 3px solid #909399;
        border-left: 3px solid #909399;
        border-bottom: 3px solid #909399;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        height: calc(50% + 138px);*/
      }

      &.cur-card::before {
        /*top: 50%;
        left: -16.67% ;
        width: 50% ;
        border-top: 3px solid #909399;
        border-left: 3px solid #909399;
        border-bottom: 3px solid #909399;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        height: calc(50% + 112px);*/
      }

      &.cur-card + .view-tree-children {
        &>.children-card::before {
          /*top: 50%;
          left: -75%;
          width: 75%;
          border-top: 3px solid #909399;
          border-bottom: 3px solid #909399;
          border-left: 3px solid #909399;
          border-bottom-left-radius: 5px;
          border-top-left-radius: 5px;
          height: calc(50% + 112px);*/
        }
      }
    }

    &:nth-child(2) {
      &.cur-card::before {
        /*top: 50%;
        left: -33.33% ;
        width: 66.66% ;
        border-top: 2px solid #909399;
        border-bottom: 2px solid #909399;
        border-left: 2px solid #909399;
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
        height: calc(50% + 112px);*/
      }

      &.cur-card + .view-tree-children {
        &>.children-card::before {
          /*top: 50%;
          left: -100%;
          width: 100%;
          border-top: 2px solid #909399;
          border-bottom: 2px solid #909399;
          border-left: 2px solid #909399;
          border-bottom-left-radius: 5px;
          border-top-left-radius: 5px;
          height: calc(50% + 112px);*/
        }
      }
    }

    &:only-child::before {
      display: none;
    }

    &:last-of-type::before, &.children-card::before {
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
    font-size: 14px;
    .name {
      color: #333;
      margin-bottom: 8px;
    }

    .info {
      color: #666;
      .id {
        border-bottom: 1px solid #f5f5f5;
        padding-bottom: 4px;
        margin-bottom: 8px;
      }
    }

    .btns {
      margin-top: 3px;
      .el-button {
        font-size: 16px;
      }
    }
  }

  .cur-card {
    .card-container {
      cursor: auto;
    }
    .name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .info {
      .id {
        font-size: 16px;
        padding-bottom: 5px;
        margin-bottom: 10px;
      }
    }

    .btns {
      margin-top: 12px;
    }
  }

  .dialog-footer {
    text-align: left;
  }

  .move-tree {
    @include scrollBar;
    width: 350px;
    min-height: 350px;
    max-height: 500px;
    overflow: auto;
    border: 1px solid #DCDFE6;
    margin-bottom: 20px;
  }
}
</style>
