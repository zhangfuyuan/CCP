<template>
  <div class="accountManager-createAccount-wrapper">
    <el-form :model="accountForm" :rules="rules" ref="accountForm" label-width="100px" inline-message status-icon label-position="left">
      <el-form-item label="用户名" prop="username" required>
        <el-input v-model="accountForm.username" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item label="名称" prop="name" required>
        <el-input v-model="accountForm.name" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password" required>
        <el-input type="password" v-model="accountForm.password" style="width: 300px;"></el-input>
      </el-form-item>

      <el-form-item label="备注" prop="mark">
        <el-input type="textarea" v-model="accountForm.mark" style="width: 500px;"></el-input>
      </el-form-item>

      <el-form-item label="账号角色" prop="role" required>
        <el-radio-group v-model="accountForm.role">
          <el-radio label="系统管理员"></el-radio>
          <el-radio label="普通管理员"></el-radio>
        </el-radio-group>
        <el-popover
          placement="bottom-start"
          title=""
          width="200"
          trigger="hover"
          content="普通管理员无法操作系统设置功能模块">
          <i class="el-icon-warning" slot="reference" style="color: #909399;cursor: pointer;margin-left: 10px;"></i>
        </el-popover>
      </el-form-item>

      <el-form-item label="分配组织" prop="office" required>
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText"
          style="width: 500px;">
        </el-input>

        <el-tree
          class="filter-tree"
          :data="treeData"
          :props="defaultProps"
          default-expand-all
          :filter-node-method="filterNode"
          ref="officeTree"
          show-checkbox
          highlight-current
          node-key="id"
          check-on-click-node
          :expand-on-click-node="false"
          @node-click="checkedOfficeHandle"
          check-strictly
          style="width: 500px;">
        </el-tree>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('accountForm')">确定</el-button>
        <el-button @click="cancelHandle">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

  export default {
    name: 'accountManager-createAccount',
    components: {  },
    data() {
      return {
        accountForm: {
          username: '',
          name: '',
          password: '',
          mark: '',
          role: '',
          office: ''
        },
        rules: {
          username: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 6, max: 12, message: '账号长度不超过12个字符/少于6个字符', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { max: 12, message: '名称长度不超过12个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 12, message: '密码长度不超过12个字符/少于6个字符', trigger: 'blur' }
          ],
          mark: [
            { max: 48, message: '长度不超过48个字符', trigger: 'blur' }
          ],
          role: [
            { required: true, message: '请选择一个账号角色', trigger: 'change' }
          ],
          office: [
            { required: true, message: '请选择一个分配组织', trigger: 'change' }
          ]
        },
        filterText: '',
        treeData: [{
          id: 1,
          label: '一级 1',
          children: [{
            id: 4,
            label: '二级 1-1',
            children: [{
              id: 9,
              label: '三级 1-1-1'
            }, {
              id: 10,
              label: '三级 1-1-2'
            }]
          }]
        }, {
          id: 2,
          label: '一级 2',
          children: [{
            id: 5,
            label: '二级 2-1'
          }, {
            id: 6,
            label: '二级 2-2'
          }]
        }, {
          id: 3,
          label: '一级 3',
          children: [{
            id: 7,
            label: '二级 3-1'
          }, {
            id: 8,
            label: '二级 3-2'
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    computed: {
    },
    watch: {
      filterText(val) {
        this.$refs.officeTree.filter(val);
      }
    },
    mounted() {
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      checkedOfficeHandle(obj, node, component) {
        this.$refs.officeTree.setCheckedKeys([obj.id]);
        console.log(obj, node, component)
        this.accountForm.office = obj.id
      },
      cancelHandle() {
        this.$confirm('已录入的信息将不保留，是否离开该页面 ？', '注意', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.push({ path: '/system/accountManager' })
        }).catch(() => {

        });
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
