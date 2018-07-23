<template>
  <div class="wordSettings-wrapper">
    <div class="btns">
      <el-row style="margin-bottom: 20px;">
        <el-button>{{$t('wordSettings.exportWord')}}</el-button>
        <el-button type="primary" @click="dialogFormVisible = true">{{$t('wordSettings.uploadWord')}}</el-button>
      </el-row>
    </div>

    <div class="table">
      <el-table stripe
                border
                fit
                highlight-current-row
                :data="tableData"
                style="width: 50%"
                :default-sort="{ prop: 'id' }">
        <el-table-column prop="id" width="100"></el-table-column>

        <el-table-column prop="language" :label="$t('wordSettings.language')"></el-table-column>

        <el-table-column :label="$t('wordSettings.handle')">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleEdit(scope.$index, scope.row)">{{$t('wordSettings.modify')}}</el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleDelete(scope.$index, scope.row)" style="color: #F56C6C;">{{$t('wordSettings.del')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="dialog">
      <el-dialog title="收货地址" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="活动名称" :label-width="formLabelWidth">
            <el-input v-model="form.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="活动区域" :label-width="formLabelWidth">
            <el-select v-model="form.region" placeholder="请选择活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'wordSettings',
    components: {  },
    data() {
      return {
        tableData: [
          {
            id: '3',
            language: '--'
          }, {
            id: '4',
            language: '--'
          }, {
            id: '1',
            language: '中文'
          }, {
            id: '2',
            language: 'English'
          }
        ],
        dialogFormVisible: false,
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px'
      }
    },
    computed: {
    },
    watch: {
    },
    mounted() {
    },
    methods: {
      handleEdit(index, row) {
        this.dialogFormVisible = true
      },
      handleDelete(index, row) {
        alert(index + row + '施工中...')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
