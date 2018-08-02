<template>
  <div class="planManager-wrapper">
    <div class="filter">
      <div class="total">
        {{$t('accountManager.total')}} <span>{{totalNum}}</span> {{$t('accountManager.account')}}
      </div>

      <div class="newBtn">
        <el-button type="primary" @click="$router.push({ path: '/system/accountManager/createAccount' })">{{$t('accountManager.create')}}</el-button>
      </div>

      <div class="search">
        <el-input @keyup.enter.native="handleSearch" style="width: 200px;" :placeholder="$t('accountManager.searchNameOrUsername')" v-model="searchVal">
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
          sortable
          prop="type"
          :label="$t('planManager.functionTypes')">
        </el-table-column>

        <el-table-column
          :filters="[{ text: $t('common.rootRole'), value: $t('common.rootRole') }, { text: $t('common.userRole'), value: $t('common.userRole') }]"
          :filter-method="filterHandler"
          prop="device"
          :label="$t('planManager.associatedApparatus')">
        </el-table-column>

        <el-table-column
          sortable
          prop="createdTime"
          :label="$t('common.createdTime')"
          align="center">
        </el-table-column>

        <el-table-column
          :label="$t('common.handle')">
          <template slot-scope="scope">
            <el-button @click="switchPageToEditAccount(scope.row)" type="text">{{$t('common.edit')}}</el-button>
            <el-button type="text" style="color: #F56C6C;">{{$t('common.delete')}}</el-button>
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
  </div>
</template>

<script>
  import { getPlanManagerTableData } from '@/datas'

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
        curAccountInfo: null
      }
    },
    computed: {
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
        return row[property] === value;
      },
      switchPageToEditAccount(info) {
        this.curAccountInfo = info;
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

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
}
</style>
