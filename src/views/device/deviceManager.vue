<template>
  <div class="deviceManager-wrapper">
    <div class="tree">
      <div class="tree-wrapper">
        <div class="selected-box"></div>

        <div class="all-and-filter-box">
          <el-input
            placeholder="输入关键字进行过滤"
            v-model="filterText">
          </el-input>
        </div>

        <div class="tree-box">
          <el-tree
            :data="treeData"
            show-checkbox
            default-expand-all
            node-key="id"
            ref="tree"
            highlight-current
            :props="defaultProps"
            :filter-node-method="filterNode">
          </el-tree>
        </div>
      </div>
    </div>

    <div class="table">
      <div class="table-wrapper">
        <complex-table></complex-table>
      </div>
    </div>
  </div>
</template>

<script>
import ComplexTable from './components/complexTable.vue'
import { getTreeData } from '@/datas'

export default {
  name: 'deviceManager',
  components: { ComplexTable },
  data() {
    return {
      filterText: '',
      treeData: getTreeData(),
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
      this.$refs.tree.filter(val);
    }
  },
  mounted() {
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.deviceManager-wrapper {
  width: 100%;
  display: flex;
  .tree {
    width: 20%;
  }

  .table {
    width: 80%;
  }
}
</style>
