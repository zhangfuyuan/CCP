<template>
  <div class="deviceManager-screen-wrapper">
    <!--多图模式-->
    <div class="multiple-model" v-if="showModel === 'multiple'">
      <!--顶部信息和操作按钮-->
      <div class="header">
        <div class="info" style="color: #666;cursor: pointer">
          <span style="margin-right: 10px;">
            {{$t('deviceManager.total')}} {{showDeviceList.length}} {{$t('deviceManager.devices')}}
          </span>

          <span>
            {{$t('deviceManager.screenTime')}} {{Date.now() | formatDate }}
          </span>
        </div>

        <div class="btns" style="display: flex;align-items: center;">
          <el-button @click="handleAdd">{{$t('deviceManager.addDevices')}}</el-button>

          <el-button plain
                     style="margin-left: 15px;"
                     :disabled="isRefreshing"
                     @click="handleRefresh">{{refreshTxt}}</el-button>

          <el-button type="danger"
                     plain
                     style="margin-left: 15px;"
                     @click="handleClearAll">{{$t('deviceManager.clearAll')}}</el-button>

          <el-button v-if="isShowSearchBtn"
                     icon="el-icon-search"
                     style="margin-left: 15px;"
                     @click="isShowSearchBtn = false"></el-button>
          <el-input v-else @keyup.enter.native="handleSearch"
                    style="width: 200px;margin-left: 15px;"
                    :placeholder="$t('accountManager.searchNameOrUsername')"
                    v-model="searchVal"
                    clearable
                    @clear="() => { isShowSearchBtn = true }">
            <i slot="suffix" style="cursor: pointer;" class="el-input__icon el-icon-search" @click="handleSearch"></i>
          </el-input>

          <span :style="{ 'font-size': '30px', 'cursor': 'pointer', 'margin-left': '15px', 'position': 'relative', 'top': '-1px', 'left': '3px' }"
                @click="toggleModel('single')"
                :title="$t('deviceManager.listMode')">
            <svg-icon icon-class="list" />
          </span>

          <span :style="{ 'font-size': '35px', 'color': '#409EFF', 'cursor': 'pointer', 'margin-left': '15px' }"
                @click="toggleModel('multiple')"
                :title="$t('deviceManager.multipleMode')">
            <i class="el-icon-menu"></i>
          </span>
        </div>
      </div>

      <!--多图模式正文截图列表-->
      <template v-if="showDeviceList.length>0">
        <div class="screen-list" :style="{ 'height': listHeight + 'px' }">
          <ul class="list-wrapper">
            <li v-for="(item, index) in showDeviceList" :key="index" class="list-box">
              <div class="list-container">
                <div class="list-img" v-loading="item.isLoading">
                  <template v-if="item.status==='1'">
                    <img :src="item.captureList[0].path" :alt="$t('deviceManager.screen')" width="100%" height="auto" />
                  </template>
                  <template v-else-if="item.status==='2'">
                    <span>{{$t('deviceManager.standby')}}</span>
                  </template>
                  <template v-else-if="item.status==='0'">
                    <span>{{$t('deviceManager.offline')}}</span>
                  </template>
                  <template v-else>
                    <span>{{$t('common.unknownError')}}</span>
                  </template>


                  <div class="list-mask" @click.stop.prevent="handleClickToView(item)">
                    <span style="position: absolute;color: #fff;font-size: 28px;right: 10px;top: 10px;"
                          @click.stop.prevent="handleCloseSingle">
                      <i class="el-icon-close"></i>
                    </span>

                    <span style="position: absolute;color: #fff;font-size: 30px;left: 50%;margin-left: -60px;top: 50%;margin-top: -17px;">
                      {{$t('deviceManager.clickToView')}}
                    </span>

                    <span style="position: absolute;color: #fff;font-size: 14px;left: 10px;bottom: 40px;">
                      {{$t('deviceManager.deviceId')}} &nbsp;&nbsp; {{item.decimalId}}
                    </span>
                    <span style="position: absolute;color: #fff;font-size: 14px;left: 10px;bottom: 10px;">
                      {{$t('deviceManager.subsidiaryOrgan')}} &nbsp;&nbsp; {{item.officeName}}
                    </span>
                  </div>
                </div>

                <div class="list-txt" style="display: flex;align-items: center;justify-content: space-between;">
                  <span style="color: #666;font-size: 14px;">{{item.name}}</span>

                  <el-button type="text">{{$t('deviceManager.historyScreenshots')}}</el-button>
                </div>
              </div>
            </li>

            <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10" style="width: 100%;">
              <div style="height: 50px;display: flex;justify-content: center;align-items: center;">
                <template v-if="busy">
                  <i class="el-icon-loading" style="margin-right: 10px;"></i>
                  <span >{{$t('deviceManager.loading')}}...</span>
                </template>

                <template v-else>
                  <span>{{$t('deviceManager.atAll')}}</span>
                </template>
              </div>
            </div>
          </ul>
        </div>
      </template>

      <!--多图模式null状态-->
      <template v-else>
        <div class="null-box" style="width: 100%;height: 300px;display: flex;flex-direction: column;align-items: center;justify-content: center;">
          <div style="font-size: 20px;margin-bottom: 20px;">{{$t('deviceManager.noAdditionalEquipment')}}</div>

          <div>
            <el-button @click="handleAdd">{{$t('deviceManager.addDevices')}}</el-button>
            &nbsp;&nbsp; {{$t('deviceManager.or')}} &nbsp;&nbsp;
            <el-button plain @click="$router.push({ path: '/device/deviceManager' })">{{$t('deviceManager.BackHomePage')}}</el-button>
          </div>
        </div>
      </template>

    </div>

    <!--列表模式-->
    <div class="single-model" v-else>
      <!--左侧设备列表-->
      <div class="left-list" :style="{ 'height': singleHeight + 'px' }">
        <div class="left-list-wrapper">
          <div class="header">
            <span>
              {{$t('deviceManager.deviceNumber')}} {{showDeviceList.length}}
           </span>

            <span>
              <el-button icon="el-icon-plus"></el-button>
              <el-button icon="el-icon-search"></el-button>
           </span>
          </div>

          <div class="devices-list">
            <ul class="devices-list-ul" :style="{ 'height': devicesListUlHeight + 'px' }">
              <li v-for="(item, index) in showDeviceList" class="devices-list-li">
                <el-button type="text"
                           style="color: #F56C6C;"
                           size="mini"
                           @click="handleCloseSingle()">{{$t('common.delete')}}</el-button>

                <div style="padding-left: 10px;display: flex;flex-direction: column;justify-content: flex-start;">
                  <span style="color: #333;font-size: 14px;margin-bottom: 5px;">{{item.name}}</span>
                  <span style="color: #909399;font-size: 12px">{{item.officeName}}</span>
                </div>
              </li>
            </ul>

            <div style="text-align: center;margin-top: 10px;">
              <el-button type="text"
                         style="color: #F56C6C;"
                         size="mini"
                         @click="handleClearAll">{{$t('deviceManager.clearAll')}}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!--右侧单图内容-->
      <div class="right-img" :style="{ 'height': singleHeight + 'px' }">
        <template v-if="curClickDevice">
          <div class="right-img-wrapper">
            <div class="header" style="display: flex;justify-content: space-between;align-items: flex-start;margin-bottom: 20px;">
              <div style="display: flex;flex-direction: column;justify-content: flex-start;">
                <span style="font-size: 20px;color: #333;margin-bottom: 5px;">{{curClickDevice.name}}</span>
                <span style="font-size: 14px;color: #666;">{{curClickDevice.officeName}}</span>
              </div>

              <div style="display: flex;align-items: center;">
                <el-button plain
                           style="margin-left: 15px;"
                           :disabled="isRefreshing"
                           @click="handleRefresh">{{refreshTxt}}</el-button>

                <span :style="{ 'font-size': '30px', 'cursor': 'pointer', 'margin-left': '15px', 'position': 'relative', 'top': '-1px', 'left': '3px' }"
                      @click="toggleModel('single')"
                      :title="$t('deviceManager.listMode')">
                  <svg-icon icon-class="list-click" />
                </span>

                <span :style="{ 'font-size': '35px', 'color': '#606266', 'cursor': 'pointer', 'margin-left': '15px' }"
                      @click="toggleModel('multiple')"
                      :title="$t('deviceManager.multipleMode')">
                  <i class="el-icon-menu"></i>
                </span>
              </div>
            </div>

            <div class="img">
              <div class="img-box">
                <img src="" :alt="$t('deviceManager.screen')" width="100%" height="100%" />
              </div>

              <div class="img-info">
                <div style="display: flex;justify-content: space-between;align-items: center;">
                  <div>
                    <span style="color: #666">{{$t('deviceManager.screenTime')}}</span> &nbsp;
                    <span>{{Date.now() | formatDate}}</span>
                  </div>

                  <div>
                    <span style="color: #666">{{$t('deviceManager.onlineTime')}}</span> &nbsp;
                    <span>{{curClickDevice.onLineTime}}</span>
                  </div>

                  <div>
                    <span style="color: #666">{{$t('deviceManager.deviceId')}}</span> &nbsp;
                    <span>{{curClickDevice.decimalId}}</span>
                  </div>

                  <div>
                    <el-button type="text" @click="toggleDialog('details')">{{$t('deviceManager.moreInfo')}}</el-button>
                  </div>
                </div>

                <div style="text-align: right;">
                  <el-button type="text" @click="toggleDialog('')">{{$t('deviceManager.setting')}}</el-button>
                </div>
              </div>
            </div>

            <div class="footer" :style="{ 'height': footerHeight + 'px' }">
              <div class="title" style="font-size: 18px;margin: 15px 0;">
                {{$t('deviceManager.historyScreenshots')}}
              </div>

              <ul style="width: 200%;position: relative;display: flex;">
                <li class="history-list" v-for="i in 4" :key="i">
                  <div class="history-list-img">
                    <img src="" :alt="$t('deviceManager.screen')" width="100%" height="100%" />
                  </div>

                  <span>{{Date.now() | formatDate}}</span>
                </li>

                <span class="seeMore-btn">
                  {{$t('deviceManager.seeMore')}}
                </span>
              </ul>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="null-box" style="width: 100%;height: 300px;display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <div style="font-size: 20px;margin-bottom: 20px;">{{$t('deviceManager.noAdditionalEquipment')}}</div>

            <div>
              <el-button @click="handleAdd">{{$t('deviceManager.addDevices')}}</el-button>
              &nbsp;&nbsp; {{$t('deviceManager.or')}} &nbsp;&nbsp;
              <el-button plain @click="$router.push({ path: '/device/deviceManager' })">{{$t('deviceManager.BackHomePage')}}</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <el-dialog :title="dialogTitle"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :width="dialogWidth"
               @close="dialogKey = ''">
      <!--详情-->
      <div class="create-dialog"
           v-if="dialogKey === 'details' && curClickDevice"
           style="min-height: 500px;position: relative;">
        <el-form label-width="100px" size="mini" inline label-position="left">
          <el-form-item :label="$t('deviceManager.deviceName')" style="width: 30%;">
            <span>{{curClickDevice.name}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.subsidiaryOrgan')" style="width: 30%;">
            <span>{{curClickDevice.officeName}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.createdTime')" style="width: 30%;">
            <span>{{curClickDevice.updateDate | formatDate}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.state')" style="width: 30%;">
            <span v-if="curClickDevice.status==='1'">{{$t('deviceManager.online')}}</span>
            <span v-else-if="curClickDevice.status==='2'">{{$t('deviceManager.standby')}}</span>
            <span v-else>{{$t('deviceManager.offline')}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.onlineTime')" style="width: 30%;">
            <span>{{curClickDevice.onLineTime}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.cumulativeRunningTime')" style="width: 30%;">
            <span>{{curClickDevice.totalRunningTime}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.brightness')" style="width: 30%;">
            <span>{{curClickDevice.brightness}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.volume')" style="width: 30%;">
            <span>{{curClickDevice.volume}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.touchState')" style="width: 30%;">
            <span v-if="curClickDevice.touchState==='1'">{{$t('deviceManager.open')}}</span>
            <span v-else>{{$t('deviceManager.shut')}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.deviceId')" style="width: 30%;">
            <span>{{curClickDevice.decimalId}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.macAddress')" style="width: 30%;">
            <span>{{curClickDevice.id}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.ipAddress')" style="width: 30%;">
            <span>{{curClickDevice.ip}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.ram')" style="width: 30%;">
            <span>{{curClickDevice.ram}} GB</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.storageSpace')" style="width: 30%;">
            <span>{{curClickDevice.availableSpace}}GB / {{curClickDevice.totalSpace}}GB</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.dpi')" style="width: 30%;">
            <span>{{curClickDevice.ratio}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.androidVersion')" style="width: 30%;">
            <span>{{curClickDevice.androidVersion}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.systemVersion')" style="width: 30%;">
            <span>{{curClickDevice.systemVersion}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.apkVersion')" style="width: 30%;">
            <span>{{curClickDevice.apkVersion}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.mark')" style="width: 100%;">
            <span>{{curClickDevice.remarks}}</span>
          </el-form-item>
        </el-form>

        <span style="color: #999;font-size: 12px;position: absolute;left: 0;bottom: 0;">
          * {{$t('deviceManager.lastUpdateTime')}} :
          {{curClickDevice.updateDate | formatDate}}
          ({{$t('deviceManager.hourlyUpdatedData')}})
        </span>
      </div>

      <!--删除-->
      <div class="manager-dialog" v-if="dialogKey === 'delete'">
        <span>{{$t('officeManager.afterAnti')}}</span>

        <div slot="footer" class="dialog-footer">
          <el-button @click="isShowDialog = false">{{$t('common.cancel')}}</el-button>
          <el-button type="danger" plain @click="anti(), isShowDialog = false">{{$t('officeManager.anti')}}</el-button>
        </div>
      </div>

      <!--添加设备-->
      <div v-if="dialogKey === 'add'" style="width: 800px">
        <div class="search" style="display: inline-block;"  v-if="isofficeShow">
          <el-input @keyup.enter.native="handleSearch" style="width: 200px;" :placeholder="$t('planManager.searchDeviceName')" v-model="searchOfficeVal">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="handleSearch"></i>
          </el-input>
        </div>
        <el-row style="margin-top: 10px;" v-if="isofficeShow">
          <span><a style="color:#409EFF;margin-right: 10px;" @click="changezIndex">返回</a>{{officeName}}</span>
        </el-row>
        <div class="whiteBox"
             :style="{'width': '120px','height': '120px','background':'#fff','position': 'absolute','top': '200px','left': '330px','z-index': wIndex +'' }">

        </div>
        <el-transfer
          :style="{ 'width': '100%', 'position': 'absolute', 'top': '100px', 'left': '10px', 'z-index': zIndex +'' }"
          v-model="officeVal"
          :data="officeData"
          :titles="['设备名称',$t('planManager.selectedEquipment')]"
          :button-texts="[$t('planManager.deleteEquipment'), $t('planManager.addEquipment')]">
        </el-transfer>
        <el-form style="width: 320px;height: 300px;position: absolute;top: 100px;left: 10px;z-index: 1111">
          <el-form-item>
            <el-input
              :placeholder="$t('common.searchOrganizationName')"
              v-model="filterText"
              suffix-icon="el-icon-search"
              clearable
              :closable="false">
            </el-input>

            <el-tree
              class="filter-tree"
              :data="treeData"
              :props="defaultProps"
              :default-expanded-keys="[officeId]"
              :filter-node-method="filterNode"
              ref="officeTree"
              show-checkbox
              highlight-current
              node-key="id"
              check-on-click-node
              :expand-on-click-node="false"
              @check="checkOfficeHandle"
              check-strictly
              style="border: 1px solid #d3dce6;min-height: 248px;">
            </el-tree>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer"  v-if="dialogKey === 'add'" style="margin-top: 320px">
        <el-button @click="dialogVisible = false" >{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" v-if="isChangeContent === 'source'" @click="dialogVisible = false;addDecial()" :disabled="isAddDevice">{{$t('common.confirmBtn')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { formatDate, treeify } from '@/utils'
  import { getScreenShoot, getRltMonitor, findCaptureByTerminalIdAndDate } from '@/api/screen'
  import { mapGetters } from 'vuex'
  import { getOfficeList } from '@/api/office'
  import { getPlanList,saveStrategy,delStrategys,strategyTerminal,terminalPageByOffices,strategyRelatedTerminal,delStrategyterminal } from '@/api/plan'

  export default {
    name: 'deviceManager-screen',
    components: {  },
    props: {
      curCheckedDeviceList: {
        type: Array,
        default: null,
      },
    },
    data() {
      return {
        showModel: 'multiple',
        busy: false,
        showDeviceList: [],
        totalDeviceList: [],
        pageSize: 8,
        page: 1,
        listHeight: document.documentElement.clientHeight - 190,
        searchVal: '',
        isShowSearchBtn: true,
        isRefreshing: false,
        refreshTxt: this.$t('deviceManager.refresh'),
        singleHeight: document.documentElement.clientHeight - 130,
        devicesListUlHeight: document.documentElement.clientHeight - 250,
        curClickDevice: null,
        dialogKey: '',
        dialogVisible: false,
        dialogTitle: '',
        dialogWidth: '50%',
        detailsDialogActiveTabsName: 'details', // 详情
        footerHeight: document.documentElement.clientHeight - 695,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        treeData: [],
        isofficeShow: false,
        searchOfficeVal: '',
        isAddDevice:false,
        wIndex:1200,
        zIndex:1,
        officeData:[],
        officeVal:[0,0],
        filterText: '',
        isChangeContent: "source"
      }
    },
    created() {
      console.log('进入屏幕画面后设备有',  this.curCheckedDeviceList);

      if (this.curCheckedDeviceList && this.curCheckedDeviceList.length>0) {
        // todo 根据 curCheckedDeviceList 请求数据

        this.totalDeviceList = this.curCheckedDeviceList;
        this.showDeviceList.push(...this.curCheckedDeviceList.slice(0,8));
        this.showDeviceList = this.showDeviceList.map(item => {
          item.isLoading = true;
          return item;
        })
        this.getScreenList(this.showDeviceList);

        console.log(this.showDeviceList);
      } else {
        this.$router.push({ path: '/device/deviceManager' });
      }
    },
    filters: {
      formatDate(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd hh:mm');
      }
    },
    computed: {
      ...mapGetters([
        'language',
        'officeId'
      ]),
    },
    watch: {
    },
    mounted() {
    },
    methods: {
      getScreenList(showDeviceList) {
        if (!showDeviceList || showDeviceList.length===0) return;

        showDeviceList.map((item, index) => {
          getScreenShoot({
            terminalId: item.id
          }).then(res => {
            console.log(res);

            let tid = item.id;
            let count = 1;
            let sId= setInterval(() => {
              getRltMonitor({ tid }).then(r => {
                console.log(r);

                if (r.status==='1' && r.isHaveRealCapture===false) {
                  count++;
                  if(count >= 20) {
                    clearInterval(sId);
                    this.showDeviceList[index].status = '-1';
                    this.showDeviceList[index].isLoading = false;
                  }
                } else {
                  clearInterval(sId);
                  this.showDeviceList[index].status = r.status;
                  this.showDeviceList[index].isHaveRealCapture = r.isHaveRealCapture;
                  this.showDeviceList[index].onLineTime = r.onLineTime;
                  this.showDeviceList[index].captureList = r.captureList;
                  this.showDeviceList[index].isLoading = false;
                }
              }).catch(e => {
                console.log(e);
                if(count >= 20) {
                  clearInterval(sId);
                  this.showDeviceList[index].status = '-1';
                  this.showDeviceList[index].isLoading = false;
                }
              });
            }, 3000);
          }).catch(err => {
            console.log(err);
            this.showDeviceList[index].status = '-1';
            this.showDeviceList[index].isLoading = false;
          })
        });
      },
      loadMore() {
        if (this.page*this.pageSize < this.totalDeviceList.length) {
          this.busy = true;
          this.page++;
          this.showDeviceList.push(...this.curCheckedDeviceList.slice(0+this.page, this.pageSize+this.page));
          this.getScreenList(this.showDeviceList);
          this.busy = false;
        }
      },
      handleSearch() {
        alert('施工中...')
      },
      handleAdd() {
        this.toggleDialog('add');
      },
      handleRefresh() {
        this.isRefreshing = true;
        this.refreshTxt = this.$t('deviceManager.loading');

        setTimeout(() => {
          this.isRefreshing = false;
          this.refreshTxt = this.$t('deviceManager.refresh');
        }, 2000)
      },
      handleClickToView(item) {
        this.toggleModel('single', item);
        console.log('单图详情', item);
      },
      handleCloseSingle() {
        alert('close中...')
      },
      toggleModel(model, info) {
        this.showModel = model;
        if (info) {
          this.curClickDevice = info;
        } else {
          this.curClickDevice = this.showDeviceList[0];
        }
      },
      handleDetailsDialogClick() {
        alert('施工中...')
      },
      handleClearAll() {
        this.showDeviceList = [];
        this.curClickDevice = null;
      },
      toggleDialog(title) {
        switch (title) {
          case 'details':
            this.dialogKey = 'details';
            this.dialogTitle = this.$t('deviceManager.details');
            this.dialogWidth = '60%';
            break;
          case 'add':
            this.dialogKey = 'add';
            this.dialogTitle = this.$t('deviceManager.addDevices');
            this.dialogWidth = '800px';
            getOfficeList().then(res => {
              console.log(res);
              if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId
              let arr = [res.currentOffice].concat(res.officeMsg);
              let tree = treeify(arr, 'id', 'parentId', 'children');
              this.treeData = JSON.parse(JSON.stringify([tree]));
            }).catch(err => {
              console.log(err)
            })
            break;
          default:
            this.dialogKey = '--';
            this.dialogTitle = '--';
            this.dialogWidth = '50%';
            break;
        }

        this.dialogVisible = true;
      },
      changezIndex() {
        this.wIndex = 1200
        this.isAddDevice = false
        this.dialogTitle = this.$t('planManager.deviceManagement');
        this.zIndex = 1;
        this.isofficeShow = false
      },
      checkOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['officeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反
        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.zIndex = 1200;
          this.isAddDevice = true
          this.dialogTitle = this.$t('planManager.addDevice');
          this.wIndex = 1
          $('.el-transfer-panel input[type="checkbox"]').attr('disabled','disabled')
          this.isofficeShow = true
          this.$refs['officeTree'].setCurrentKey(data.id);
          this.curofficeId = data.id
          this.officeName = data.name
          // officeData
          terminalPageByOffices({officeIds: this.curofficeId}).then(res => {
            this.officeData = []
            for(let key in res.data){
              let id = res.data[key].id
              let decimalId = res.data[key].decimalId
              let decaimalName = res.data[key].name
              let obj = {}
              obj.key = id
              obj.label = decaimalName
              this.officeData.push(obj)
            }
            //this.officeData = res.data;
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
        } else { // 已选 -> 去选
          this.$refs['officeTree'].setCheckedKeys([]);
          this.curofficeId = ''
          this.officeName = ''
        }

      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  //reset element css of el-icon-close
  .deviceManager-screen-wrapper {
    .el-dialog .el-dialog__body .el-transfer .el-transfer-panel{
      width: 320px;
    }
  }
  .el-dialog{
    width: 800px;
    min-height: 450px;
  }
  .el-dialog__body{
    position: relative;
  }
  .span_line:nth-of-type(1)::after{
    content: '~';
    display: inline-block;
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.deviceManager-screen-wrapper {
  width: 100%;
  .multiple-model {
    width: 100%;
    .header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 10px 10px 0 0;
    }

    .screen-list {
      @include scrollBar;
      width: 100%;
      overflow: auto;
    }

    .list-wrapper {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    .list-box {
      width: 50%;
      padding-right: 20px;
      margin-bottom: 20px;
    }

    .list-container {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
      background-color: #fff;
      margin-bottom: 40px;
    }

    .list-img {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
      position: relative;
    }

    .list-mask {
      display: none;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .25);
      cursor: pointer;
    }

    .list-img:hover .list-mask {
      display: block !important;
    }



  }

  .single-model {
    width: 100%;
    display: flex;
    .left-list {
      width: 300px;
      .left-list-wrapper {
        width: 100%;
        height: 100%;
        background-color: #fff;
        border: 1px solid #EBEEF5;
        padding: 10px;
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
      }

      .devices-list-ul {
        @include scrollBar;
        width: 100%;
        overflow: auto;
        border-bottom: 1px solid #DCDFE6;
      }

      .devices-list-li {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #EBEEF5;
      }
    }

    .right-img {
      width: calc(100% - 300px);
      padding-left: 20px;
      .right-img-wrapper {
        height: 100%;
        background-color: #fff;
        padding: 10px;
      }


      .img {
        width: 100%;
        border-bottom: 1px solid #DCDFE6;
        .img-box {
          width: 646px;
          height: 392px;
          margin: 0 auto 10px;
          background: #999;
        }
      }

      .footer {
        @include scrollBar;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        .history-list {
          width: 332px;
          height: 186.75px;
          padding-right: 20px;
          text-align: center;
          .history-list-img {
            width: 100%;
            height: 100%;
            background-color: #999;
            margin-bottom: 10px;
          }
        }

        .seeMore-btn {
          width: 47px;
          height: 47px;
          display: flex;
          position: absolute;
          left: 50%;
          margin-left: -54px;
          top: 50%;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.5);
          color: #fff;
          user-select: none;
          cursor: pointer;
          align-items: center;
          text-align: center;
        }
      }
    }
  }

  .create-dialog {
    @include scrollBar;
    max-height: 500px;
    overflow: auto;
  }
}
</style>


