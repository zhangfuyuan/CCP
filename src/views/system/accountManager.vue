<template>
  <div class="accountManager-wrapper">
    <template v-if="!$route_isCreate">
      <div class="filter">
        <div class="total">
          {{$t('accountManager.total')}} <span>{{totalNum}}</span> {{$t('accountManager.account')}}
        </div>

        <div class="newBtn">
          <el-button type="primary" v-waves @click="$router.push({ path: '/system/accountManager/createAccount' })">{{$t('accountManager.create')}}</el-button>
        </div>

        <div class="search">
          <el-input @keyup.enter.native="handleSearch" style="width: 200px;" :placeholder="$t('table.title')" v-model="searchVal">
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
            sortable
            prop="name"
            :label="$t('accountManager.name')">
          </el-table-column>
          <el-table-column
            sortable
            prop="username"
            :label="$t('accountManager.username')">
          </el-table-column>
          <el-table-column
            :filters="[{ text: $t('common.rootRole'), value: $t('common.rootRole') }, { text: $t('common.userRole'), value: $t('common.userRole') }]"
            :filter-method="filterHandler"
            prop="role"
            :label="$t('accountManager.role')">
          </el-table-column>
          <el-table-column
            sortable
            :label="$t('accountManager.office')">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>{{ scope.row.office }}</p>
                <p style="color: #666;font-size: 12px;">/分机构1/顶级机构</p>
                <div slot="reference" class="office-wrapper">
                  <p>{{ scope.row.office }}</p>
                  <p style="color: #666;font-size: 12px;">/分机构1/顶级机构</p>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            sortable
            prop="createdTime"
            :label="$t('accountManager.createdTime')"
            align="center">
          </el-table-column>
          <el-table-column
            :label="$t('accountManager.handle')">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text">{{$t('accountManager.edit')}}</el-button>
              <el-button type="text" style="color: #F56C6C;">{{$t('accountManager.del')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
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
      </div>
    </template>

    <router-view></router-view>
  </div>
</template>

<script>
  import { getAccountManagerTableData } from '@/datas'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'accountManager',
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
        $route_isCreate: false
      }
    },
    computed: {
    },
    watch: {
      $route($r) {
        this.$route_isCreate = $r.name==='accountManager-createAccount'
      }
    },
    created() {
      this.$route_isCreate = this.$route.name==='accountManager-createAccount'

      this.listLoading = true
      setTimeout(() => {
        this.tableData = getAccountManagerTableData()
        this.listLoading = false
      }, 1500)
    },
    mounted() {
    },
    methods: {
      handleSearch() {
        alert('施工中...')
      },
      handleClick(row) {
        alert(row + ' 施工中...')
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
      }
    },
    directives: {
      waves
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.accountManager-wrapper {
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
