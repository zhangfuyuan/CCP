
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
      pid: 1,
      children: [{
        id: 9,
        label: '三级 1-1-1',
        pid: 4,
        leaf: true,
      }, {
        id: 10,
        label: '三级 1-1-2',
        pid: 4,
        leaf: true,
      }]
    }, {
      id: 2,
      label: '一级 2',
      children: [{
        id: 5,
        label: '二级 2-1',
        pid: 2,
        leaf: true,
      }, {
        id: 6,
        label: '二级 2-2',
        pid: 2,
        leaf: true,
      }]
    }, {
      id: 3,
      label: '一级 3',
      children: [{
        id: 7,
        label: '二级 3-1',
        pid: 3,
      }, {
        id: 8,
        label: '二级 3-2',
        children: [{
          id: 11,
          label: '三级 3-2-1',
          pid: 8,
          leaf: true,
        }, {
          id: 12,
          label: '三级 3-2-2',
          pid: 8,
          leaf: true,
        }, {
          id: 13,
          label: '三级 3-2-3',
          pid: 8,
          leaf: true,
        }],
        pid: 3,
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

export function getOfficeTreeData() {
  return [
    {
      id: 1,
      label: '一级 1',
      children: [{
        id: 2,
        label: '二级 1-1',
        isWisdom: true,
        pid: 1,
        children: [{
          id: 3,
          label: '三级 1-1-1',
          pid: 2,
          children: [],
        }, {
          id: 4,
          label: '三级 1-1-2',
          pid: 2,
          children: [],
        }]
      }]
    }, {
      id: 5,
      label: '一级 2',
      assignedPoints: 274+100, // 已分配点数 = 给所有下级的总点数 + 当前机构的<上线>设备数
      totalPoints: 385, // 机构总点数
      deviceNumber: 100, // 设备数（全上线）
      children: [{
        id: 6,
        label: '二级 2-1',
        pid: 5,
        children: [],
        assignedPoints: 100, // 已分配点数
        totalPoints: 101, // 机构总点数
        deviceNumber: 100, // 设备数（全上线）
      }, {
        id: 7,
        label: '二级 2-2',
        pid: 5,
        assignedPoints: 152+20, // 已分配点数
        totalPoints: 173, // 机构总点数
        deviceNumber: 20, // 设备数（全上线）
        children: [{
          id: 8,
          label: '三级 2-2-1',
          pid: 7,
          isWisdom: true,
          assignedPoints: 0, // 已分配点数
          totalPoints: 51, // 机构总点数
          deviceNumber: 20, // 设备数（全上线）
          children: [{
            id: 9,
            label: '四级 2-2-1-1',
            pid: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [], // 叶子结点 [] 不能少
            openWisdomPid: 8,
          }, {
            id: 10,
            label: '四级 2-2-1-2',
            pid: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [],
            openWisdomPid: 8,
          }, {
            id: 11,
            label: '四级 2-2-1-3',
            pid: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [],
            openWisdomPid: 8,
          }]
        }, {
          id: 12,
          label: '三级 2-2-2',
          pid: 7,
          assignedPoints: 100, // 已分配点数
          totalPoints: 101, // 机构总点数
          deviceNumber: 100, // 设备数（全上线）
          children: [],
        }]
      }]
    }, {
      id: 13,
      label: '一级 3',
      children: [{
        id: 14,
        label: '二级 3-1',
        isWisdom: true,
        pid: 13,
        children: [],
      }, {
        id: 15,
        label: '二级 3-2',
        pid: 13,
        children: [],
      }]
    }, {
      id: 16,
      label: '一级 4',
      children: [],
      isNoAuth: true,
    }
  ];
}
