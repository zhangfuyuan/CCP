<template>
  <div class="officeManager-distributionPoints-wrapper">
    <!--顶部-->
    <div class="header">
      <!--左侧操作按钮-->
      <div class="btns">
        <el-button type="primary" @click="confirmHandle" style="width: 100px;">{{$t('common.confirm')}}</el-button>
        <el-button plain @click="cancelHandle" style="margin-left: 50px;width: 100px;">{{$t('common.cancel')}}</el-button>
      </div>

      <!--右侧上级及可分配点数-->
      <div class="higher" style="padding-right: 23px;">
        <template v-if="isShowAllChildren || confirmForm.curOfficeParents.length > 0">
          <el-popover placement="bottom"
                      width="200"
                      trigger="click"
                      popper-class="officeManager-distributionPoints-wrapper-higher-popper">
            <div class="popover-content">
              <ul class="higher-list">
                <template v-if="isSubOpenIntelligentPointAllocation">
                  <li>{{curOfficeOpenIntelligentPointAllocationParent ? curOfficeOpenIntelligentPointAllocationParent.name : '--'}}</li>
                </template>

                <template v-else>
                  <li v-for="(item, index) in confirmForm.curOfficeParents" :key="index">
                    {{item.name}}
                  </li>
                  <li v-if="isShowAllChildren">{{confirmForm.curOfficeInfo.name}}</li>
                </template>
              </ul>
            </div>

            <el-button type="text" slot="reference" style="font-size: 14px;">{{$t('officeManager.superior')}}</el-button>
          </el-popover>

          <span style="color: #666;">{{$t('officeManager.distributablePoints')}}</span> &nbsp;&nbsp;
          <span v-if="!isSubOpenIntelligentPointAllocation" style="color: #409EFF;font-size: 16px;">
            <span v-if="!isShowAllChildren">{{higherDistributablePoints}}</span>
            <span v-else>{{childrenHigherDistributablePoints}}</span>
          </span>
          <span v-else style="color: #409EFF;font-size: 14px;">
            {{curOfficeOpenIntelligentPointAllocationParent ? (curOfficeOpenIntelligentPointAllocationParent.terminalTotal-curOfficeOpenIntelligentPointAllocationParent.terminalAssigned) : '--'}}
          </span>
        </template>
      </div>
    </div>

    <!--操作内容-->
    <div class="container">
      <div class="container-wrapper" :style="{ 'height': containerHeight + 'px' }">
        <template v-if="!isShowAllChildren">
          <template v-if="confirmForm.curOfficeInfo">
            <!--当前机构点数信息-->
            <el-card class="box-card cur-card" shadow="always">
              <div class="card-container">
                <div class="name">
                <span v-if="confirmForm.curOfficeInfo&&confirmForm.curOfficeInfo.type===1"
                      :title="$t('officeManager.intelligentAllocationPointsMode')">
                  <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                </span>
                  {{confirmForm.curOfficeInfo.name}}
                </div>

                <div class="info">
                  <div class="id">{{$t('officeManager.id')}} &nbsp; {{confirmForm.curOfficeInfo.organizationCode}}</div>

                  <div class="points">
                    {{$t('officeManager.distributablePoints')}} {{(confirmForm.curOfficeInfo.terminalTotal||0) - (confirmForm.curOfficeInfo.terminalAssigned||0)}} &nbsp;
                    {{$t('officeManager.assignedPoints')}} {{confirmForm.curOfficeInfo.terminalAssigned||0}} &nbsp; | &nbsp;
                    {{$t('officeManager.deviceNumber')}} {{confirmForm.curOfficeInfo.terminalNum||0}} &nbsp;
                  </div>
                </div>

                <div class="handle">
                  <div>
                  <span v-if="isSubOpenIntelligentPointAllocation" style="color: #409EFF;">
                    {{$t('officeManager.intelligentAllocationPointsMode')}}
                  </span>

                    <span v-else>
                    {{$t('officeManager.intelligentPointAllocation')}} &nbsp;
                    <el-switch v-model="curOfficeIsWisdom"
                               @change="changeWisdomHandle"></el-switch>
                  </span>
                  </div>

                  <div>
                    {{$t('officeManager.mechanismTotalPoints')}} &nbsp;
                    <span v-if="isSubOpenIntelligentPointAllocation" style="color:#409EFF;font-size: 20px;padding-right: 20px;"> 0 </span>
                    <span v-else-if="confirmForm.curOfficeParents.length > 0">
                      <el-input-number size="small"
                                       :min="confirmForm.curOfficeInfo.terminalAssigned"
                                       v-model="confirmForm.curOfficeInfo.terminalTotal"
                                       :max="confirmForm.curOfficeInfo.terminalTotal+higherDistributablePoints"
                                       @change="changePointsHandle(arguments, confirmForm.curOfficeInfo.terminalAssigned, confirmForm.curOfficeInfo.terminalTotal+higherDistributablePoints, confirmForm.curOfficeInfo)"
                                       :key="confirmForm.curOfficeInfo.id"
                                       :name="confirmForm.curOfficeInfo.id + 'inputNumber'"
                                       :precision="0">
                      </el-input-number>
                    </span>
                    <span v-else style="color:#409EFF;font-size: 20px;padding-right: 20px;">
                      {{confirmForm.curOfficeInfo.terminalTotal}}
                    </span>
                  </div>
                </div>
              </div>
            </el-card>

            <div class="next-level">
              <el-button type="info"
                         :disabled="confirmForm.curOfficeChildren.length===0 || confirmForm.curOfficeInfo.type!==0"
                         @click="toggleShowAllChildren(true)">{{$t('officeManager.nextLevelMechanismPoints')}}
              </el-button>
            </div>
          </template>

          <template v-else>
            <el-card class="box-card" shadow="always" style="width: 538px;margin-top: 50px;">
              <div style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                {{$t('officeManager.pleaseSelectMechanism')}}
              </div>
            </el-card>
          </template>
        </template>

        <template v-else>
          <div class="children-box" v-if="confirmForm.curOfficeChildren.length > 0">
            <div class="children-box-header" style="margin-bottom: 20px;">
              <span style="font-size: 20px;color: #333;">{{confirmForm.curOfficeInfo.name}}</span>

              <el-button type="info" @click="toggleShowAllChildren(false)" style="width: 100px;">{{$t('common.returnBtn')}}</el-button>
            </div>

            <div class="children-box-list">
              <el-card class="box-card children-card"
                       shadow="always"
                       v-for="(item, index) in confirmForm.curOfficeChildren"
                       :key="index">
                <div class="card-container">
                  <div class="name">
                    <span v-if="item.type===1" :title="$t('officeManager.intelligentAllocationPointsMode')">
                      <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                    </span>
                    {{item.name}}
                  </div>

                  <div class="info">
                    <div class="id">{{$t('officeManager.id')}} &nbsp; {{item.id}}</div>

                    <div class="points">
                      {{$t('officeManager.assignedPoints')}} {{item.terminalAssigned||0}} &nbsp; | &nbsp;
                      {{$t('officeManager.deviceNumber')}} {{item.terminalNum||0}} &nbsp;
                    </div>
                  </div>

                  <div class="btns">
                    {{$t('officeManager.mechanismTotalPoints')}} &nbsp;
                    <el-input-number size="small"
                                     :min="item.terminalAssigned"
                                     v-model="item.terminalTotal"
                                     :max="childrenHigherDistributablePoints+item.terminalTotal"
                                     @change="changePointsHandle(arguments, item.terminalAssigned, childrenHigherDistributablePoints+item.terminalTotal, item)"
                                     :key="item.id"
                                     :name="item.id + 'inputNumber'"
                                     :precision="0">
                    </el-input-number>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import { getChildrenByBFS } from '@/utils'
  import { dealOffice } from '@/api/office'

  export default {
    name: 'officeManager-distributionPoints',
    components: {  },
    props: {
      curOfficeInfo: {
        type: Object,
        default: null,
      },
      curOfficeChildren: {
        type: Array,
        default: [],
      },
      curOfficeParents: {
        type: Array,
        default: [],
      },
    },
    data() {
      return {
        curOfficeId: this.$route.query.officeId, // 根据路由参数获取当前机构id
        isShowAllChildren: false, // 是否显示当前机构的所有下一级机构
        containerHeight: document.documentElement.clientHeight - 210, // 滚动最小高度
        isSubOpenIntelligentPointAllocation: false, // 是否子节点被动开启智能分配点数
        confirmForm: { // 另备份当前机构的相关信息
          curOfficeInfo: null, // 当前机构的数据
          curOfficeChildren: [], // 当前机构下一级的数据
          curOfficeParents: [], // 当前机构所有父级的数据
          curOfficeAllSun: [], // 当前机构所有孙子及以下节点的数据
        },
        higherDistributablePoints: 0, // 获取所有父级可分配点数（根据计数器可变）
        childrenHigherDistributablePoints: 0, // 获取子机构的所有父级可分配点数（当前机构+当前机构的所有父级总可分配点数）（根据计数器可变）
        curOfficeIsWisdom: false,
      }
    },
    computed: {
      curOfficeOpenIntelligentPointAllocationParent() {
        let data = null;

        if (this.isSubOpenIntelligentPointAllocation) {
          this.confirmForm.curOfficeParents.map((item) => {
            if (item.id === this.confirmForm.curOfficeInfo.intelligentOfficeId) {
              data = item;
            }
          })
        }

        return data;
      }
    },
    watch: {
      $route($r) {
        this.curOfficeId = $r.query.officeId
        this.isShowAllChildren = false
      },
      curOfficeInfo(val) {
        // todo 用到 curOfficeInfo 当前机构信息放这
        console.log('切换分配点数的当前机构', val)

        if (!val) return;

        this.confirmForm.curOfficeInfo = JSON.parse(JSON.stringify(val));
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo.type===2;
        this.curOfficeIsWisdom = this.confirmForm.curOfficeInfo.type===1;
        this.confirmForm.curOfficeInfo.oldTerminalTotal = this.confirmForm.curOfficeInfo.terminalTotal;
        this.confirmForm.curOfficeInfo.oldTerminalAssigned = this.confirmForm.curOfficeInfo.terminalAssigned;
      },
      curOfficeChildren(val) {
        // todo 用到 curOfficeChildren 子机构信息放这
        if (!val) return;

        this.confirmForm.curOfficeChildren = JSON.parse(JSON.stringify(val));
        this.confirmForm.curOfficeInfo.oldTerminalAssigned = this.curOfficeInfo.terminalAssigned;
        this.confirmForm.curOfficeChildren = this.confirmForm.curOfficeChildren.map(item => {
          item.oldTerminalTotal = item.terminalTotal;
          item.oldTerminalAssigned = item.terminalAssigned;
          return item;
        });
      },
      curOfficeParents(val) {
        // todo 用到 curOfficeParents 父机构信息放这
        if (!val) return;

        this.confirmForm.curOfficeParents = JSON.parse(JSON.stringify(val)).reverse();
        this.higherDistributablePoints = this.getHigherDistributablePoints();
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.terminalTotal-this.confirmForm.curOfficeInfo.terminalAssigned);
        this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.map(item => {
          item.oldTerminalTotal = item.terminalTotal;
          item.oldTerminalAssigned = item.terminalAssigned;
          return item;
        });
      },
    },
    created() {
      // todo 写在 created 钩子内的特别注意页面刷新后 null 数据的处理
      if (this.curOfficeInfo) {
        this.confirmForm = {
          curOfficeInfo: JSON.parse(JSON.stringify(this.curOfficeInfo)),
          curOfficeChildren: JSON.parse(JSON.stringify(this.curOfficeChildren)),
          curOfficeParents: JSON.parse(JSON.stringify(this.curOfficeParents)).reverse(),
          curOfficeAllSun: []
        };
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo.type===2;
        this.higherDistributablePoints = this.getHigherDistributablePoints();
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.terminalTotal-this.confirmForm.curOfficeInfo.terminalAssigned);
        this.curOfficeIsWisdom = this.confirmForm.curOfficeInfo.type===1;
        this.confirmForm.curOfficeInfo.oldTerminalTotal = this.curOfficeInfo.terminalTotal;
        this.confirmForm.curOfficeInfo.oldTerminalAssigned = this.curOfficeInfo.terminalAssigned;
        this.confirmForm.curOfficeChildren = this.confirmForm.curOfficeChildren.map(item => {
          item.oldTerminalTotal = item.terminalTotal;
          item.oldTerminalAssigned = item.terminalAssigned;
          return item;
        });
        this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.map(item => {
          item.oldTerminalTotal = item.terminalTotal;
          item.oldTerminalAssigned = item.terminalAssigned;
          return item;
        });
      }

      console.log('初始化...', this.confirmForm.curOfficeInfo)
    },
    mounted() {
    },
    methods: {
      getHigherDistributablePoints() {
        if (this.confirmForm.curOfficeParents.length===0) return 0;

        return this.confirmForm.curOfficeParents.reduce((total, item) => {
          return total + (item.terminalTotal - item.terminalAssigned);
        }, 0)
      },
      changePointsHandle(args, min, max, obj) {
        console.log('最后变更点数后', args, min, max);
        this.$bus.emit('distribution-points-operated', true);

        /**
         *  分配点数原则：
         *  1.谁动了机构总点数，谁的直属父机构的分配点数跟着同增同减，但其父总点数不变
         *
         *  args 是 element ui 自定义事件回调的参数数组，一共两个元素，第一个元素是新值，第二个元素是旧值
         * */

        let newVal = args[0];
        let oldVal = args[1];

        if (!newVal && newVal!==0) {
          newVal = min;
          let diffVal = oldVal - newVal;
          let minVal = min;
          let maxVal = max + diffVal;

          this.$nextTick(() => {
            obj.terminalTotal = min;
            this.changePoints(diffVal, newVal, maxVal, minVal);
          })
        } else {
          let diffVal = oldVal - newVal;
          let minVal = min;
          let maxVal = max + diffVal;

          this.changePoints(diffVal, newVal, maxVal, minVal);
        }
      },
      changePoints(diffVal, newVal, maxVal, minVal) {
        if (this.isShowAllChildren) { // 子机构操作
          this.childrenHigherDistributablePoints += diffVal;

          if (diffVal > 0) { // 减操作
            console.log(`本机构回收分配点数${diffVal}`);
            // todo 子机构【减】总点数 -> 本机构【减】已分配数，总点数不变
            this.confirmForm.curOfficeInfo.terminalAssigned -= diffVal;
          } else if (diffVal < 0) { // 加操作
            let absDiffVal = Math.abs(diffVal); //取绝对差值
            let curOfficeAvailPoints = this.confirmForm.curOfficeInfo.terminalTotal - this.confirmForm.curOfficeInfo.terminalAssigned;

            if (curOfficeAvailPoints >= absDiffVal) {
              console.log(`本机构分配出去点数${diffVal}`);
              // todo 子机构【加】总点数 -> 本机构有足够点数，则【加】已分配数，总点数不变
              this.confirmForm.curOfficeInfo.terminalAssigned -= diffVal; //负负得正
            } else {
              // todo 子机构【加】总点数 -> 本机构没有足够点数，则【加】已分配数至等于总点数
              this.confirmForm.curOfficeInfo.terminalAssigned = this.confirmForm.curOfficeInfo.terminalTotal;

              let curOfficeDiffPoints = absDiffVal - curOfficeAvailPoints;
              this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map((item, index, arr) => {
                if (curOfficeDiffPoints > 0) {
                  if ((item.terminalTotal-item.terminalAssigned) >= curOfficeDiffPoints) {
                    console.log(`${item.name}机构分配出去点数${curOfficeDiffPoints}`);
                    // todo 子机构【加】总点数 -> 某父机构有足够点数，则【加】已分配数，总点数不变
                    item.terminalAssigned += curOfficeDiffPoints;
                    // todo 子机构【加】总点数 -> 有足够点数的某父机构以下子机构以上的机构，则一级一级【加】已分配数和总点数
                    if (index > 0) {
                      for (let i=0; i<index; i++) {
                        arr[i].terminalTotal += curOfficeDiffPoints;
                        arr[i].terminalAssigned += curOfficeDiffPoints;
                      }
                    }
                    this.confirmForm.curOfficeInfo.terminalTotal += curOfficeDiffPoints;
                    this.confirmForm.curOfficeInfo.terminalAssigned += curOfficeDiffPoints;
                    curOfficeDiffPoints = 0;
                  } else {
                    console.log(`${item.name}机构分配出去点数${item.terminalTotal - item.terminalAssigned}`);
                    // todo 子机构【加】总点数 -> 某父机构没有足够点数，则【加】已分配数至等于总点数
                    curOfficeDiffPoints -= item.terminalTotal - item.terminalAssigned;
                    // todo 子机构【加】总点数 -> 没有足够点数的某父机构以下子机构以上的机构，则一级一级【加】已分配数和总点数
                    if (index > 0) {
                      for (let i=0; i<index; i++) {
                        arr[i].terminalTotal += item.terminalTotal - item.terminalAssigned;
                        arr[i].terminalAssigned += item.terminalTotal - item.terminalAssigned;
                      }
                    }
                    this.confirmForm.curOfficeInfo.terminalTotal += item.terminalTotal - item.terminalAssigned;
                    this.confirmForm.curOfficeInfo.terminalAssigned += item.terminalTotal - item.terminalAssigned;
                    item.terminalAssigned = item.terminalTotal;
                  }
                }
                return item;
              }).reverse();
            }
          }
        } else { // 本机构操作
          this.higherDistributablePoints += diffVal;

          if (diffVal > 0) { // 减操作
            console.log(`${this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].name}机构回收分配点数${diffVal}`);
            // todo 本机构【减】总点数 -> 直属父机构【减】已分配数，总点数不变
            this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].terminalAssigned -= diffVal;
          } else if (diffVal < 0) { // 加操作
            let absDiffVal = Math.abs(diffVal); //取绝对差值

            this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map((item, index, arr) => {
              if (absDiffVal > 0) {
                if ((item.terminalTotal-item.terminalAssigned) >= absDiffVal) {
                  console.log(`${item.name}机构分配出去点数${absDiffVal}`);
                  // todo 本机构【加】总点数 -> 某父机构有足够点数，则【加】已分配数，总点数不变
                  item.terminalAssigned += absDiffVal;
                  // todo 本机构【加】总点数 -> 有足够点数的某父机构以下本机构以上的机构，则一级一级【加】已分配数和总点数
                  if (index > 0) {
                    for (let i=0; i<index; i++) {
                      arr[i].terminalTotal += absDiffVal;
                      arr[i].terminalAssigned += absDiffVal;
                    }
                  }
                  absDiffVal = 0;
                } else {
                  console.log(`${item.name}机构怒减点数${item.terminalTotal - item.terminalAssigned}`);
                  // todo 本机构【加】总点数 -> 某父机构没有足够点数，则【加】已分配数至等于总点数
                  absDiffVal -= item.terminalTotal - item.terminalAssigned;
                  // todo 本机构【加】总点数 -> 没有足够点数的某父机构以下本机构以上的机构，则一级一级【加】已分配数和总点数
                  if (index > 0) {
                    for (let i=0; i<index; i++) {
                      arr[i].terminalTotal += item.terminalTotal - item.terminalAssigned;
                      arr[i].terminalAssigned += item.terminalTotal - item.terminalAssigned;
                    }
                  }
                  item.terminalAssigned = item.terminalTotal;
                }
              }
              return item;
            }).reverse();
          }
        }

        console.log('分配点数后：', this.confirmForm.curOfficeInfo, this.confirmForm.curOfficeParents);

        if (newVal >= maxVal) {
          this.$message({
            message: this.$t('officeManager.cannotContinueIncreasePointTips'),
            type: 'warning'
          });
        } else if (newVal <= minVal) {
          this.$message({
            message: this.$t('officeManager.cannotContinueReducePoints'),
            type: 'warning'
          });
        }
      },
      showLoading(txt, target, isLock) {
        return this.$loading({
          text: txt || this.$t('common.processing'),
          target: target || '#appMain',
          lock: isLock || true,
        });
      },
      confirmHandle() {
        if (!this.isSubOpenIntelligentPointAllocation && this.confirmForm.curOfficeInfo) { // 被动开启智能分配点数是没有进行任何操作，故无需更新
          this.confirmSubmit().then(() => {
            this.$router.push({ path: '/system/officeManager' });
          }).catch(() => {});
        } else {
          this.$router.push({ path: '/system/officeManager' });
        }
      },
      confirmSubmit() {
        const loading = this.showLoading();

        return new Promise((resolve, reject) => {
          let param =  [this.confirmForm.curOfficeInfo].concat(this.confirmForm.curOfficeChildren, this.confirmForm.curOfficeParents, this.confirmForm.curOfficeAllSun);

          param = param.map(item => {
            item.operation = 'modify';
            if (item.children) delete item.children; // 不带children
            return item;
          });

          console.log('分配点数参数：', param);
          dealOffice(param).then(res => {
            console.log(res);
            this.$bus.emit('distribution-points', {
              curOfficeId: this.curOfficeId,
              curOfficeInfo: this.confirmForm.curOfficeInfo,
              bloodList: [
                ...this.confirmForm.curOfficeChildren, // 直属下级机构
                ...this.confirmForm.curOfficeParents // 父及父以上机构
              ],
              sunList: this.curOfficeInfo.type===this.confirmForm.curOfficeInfo.type ?
                [] : [...this.confirmForm.curOfficeAllSun], // 孙及孙以下节点
            });

            loading.close();
            this.$message({
              showClose: true,
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
            resolve();
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
                    msg = d ? (': ' + d) : '';
                    break;
                }

                return this.$t('common.exception') + msg;
              })(err.msg, err.data),
              type: 'error'
            });
            reject(err);
          })
        });
      },
      cancelHandle() {
        this.$router.push({ path: '/system/officeManager' });
      },
      toggleShowAllChildren (isShow) {
        if (isShow) {
          this.isShowAllChildren = true;
          this.childrenHigherDistributablePoints = this.getHigherDistributablePoints() + (this.confirmForm.curOfficeInfo.terminalTotal-this.confirmForm.curOfficeInfo.terminalAssigned);
        } else {
          this.isShowAllChildren = false;
          this.higherDistributablePoints = this.getHigherDistributablePoints();
        }
      },
      changeWisdomHandle(val) {
        console.log(val)

        if (val) { // 关闭 -> 开启智能分配点数
          this.$msgbox({
            title: this.$t('common.notice'),
            message: this.$createElement('p', null, [
              this.$createElement('span', null, this.$t('officeManager.turnOnIntelligentPointAllocation')),
              this.$createElement('i', { style: 'color: #F56C6C' }, this.$t('officeManager.returnZero'))
            ]),
            showCancelButton: true,
            confirmButtonText: this.$t('common.confirm'),
            cancelButtonText: this.$t('common.cancel'),
          }).then(() => {
            this.confirmForm.curOfficeInfo.type = 1;
            this.curOfficeIsWisdom = this.confirmForm.curOfficeInfo.type===1;
            this.changeWisdomSubmit();
          }).catch(() => {
            this.confirmForm.curOfficeInfo.type = 0;
            this.curOfficeIsWisdom = this.confirmForm.curOfficeInfo.type===1;
          });
        } else { // 开启智能分配点数 -> 关闭
          this.confirmForm.curOfficeInfo.type = 0;
          this.curOfficeIsWisdom = this.confirmForm.curOfficeInfo.type===1;
          this.changeWisdomSubmit();
        }
      },
      changeWisdomSubmit() {
        this.$bus.emit('distribution-points-operated', true);

        try {
          let allChildren =  getChildrenByBFS(this.confirmForm.curOfficeInfo, 'children');

          // 将孙子及以下节点重置
          this.confirmForm.curOfficeAllSun = allChildren.slice(this.confirmForm.curOfficeChildren.length).map(item => {
            item.intelligentOfficeId = this.confirmForm.curOfficeInfo.type===1 ? this.curOfficeId : '';
            item.terminalAssigned = 0;
            item.terminalTotal = 0;
            item.type = this.curOfficeIsWisdom ? 2 : 0;
            return item;
          });
          // 仅将直属下级节点重置
          this.confirmForm.curOfficeChildren = this.confirmForm.curOfficeChildren.map(item => {
            item.intelligentOfficeId = this.confirmForm.curOfficeInfo.type===1 ? this.curOfficeId : '';
            item.terminalAssigned = 0;
            item.terminalTotal = 0;
            item.type = this.curOfficeIsWisdom ? 2 : 0;
            return item;
          });
          // 将本机构已分配点数归零
          this.confirmForm.curOfficeInfo.terminalAssigned = 0;
          console.log('开关智能分配后所有孙+子节点重置', this.confirmForm.curOfficeAllSun, this.confirmForm.curOfficeChildren)
        } catch (err) {
          console.log(err)
        }
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">

  /* reset element-ui css */
  .officeManager-distributionPoints-wrapper-higher-popper {
    margin-top: 0 !important;
    padding: 0 !important;
    .higher-list {
      padding: 10px 30px !important;
      overflow: hidden !important;
      list-style: disc;
    }
  }

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.officeManager-distributionPoints-wrapper {
  width: 538px;
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .container {
    width: 100%;
    overflow: hidden;
    .container-wrapper {
      @include scrollBar;
      width: 100%;
      overflow: auto;
    }
  }


  .box-card {
    width: 388px;
    margin-bottom: 15px;
    height: 148px;
    position: relative;
    overflow: inherit;
    .text {
      font-size: 14px;
    }
    .item {
      padding: 18px 0;
    }
  }

  .card-container {
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
      text-align: right;
      .el-button {
        font-size: 16px;
      }
    }
  }

  .cur-card {
    margin-top: 50px;
    width: 538px;
    height: 170px;
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

    .handle {
      font-size: 16px;
      width: 100%;
      height: 45px;
      line-height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
    }
  }

  .next-level {
    margin-top: 30px;
    text-align: right;
  }

  .children-box {
    width: 440px;
    margin-top: 28px;
  }

  .children-box-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    &::after {
      content: url(../../../assets/img/arrow.png);
      width: 31px;
      height: 29px;
      position: absolute;
      left: 10px;
      bottom: -29px;
    }
  }

  .children-box-list {
    width: 100%;
    margin-left: 53px;
  }
}
</style>
