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
                    <el-switch v-model="confirmForm.curOfficeInfo.isWisdom" ></el-switch>
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
                                       @change="changePointsHandle"
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
                    <el-input-number size="small"
                                     :min="item.assignedPoints"
                                     v-model="item.totalPoints"
                                     :max="childrenHigherDistributablePoints+item.totalPoints"
                                     @change="changePointsHandle"
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
//        isOpenIntelligentPointAllocation: false, // 是否当前节点主动开启智能分配点数
        isSubOpenIntelligentPointAllocation: false, // 是否子节点被动开启智能分配点数
//        isOpenIPA: false, // 是否开启智能分配点数（无论主动或被动）
        confirmForm: { // 另备份当前机构的相关信息
          curOfficeInfo: null, // 当前机构的数据
          curOfficeChildren: [], // 当前机构下一级的数据
          curOfficeParents: [], // 当前机构所有父级的数据
        },
        higherDistributablePoints: 0, // 获取所有父级可分配点数（根据计数器可变）
//        curOfficeTotalPointsMax: 0, // 缓存一份当前机构总点数（定值）
        childrenHigherDistributablePoints: 0, // 获取子机构的所有父级可分配点数（当前机构+当前机构的所有父级总可分配点数）（根据计数器可变）
//        curOfficeChildrenTotalPointsMax: 0, // 缓存一份子机构总点数（当前机构+当前机构的所有父级总可分配点数）（定值）
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
//        this.isOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.isWisdom
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.openWisdomPid
//        this.isOpenIPA = this.isOpenIntelligentPointAllocation || this.isSubOpenIntelligentPointAllocation
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
        this.higherDistributablePoints = this.getHigherDistributablePoints()
//        this.curOfficeTotalPointsMax = (this.confirmForm.curOfficeInfo.totalPoints || 0) + this.higherDistributablePoints
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.totalPoints-this.confirmForm.curOfficeInfo.assignedPoints)
      }
    },
    created() {
      // todo 写在 created 钩子内的特别注意页面刷新后 null 数据的处理
      if (this.curOfficeInfo) {
        this.confirmForm = {
          curOfficeInfo: JSON.parse(JSON.stringify(this.curOfficeInfo)),
          curOfficeChildren: JSON.parse(JSON.stringify(this.curOfficeChildren)),
          curOfficeParents: JSON.parse(JSON.stringify(this.curOfficeParents)).reverse(),
        }
//        this.isOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo.isWisdom
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo.openWisdomPid
//        this.isOpenIPA = this.isOpenIntelligentPointAllocation || this.isSubOpenIntelligentPointAllocation
        this.higherDistributablePoints = this.getHigherDistributablePoints()
//        this.curOfficeTotalPointsMax = (this.confirmForm.curOfficeInfo.totalPoints||0) + this.higherDistributablePoints
        this.childrenHigherDistributablePoints = this.higherDistributablePoints + (this.confirmForm.curOfficeInfo.totalPoints-this.confirmForm.curOfficeInfo.assignedPoints)
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
      changePointsHandle(val, old) {
        console.log('最后变更的点数值', val, old);

        let diffVal = old - val;

        if (this.isShowAllChildren) {
          this.childrenHigherDistributablePoints += diffVal;

          if (!this.confirmForm.curOfficeInfo.totalPoints) return;

          if (diffVal > 0) {
            console.log(`本机构喜获点数${diffVal}`); //todo
            this.confirmForm.curOfficeInfo.totalPoints += diffVal;
          } else if (diffVal < 0) {
            let absDiffVal = Math.abs(diffVal); //取绝对差值
            let curOfficeAvailPoints = this.confirmForm.curOfficeInfo.totalPoints - this.confirmForm.curOfficeInfo.assignedPoints;

            if (curOfficeAvailPoints >= absDiffVal) {
              console.log(`本机构怒减点数${diffVal}`); //todo
              this.confirmForm.curOfficeInfo.totalPoints += diffVal;
            } else {
              let curOfficeDiffPoints = absDiffVal - curOfficeAvailPoints;

              this.confirmForm.curOfficeInfo.totalPoints = this.confirmForm.curOfficeInfo.assignedPoints;
              this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map(item => {
                if (curOfficeDiffPoints > 0) {
                  if ((item.totalPoints-item.assignedPoints) >= curOfficeDiffPoints) {
                    console.log(`${item.label}机构怒减点数${curOfficeDiffPoints}`); //todo
                    item.totalPoints -= curOfficeDiffPoints;
                    curOfficeDiffPoints = 0;
                  } else {
                    console.log(`${item.label}机构怒减点数${item.totalPoints - item.assignedPoints}`); //todo
                    curOfficeDiffPoints -= item.totalPoints - item.assignedPoints;
                    item.totalPoints = item.assignedPoints;
                  }
                }
                return item;
              }).reverse();
            }
          }
        } else {
          this.higherDistributablePoints += diffVal;

          if (!this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].totalPoints) return;

          if (diffVal > 0) {
            console.log(`${this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].label}机构喜获点数${diffVal}`); //todo
            this.confirmForm.curOfficeParents[this.confirmForm.curOfficeParents.length-1].totalPoints += diffVal;
          } else if (diffVal < 0) {
            let absDiffVal = Math.abs(diffVal); //取绝对差值

            this.confirmForm.curOfficeParents = this.confirmForm.curOfficeParents.reverse().map(item => {
              if (absDiffVal > 0) {
                if ((item.totalPoints-item.assignedPoints) >= absDiffVal) {
                  console.log(`${item.label}机构怒减点数${absDiffVal}`); //todo
                  item.totalPoints -= absDiffVal;
                  absDiffVal = 0;
                } else {
                  console.log(`${item.label}机构怒减点数${item.totalPoints - item.assignedPoints}`); //todo
                  absDiffVal -= item.totalPoints - item.assignedPoints;
                  item.totalPoints = item.assignedPoints;
                }
              }
              return item;
            }).reverse();
          }
        }

        console.log('分配点数后：', this.confirmForm.curOfficeInfo, this.confirmForm.curOfficeParents)
      },
      showLoading(txt, target, isLock) {
        return this.$loading({
          text: txt || this.$t('common.processing'),
          target: target || '#appMain',
          lock: isLock || true,
        });
      },
      confirmHandle() {
        if (!this.isSubOpenIntelligentPointAllocation) { // 被动开启智能分配点数是没有进行任何操作，故无需更新
          const loading = this.showLoading();

          setTimeout(() => {
            loading.close();
            this.$message({
              showClose: true,
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });

            this.$bus.emit('distribution-points', [
              this.confirmForm.curOfficeInfo,
              ...this.confirmForm.curOfficeChildren,
              ...this.confirmForm.curOfficeParents
            ]);
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
