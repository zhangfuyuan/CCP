<template>
  <div class="officeManager-distributionPoints-wrapper">
    <!--顶部-->
    <div class="header">
      <!--左侧操作按钮-->
      <div class="btns">
        <el-button type="primary" @click="confirmHandle">{{$t('common.confirm')}}</el-button>
        <el-button plain @click="cancelHandle">{{$t('common.cancel')}}</el-button>
      </div>

      <!--右侧上级及可分配点数-->
      <div class="higher">
        <template v-if="isShowAllChildren || confirmForm.curOfficeParents.length > 0">
          <el-popover placement="bottom"
                      width="200"
                      trigger="click"
                      popper-class="officeManager-distributionPoints-wrapper-higher-popper">
            <div class="popover-content">
              <ul class="higher-list">
                <template v-if="isSubOpenIntelligentPointAllocation">
                  <li>{{curOfficeOpenIntelligentPointAllocationParent ? curOfficeOpenIntelligentPointAllocationParent.label : '--'}}</li>
                </template>

                <template v-else>
                  <li v-for="(item, index) in confirmForm.curOfficeParents" :key="index">
                    {{item.label}}
                  </li>
                  <li v-if="isShowAllChildren">{{confirmForm.curOfficeInfo.label}}</li>
                </template>
              </ul>
            </div>

            <el-button type="text" slot="reference" style="font-size: 16px;">{{$t('officeManager.superior')}}</el-button>
          </el-popover>

          <span>{{$t('officeManager.distributablePoints')}}</span> &nbsp;
          <span v-if="!isSubOpenIntelligentPointAllocation" style="color: #409EFF;font-size: 20px;">
            <span v-if="!isShowAllChildren">{{higherDistributablePoints}}</span>
            <span v-else>{{childrenHigherDistributablePoints}}</span>
          </span>
          <span v-else style="color: #409EFF;font-size: 20px;">
            {{curOfficeOpenIntelligentPointAllocationParent ? (curOfficeOpenIntelligentPointAllocationParent.totalPoints-curOfficeOpenIntelligentPointAllocationParent.assignedPoints) : '--'}}
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
                <span v-if="confirmForm.curOfficeInfo&&confirmForm.curOfficeInfo.isWisdom"
                      :title="$t('officeManager.intelligentAllocationPointsMode')">
                  <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                </span>
                  {{confirmForm.curOfficeInfo.label}}
                </div>

                <div class="info">
                  <div class="id">{{$t('officeManager.id')}} &nbsp; {{curOfficeId}}</div>

                  <div class="points">
                    {{$t('officeManager.distributablePoints')}} {{(confirmForm.curOfficeInfo.totalPoints||0) - (confirmForm.curOfficeInfo.assignedPoints||0)}} &nbsp;
                    {{$t('officeManager.assignedPoints')}} {{confirmForm.curOfficeInfo.assignedPoints||0}} &nbsp; | &nbsp;
                    {{$t('officeManager.deviceNumber')}} {{confirmForm.curOfficeInfo.deviceNumber||0}} &nbsp;
                  </div>
                </div>

                <div class="handle">
                  <div>
                  <span v-if="isSubOpenIntelligentPointAllocation" style="color: #409EFF;">
                    {{$t('officeManager.intelligentAllocationPointsMode')}}
                  </span>

                    <span v-else>
                    {{$t('officeManager.intelligentPointAllocation')}} &nbsp;
                    <el-switch v-model="confirmForm.curOfficeInfo.isWisdom"
                               @change="changeWisdomHandle"></el-switch>
                  </span>
                  </div>

                  <div>
                    {{$t('officeManager.mechanismTotalPoints')}} &nbsp;
                    <span v-if="isSubOpenIntelligentPointAllocation" style="color:#409EFF;font-size: 20px;padding-right: 20px;"> 0 </span>
                    <span v-else-if="confirmForm.curOfficeParents.length > 0">
                      <el-input-number size="small"
                                       :min="confirmForm.curOfficeInfo.assignedPoints"
                                       v-model="confirmForm.curOfficeInfo.totalPoints"
                                       :max="confirmForm.curOfficeInfo.totalPoints+higherDistributablePoints"
                                       @change="changePointsHandle(arguments, confirmForm.curOfficeInfo.assignedPoints, confirmForm.curOfficeInfo.totalPoints+higherDistributablePoints)"
                                       :key="confirmForm.curOfficeInfo.id"
                                       :name="confirmForm.curOfficeInfo.id + 'inputNumber'">
                      </el-input-number>
                    </span>
                    <span v-else style="color:#409EFF;font-size: 20px;padding-right: 20px;">
                      {{confirmForm.curOfficeInfo.totalPoints}}
                    </span>
                  </div>
                </div>
              </div>
            </el-card>

            <div class="next-level">
              <el-button type="info"
                         :disabled="confirmForm.curOfficeChildren.length===0 || confirmForm.curOfficeInfo.isWisdom"
                         @click="toggleShowAllChildren(true)">{{$t('officeManager.nextLevelMechanismPoints')}}
              </el-button>
            </div>
          </template>

          <template v-else>
            <el-card class="box-card" shadow="never" style="width: 60%;margin: 0 auto;">
              <div style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                {{$t('officeManager.pleaseSelectMechanism')}}
              </div>
            </el-card>
          </template>
        </template>

        <template v-else>
          <div class="children-box" v-if="confirmForm.curOfficeChildren.length > 0">
            <div class="children-box-header" style="margin-bottom: 20px;">
              <span style="font-size: 20px">{{confirmForm.curOfficeInfo.label}}</span>

              <el-button type="info" @click="toggleShowAllChildren(false)">{{$t('common.returnBtn')}}</el-button>
            </div>

            <div class="children-box-list">
              <el-card class="box-card children-card"
                       shadow="never"
                       v-for="(item, index) in confirmForm.curOfficeChildren"
                       :key="index">
                <div class="card-container">
                  <div class="name">
                    <span v-if="item.isWisdom" :title="$t('officeManager.intelligentAllocationPointsMode')">
                      <svg-icon icon-class="eglass-tag" style="cursor: pointer;" />
                    </span>
                    {{item.label}}
                  </div>

                  <div class="info">
                    <div class="id">{{$t('officeManager.id')}} &nbsp; {{item.id}}</div>

                    <div class="points">
                      {{$t('officeManager.assignedPoints')}} {{item.assignedPoints||0}} &nbsp; | &nbsp;
                      {{$t('officeManager.deviceNumber')}} {{item.deviceNumber||0}} &nbsp;
                    </div>
                  </div>

                  <div class="btns">
                    {{$t('officeManager.mechanismTotalPoints')}} &nbsp;
                    <el-input-number size="small"
                                     :min="item.assignedPoints"
                                     v-model="item.totalPoints"
                                     :max="childrenHigherDistributablePoints+item.totalPoints"
                                     @change="changePointsHandle(arguments, item.assignedPoints, childrenHigherDistributablePoints+item.totalPoints)"
                                     :key="item.id"
                                     :name="item.id + 'inputNumber'">
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
  import { getChildremByBFS } from '@/utils'

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
      }
    },
    computed: {
      curOfficeOpenIntelligentPointAllocationParent() {
        let data = null;

        if (this.isSubOpenIntelligentPointAllocation) {
          this.confirmForm.curOfficeParents.map((item) => {
            if (item.id === this.confirmForm.curOfficeInfo.openWisdomPid) {
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
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&(this.confirmForm.curOfficeInfo.openWisdomPid>-1);
      },
      curOfficeChildren(val) {
        // todo 用到 curOfficeChildren 子机构信息放这
        if (!val) return;

        this.confirmForm.curOfficeChildren = JSON.parse(JSON.stringify(val));
      },
      curOfficeParents(val) {
        // todo 用到 curOfficeParents 父机构信息放这
        if (!val) return;

        this.confirmForm.curOfficeParents = JSON.parse(JSON.stringify(val)).reverse();
        this.higherDistributablePoints = this.getHigherDistributablePoints();
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.totalPoints-this.confirmForm.curOfficeInfo.assignedPoints);
      }
    },
    created() {
      // todo 写在 created 钩子内的特别注意页面刷新后 null 数据的处理
      if (this.curOfficeInfo) {
        this.confirmForm = {
          curOfficeInfo: JSON.parse(JSON.stringify(this.curOfficeInfo)),
          curOfficeChildren: JSON.parse(JSON.stringify(this.curOfficeChildren)),
          curOfficeParents: JSON.parse(JSON.stringify(this.curOfficeParents)).reverse(),
        };
        this.isSubOpenIntelligentPointAllocation = (this.confirmForm.curOfficeInfo.openWisdomPid>-1);
        this.higherDistributablePoints = this.getHigherDistributablePoints();
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.totalPoints-this.confirmForm.curOfficeInfo.assignedPoints);
      }

      console.log('初始化...', this.confirmForm.curOfficeInfo)
    },
    mounted() {
    },
    methods: {
      getHigherDistributablePoints() {
        if (this.confirmForm.curOfficeParents.length===0 || !this.confirmForm.curOfficeParents[0].assignedPoints) return 0;

        return this.confirmForm.curOfficeParents.reduce((total, item) => {
          return total + (item.totalPoints - item.assignedPoints);
        }, 0)
      },
      changePointsHandle(args, min, max) {
        console.log('最后变更点数后', args, min, max);

        /**
         *  分配点数原则：
         *  1.谁动了机构总点数，谁的直属父机构的分配点数跟着同增同减，但其父总点数不变
         *
         *  args 是 element ui 自定义事件回调的参数数组，一共两个元素，第一个元素是新值，第二个元素是旧值
         * */

        let newVal = args[0];
        let oldVal = args[1];
        let diffVal = oldVal - newVal;
        let minVal = min;
        let maxVal = max + diffVal;

        if (this.isShowAllChildren) { // 子机构操作
          this.childrenHigherDistributablePoints += diffVal;

          if (!this.confirmForm.curOfficeInfo.totalPoints) return;

          if (diffVal > 0) { // 减操作
            console.log(`本机构回收分配点数${diffVal}`);
            // todo 子机构【减】总点数 -> 本机构【减】已分配数，总点数不变
            this.confirmForm.curOfficeInfo.assignedPoints -= diffVal;
          } else if (diffVal < 0) { // 加操作
            let absDiffVal = Math.abs(diffVal); //取绝对差值
            let curOfficeAvailPoints = this.confirmForm.curOfficeInfo.totalPoints - this.confirmForm.curOfficeInfo.assignedPoints;

            if (curOfficeAvailPoints >= absDiffVal) {
              console.log(`本机构分配出去点数${diffVal}`);
              // todo 子机构【加】总点数 -> 本机构有足够点数，则【加】已分配数，总点数不变
              this.confirmForm.curOfficeInfo.assignedPoints -= diffVal; //负负得正
            } else {
              // todo 子机构【加】总点数 -> 本机构没有足够点数，则【加】已分配数至等于总点数
              this.confirmForm.curOfficeInfo.assignedPoints = this.confirmForm.curOfficeInfo.totalPoints;

              let curOfficeDiffPoints = absDiffVal - curOfficeAvailPoints;
              this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map((item, index, arr) => {
                if (curOfficeDiffPoints > 0) {
                  if ((item.totalPoints-item.assignedPoints) >= curOfficeDiffPoints) {
                    console.log(`${item.label}机构分配出去点数${curOfficeDiffPoints}`);
                    // todo 子机构【加】总点数 -> 某父机构有足够点数，则【加】已分配数，总点数不变
                    item.assignedPoints += curOfficeDiffPoints;
                    // todo 子机构【加】总点数 -> 有足够点数的某父机构以下子机构以上的机构，则一级一级【加】已分配数和总点数
                    if (index > 0) {
                      for (let i=0; i<index; i++) {
                        arr[i].totalPoints += curOfficeDiffPoints;
                        arr[i].assignedPoints += curOfficeDiffPoints;
                      }
                    }
                    this.confirmForm.curOfficeInfo.totalPoints += curOfficeDiffPoints;
                    this.confirmForm.curOfficeInfo.assignedPoints += curOfficeDiffPoints;
                    curOfficeDiffPoints = 0;
                  } else {
                    console.log(`${item.label}机构分配出去点数${item.totalPoints - item.assignedPoints}`);
                    // todo 子机构【加】总点数 -> 某父机构没有足够点数，则【加】已分配数至等于总点数
                    curOfficeDiffPoints -= item.totalPoints - item.assignedPoints;
                    // todo 子机构【加】总点数 -> 没有足够点数的某父机构以下子机构以上的机构，则一级一级【加】已分配数和总点数
                    if (index > 0) {
                      for (let i=0; i<index; i++) {
                        arr[i].totalPoints += item.totalPoints - item.assignedPoints;
                        arr[i].assignedPoints += item.totalPoints - item.assignedPoints;
                      }
                    }
                    this.confirmForm.curOfficeInfo.totalPoints += item.totalPoints - item.assignedPoints;
                    this.confirmForm.curOfficeInfo.assignedPoints += item.totalPoints - item.assignedPoints;
                    item.assignedPoints = item.totalPoints;
                  }
                }
                return item;
              }).reverse();
            }
          }
        } else { // 本机构操作
          this.higherDistributablePoints += diffVal;

          if (!this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].totalPoints) return;

          if (diffVal > 0) { // 减操作
            console.log(`${this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].label}机构回收分配点数${diffVal}`);
            // todo 本机构【减】总点数 -> 直属父机构【减】已分配数，总点数不变
            this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].assignedPoints -= diffVal;
          } else if (diffVal < 0) { // 加操作
            let absDiffVal = Math.abs(diffVal); //取绝对差值

            this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map((item, index, arr) => {
              if (absDiffVal > 0) {
                if ((item.totalPoints-item.assignedPoints) >= absDiffVal) {
                  console.log(`${item.label}机构分配出去点数${absDiffVal}`);
                  // todo 本机构【加】总点数 -> 某父机构有足够点数，则【加】已分配数，总点数不变
                  item.assignedPoints += absDiffVal;
                  // todo 本机构【加】总点数 -> 有足够点数的某父机构以下本机构以上的机构，则一级一级【加】已分配数和总点数
                  if (index > 0) {
                    for (let i=0; i<index; i++) {
                      arr[i].totalPoints += absDiffVal;
                      arr[i].assignedPoints += absDiffVal;
                    }
                  }
                  absDiffVal = 0;
                } else {
                  console.log(`${item.label}机构怒减点数${item.totalPoints - item.assignedPoints}`);
                  // todo 本机构【加】总点数 -> 某父机构没有足够点数，则【加】已分配数至等于总点数
                  absDiffVal -= item.totalPoints - item.assignedPoints;
                  // todo 本机构【加】总点数 -> 没有足够点数的某父机构以下本机构以上的机构，则一级一级【加】已分配数和总点数
                  if (index > 0) {
                    for (let i=0; i<index; i++) {
                      arr[i].totalPoints += item.totalPoints - item.assignedPoints;
                      arr[i].assignedPoints += item.totalPoints - item.assignedPoints;
                    }
                  }
                  item.assignedPoints = item.totalPoints;
                }
              }
              return item;
            }).reverse();
          }
        }

        console.log('分配点数后：', this.confirmForm.curOfficeInfo, this.confirmForm.curOfficeParents)

        if (newVal >= maxVal) {
          this.$message({
            message: '警告哦，因上级机构点数不足，无法继续增加点数！',
            type: 'warning'
          });
        } else if (newVal <= minVal) {
          this.$message({
            message: '警告哦，因机构点数不能小于分配的点数，无法继续减少点数！',
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
          const loading = this.showLoading();

          setTimeout(() => {
            loading.close();
            this.$message({
              showClose: true,
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });

            this.$bus.emit('distribution-points', {
              curOfficeId: this.curOfficeId,
              curOfficeInfo: this.confirmForm.curOfficeInfo,
              bloodList: [
                ...this.confirmForm.curOfficeChildren,
                ...this.confirmForm.curOfficeParents
              ],
              sunList: this.curOfficeInfo.isWisdom===this.confirmForm.curOfficeInfo.isWisdom ?
                [] : [...this.confirmForm.curOfficeAllSun]
            });
            this.$router.push({ path: '/system/officeManager' });
          }, 2000);
        } else {
          this.$router.push({ path: '/system/officeManager' });
        }
      },
      cancelHandle() {
        this.$router.push({ path: '/system/officeManager' });
      },
      toggleShowAllChildren (isShow) {
        if (isShow) {
          this.isShowAllChildren = true;
          this.childrenHigherDistributablePoints = this.getHigherDistributablePoints() + (this.confirmForm.curOfficeInfo.totalPoints-this.confirmForm.curOfficeInfo.assignedPoints);
        } else {
          this.isShowAllChildren = false;
          this.higherDistributablePoints = this.getHigherDistributablePoints();
        }
      },
      changeWisdomHandle(val) {
        console.log(val)

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
          try {
            let allChildren =  getChildremByBFS(this.confirmForm.curOfficeInfo, 'children');

            // 将孙子及以下节点重置
            this.confirmForm.curOfficeAllSun = allChildren.slice(this.confirmForm.curOfficeChildren.length).map(item => {
              item.openWisdomPid = val ? +this.curOfficeId : -1;
              item.assignedPoints = 0;
              item.totalPoints = 0;
              return item;
            });
            // 仅将直属下级节点重置
            this.confirmForm.curOfficeChildren = this.confirmForm.curOfficeChildren.map(item => {
              item.openWisdomPid = val ? +this.curOfficeId : -1;
              item.assignedPoints = 0;
              item.totalPoints = 0;
              return item;
            });
            // 将本机构已分配点数归零
            this.confirmForm.curOfficeInfo.assignedPoints = 0;
            console.log('开启智能分配后所有孙+子节点重置', this.confirmForm.curOfficeAllSun, this.confirmForm.curOfficeChildren)
          } catch (err) {
            console.log(err)
          }
        }).catch(() => {
          this.confirmForm.curOfficeInfo.isWisdom = !this.confirmForm.curOfficeInfo.isWisdom;
        });
      },
      blurHandle(a, b) {
        console.log(a, b)
      },
      focusHandle(a, b) {
        console.log(a, b)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">

  /* reset element-ui css */
  .officeManager-distributionPoints-wrapper-higher-popper {
    margin-top: 0 !important;
    padding: 0 !important;
    .higher-list {
      padding: 0 30px !important;
      overflow: hidden !important;
    }
  }

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.officeManager-distributionPoints-wrapper {
  padding-right: 20px;
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #fff;
    border-bottom: 1px solid #DCDFE6;
    border-radius: 4px;
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
    height: 178px;
    margin-bottom: 20px;
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
      text-align: right;
      padding-top: 6px;
    }
  }

  .cur-card {
    width: 60%;
    height: 230px;
    margin: 0 auto;
    .name {
      padding: 5px 0 20px;
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

    .handle {
      width: 100%;
      height: 45px;
      line-height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 13px;
    }
  }

  .next-level {
    margin-top: 20px;
    text-align: right;
  }

  .children-box {
    width: 60%;
    margin: 0 auto;
  }

  .children-box-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .children-box-list {
    .children-card {
      width: 75%;
      margin-left: 25%;
    }
  }
}
</style>
