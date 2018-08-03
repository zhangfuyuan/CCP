<template>
  <div class="planManager-wrapper">
    <div class="filter">
      <div class="total">
        {{$t('planManager.total')}} <span>{{totalNum}}</span> {{$t('planManager.plans')}}
      </div>

      <div class="newBtn">
        <el-button type="primary" @click="toggleDialog('create')">{{$t('planManager.newPlan')}}</el-button>
      </div>

      <div class="search">
        <el-input @keyup.enter.native="handleSearch" style="width: 200px;" :placeholder="$t('planManager.searchPlanName')" v-model="searchVal">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="handleSearch"></i>
        </el-input>
      </div>
    </div>

    <div class="table">
      <el-table
        :data="tableData"
        fit
        border
        v-loading="listLoading"
        highlight-current-row
        stripe
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>

        <el-table-column
          sortable
          prop="name"
          :label="$t('planManager.planName')">
        </el-table-column>

        <el-table-column
          prop="type"
          :filters="[
                      { text: $t('planManager.powerSource'), value: $t('planManager.powerSource') },
                      { text: $t('planManager.volume'), value: $t('planManager.volume') }
                    ]"
          :filter-method="filterHandler"
          :label="$t('planManager.functionTypes')">
          <template slot-scope="scope">
            <span>{{ scope.row.type==='电源' ? $t('planManager.powerSource') : $t('planManager.volume') }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="device"
          :label="$t('planManager.associatedApparatus')">
        </el-table-column>

        <el-table-column
          sortable
          prop="createdTime"
          :label="$t('common.createdTime')">
        </el-table-column>

        <el-table-column
          :label="$t('common.handle')">
          <template slot-scope="scope">
            <el-button @click="toggleDialog('details', scope.row)" type="text">{{$t('planManager.details')}}</el-button>
            <el-button @click="toggleDialog('modify', scope.row)" type="text">{{$t('common.modify')}}</el-button>
            <el-button @click="toggleDialog('manager', scope.row)" type="text">{{$t('planManager.deviceManagementBtn')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination" style="display: flex;align-items: center;justify-content: flex-end;">
      <el-pagination background
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="listQuery.page"
                     :page-sizes="[10,20,30,50]"
                     :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="totalNum"
                     style="text-align: right;">
      </el-pagination>

      <el-button size="mini" style="margin-left: 8px;">{{$t('common.skip')}}</el-button>
    </div>

    <el-dialog :title="dialogTitle"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               :close-on-press-escape="false">
      <!--新建定时计划-->
      <div class="create-dialog" v-if="dialogKey === 'create'">
        <div style="height: 1000px;">
          <el-form ref="form" :model="createForm"
                   :label-width="language==='zh' ? '80px' : '136px'"
                   style="width: 560px;" label-position="left">
            <el-form-item :label="$t('planManager.functionTypes') + ' *'">
              <el-radio-group v-model="createForm.type">
                <el-radio label="电源">{{$t('planManager.powerSource')}}</el-radio>
                <el-radio label="音量">{{$t('planManager.volume')}}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('planManager.strategyName') + ' *'">
              <el-input v-model="createForm.name"></el-input>
              <el-button type="primary" plain>{{$t('planManager.emptySet')}}</el-button>
            </el-form-item>

            <div class="weekly-plan-box">
              <el-checkbox v-model="createForm.weeklyPlan.isOpen">{{$t('planManager.weeklyPlan')}}</el-checkbox>
              <ul>
                <li v-for="(item, index) in createForm.weeklyPlan.planList" :key="index">
                  <el-select v-model="item.action">
                    <el-option
                      v-for="(o, i) in actionOptions"
                      :key="o.value"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>

                  <el-time-picker
                    v-model="item.time"
                    value-format="HH:mm:ss"
                    :placeholder="$t('planManager.timePickerPlaceholder')">
                  </el-time-picker>

                  <el-checkbox-group v-model="item.weeks">
                    <el-checkbox-button label="Monday" name="weeks">{{$t('planManager.monday')}}</el-checkbox-button>
                    <el-checkbox-button label="Tuesday" name="weeks">{{$t('planManager.tuesday')}}</el-checkbox-button>
                    <el-checkbox-button label="Wednesday" name="weeks">{{$t('planManager.wednesday')}}</el-checkbox-button>
                    <el-checkbox-button label="Thursday" name="weeks">{{$t('planManager.thursday')}}</el-checkbox-button>
                    <el-checkbox-button label="Friday" name="weeks">{{$t('planManager.friday')}}</el-checkbox-button>
                    <el-checkbox-button label="Saturday" name="weeks">{{$t('planManager.saturday')}}</el-checkbox-button>
                    <el-checkbox-button label="Sunday" name="weeks">{{$t('planManager.sunday')}}</el-checkbox-button>
                  </el-checkbox-group>

                  <el-button type="text" v-if="index===0"><i class="el-icon-plus"></i></el-button>
                  <el-button type="text" v-else><i class="el-icon-minus"></i></el-button>
                </li>
              </ul>
            </div>

            <div class="special-plan-box">
              <el-checkbox v-model="createForm.specialPlan.isOpen">{{$t('planManager.specialPlan')}}</el-checkbox>
              <ul>
                <li v-for="(item, index) in createForm.specialPlan.planList" :key="index">
                  <el-select v-model="item.action">
                    <el-option
                      v-for="(o, i) in actionOptions"
                      :key="o.value"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>

                  <el-time-picker
                    v-model="item.time"
                    value-format="HH:mm:ss"
                    :placeholder="$t('planManager.timePickerPlaceholder')">
                  </el-time-picker>

                  <el-date-picker
                    v-model="item.date"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="-"
                    :start-placeholder="$t('planManager.datePickerStartPlaceholder')"
                    :end-placeholder="$t('planManager.datePickerEndPlaceholder')"
                    :picker-options="pickerOptions"
                    value-format="yyyy-MM-dd">
                  </el-date-picker>

                  <el-button type="text" v-if="index===0"><i class="el-icon-plus"></i></el-button>
                  <el-button type="text" v-else><i class="el-icon-minus"></i></el-button>
                </li>
              </ul>
            </div>
          </el-form>
        </div>
      </div>

      <div class="details-dialog" v-if="dialogKey === 'details'">
        details
      </div>

      <div class="modify-dialog" v-if="dialogKey === 'modify'">
        modify
      </div>

      <div class="manager-dialog" v-if="dialogKey === 'manager'">
        manager
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getPlanManagerTableData } from '@/datas'
  import { mapGetters } from 'vuex'

  export default {
    name: 'planManager',
    components: {  },
    data() {
      return {
        totalNum: 100,
        searchVal: '',
        listLoading: false,
        tableData: [],
        listQuery: {
          page: 1,
          limit: 20,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        },
        isSubRoute: false, // 判断当前是二级还是三级路由（true为三级路由，即创建/编辑账号页面）
        curAccountInfo: null,
        dialogKey: '',
        dialogTitle: '',
        dialogVisible: false,
        dialogPlanInfo: null,
        createForm: {
          type: '电源',
          name: '',
          weeklyPlan: {
            isOpen: false,
            planList: [
              {
                action: 'start',
                time: '00:00:00',
                weeks: []
              }
            ]
          },
          specialPlan: {
            isOpen: false,
            planList: [
              {
                action: 'start',
                time: '00:00:00',
                date: (function () {
                  const end = new Date();
                  const start = new Date();
                  end.setTime(start.getTime() + 3600 * 1000 * 24);

                  return [start, end];
                })(),
              }
            ]
          }
        },
        actionOptions: [
          {
            value: 'start',
            label: this.$t('planManager.startingUp'),
          }, {
            value: 'close',
            label: this.$t('planManager.powerOff'),
          }, {
            value: 'standby',
            label: this.$t('planManager.standBy'),
          }
        ],
        pickerOptions: {
          shortcuts: [{
            text: '未来一天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '未来一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '未来一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      }
    },
    computed: {
      ...mapGetters([
        'language',
      ])
    },
    watch: {
    },
    created() {
      this.listLoading = true
      setTimeout(() => {
        this.tableData = getPlanManagerTableData()
        this.listLoading = false
      }, 1500)
    },
    mounted() {

    },
    methods: {
      handleSearch() {
        alert('施工中...')
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        alert(val + ' 施工中...')
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        alert(val + ' 施工中...')
      },
      filterHandler(value, row, column) {
        const property = column['property'];
        return (row[property]==='电源' ? this.$t('planManager.powerSource') : this.$t('planManager.volume')) === value;
      },
      switchPageToEditAccount(info) {
        this.curAccountInfo = info;
      },
      toggleDialog(title, data) {
        switch (title) {
          case 'create':
            this.dialogKey = 'create';
            this.dialogTitle = this.$t('planManager.newTimingPlan');
            this.dialogPlanInfo = null;
            break;
          case 'details':
            this.dialogKey = 'details';
            this.dialogTitle = this.$t('planManager.planDetails');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            break;
          case 'modify':
            this.dialogKey = 'modify';
            this.dialogTitle = this.$t('planManager.modifyTimingPlan');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            break;
          case 'manager':
            this.dialogKey = 'manager';
            this.dialogTitle = this.$t('planManager.deviceManagement');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            break;
          default:
            this.dialogKey = '--';
            this.dialogTitle = '--';
            this.dialogPlanInfo = null;
            break;
        }

        this.dialogVisible = true;
        console.log('当前计划信息', data)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.planManager-wrapper {
  .filter {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .total {
      flex: 1;
    }
    .search {
      margin-left: 30px;
      .el-icon-search {
        cursor: pointer;
      }
    }
  }

  .table {
    width: 100%;
    display: flex;
  }

  .pagination {
    margin-top: 20px;
  }

  .create-dialog {
    @include scrollBar;
    max-height: 500px;
    overflow: auto;
  }
}
</style>
