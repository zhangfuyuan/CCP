
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
      platforms: ['a-platform'],
      zfy_devicename: "占位符" + i,
      zfy_office: "/分机构" + i,
      zfy_status: (i%3)===0? '1' : ((i%3)===1?'2':'0'),
      zfy_duration: i*2 + 'd 18h',
      zfy_deviceID: "161616161616161"+i,
      zfy_createdTime: Date.now(),
      zfy_onlineTime: i + 'd 18h',
      zfy_brightness: i + "0",
      zfy_volume: i + "0",
      zfy_touchState: "1",
      zfy_macAddress: i +"a-80-e9-22-37-e7",
      zfy_ipAddress: "192.168.0." + i,
      zfy_ram: i,
      zfy_storageSpace: i + "GB/" + i+1 + "GB",
      zfy_dpi: "1920 * 1080",
      zfy_androidVersion: "5.1." + i,
      zfy_systemVersion: i + ".0",
      zfy_apkVersion: i + ".0",
      zfy_mark: "备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符备注占位符",
      zfy_lastUpdateTime: Date.now(),
    })
  }

  return tableData;
}

export function getTreeData() {
  return [
    {
      id: "1",
      name: '一级 1',
      parentId: 0+'',
      "organizationCode": "0001",
      "terminalTotal": 0,
      "terminalAssigned": 0,
      "terminalNum": 0,
      "type": 1,
      children: [
        {
          id: 4+'',
          name: '二级 1-1',
          parentId: 1+'',
          "organizationCode": "0001",
          "terminalTotal": 0,
          "terminalAssigned": 0,
          "terminalNum": 0,
          "type": 1,
          children: [{
            id: 9+'',
            name: '三级 1-1-1',
            parentId: 4,
            "organizationCode": "0001",
            "terminalTotal": 0,
            "terminalAssigned": 0,
            "terminalNum": 0,
            "type": 1,
          }, {
            id: 10+'',
            name: '三级 1-1-2',
            parentId: 4+'',
            "organizationCode": "0001",
            "terminalTotal": 0,
            "terminalAssigned": 0,
            "terminalNum": 0,
            "type": 1,
          }, {
            id: 2+'',
            name: '一级 2',
            parentId: 1+'',
            "organizationCode": "0001",
            "terminalTotal": 0,
            "terminalAssigned": 0,
            "terminalNum": 0,
            "type": 1,
            children: [{
              id: 5+'',
              name: '二级 2-1',
              parentId: 2+'',
              "organizationCode": "0001",
              "terminalTotal": 0,
              "terminalAssigned": 0,
              "terminalNum": 0,
              "type": 1,
            }, {
              id: 6+'',
              name: '二级 2-2',
              parentId: 2+'',
              "organizationCode": "0001",
              "terminalTotal": 0,
              "terminalAssigned": 0,
              "terminalNum": 0,
              "type": 1,
            }]
          }, {
            id: 3+'',
            name: '一级 3',
            parentId: 1+'',
            "organizationCode": "0001",
            "terminalTotal": 0,
            "terminalAssigned": 0,
            "terminalNum": 0,
            "type": 1,
            children: [{
              id: 7+'',
              name: '二级 3-1',
              parentId: 3+'',
              "organizationCode": "0001",
              "terminalTotal": 0,
              "terminalAssigned": 0,
              "terminalNum": 0,
              "type": 1,
            }, {
              id: 8+'',
              name: '二级 3-2',
              parentId: 3+'',
              "organizationCode": "0001",
              "terminalTotal": 0,
              "terminalAssigned": 0,
              "terminalNum": 0,
              "type": 1,
              children: [{
                id: 11+'',
                name: '三级 3-2-1',
                parentId: 8+'',
                "organizationCode": "0001",
                "terminalTotal": 0,
                "terminalAssigned": 0,
                "terminalNum": 0,
                "type": 1,
              }, {
                id: 12+'',
                name: '三级 3-2-2',
                parentId: 8+'',
                "organizationCode": "0001",
                "terminalTotal": 0,
                "terminalAssigned": 0,
                "terminalNum": 0,
                "type": 1,
              }, {
                id: 13+'',
                name: '三级 3-2-3',
                parentId: 8+'',
                "organizationCode": "0001",
                "terminalTotal": 0,
                "terminalAssigned": 0,
                "terminalNum": 0,
                "type": 1,
              }],
            }]
          }]
        }
      ]
    }
  ]
}

export function getAccountManagerTableData() {
  return [
    {
      name: '占位符1',
      username: 'admin321',
      role: '系统管理员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符2',
      username: 'admin123',
      role: '普通管理员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符3',
      username: 'admin132',
      role: '普通管理员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '占位符4',
      username: 'admin231',
      role: '普通管理员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }
  ]
}

export function getOfficeTreeData() {
  return [
    {
      id: 1,
      name: '一级 1',
      children: [{
        id: 2,
        name: '二级 1-1',
        isWisdom: true,
        parentId: 1,
        children: [{
          id: 3,
          name: '三级 1-1-1',
          parentId: 2,
          children: [],
        }, {
          id: 4,
          name: '三级 1-1-2',
          parentId: 2,
          children: [],
        }]
      }]
    }, {
      id: 5,
      name: '一级 2',
      assignedPoints: 274+100, // 已分配点数 = 给所有下级的总点数 + 当前机构的<上线>设备数
      totalPoints: 385, // 机构总点数
      deviceNumber: 100, // 设备数（全上线）
      children: [{
        id: 6,
        name: '二级 2-1',
        parentId: 5,
        children: [],
        assignedPoints: 100, // 已分配点数
        totalPoints: 101, // 机构总点数
        deviceNumber: 100, // 设备数（全上线）
      }, {
        id: 7,
        name: '二级 2-2',
        parentId: 5,
        assignedPoints: 152+20, // 已分配点数
        totalPoints: 173, // 机构总点数
        deviceNumber: 20, // 设备数（全上线）
        children: [{
          id: 8,
          name: '三级 2-2-1',
          parentId: 7,
          isWisdom: true,
          assignedPoints: 0, // 已分配点数
          totalPoints: 51, // 机构总点数
          deviceNumber: 20, // 设备数（全上线）
          children: [{
            id: 9,
            name: '四级 2-2-1-1',
            parentId: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [], // 叶子结点 [] 不能少
            openWisdomPid: 8,
          }, {
            id: 10,
            name: '四级 2-2-1-2',
            parentId: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [],
            openWisdomPid: 8,
          }, {
            id: 11,
            name: '四级 2-2-1-3',
            parentId: 8,
            assignedPoints: 0, // 已分配点数
            totalPoints: 0, // 机构总点数
            deviceNumber: 10, // 设备数（全上线）
            children: [],
            openWisdomPid: 8,
          }]
        }, {
          id: 12,
          name: '三级 2-2-2',
          parentId: 7,
          assignedPoints: 100, // 已分配点数
          totalPoints: 101, // 机构总点数
          deviceNumber: 100, // 设备数（全上线）
          children: [],
        }]
      }]
    }, {
      id: 13,
      name: '一级 3',
      children: [{
        id: 14,
        name: '二级 3-1',
        isWisdom: true,
        parentId: 13,
        children: [],
      }, {
        id: 15,
        name: '二级 3-2',
        parentId: 13,
        children: [],
      }]
    }, {
      id: 16,
      name: '一级 4',
      children: [],
      isNoAuth: true,
    }
  ];
}

export function getPlanManagerTableData() {
  let power = [
    {
      playType: '1', // String '1'->周计划 '2'->特殊计划
      operation: '1', // String '1'->开机 '2'->待机 '3'->关机
      time: '00:00:00', // String 时分秒
      week: ['1','2']  // 字符串数组 '1'~'7'-> 周一至周日
    },
    {
      type: '2', // String '1'->周计划 '2'->特殊计划
      operation: '2', // String '1'->开机 '2'->待机 '3'->关机
      time: '00:00:00', // String 时分秒
      date: ['',''] // 字符串数组 [0]->开始时间 [1]->结束时间
    }
  ]

  let volume = [
    {
      playType: '1', // String '1'->默认音量 '2'->定时音量
      volume: 20, // Int
    },
    {
      playType: '2', // String '1'->默认音量 '2'->定时音量
      volume: 20, // Int
      time: '00:00:00', // String 时分秒
      week: ['1','2']  // 字符串数组 '1'~'7'-> 周一至周日
    }
  ]

  return [
    {
      name: '计划名称1',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称2',
      type: '音量',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称3',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称4',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称1',
      type: '音量',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称2',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称3',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称4',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称1',
      type: '电源',
      device: '8员',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称2',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称3',
      type: '音量',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }, {
      name: '计划名称4',
      type: '电源',
      device: '8',
      office: '普陀区',
      createdTime: '2018-07-09 08:00'
    }
  ]
}
