<template>
  <div class="accountManager-wrapper">
    <template v-if="!isSubRoute">
      <div class="filter">
        <div class="total">
          {{$t('accountManager.total')}} <span>{{count}}</span> {{$t('accountManager.account')}}
        </div>

        <div class="newBtn">
          <el-button type="primary" v-waves @click="$router.push({ path: '/system/accountManager/createAccount' })">{{$t('accountManager.create')}}</el-button>
        </div>

        <div class="search">
          <!--<el-input @keyup.enter.native="handleSearch" style="width: 200px;" :placeholder="$t('accountManager.searchNameOrUsername')" v-model="searchVal">
            <i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer;" @click="handleSearch"></i>
          </el-input>-->
          <div class="el-input el-input--suffix" style="width: 200px;">
            <input type="text"
                   v-model="searchVal"
                   @input="searchUser"
                   :placeholder="$t('accountManager.searchNameOrUsername')"
                   class="el-input__inner" />
            <span class="el-input__suffix" v-show="!searchVal">
              <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
            </span>
            <span class="el-input__suffix" v-show="searchVal" @click="searchVal = '', searchUser()">
              <span class="el-input__suffix-inner" style="cursor: pointer;"><i class="el-input__icon el-icon-circle-close"></i></span>
            </span>
          </div>
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
            prop="loginName"
            :label="$t('accountManager.username')">
          </el-table-column>

          <el-table-column
            :filters="[{ text: $t('common.rootRole'), value: $t('common.rootRole') }, { text: $t('common.userRole'), value: $t('common.userRole') }]"
            :filter-method="filterHandler"
            prop="roleName"
            :label="$t('accountManager.role')">
          </el-table-column>

          <el-table-column
            :label="$t('accountManager.office')"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>{{ scope.row.officeName }}</p>
                <p style="color: #666;font-size: 12px;">{{scope.row.officePath === '/HQ' ? '' :scope.row.officePath }}</p>
                <div slot="reference" class="office-wrapper">
                  <p>{{ scope.row.officeName}}</p>
                  <p style="color: #666;font-size: 12px;">{{ scope.row.officePath === '/HQ' ? '' :scope.row.officePath }}</p>
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column
            sortable
            prop="updateDate"
            :label="$t('accountManager.createdTime')">
            <template slot-scope="scope">
              {{scope.row.updateDate | formatDate}}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('accountManager.handle')">
            <template slot-scope="scope">
              <el-button @click="switchPageToEditAccount(scope.row)" type="text">{{$t('common.edit')}}</el-button>
              <el-button type="text" style="color: #F56C6C;" @click="dialogVisible = true;scopeName=scope.row.name;scopeID=scope.row.id">{{$t('common.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog
          :title="$t('accountManager.attention')"
          :visible.sync="dialogVisible"
          width="400px"
          height="200px">
          <span>{{$t('accountManager.logOut')}}</span><br>
          <span>{{$t('accountManager.ifDelete')}}</span><span style="display:inline-block;margin-left: 10px;margin-top: 10px;">{{scopeName}}</span>
          <span slot="footer" class="dialog-footer">
                 <el-button @click="dialogVisible = false">{{$t('accountManager.cancle')}}</el-button>
                 <el-button type="primary" @click="dialogVisible = false;delAccount(scopeID,scopeName)">{{$t('accountManager.del')}}</el-button>
                </span>
        </el-dialog>
      </div>



      <div class="pagination" style="display: flex;align-items: center;justify-content: flex-end;">
        <el-pagination background
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="listQuery.page"
                       :page-sizes="[10,20,30]"
                       :page-size="listQuery.limit"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="count"
                       style="text-align: right;">
        </el-pagination>

        <el-button size="mini" style="margin-left: 8px;">{{$t('common.skip')}}</el-button>
      </div>
    </template>

    <router-view :curAccountInfo="curAccountInfo" ref="subRoute"></router-view>
  </div>
</template>

<script>
  import waves from '@/directive/waves' // 水波纹指令
  import { getAccountList,saveAccountInfo,deleteAccount,checkAccountName,modifyAccountPwd } from '@/api/account'
  import { formatDate } from '@/utils'
  import { mapGetters } from 'vuex'

  export default {
    name: 'accountManager',
    components: {  },
    data() {
      return {
        count: 100,
        searchVal: '',
        listLoading: false,
        dialogVisible: false,
        scopeName:'',
        scopeID:'',

        tableData: [],
        listQuery: {
          page: 1,
          limit: 10,
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
      ...mapGetters([
        'language',
        'officeId'
      ]),
    },
    filters:{
      formatDate(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd hh:mm');
      }
    },
    watch: {
      $route($r) {
          console.log('fdjfisdj')
          console.log($r)
        this.isSubRoute = ($r.name==='accountManager-createAccount' || $r.name==='accountManager-editAccount');
        this.tableData = []
        getAccountList({
          pageSize: this.listQuery.limit
        }).then(res => {
          // console.log(res.userMsg)
          this.count = res.count
          this.tableData = res.userMsg.map(item => {
            item.roleName = item.roleArray.reduce((total, item) => {
              return total + (this.language==='zh' ? item.name : item.enname);
            }, '');
            item.updateDate = this.formatDateHandle(item.updateDate);
            return item;
          });
        }).catch(err => {
          console.log(err);
        })

      }
    },
    created() {
      this.isSubRoute = (this.$route.name==='accountManager-createAccount' || this.$route.name==='accountManager-editAccount')

      this.$bus.on('edit-account', (data) => {
        console.log('编辑账号合并信息', data)
        const index = this.tableData.findIndex(item => item.username === data.username);
        this.tableData[index] = data;
      });

      this.listLoading = true
      this.tableData = []
      getAccountList({
        pageSize: this.listQuery.limit
      }).then(res => {
        this.count = res.count
        this.tableData = res.userMsg.map(item => {
          item.roleName = item.roleArray.reduce((total, item) => {
            return total + (this.language==='zh' ? item.name : item.enname);
          }, '');
          item.updateDate = this.formatDateHandle(item.updateDate);
          return item;
        });

        this.listLoading = false
      }).catch(err => {
        console.log(err);
      })

    },
    beforeDestroy() {
      this.$bus.off('edit-account');
    },
    mounted() {
    },
    methods: {
      handleSearch() {
        this.tableData = []
        getAccountList({
          pageSize: this.listQuery.limit,
          searchKey: this.searchVal
        }).then(res => {
          this.count = res.count
          this.tableData = res.userMsg.map(item => {
            item.roleName = item.roleArray.reduce((total, item) => {
              return total + (this.language==='zh' ? item.name : item.enname);
            }, '');
            item.updateDate = this.formatDateHandle(item.updateDate);
            return item;
          });
        }).catch(err => {
          console.log(err);
        })
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.tableData = []
        getAccountList({
          pageSize: this.listQuery.limit
        }).then(res => {
          // console.log(res.userMsg)
          this.count = res.count
          this.tableData = res.userMsg.map(item => {
            item.roleName = item.roleArray.reduce((total, item) => {
              return total + (this.language==='zh' ? item.name : item.enname);
            }, '');
            item.updateDate = this.formatDateHandle(item.updateDate);
            return item;
          });
        }).catch(err => {
          console.log(err);
        })
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        console.log(this.listQuery.page)
        //alert(val + ' 施工中...')
        this.tableData = []
        getAccountList({
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit,
          orderbyfield: "updateDate",
          orderbytype:"desc"
        }).then(res => {
            console.log(res)
          this.count = res.count
          this.tableData = res.userMsg
        }).catch(err => {
          console.log(err);
        })

      },
      filterHandler(value, row, column) {
        console.log(value, row, column)
        const property = column['property'];
        console.log(property, row[property] )
        return row[property] === value;
      },
      switchPageToEditAccount(info) {
        this.curAccountInfo = info;
        this.$router.push({ path: '/system/accountManager/editAccount' });
      },
      delAccount(userId,username){
      /*  this.$confirm(this.$t('accountManager.logOut')+'\n'+this.$t('accountManager.ifDelete')+username, this.$t('accountManager.attention'), {
          confirmButtonText: this.$t('accountManager.del'),
          cancelButtonText: this.$t('accountManager.cancle'),
          type: 'warning'
        }).then(() => {*/
      console.log(userId)
      console.log(username)

          deleteAccount(userId).then(res => {
            this.delsuccessed()
            console.log(res)
          }).catch(err => {
            this.delerrored()
            console.log(err)
          })
     /*   }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('accountManager.deletedDeleted')
          });
        });*/
      },
      searchUser(){
        this.tableData = []
        getAccountList({
          pageSize: this.listQuery.limit,
          searchKey: this.searchVal
        }).then(res => {
          this.count = res.count
          this.tableData = res.userMsg.map(item => {
            item.roleName = item.roleArray.reduce((total, item) => {
              return total + (this.language==='zh' ? item.name : item.enname);
            }, '');
            item.updateDate = this.formatDateHandle(item.updateDate);
            return item;
          });
        }).catch(err => {
          console.log(err);
        })
      },
      delsuccessed() {
        this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          },
          getAccountList({
            pageSize: this.listQuery.limit
          }).then(res => {
            this.count = res.count
            this.tableData = res.userMsg
            this.listLoading = false
          }).catch(err => {
            console.log(err);
          })
        );
      },
      delerrored() {
        this.$message.error(this.$t('common.operationFailure'));
      },
      formatDateHandle(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd hh:mm');
      },
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
