<template>
  <div class="officeManager-distributionPoints-wrapper">
    <div class="header">
      <div class="btns">
        <el-button type="primary">{{$t(common.confirm)}}</el-button>
        <el-button plain>{{$t(common.cancel)}}</el-button>
      </div>

      <div class="higher">
        <div v-if="!isShowAllChildren && curOfficeParents.length > 0">
          <el-popover placement="bottom"
                      width="300"
                      trigger="click">
            <div class="popover-content">
              <ul class="higher-list">
                <li v-for="(item, index) in curOfficeParents" :key="index">
                  * {{item.label}}
                </li>
              </ul>
            </div>

            <el-button type="text" slot="reference">{{$t('officeManager.superior')}}</el-button>
          </el-popover>

          <span>
            {{$t('officeManager.distributablePoints')}} &nbsp; {{higherDistributablePoints}}
          </span>
        </div>

        <div v-else>

        </div>
      </div>
    </div>

    <div class="container" :style="{ 'height': containerHeight + 'px' }">
      <template v-if="!isShowAllChildren">
        <el-card class="box-card cur-card" shadow="always">
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
                {{$t('officeManager.distributablePoints')}} {{curOfficeInfo.totalPoints - curOfficeInfo.assignedPoints}} &nbsp;
                {{$t('officeManager.assignedPoints')}} {{curOfficeInfo.assignedPoints}} &nbsp;
                {{$t('officeManager.deviceNumber')}} {{curOfficeInfo.deviceNumber}} &nbsp;
              </div>
            </div>

            <div class="handle">
              <el-switch v-model="isOpenIntelligentPointAllocation"></el-switch>

              <div>
                {{$t('officeManager.mechanismTotalPoints')}}
                <el-input-number size="medium" v-model="curOfficeInfo.totalPoints"></el-input-number>
              </div>
            </div>
          </div>
        </el-card>
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
        containerHeight: document.documentElement.clientHeight - 125,
        isOpenIntelligentPointAllocation: false
      }
    },
    computed: {
      higherDistributablePoints() {
        if (this.curOfficeParents.length===0 || !this.curOfficeParents[0].assignedPoints) return 0;

        return this.curOfficeParents.reduce((total, item) => {
          return (item.totalPoints - item.assignedPoints);
        }, 0)
      }
    },
    watch: {
    },
    created() {

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
