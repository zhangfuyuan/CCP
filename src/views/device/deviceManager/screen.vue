<template>
  <div class="deviceManager-screen-wrapper">
    <!--多图模式-->
    <div class="multiple-model" v-if="showModel === 'multiple'">
      <!--顶部信息和操作按钮-->
      <div class="header">
        <div class="info" style="color: #666;">
          <span style="margin-right: 10px;">
            {{$t('deviceManager.total')}} {{isFilter ? showDeviceList.length : totalDeviceList.length}} {{$t('deviceManager.devices')}}
          </span>

          <span>
            {{$t('deviceManager.screenTime')}} {{Date.now() | formatDate }}
          </span>
        </div>

        <div class="btns" style="display: flex;align-items: center;">
          <el-button @click="handleAdd">{{$t('deviceManager.addDevices')}}</el-button>

          <el-button plain
                     style="margin-left: 15px;"
                     :disabled="showDeviceList.length===0"
                     :loading="isRefreshing"
                     @click="handleRefresh">{{isRefreshing ? $t('deviceManager.loading') : $t('deviceManager.refresh')}}</el-button>

          <el-button type="danger"
                     plain
                     style="margin-left: 15px;"
                     @click="handleClearAll">{{$t('deviceManager.clearAll')}}</el-button>

          <el-button v-if="isShowSearchBtn"
                     icon="el-icon-search"
                     style="margin-left: 15px;"
                     @click="isShowSearchBtn = false"></el-button>
          <el-input v-else
                    @keyup.enter.native="handleMultipleDeviceSearch"
                    style="width: 250px;margin-left: 15px;"
                    :placeholder="$t('deviceManager.deviceNameOrId')"
                    v-model="searchVal"
                    clearable
                    @clear="handleMultipleCloseSearch">
            <i slot="suffix" style="cursor: pointer;" class="el-input__icon el-icon-search" @click="handleMultipleDeviceSearch"></i>
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
                <div class="list-img" v-loading="item.isLoading" style="width: 550px;height: 309.37px;background-color:#666;">
                  <template v-if="item.screenStatus==='1'">
                    <!-- todo 多图 550*309.37 ------------------------------------------------------------>
                    <div class="adaptive-img-box" style="width: 100%;height: 100%">
                      <img :class="[ 'adaptive-img', 'adaptive-img-'+item.id ]"
                           :src="item.captureList[0].path"
                           :alt="$t('deviceManager.screen')"/>
                    </div>
                  </template>
                  <template v-else-if="item.screenStatus==='2'">
                    <span style="color: #f8f8f8;font-size: 20px;">{{$t('deviceManager.standby')}}</span>
                  </template>
                  <template v-else-if="item.screenStatus==='0'">
                    <span style="color: #f8f8f8;font-size: 20px;">{{$t('deviceManager.offline')}}</span>
                  </template>
                  <template v-else-if="item.screenStatus==='-2'">
                    <span style="color: #f8f8f8;font-size: 20px;">{{$t('deviceManager.requestTimeout')}}</span>
                  </template>
                  <template v-else-if="item.screenStatus==='-1'">
                    <span style="color: #f8f8f8;font-size: 20px;">{{$t('common.unknownError')}}</span>
                  </template>
                  <template v-else>
                    <span style="color: #f8f8f8;font-size: 20px;">...</span>
                  </template>

                  <div class="list-mask" @click.stop.prevent="handleClickToView(item)">
                    <span style="position: absolute;color: #fff;font-size: 28px;right: 10px;top: 10px;"
                          @click.stop.prevent="handleCloseSingle(item.id, true)">
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
                  <span style="color: #666;">{{item.name}}</span>

                  <el-button type="text"
                             :disabled="!item.screenStatus ||item.screenStatus==='-2' || item.screenStatus==='-1'"
                             style="font-size: 16px;"
                             @click="showHistory(item)">{{$t('deviceManager.historyScreenshots')}}
                  </el-button>
                </div>
              </div>
            </li>

            <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10" style="width: 100%;">
              <div style="height: 50px;display: flex;justify-content: center;align-items: center;color: #999;font-size: 14px;">
                <template v-if="busy">
                  <i class="el-icon-loading" style="margin-right: 10px;"></i>
                  <span >{{$t('deviceManager.loading')}}...</span>
                </template>

                <template v-else>
                  <span v-if="showDeviceList.length>4">{{$t('deviceManager.atAll')}}</span>
                </template>
              </div>
            </div>
          </ul>
        </div>
      </template>

      <!--多图模式无搜索结果状态-->
      <template v-else-if="isFilter">
        <div class="null-box" style="width: 100%;height: 300px;display: flex;flex-direction: column;align-items: center;justify-content: center;">
          <div style="font-size: 20px;margin-bottom: 20px;">{{$t('deviceManager.noSearchResults')}}</div>
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
      <!--<div class="left-list" :style="{ 'height': singleHeight + 'px' }">-->
      <div class="left-list" style="height: 846px;">
        <div class="left-list-wrapper">
          <div class="header">
            <div class="header-btns">
              <span>
              {{$t('deviceManager.deviceNumber')}} {{isFilter ? showDeviceList.length : totalDeviceList.length}}
           </span>

              <span>
              <el-button icon="el-icon-plus" @click="handleAdd"></el-button>
              <el-button icon="el-icon-search" @click="isShowSearchBtn = !isShowSearchBtn"></el-button>
           </span>
            </div>

            <div class="header-search" v-show="!isShowSearchBtn">
              <el-input @keyup.enter.native="handleSingleDeviceSearch"
                        style="width: 100%;"
                        :placeholder="$t('deviceManager.deviceNameOrId')"
                        v-model="searchVal"
                        clearable
                        @clear="handleSingleCloseSearch()">
                <i slot="suffix" style="cursor: pointer;" class="el-input__icon el-icon-search" @click="handleSingleDeviceSearch"></i>
              </el-input>
            </div>
          </div>

          <div class="devices-list" v-loading="(curClickDevice&&curClickDevice.isLoading) || isMultipleLoading">
            <!--<ul class="devices-list-ul" :style="{ 'height': (!isShowSearchBtn ? devicesListUlHeight : devicesListUlHeight+40) + 'px' }">-->
            <ul class="devices-list-ul" style="height: 714px;">
              <template v-if="showDeviceList.length>0">
                <li v-for="(item, index) in showDeviceList"
                    :class="[ 'devices-list-li', { 'is-cur': item.id === curClickDevice.id } ]"
                    @click.stop.prevent="toggleCurClickDevice(item)">
                  <el-button type="text"
                             style="color: #F56C6C;"
                             size="mini"
                             @click.stop.prevent="handleCloseSingle(item.id)">{{$t('common.delete')}}</el-button>

                  <div style="padding-left: 10px;display: flex;flex-direction: column;justify-content: flex-start;">
                    <span style="color: #333;font-size: 14px;margin-bottom: 5px;">{{item.name}}</span>
                    <span style="color: #909399;font-size: 12px">{{item.officeName}}</span>
                  </div>
                </li>
              </template>

              <template v-else-if="isFilter">
                <li class="null-box" style="width: 100%;height: 300px;display: flex;flex-direction: column;align-items: center;justify-content: center;">
                  <div style="font-size: 20px;margin-bottom: 20px;">{{$t('deviceManager.noSearchResults')}}</div>
                </li>
              </template>

              <template v-else>
                <li class="null-box" style="width: 100%;height: 300px;display: flex;flex-direction: column;align-items: center;justify-content: center;">
                  <div style="font-size: 20px;margin-bottom: 14px;color: #999;">{{$t('common.noData')}}</div>
                </li>
              </template>
            </ul>

            <div style="text-align: center;margin-top: 10px;">
              <el-button type="text"
                         style="color: #F56C6C;"
                         size="mini"
                         :disabled="showDeviceList.length===0"
                         @click="handleClearAll">{{$t('deviceManager.clearAll')}}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!--右侧单图内容-->
      <!--<div class="right-img" :style="{ 'height': singleHeight + 'px' }">-->
      <div class="right-img" style="height: 846px;">
        <template v-if="curClickDevice">
          <div class="right-img-wrapper">
            <div class="header" style="display: flex;justify-content: space-between;align-items: flex-start;margin-bottom: 10px;">
              <div style="display: flex;flex-direction: column;justify-content: flex-start;">
                <span style="font-size: 20px;color: #333;margin-bottom: 5px;">{{curClickDevice.name}}</span>
                <span style="font-size: 14px;color: #666;">{{curClickDevice.officeName}}</span>
              </div>

              <div style="display: flex;align-items: center;">
                <el-button plain
                           style="margin-left: 15px;"
                           :disabled="showDeviceList.length===0"
                           :loading="isRefreshing"
                           @click="handleSingleRefresh">{{isRefreshing ? $t('deviceManager.loading') : $t('deviceManager.refresh')}}</el-button>

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
              <div class="img-box" v-loading="(curClickDevice&&curClickDevice.isLoading)" style="width: 768px;height: 432px;background-color:#666;">
                <template v-if="curClickDevice.screenStatus==='1'">
                  <!-- todo 单图 768*432 ------------------------------------------------------------>
                  <div class="adaptive-img-box" style="width: 100%;height: 100%;">
                    <img :class="[ 'adaptive-img', 'adaptive-img-'+curClickDevice.id ]"
                         :src="curClickDevice.captureList[0].path"
                         :alt="$t('deviceManager.screen')"/>
                  </div>
                </template>
                <template v-else-if="curClickDevice.screenStatus==='2'">
                  <span style="color: #fff;font-size: 20px;">{{$t('deviceManager.standby')}}</span>
                </template>
                <template v-else-if="curClickDevice.screenStatus==='0'">
                  <span style="color: #fff;font-size: 20px;">{{$t('deviceManager.offline')}}</span>
                </template>
                <template v-else-if="curClickDevice.screenStatus==='-2'">
                  <span style="color: #fff;font-size: 20px;">{{$t('deviceManager.requestTimeout')}}</span>
                </template>
                <template v-else-if="curClickDevice.screenStatus==='-1'">
                  <span style="color: #f8f8f8;font-size: 20px;">{{$t('common.unknownError')}}</span>
                </template>
                <template v-else>
                  <span style="color: #f8f8f8;font-size: 20px;">...</span>
                </template>
              </div>

              <div class="img-info" style="font-size: 14px;">
                <div style="display: flex;justify-content: space-between;align-items: center;">
                  <div>
                    <span style="color: #666">{{$t('deviceManager.screenTime')}}</span> &nbsp;
                    <span v-if="curClickDevice.screenStatus==='1'">{{curClickDevice.captureList[0].updateDate | formatDate}}</span>
                    <span v-else>--</span>
                  </div>

                  <div>
                    <span style="color: #666">{{$t('deviceManager.onlineTime')}}</span> &nbsp;
                    <span>{{curClickDevice.onLineTime | formatDay}}</span>
                  </div>

                  <div>
                    <span style="color: #666">{{$t('deviceManager.deviceId')}}</span> &nbsp;
                    <span>{{curClickDevice.decimalId}}</span>
                  </div>

                  <div>
                    <el-button type="text" @click="toggleDialog('details')">{{$t('deviceManager.moreInfo')}}</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!--<div class="footer" :style="{ 'height': footerHeight + 'px' }">-->
            <div class="footer" style="height: 280px;">
              <div class="title" style="font-size: 18px;margin: 15px 0;">
                {{$t('deviceManager.historyScreenshots')}}
              </div>

              <template v-if="curClickDevice && curClickDevice.captureList && curClickDevice.captureList[0]">
                <ul style="width: 400%;position: relative;display: flex;" v-if="curClickDevice && curClickDevice.captureList">
                  <li class="history-list" v-for="(item, index) in curClickDevice.captureList.slice(0, 6)" :key="index">
                    <div class="history-list-img">
                      <!-- todo 历史 332*186.75 ------------------------------------------------------------>
                      <div class="adaptive-img-box" style="width: 332px;height: 186.75px;">
                        <img class="adaptive-img adaptive-img-history"
                             :src="item.path"
                             :alt="$t('deviceManager.screen')"/>
                      </div>
                    </div>

                    <span style="font-size: 14px;color: #999;">{{item.updateDate | formatDate}}</span>
                  </li>

                  <span class="seeMore-btn" @click="showHistory(curClickDevice)">
                  {{$t('deviceManager.seeMore')}}
                </span>
                </ul>
              </template>
              <template v-else>
                <div style="width: 100%;height: 50px;line-height: 50px;text-align: center;color: #999;font-size: 14px;">
                  {{$t('common.noData')}}
                </div>
              </template>
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
            <span>{{curClickDevice.onLineTime | formatDay}}</span>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.cumulativeRunningTime')" style="width: 30%;">
            <span>{{curClickDevice.totalRunningTime | formatDay}}</span>
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

      <!--添加设备-->
      <template v-if="dialogKey === 'add'" >
        <div style="width: 800px">
          <div class="search" style="display: inline-block;"  v-if="isOfficeShow">
            <el-input @keyup.enter.native="handleAllDeviceSearch" style="width: 200px;" :placeholder="$t('planManager.searchDeviceName')" v-model="searchOfficeDeviceVal">
              <i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer;" @click="handleAllDeviceSearch"></i>
            </el-input>
          </div>
          <el-row style="margin-top: 10px;" v-if="isOfficeShow">
            <span><a style="color:#409EFF;margin-right: 10px;" @click="changezIndex">{{$t('common.return')}}</a>{{curOfficeName}}</span>
          </el-row>
          <div class="whiteBox"
               :style="{'width': '120px','height': '120px','background':'#fff','position': 'absolute','top': '200px','left': '330px','z-index': wIndex +'' }">
          </div>
          <div class="whiteSmallBox"
               :style="{'width': '50px','height': '20px','background':'#f5f7fa','position': 'absolute','top': '110px','left': '270px','z-index': zIndex+1 +'' }">
          </div>
          <el-transfer
            :style="{ 'width': '100%', 'height': '300px','position': 'absolute', 'top': '100px', 'left': '10px', 'z-index': zIndex +'' }"
            v-model="officeDeviceVal"
            :left-default-checked="officeDeviceVal"
            :data="officeDeviceData"
            :titles="[$t('planManager.deviceName'),$t('planManager.selectedEquipment')]"
            :button-texts="[$t('planManager.deleteEquipment'), $t('planManager.addEquipment')]">
          <span slot-scope="{ option }"
                :class="{ 'cjc_isHidden': (option.officeid!==curOfficeId) && (officeDeviceVal.indexOf(option.key)===-1),
                           'cjc_isShow': (option.officeid===curOfficeId) && (officeDeviceVal.indexOf(option.key)===-1) }"
                :title="option.label">{{ option.label }}
          </span>
          </el-transfer>
          <el-form style="width: 320px;height: 300px;position: absolute;top: 100px;left: 10px;z-index: 1111" v-if="zIndex === 1">
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
                highlight-current
                node-key="id"
                check-on-click-node
                :expand-on-click-node="false"
                @node-click="clickOfficeHandle"
                @check="checkOfficeHandle"
                check-strictly
                style="border: 1px solid #d3dce6;height: 248px;overflow: auto;">
              </el-tree>
            </el-form-item>
          </el-form>
        </div>

        <div slot="footer" class="dialog-footer"  v-if="dialogKey === 'add'" :style="{ 'margin-top': isOfficeShow ? '264px' : '330px' }">
          <el-button @click="dialogVisible = false" >{{$t('common.cancelBtn')}}</el-button>
          <el-button type="primary"
                     @click="addDevice(), dialogVisible = false"
                     :disabled="officeDeviceVal.length===0">{{$t('common.confirmBtn')}}
          </el-button>
        </div>
      </template>

      <template v-if="dialogKey === 'history'">
        <div class="history-timer" style="height: 40px;text-align: right;margin-bottom: 10px;">
          <el-date-picker
            v-model="datePickerVal"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            :start-placeholder="$t('planManager.datePickerStartPlaceholder')"
            :end-placeholder="$t('planManager.datePickerEndPlaceholder')"
            :picker-options="datePickerOptions"
            value-format="yyyy-MM-dd">
          </el-date-picker>

          <el-button icon="el-icon-search" style="margin-left: 10px;" @click="handleSearchScreen">{{$t('common.search')}}</el-button>
        </div>

        <div class="history-container">
          <template v-if="curDeviceCaptureMap && Object.keys(curDeviceCaptureMap).length>0">
            <div v-for="(item, index) in Object.keys(curDeviceCaptureMap).reverse()" :key="index" style="margin-bottom: 30px;">
              <div><svg-icon icon-class="circle" /> &nbsp; {{curDeviceCaptureMap[item][0].updateDate | formatDateDate}}</div>

              <div style="padding: 10px;position: relative;">
                <swiper :options="swiperOption" >
                  <swiper-slide v-for="(data, i) in curDeviceCaptureMap[item]" :key="i" class="history-more-list">
                    <div class="history-more-list-img" style="cursor: pointer;" @click="showBigScreen(data)">
                      <!-- todo 更多 332*186.75 ------------------------------------------------------------>
                      <div class="adaptive-img-box" style="width: 332px;height: 186.75px;">
                        <img class="adaptive-img adaptive-img-more"
                             :src="data.path"
                             :alt="$t('deviceManager.screen')"/>
                      </div>
                    </div>

                    <span style="font-size: 14px;color: #999;">{{+data.updateDate | formatDateTime}}</span>
                  </swiper-slide>

                  <swiper-slide class="history-more-list"></swiper-slide> <!--解决最后一张无法显示全的问题-->
                  <div class="swiper-button-prev" slot="button-prev"></div>
                  <div class="swiper-button-next" slot="button-next"></div>
                </swiper>
              </div>
            </div>
          </template>

          <template v-else>
            <div style="text-align: center;color: #999;height: 50px;line-height: 50px;">{{$t('common.noData')}}</div>
          </template>
        </div>
      </template>

      <el-dialog
        width="864px"
        :title="$t('deviceManager.screen')"
        :visible.sync="screenDialogVisible"
        append-to-body
        v-if="dialogKey === 'history' && curBigScreenInfo">
        <!-- todo 放大 824*463.5 ------------------------------------------------------------>
        <div class="adaptive-img-box" style="width: 824px;height: 463.5px;margin-bottom: 10px;">
          <img class="adaptive-img adaptive-img-big"
               :src="curBigScreenInfo.path"
               :alt="$t('deviceManager.screen')"/>
        </div>
        <div style="text-align: center;">{{curBigScreenInfo.name}}</div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
  import { formatDate, treeify, listClassify, imgHistoryScreenCapture } from '@/utils'
  import { getScreenShoot, getRltMonitor, findCaptureByTerminalIdAndDate } from '@/api/screen'
  import { mapGetters } from 'vuex'
  import { getOfficeList } from '@/api/office'
  import { getPlanList,saveStrategy,delStrategys,strategyTerminal,terminalPageByOffices,strategyRelatedTerminal,delStrategyterminal } from '@/api/plan'
  import { getDeviceList } from '@/api/device'
  import 'swiper/dist/css/swiper.css'
  import { swiper, swiperSlide } from 'vue-awesome-swiper'

  export default {
    name: 'deviceManager-screen',
    components: { swiper, swiperSlide },
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
        listHeight: document.documentElement.clientHeight - 190,
        searchVal: '',
        isShowSearchBtn: true,
        isRefreshing: false,
        singleHeight: document.documentElement.clientHeight - 130,
        devicesListUlHeight: document.documentElement.clientHeight - 300,
        curClickDevice: null,
        dialogKey: '',
        dialogVisible: false,
        dialogTitle: '',
        dialogWidth: '50%',
        detailsDialogActiveTabsName: 'details', // 详情
        footerHeight: document.documentElement.clientHeight - 695,
        // 选择设备
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        treeData: [],
        isOfficeShow: false,
        searchOfficeDeviceVal: '',
        wIndex:1200,
        zIndex:1,
        officeDeviceData:[],
        officeDeviceDataCopy: [], //过滤器备份
        officeDeviceVal:[],
        officeDeviceDataDetail: [], //新增详细的设备信息列表
        filterText: '',
        curOfficeId: '',
        curOfficeName: '',
        // 搜索
        isFilter: false,
        // 历史截屏
        curDeviceCaptureMap: null,
        curDeviceCaptureMapCopy: null,
        datePickerVal: '',
        datePickerOptions: {
          shortcuts: [{
            text: this.$t('planManager.latestWeek'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t('planManager.latestMonth'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t('planManager.latest3Month'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        screenDialogVisible: false,
        curBigScreenInfo: null,
        curClickHistoryDeviceId: '',
        timer: null,
        // 更多历史轮播图
        swiperOption: {
          slidesPerView: 3,
          spaceBetween: 20,
          width: 1036,
          setWrapperSize: true,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }
        }
      }
    },
    created() {
      console.log('进入屏幕画面后设备有',  this.curCheckedDeviceList);

      if (this.curCheckedDeviceList && this.curCheckedDeviceList.length>0) {
        // todo 根据 curCheckedDeviceList 请求数据

        this.totalDeviceList = this.curCheckedDeviceList;

        this.showDeviceList.push(...this.totalDeviceList.slice(0, this.pageSize));
        this.showDeviceList = this.showDeviceList.map(item => {
          item.isLoading = true;
          return item;
        });
        this.eachGetScreenList(JSON.parse(JSON.stringify(this.showDeviceList)));

        console.log(this.showDeviceList);
      } else {
        this.$router.push({ path: '/device/deviceManager' });
      }
    },
    beforeDestroy() {
      this.clearTimer();
    },
    filters: {
      formatDate(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd hh:mm');
      },
      formatDateTime(time){
        let date = new Date(time);
        return formatDate(date,'hh:mm');
      },
      formatDateDate(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd');
      },
      formatDay(time) {
        let day = Math.floor(time/(1000*60*60*24)),
          hour = Math.floor((time-day*(1000*60*60*24))/(1000*60*60)),
          min = Math.floor((time-day*(1000*60*60*24)-hour*(1000*60*60))/(1000*60));

        return day + 'd' + ' ' + hour + 'h';
      }
    },
    computed: {
      ...mapGetters([
        'language',
        'officeId'
      ]),
      isMultipleLoading() {
        return this.showDeviceList.some(item => item.isLoading === true)
      }
    },
    watch: {
      filterText(val) {
        this.$refs.officeTree.filter(val);
      }
    },
    mounted() {
    },
    methods: {
      eachGetScreenList(showDeviceList) { // todo 参数 showDeviceList 一定要备份!!!
        if (!showDeviceList || showDeviceList.length===0) return;

        const data = showDeviceList.shift();
        const index = this.showDeviceList.findIndex(item => item.id === data.id);

        console.log('本轮遍历数据', data, index);

        this.busy = true;
        this.isRefreshing = true;
        getScreenShoot({
          terminalId: data.id
        }).then(res => {
          console.log(res);

          let count = 1;
          if (this.timer) {
            this.clearTimer();
          }
          this.timer = setInterval(() => {
            getRltMonitor({ terminalId: data.id }).then(r => {
              console.log(r);

              if (r.status==='1' && r.isHaveRealCapture===false) { // 在线但请求不到实时截图
                count++;
                if(count >= 20) {
                  clearInterval(this.timer);

                  this.showDeviceList[index].screenStatus = '-2';
                  this.showDeviceList[index].isLoading = false;
                  this.showDeviceList.splice(index, 1, this.showDeviceList[index]); // todo Vue对数组索引赋值的局限性！！！
                  this.syncDataFormShowToTotalById(data.id);

                  if (showDeviceList.length > 0) {
                    console.log(8126.1, showDeviceList.length, this.showDeviceList.length)
                    this.eachGetScreenList(showDeviceList);
                  } else {
                    this.busy = false;
                    this.isRefreshing = false;
                    if (!this.curClickDevice) this.curClickDevice = this.showDeviceList[0];

                    console.log(8126.2, '所有请求轮完')
                  }
                }
              } else {
                console.log('一次请求截图出结果', r);
                clearInterval(this.timer);

                this.showDeviceList[index].screenStatus = r.status;
                this.showDeviceList[index].isHaveRealCapture = r.isHaveRealCapture;
                this.showDeviceList[index].onLineTime = r.onLineTime;
                this.showDeviceList[index].captureList = r.captureList.sort((a,b) => b.updateDate - a.updateDate);
                this.showDeviceList[index].isLoading = false;
                this.showDeviceList.splice(index, 1, this.showDeviceList[index]); // todo Vue对数组索引赋值的局限性！！！
                this.syncDataFormShowToTotalById(data.id);

                if (r.status==='1' && r.isHaveRealCapture===true) { // 在线且有实时截图
                  this.$nextTick(() => {
                    let _$adaptiveImg = $('.adaptive-img-'+data.id);
                    imgHistoryScreenCapture(_$adaptiveImg.attr('src'), _$adaptiveImg);
                    console.log('++实时截图++', _$adaptiveImg.attr('src'), _$adaptiveImg);
                  })
                }

                if (showDeviceList.length > 0) {
                  console.log(8126.1, showDeviceList.length, this.showDeviceList.length)
                  this.eachGetScreenList(showDeviceList);
                } else {
                  this.busy = false;
                  this.isRefreshing = false;
                  if (!this.curClickDevice) this.curClickDevice = this.showDeviceList[0];

                  console.log(8126.2, '所有请求轮完')
                }
              }
            }).catch(e => {
              console.log(e);
              clearInterval(this.timer);

              this.showDeviceList[index].screenStatus = '-1';
              this.showDeviceList[index].isLoading = false;
              this.showDeviceList.splice(index, 1, this.showDeviceList[index]); // todo Vue对数组索引赋值的局限性！！！
              this.syncDataFormShowToTotalById(data.id);

              if (showDeviceList.length > 0) {
                console.log(8126.1, showDeviceList.length, this.showDeviceList.length)
                this.eachGetScreenList(showDeviceList);
              } else {
                this.busy = false;
                this.isRefreshing = false;
                if (!this.curClickDevice) this.curClickDevice = this.showDeviceList[0];

                console.log(8126.2, '所有请求轮完')
              }
            });
          }, 3000);
        }).catch(err => {
          console.log(err, index);

          this.showDeviceList[index].screenStatus = '-1';
          this.showDeviceList[index].isLoading = false;
          this.showDeviceList.splice(index, 1, this.showDeviceList[index]); // todo Vue对数组索引赋值的局限性！！！
          this.syncDataFormShowToTotalById(data.id);

          if (showDeviceList.length > 0) {
            console.log(8126, showDeviceList.length, this.showDeviceList.length)
            this.eachGetScreenList(showDeviceList);
          } else {
            this.busy = false;
            this.isRefreshing = false;
            if (!this.curClickDevice) this.curClickDevice = this.showDeviceList[0];

            console.log(8126.2, '所有请求轮完')
          }
        })

      },
//      getScreenList(showDeviceList, option) {
//        return false;
//
//        let newLen = showDeviceList.length;
//        let oldLen = this.showDeviceList.length;
//
//        this.clearTimer();
//        showDeviceList.map((item, index) => {
//          let curIndex = oldLen - newLen + index;
//
//          console.log('当前索引,排位', index, curIndex);
//
//          setTimeout(() => {
//            getScreenShoot({
//              terminalId: item.id
//            }).then(res => {
//              console.log(res);
//
//              let tid = item.id;
//              let count = 1;
//              this.timer = setInterval(() => {
//                getRltMonitor({ terminalId: tid }).then(r => {
//                  console.log(r);
//
//                  if (r.status==='1' && r.isHaveRealCapture===false) {
//                    count++;
//                    if(count >= 20) {
//                      clearInterval(this.timer);
//
//                      this.showDeviceList[curIndex].screenStatus = '-2';
//                      this.showDeviceList[curIndex].isLoading = false;
//                      this.showDeviceList.splice(curIndex, 1, this.showDeviceList[curIndex]); // todo Vue对数组索引赋值的局限性！！！
//                    }
//                  } else {
//                    console.log('一次请求截图出结果', r);
//                    clearInterval(this.timer);
//
//                    this.showDeviceList[curIndex].screenStatus = r.status;
//                    this.showDeviceList[curIndex].isHaveRealCapture = r.isHaveRealCapture;
//                    this.showDeviceList[curIndex].onLineTime = r.onLineTime;
//                    this.showDeviceList[curIndex].captureList = r.captureList;
//                    this.showDeviceList[curIndex].isLoading = false;
//                    this.showDeviceList.splice(curIndex, 1, this.showDeviceList[curIndex]); // todo Vue对数组索引赋值的局限性！！！
//                  }
//                }).catch(e => {
//                  console.log(e, count);
//                  clearInterval(this.timer);
//
//                  this.showDeviceList[curIndex].screenStatus = '-2';
//                  this.showDeviceList[curIndex].isLoading = false;
//                  this.showDeviceList.splice(curIndex, 1, this.showDeviceList[curIndex]); // todo Vue对数组索引赋值的局限性！！！
//                });
//              }, 3000+500*index);
//
//              if (option && option.isBusy) setTimeout(() => { this.busy = false }, 1000);
//              if (option && option.isRefresh) setTimeout(() => { this.isRefreshing = false }, 1000);
//            }).catch(err => {
//              console.log(err, curIndex);
//
//              this.showDeviceList[curIndex].screenStatus = '-1';
//              this.showDeviceList[curIndex].isLoading = false;
//              this.showDeviceList.splice(curIndex, 1, this.showDeviceList[curIndex]); // todo Vue对数组索引赋值的局限性！！！
//              if (option && option.isBusy) setTimeout(() => { this.busy = false }, 1000);
//              if (option && option.isRefresh) setTimeout(() => { this.isRefreshing = false }, 1000);
//            })
//          }, 500+500*index);
//        });
//      },
      loadMore() {
        if ((this.showDeviceList.length<this.totalDeviceList.length) &&
            (this.totalDeviceList.length>this.pageSize) &&
            !this.busy &&
            !this.isFilter) {
          this.busy = true;
          let oldLen = this.showDeviceList.length;
          let newList = this.totalDeviceList.slice(oldLen, oldLen+this.pageSize);
          newList = newList.map(item => {
            item.isLoading = true;
            return item;
          });
          this.showDeviceList.push(...newList);
          this.eachGetScreenList(newList, { isBusy: true });

          console.log('懒加载...', this.showDeviceList, newList);
        }
      },
      handleMultipleDeviceSearch() {
        this.isFilter = true;
        this.showDeviceList = this.totalDeviceList.filter(item => item.name.indexOf(this.searchVal)!==-1 || item.decimalId.indexOf(this.searchVal)!==-1);
      },
      handleMultipleCloseSearch() {
        this.showDeviceList = JSON.parse(JSON.stringify(this.totalDeviceList));
        this.isShowSearchBtn = true;
        this.isFilter = false;
      },
      handleSingleCloseSearch() {
        this.showDeviceList = JSON.parse(JSON.stringify(this.totalDeviceList));
        this.isFilter = false;
      },
      handleSingleDeviceSearch() {
        this.showDeviceList = this.totalDeviceList.filter(item => item.name.indexOf(this.searchVal)!==-1 || item.decimalId.indexOf(this.searchVal)!==-1);
        this.isFilter = true;
      },
      handleAllDeviceSearch() {
        this.officeDeviceData = this.officeDeviceDataCopy.filter(item => {
          return item['label'].indexOf(this.searchOfficeDeviceVal) !== -1;
        });
      },
      handleAdd() {
        this.toggleDialog('add');
      },
      handleRefresh() {
        console.log('刷新中...');

        this.showDeviceList = this.showDeviceList.map(item => {
          item.isLoading = true;
          return item;
        });
        this.isRefreshing = true;
        this.eachGetScreenList(JSON.parse(JSON.stringify(this.showDeviceList)));
      },
      handleSingleRefresh() {
        this.isRefreshing = true;
        this.curClickDevice.isLoading = true;
        this.syncDataFormCurToShowAndTotalById();
        this.clearTimer();

        getScreenShoot({
          terminalId: this.curClickDevice.id
        }).then(res => {
          console.log(res);

          let count = 1;
          this.timer = setInterval(() => {
            getRltMonitor({ terminalId: this.curClickDevice.id }).then(r => {
              console.log(r);

              if (r.status==='1' && r.isHaveRealCapture===false) {
                count++;
                if(count >= 20) {
                  clearInterval(this.timer);

                  this.curClickDevice.screenStatus = '-2';
                  this.isRefreshing = false;
                  this.curClickDevice.isLoading = false;
                  this.syncDataFormCurToShowAndTotalById();
                }
              } else {
                console.log('一次请求截图出结果', r);
                clearInterval(this.timer);

                this.curClickDevice.screenStatus = r.status;
                this.curClickDevice.isHaveRealCapture = r.isHaveRealCapture;
                this.curClickDevice.onLineTime = r.onLineTime;
                this.curClickDevice.captureList = r.captureList.sort((a,b) => b.updateDate - a.updateDate);;
                this.isRefreshing = false;
                this.curClickDevice.isLoading = false;
                this.syncDataFormCurToShowAndTotalById();

                if (r.status==='1' && r.isHaveRealCapture===true) { // 在线且有实时截图
                  this.$nextTick(() => {
                    let _$adaptiveImg = $('.adaptive-img-'+this.curClickDevice.id);
                    imgHistoryScreenCapture(_$adaptiveImg.attr('src'), _$adaptiveImg);
                    console.log('++实时截图++', _$adaptiveImg.attr('src'), _$adaptiveImg);
                  })
                }

                this.$nextTick(() => {
                  console.log('轮播图', $('.adaptive-img-history'));

                  $('.adaptive-img-history').each(function(){
                    imgHistoryScreenCapture($(this).attr('src'), $(this));
                  });
                })
              }
            }).catch(e => {
              console.log(e, count);
              clearInterval(this.timer);

              this.curClickDevice.screenStatus = '-1';
              this.isRefreshing = false;
              this.curClickDevice.isLoading = false;
              this.syncDataFormCurToShowAndTotalById();
            });
          }, 3000);
        }).catch(err => {
          console.log(err);

          this.curClickDevice.screenStatus = '-1';
          this.isRefreshing = false;
          this.curClickDevice.isLoading = false;
          this.syncDataFormCurToShowAndTotalById();
        })
      },
      handleClickToView(item) {
        console.log('单图详情', item);

        this.toggleModel('single', item);
      },
      handleCloseSingle(id, isMultiple) {
        console.log('删除id', id)
        if (isMultiple && this.showDeviceList.length<this.totalDeviceList.length) {
          this.showDeviceList = JSON.parse(JSON.stringify(this.totalDeviceList));
        }

        const index1 = this.showDeviceList.findIndex(item => item.id === id);
        const index2 = this.totalDeviceList.findIndex(item => item.id === id);

        this.showDeviceList.splice(index1, 1);
        this.totalDeviceList.splice(index2, 1);

        if (this.curClickDevice && this.curClickDevice.id===id && this.showDeviceList.length>0) {
          this.curClickDevice = this.showDeviceList[0];
        } else if (this.curClickDevice && this.curClickDevice.id===id && this.showDeviceList.length===0) {
          this.curClickDevice = null;
        }
      },
      toggleModel(model, info) {
        if (this.showModel === model) return false;

        if (info) {
          this.curClickDevice = info;
        } else if (!this.curClickDevice) {
          this.curClickDevice = this.showDeviceList[0];
        }

        if (model === 'single') {
          this.showDeviceList = JSON.parse(JSON.stringify(this.totalDeviceList));
          this.$nextTick(() => {
            console.log('轮播图', $('.adaptive-img-history'));

            $('.adaptive-img-history').each(function(){
              imgHistoryScreenCapture($(this).attr('src'), $(this));
            });
          })
        }

        this.isFilter = false;
        this.searchVal = '';
        this.busy = false;
//        this.isRefreshing = false;
//        this.showDeviceList = this.showDeviceList.map(item => {
//          item.isLoading = false;
//          return item;
//        });
        this.showModel = model;
      },
      handleClearAll() {
        this.showDeviceList = [];
        this.curClickDevice = null; // curClickDevice.isL
        this.totalDeviceList = [];
        this.clearTimer();
      },
      toggleDialog(title, data) {
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
            this.changezIndex();
            this.officeDeviceData = [];
            this.officeDeviceDataCopy = []; //过滤器备份
            this.officeDeviceVal = [];
            this.officeDeviceDataDetail = [];
            this.curOfficeId =  '';
            this.curOfficeName = '';
            getOfficeList().then(res => {
              console.log(res);
              if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId
              let arr = [res.currentOffice].concat(res.officeMsg);
              let tree = treeify(arr, 'id', 'parentId', 'children');
              this.treeData = JSON.parse(JSON.stringify([tree]));

              this.$nextTick(() => {
                $('p.el-transfer-panel__empty').text(this.$t('deviceManager.noAdditionalEquipment'));
              })
            }).catch(err => {
              console.log(err)
            });
            break;
          case 'history':
            this.dialogKey = 'history';
            this.dialogTitle = this.$t('deviceManager.historyScreenshots');
            this.dialogWidth = '864px';
            this.curDeviceCaptureMap = listClassify(data.captureList.sort((a,b) => b.updateDate - a.updateDate), 'updateDate', 1000*60*60*24);
            this.curDeviceCaptureMapCopy = JSON.parse(JSON.stringify(this.curDeviceCaptureMap));
            this.curClickHistoryDeviceId = data.id;
            console.log('历史截图分类Map', this.curDeviceCaptureMap);

            this.$nextTick(() => {
              console.log('轮播图', $('.adaptive-img-more'));

              $('.adaptive-img-more').each(function(){
                imgHistoryScreenCapture($(this).attr('src'), $(this));
              });
            });
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
        this.wIndex = 1200;
        this.zIndex = 1;
        this.isOfficeShow = false;
      },
      clickOfficeHandle(data, node, component) {
      },
      checkOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['officeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反

        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.zIndex = 1200;
          this.wIndex = 1;
          $('.el-transfer-panel input[type="checkbox"]').attr('disabled','disabled');
          this.isOfficeShow = true;
          this.$refs['officeTree'].setCurrentKey(data.id);
          this.curOfficeId = data.id;
          this.curOfficeName = data.name;

          let pageNo = 1;
          let pageSize = 17;
          let self = this;

//          this.officeDeviceData = []; // 不能置空！！！
          this.officeDeviceDataCopy = [];

          (function getAllDevice() {
            let arr = [], tmp = [];

            terminalPageByOffices({
              officeIds: self.curOfficeId,
              pageNo: pageNo,
            }).then(res => {
              for(let key in res.data){
                let id = res.data[key].id;
                let decaimalName = res.data[key].name;
                let obj = {};
                obj.key = id;
                obj.label = decaimalName;
                obj.officeid = res.data[key].officeId;
                arr.push(obj)
              }

              self.totalDeviceList.map(item => tmp.push(item.id) );
              self.officeDeviceData.map(item => tmp.push(item.key) );
              self.officeDeviceData.push(...arr.filter(item => tmp.indexOf(item.key) === -1 ));
              $('.cjc_isHidden').parents('.el-transfer-panel__item').hide();
              $('.cjc_isShow').parents('.el-transfer-panel__item').show();
              self.officeDeviceDataDetail.push(...res.data.filter(item => tmp.indexOf(item.id) === -1 )); // 过滤并备份所有设备详情

              if (pageNo*pageSize < res.count) {
                pageNo++;
                getAllDevice();
              } else {
                self.officeDeviceData = self.officeDeviceData.map(item => {
                    item.disabled = (item.officeid!==self.curOfficeId) && (self.officeDeviceVal.indexOf(item.key)===-1);
                    return item
                });
                self.officeDeviceDataCopy = JSON.parse(JSON.stringify(self.officeDeviceData));
                console.log('当前(已选)设备列表，详情', self.officeDeviceVal, self.officeDeviceData, self.officeDeviceDataDetail);
              }
            }).catch(err => {
              console.log(err)
            })
          })();
        } else { // 已选 -> 去选
          this.$refs['officeTree'].setCheckedKeys([]);
          this.curofficeId = '';
          this.curOfficeName = '';
        }

      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      addDevice() {
        let addList = [];
        addList = this.officeDeviceDataDetail.filter(item => this.officeDeviceVal.indexOf(item.id) > -1 );
        console.log('新增设备id列表', this.officeDeviceVal, addList);

        if (this.showModel === 'multiple') {
          if (this.showDeviceList.length < this.totalDeviceList.length) {
            this.totalDeviceList.push(...addList);
          } else if ((this.totalDeviceList.length+addList.length) <= 8) {
            this.totalDeviceList.push(...addList);
            this.showDeviceList.push(...addList);
            this.eachGetScreenList(addList);
          } else {
            this.totalDeviceList.push(...addList);
            this.loadMore();
          }

          if (this.isFilter) {
            this.handleMultipleDeviceSearch();
          }
        } else {
          if (this.totalDeviceList.length===0) {
            this.curClickDevice = addList[0];
          }
          this.totalDeviceList.push(...addList);
          this.showDeviceList.push(...addList);

          if (this.isFilter) {
            this.handleSingleDeviceSearch();
          }
        }

        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
      },
      showHistory(info) {
        this.toggleDialog('history', info);
      },
      showBigScreen(data) {
        this.curBigScreenInfo = data;
        this.screenDialogVisible = true;
        this.$nextTick(() => { //
          let $_adaptiveImg = $('.adaptive-img-big');

          imgHistoryScreenCapture($_adaptiveImg.attr('src'), $_adaptiveImg);
          console.log('轮播图', $_adaptiveImg);
        })
      },
//      nextScreen(key) {
//        if (this.curDeviceCaptureMap[key].length <= 1) return false;
//
//        console.log('下一张', key, this.curDeviceCaptureMap[key].length);
//        let val = this.curDeviceCaptureMap[key].shift();
//        console.log('首去掉', val, this.curDeviceCaptureMap[key].length);
//      },
//      lastScreen(key) {
//        if (this.curDeviceCaptureMap[key].length >= this.curDeviceCaptureMapCopy[key].length) return false;
//
//        console.log('上一张', key, this.curDeviceCaptureMap[key].length);
//        let val = this.curDeviceCaptureMapCopy[key][this.curDeviceCaptureMapCopy[key].length-this.curDeviceCaptureMap[key].length-1];
//        let len = this.curDeviceCaptureMap[key].unshift(val);
//        console.log('首加入', val, this.curDeviceCaptureMap[key].length);
//      },
      handleSearchScreen() {
        console.log('历史截图搜索', this.datePickerVal, this.curClickHistoryDeviceId);

        if (this.datePickerVal) {
          findCaptureByTerminalIdAndDate({
            terminalId: this.curClickHistoryDeviceId,
            startTime: this.datePickerVal[0],
            endTime: this.datePickerVal[1],
          }).then(res => {
            console.log(res)

            this.curDeviceCaptureMap = listClassify(res.captureList.sort((a,b) => b.updateDate - a.updateDate), 'updateDate', 1000*60*60*24);
            this.$nextTick(() => {
              console.log('轮播图', $('.adaptive-img-more'));

              $('.adaptive-img-more').each(function(){
                imgHistoryScreenCapture($(this).attr('src'), $(this));
              });
            })
            this.$message({
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
          }).catch(err => {
            console.log(err)

            this.$message.error(this.$t('common.operationFailure'));
          })
        } else {
          this.curDeviceCaptureMap = JSON.parse(JSON.stringify(this.curDeviceCaptureMapCopy));
          this.$nextTick(() => {
            console.log('轮播图', $('.adaptive-img-more'));

            $('.adaptive-img-more').each(function(){
              imgHistoryScreenCapture($(this).attr('src'), $(this));
            });
          })

          this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          });
        }
      },
      toggleCurClickDevice(data) {
        console.log('当前设备信息', data);

        this.curClickDevice = data;
        this.handleSingleRefresh();
        if (this.curClickDevice && this.curClickDevice.captureList) {
          this.$nextTick(() => {
            console.log('轮播图', $('.adaptive-img-history'));

            $('.adaptive-img-history').each(function(){
              imgHistoryScreenCapture($(this).attr('src'), $(this));
            });
          })
        }
      },
      clearTimer() {
        clearInterval(this.timer);
        this.timer = null;
      },
      syncDataFormShowToTotalById(showId) {
        const showIndex = this.showDeviceList.findIndex(item => item.id === showId);
        const totalIndex = this.totalDeviceList.findIndex(item => item.id === showId);

        Object.assign(this.totalDeviceList[totalIndex], this.showDeviceList[showIndex]);

        console.log('同步数据', this.totalDeviceList[totalIndex], this.showDeviceList[showIndex])
      },
      syncDataFormCurToShowAndTotalById() {
        const showIndex = this.showDeviceList.findIndex(item => item.id === this.curClickDevice.id);
        const totalIndex = this.totalDeviceList.findIndex(item => item.id === this.curClickDevice.id);

        Object.assign(this.showDeviceList[showIndex], this.curClickDevice);
        Object.assign(this.totalDeviceList[totalIndex], this.curClickDevice);

        console.log('同步数据', this.showDeviceList[showIndex], this.totalDeviceList[totalIndex], this.curClickDevice);
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

    .swiper-container {
      overflow: initial;
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
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
    }

    .list-box {
      width: 570px;
      padding-right: 20px;
    }

    .list-container {
      width: 100%;
      margin-bottom: 40px;
    }

    .list-img {
      width: 100%;
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
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid #DCDFE6;
        }

        .header-btns {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 10px;
        }

        .header-search {

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
        cursor: pointer;
        &.is-cur {
          background-color: #F0F7FF;
        }
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
        padding-bottom: 10px;
        .img-box {
          width: 768px;
          height: 432px;
          margin: 0 auto 10px;
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
          text-align: center;
          .history-list-img {
            width: 100%;
            height: 100%;
            margin-bottom: 10px;
          }
        }

        .seeMore-btn {
          width: 47px;
          height: 47px;
          display: flex;
          position: absolute;
          left: 25%;
          margin-left: -54px;
          margin-top: -24px;
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
    overflow-y: auto;
    overflow-x: hidden;
  }

  .history-container {
    @include scrollBar;
    height: 450px;
    overflow-y: auto;
    overflow-x: hidden;
    .history-more-list {
      width: 332px;
      height: 186.75px;
      text-align: center;
      .history-more-list-img {
        width: 100%;
        height: 100%;
        margin-bottom: 10px;
      }
    }
  }

  .adaptive-img-box {
    position: relative;
    overflow: hidden;
    transition: all .35s ease;
    -webkit-transition: all .35s ease;
    .adaptive-img {
      display: block;
      position: absolute;
      border: 0;
      vertical-align: middle;
    }
  }
}
</style>


