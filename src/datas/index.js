
export function getTableData() {
  let tableData = []

  for (let i=1; i<21; i++) {
    tableData.push({
      author: "Jason",
      comment_disabled: true,
      content: "<p>我是测试数据我是测试数据</p><p><img src='https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943'></p>",
      content_short: "我是测试数据",
      display_time: "1973-03-25 02:06:05",
      forecast: 34.09,
      id: i,
      image_uri: "https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3",
      importance: 2,
      pageviews: 4803,
      reviewer: "Ronald",
      status: "draft",
      timestamp: 532191217520,
      title: "Meomp Yydtffjq Dpdawlic Pbc Dktciqc Tuxcnequtz",
      type: "US",
      platforms: ['a-platform']
    })
  }

  return tableData;
}

export function getTreeData() {
  return [{
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
      label: '二级 3-2',
      children: [{
        id: 11,
        label: '三级 3-2-1'
      }, {
        id: 12,
        label: '三级 3-2-2'
      }, {
        id: 13,
        label: '三级 3-2-3'
      }]
    }]
  }]
}

export function getAccountManagerTableData() {
  return [
    {
      name: '占位符1',
      username: '王小虎',
      role: '超级管理员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符2',
      username: '王小虎',
      role: '普通用户',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符3',
      username: '王小虎',
      role: '普通用户',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符4',
      username: '王小虎',
      role: '普通用户',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }
  ]
}

