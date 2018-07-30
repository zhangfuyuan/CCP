<template>
  <div class="officeManager-distributionPoints-wrapper">
    <div class="header">
      <div class="btns">
        <el-button type="primary">{{$t('common.confirm')}}</el-button>
        <el-button plain>{{$t('common.cancel')}}</el-button>
      </div>

      <div class="higher">
        <template v-if="confirmForm.curOfficeParents.length > 0">
          <el-popover placement="bottom"
                      width="200"
                      trigger="click">
            <div class="popover-content">
              <ul class="higher-list">
                <template v-if="isSubOpenIntelligentPointAllocation">
                  <li>{{curOfficeOpenIntelligentPointAllocationParent}}</li>
                </template>

                <template v-else>
                  <li v-for="(item, index) in confirmForm.curOfficeParents" :key="index">
                    {{item.label}}
                  </li>
                </template>
              </ul>
            </div>

            <el-button type="text" slot="reference">{{$t('officeManager.superior')}}</el-button>
          </el-popover>

          <span v-if="!isShowAllChildren">{{$t('officeManager.distributablePoints')}}</span>
          <span v-else>{{$t('officeManager.totalDistributablePoints')}}</span>
          &nbsp; {{higherDistributablePoints}}
        </template>
      </div>
    </div>

    <div class="container" :style="{ 'height': containerHeight + 'px' }">
      <template v-if="!isShowAllChildren">
        <template v-if="confirmForm.curOfficeInfo">
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
                  {{$t('officeManager.assignedPoints')}} {{confirmForm.curOfficeInfo.assignedPoints||0}} &nbsp;
                  {{$t('officeManager.deviceNumber')}} {{confirmForm.curOfficeInfo.deviceNumber||0}} &nbsp;
                </div>
              </div>

              <div class="handle">
                <div>
                  <span v-if="isSubOpenIntelligentPointAllocation" style="color: #409EFF;">
                    已开启智能分配点数模式
                  </span>
                  <el-switch v-model="isOpenIntelligentPointAllocation" v-else></el-switch>
                </div>


                <div>
                  {{$t('officeManager.mechanismTotalPoints')}}
                  <el-input-number size="small" v-model="confirmForm.curOfficeInfo.totalPoints"></el-input-number>
                </div>
              </div>
            </div>
          </el-card>

          <div class="next-level">
            <el-button type="info"
                       :disabled="confirmForm.curOfficeChildren.length===0"
                       @click="isShowAllChildren = true">{{$t('officeManager.nextLevelMechanismPoints')}}
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

      </template>
    </div>
  </div>
</template>

<script>

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
        curOfficeId: this.$route.query.officeId,
        isShowAllChildren: false,
        containerHeight: document.documentElement.clientHeight - 170,
        isOpenIntelligentPointAllocation: false,
        isSubOpenIntelligentPointAllocation: false,
        isOpenIPA: false,
        confirmForm: {
          curOfficeInfo: null,
          curOfficeChildren: [],
          curOfficeParents: [],
        }
      }
    },
    computed: {
      higherDistributablePoints() {
        if (this.confirmForm.curOfficeParents.length===0 || !this.confirmForm.curOfficeParents[0].assignedPoints) return 0;

        return this.confirmForm.curOfficeParents.reduce((total, item) => {
          return total + (item.totalPoints - item.assignedPoints);
        }, 0)
      },
      curOfficeOpenIntelligentPointAllocationParent() {
        let name = '';

        if (this.isSubOpenIntelligentPointAllocation) {
          this.confirmForm.curOfficeParents.map((item) => {
            if (item.id === this.confirmForm.curOfficeInfo.openWisdomPid) {
              name = item.label;
            }
          })
        }

        return name;
      }
    },
    watch: {
      $route($r) {
        this.curOfficeId = $r.query.officeId
      },
      curOfficeInfo(val) {
        console.log('切换分配点数的当前机构', val)
        this.confirmForm.curOfficeInfo = JSON.parse(JSON.stringify(val));
        this.isOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.isWisdom
        this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.openWisdomPid
        this.isOpenIPA = this.isOpenIntelligentPointAllocation || this.isSubOpenIntelligentPointAllocation
      },
      curOfficeChildren(val) {
        this.confirmForm.curOfficeChildren = JSON.parse(JSON.stringify(val));
      },
      curOfficeParents(val) {
        this.confirmForm.curOfficeParents = JSON.parse(JSON.stringify(val)).reverse();
      }
    },
    created() {
      this.confirmForm = {
        curOfficeInfo: JSON.parse(JSON.stringify(this.curOfficeInfo)),
        curOfficeChildren: JSON.parse(JSON.stringify(this.curOfficeChildren)),
        curOfficeParents: JSON.parse(JSON.stringify(this.curOfficeParents)).reverse(),
      }
      this.isOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.isWisdom
      this.isSubOpenIntelligentPointAllocation = this.confirmForm.curOfficeInfo&&this.confirmForm.curOfficeInfo.openWisdomPid
      this.isOpenIPA = this.isOpenIntelligentPointAllocation || this.isSubOpenIntelligentPointAllocation

      console.log('初始化..', this.confirmForm.curOfficeInfo)
    },
    mounted() {
    },
    methods: {
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.officeManager-distributionPoints-wrapper {
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .container {
    @include scrollBar;
    width: 100%;
    overflow: auto;
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

  .cur-card {
    width: 60%;
    height: 230px;
    margin: 0 auto;
    .card-container {
      white-space: nowrap;
    }
    .name {
      padding: 5px 0 20px 15px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid #DCDFE6;
      color: #303133;
    }

    .info {
      padding: 20px 0;
      font-size: 18px;
      border-bottom: 1px solid #DCDFE6;
      color: #606266;
      .id {
        margin-bottom: 20px;
      }
    }

    .handle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
    }
  }


}
</style>
