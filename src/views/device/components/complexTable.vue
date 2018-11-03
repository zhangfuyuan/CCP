<template>
  <div class="complexTable-wrapper" style="padding-left: 20px;padding-top: 0;">
    <div class="filter-container">
      <div class="selected-box" v-if="checkedDeviceList.length>0">
        <div :class="[ 'total', { 'total-disabled': checkedDeviceList.length===0 }]"
             @click="clickTotalBoxHandle">
          {{$t('deviceManager.selected')}}
          {{checkedDeviceList.length}}
          {{$t('deviceManager.devices')}}

          <i :class="[ {'el-icon-caret-bottom': !isShowCheckedDeviceList},
                         {'el-icon-caret-top': isShowCheckedDeviceList} ]"></i>
        </div>

        <div class="list" v-if="checkedDeviceList.length>0 && isShowCheckedDeviceList">
          <div class="all-clear" style="height: 30px;line-height: 30px;text-align: right;padding: 0 10px;">
            <el-button type="text"
                       style="color: #F56C6C;"
                       size="mini"
                       @click="resetChecked">{{$t('deviceManager.allClear')}}</el-button>
          </div>

          <div class="list-item" v-for="(item,index) in checkedDeviceList" :key="index">
            <el-button type="text"
                       style="color: #F56C6C;"
                       size="mini"
                       @click="uncheckedOneRow(item)">{{$t('common.delete')}}</el-button>

            <div class="list-office" style="padding-left: 10px;">
              <span>{{item.name}}</span>
              <span style="color: #909399;font-size: 12px">{{item.officeName}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="selected-device-txt" v-else>
        {{$t('deviceManager.total')}}
        <span v-if="isShowTotalCount">{{listTotalCount}}</span>
        <span v-else>{{finalShowNum}}</span>
        {{$t('deviceManager.devices')}}
      </div>

      <div class="handle-box">
        <multiselect :placeholder="$t('common.handle')"
                     :options="actions"
                     :searchable="false"
                     :reset-after="true"
                     @select="dispatchAction"
                     :show-labels="false"
                     :style="{ 'width': '150px', 'text-align': 'center', 'cursor': 'pointer'  }"
                     :disabled="checkedDeviceList.length===0">
          <template slot="option" slot-scope="props">
            <div :style="{ 'color': props.option.val==='delete' ?  '#F56C6C' : '#333' }">{{props.option.label}}</div>
          </template>
        </multiselect>

        <el-input @keyup.enter.native="handleSearch"
                  style="width: 250px;margin-left: 10px;"
                  :placeholder="$t('deviceManager.searchNameOrId')"
                  clearable
                  v-model="searchVal"
                  suffix-icon="el-icon-search"
                  @clear="handleSearch">
        </el-input>
      </div>
    </div>

    <el-table :data="list"
              v-loading="listLoading"
              border
              fit
              stripe
              highlight-current-row
              style="width: 100%;"
              tooltip-effect="dark"
              show-overflow-tooltip
              @select="handleSelection"
              @selection-change="handleSelectionChange"
              :height="tableHeight"
              v-tabelLoadmore="tableLoadMore"
              :empty-text="$t('common.noData')"
              @filter-change="filterChangeHandle"
              ref="deviceTable"
              @select-all="handleSelectAll">
      <el-table-column
        type="selection"
        align="center">
      </el-table-column>

      <el-table-column prop="name"
                       sortable
                       :render-header="renderDevicenameHeader">
        <template slot-scope="scope">
          <span v-if="scope.row.status==='3'" style="color: #F56C6C;">{{scope.row.name}}</span>
          <span v-else style="color: #666;">{{scope.row.name}}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status"
                       :label="$t('deviceManager.state')"
                       :filters="[{ text: $t('deviceManager.online'), value: '1' },
                                 { text: $t('deviceManager.standby'), value: '2' },
                                 { text: $t('deviceManager.offline'), value: '0' }]"
                       :filter-method="filterHandler">
        <template slot-scope="scope">
          <span v-if="scope.row.status==='1'" style="color: #409EFF;">{{$t('deviceManager.online')}}</span>
          <span v-else-if="scope.row.status==='2'" style="color: #666;">{{$t('deviceManager.standby')}}</span>
          <span v-else style="color: #C0C4CC;">{{$t('deviceManager.offline')}}</span>
        </template>
      </el-table-column>

      <el-table-column prop="totalRunningTime"
                       sortable
                       :render-header="renderRunningTimeHeader" width="155">
        <template slot-scope="scope">
          {{scope.row.totalRunningTime | formatDay}}
        </template>
      </el-table-column>

      <el-table-column prop="decimalId"
                       :label="$t('deviceManager.deviceId')">
      </el-table-column>

      <el-table-column prop="officeName" :label="$t('deviceManager.subsidiaryOrgan')"></el-table-column>

      <el-table-column :render-header="renderHandleHeader">
        <template slot-scope="scope">
          <el-button type="text" @click="toggleDialog('details', scope.row)">{{$t('deviceManager.details')}}</el-button>
          <el-button type="text" @click="toggleDialog('modify', scope.row)">{{$t('common.modify')}}</el-button>
        </template>
      </el-table-column>

      <template slot="append">
        <div style="height: 50px;display: flex;justify-content: center;align-items: center;color: #999;">
          <template v-if="busy">
            <i class="el-icon-loading" style="margin-right: 10px;"></i>
            <span >{{$t('deviceManager.loading')}}...</span>
          </template>

          <template v-else>
            <span v-if="finalShowNum>10">{{$t('deviceManager.atAll')}}</span>
          </template>
        </div>
      </template>
    </el-table>

    <el-dialog :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :width="dialogWidth"
               id="deviceDialog"
               :before-close="beforeCloseDialog"
               @close="handleCloseDialog">
      <!--dialog标题-->
      <div slot="title">
        <template v-if="(dialogKey==='settings'||dialogKey==='plan') && dialogInfo.length===1">
          <div>{{dialogInfo[0].name}}</div>
          <div style="color: #666;font-size: 12px;margin-top: 5px;">{{dialogInfo[0].decimalId}}</div>
        </template>

        <template v-else-if="(dialogKey==='settings'||dialogKey==='plan') && dialogInfo.length>1">
          {{$t('deviceManager.selected')}}
          {{dialogInfo[0].name}}
          {{$t('deviceManager.etc')}}
          {{dialogInfo.length}}
          {{$t('deviceManager.devices')}} &nbsp;
          {{$t('deviceManager.online')}} {{dialogInfoOnlineNum}} &nbsp;
          {{$t('deviceManager.standby')}} {{dialogInfoStandbyNum}} &nbsp;
          {{$t('deviceManager.offline')}} {{dialogInfoOfflineNum}}
        </template>

        <template v-else>
          {{this.dialogTitle}}
        </template>
      </div>

      <!--详情-->
      <div class="create-dialog"
           v-if="dialogKey === 'details' && dialogInfo"
           style="min-height: 500px;position: relative;">
        <el-tabs v-model="detailsDialogActiveTabsName" @tab-click="handleDetailsDialogClick">
          <el-tab-pane :label="$t('deviceManager.details')" name="details">
            <el-form label-width="100px" size="mini" inline label-position="left">
              <el-form-item :label="$t('deviceManager.deviceName')" style="width: 30%;">
                <span>{{dialogInfo.name}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.subsidiaryOrgan')" style="width: 30%;">
                <span>{{dialogInfo.officeName}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.createdTime')" style="width: 30%;">
                <span>{{dialogInfo.updateDate | formatDate}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.state')" style="width: 30%;">
                <span v-if="dialogInfo.status==='1'">{{$t('deviceManager.online')}}</span>
                <span v-else-if="dialogInfo.status==='2'">{{$t('deviceManager.standby')}}</span>
                <span v-else>{{$t('deviceManager.offline')}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.onlineTime')" style="width: 30%;">
                <span>{{+dialogInfo.onLineTime | formatDay}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.cumulativeRunningTime')" style="width: 30%;">
                <span>{{+dialogInfo.totalRunningTime | formatDay}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.brightness')" style="width: 30%;">
                <span>{{dialogInfo.brightness}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.volume')" style="width: 30%;">
                <span>{{dialogInfo.volume}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.touchState')" style="width: 30%;">
                <span v-if="dialogInfo.touchState==='1'">{{$t('deviceManager.open')}}</span>
                <span v-else>{{$t('deviceManager.shut')}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.deviceId')" style="width: 30%;">
                <span>{{dialogInfo.decimalId}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.macAddress')" style="width: 30%;">
                <span>{{dialogInfo.id}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.ipAddress')" style="width: 30%;">
                <span>{{dialogInfo.ip}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.ram')" style="width: 30%;">
                <span>{{dialogInfo.ram}} GB</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.storageSpace')" style="width: 30%;">
                <span>{{dialogInfo.availableSpace}}GB / {{dialogInfo.totalSpace}}GB</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.dpi')" style="width: 30%;">
                <span>{{dialogInfo.ratio}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.androidVersion')" style="width: 30%;">
                <span>{{dialogInfo.androidVersion}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.systemVersion')" style="width: 30%;">
                <span>{{dialogInfo.systemVersion}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.apkVersion')" style="width: 30%;">
                <span>{{dialogInfo.apkVersion}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.lockScreenImage')" style="width: 30%;">
                <span>{{dialogInfo.lockScreenStyle==='0' ?
                        $t('deviceManager.defaultM') :
                        $t('deviceManager.customize')}}</span>
              </el-form-item>

              <el-form-item :label="$t('deviceManager.mark')" style="width: 100%;">
                <span>{{dialogInfo.remarks}}</span>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('deviceManager.timingPlan')" name="timingPlan" lazy>
            <div class="timingPlan-box">
              <div class="timingPlan-power">
                <div style="white-space: nowrap;font-size: 16px;">{{$t('deviceManager.powerPlan')}}</div>

                <div class="timingPlan-power-list" v-if="dialogInfo['1'] && dialogInfo['1'].length>0">
                  <div style="margin-bottom: 10px;">{{dialogInfo.name1}}</div>

                  <ul>
                    <li v-for="(item, index) in dialogInfo['1']" :key="index" style="margin-bottom: 10px">
                      <span v-if="item.planType==='1'">{{$t('deviceManager.weeklyPlan') + ' ' + (index+1)}}</span>
                      <span v-else>{{$t('deviceManager.specialPlan') + ' ' + (index+1)}}</span>
                      &nbsp;
                      <span v-if="item.operation==='1'">{{$t('deviceManager.startingUp')}}</span>
                      <span v-else-if="item.operation==='2'">{{$t('deviceManager.standby')}}</span>
                      <span v-else>{{$t('deviceManager.powerOff')}}</span>
                      &nbsp;
                      <span>{{+item.time | formatDateTime}}</span>
                      &nbsp;
                      <template v-if="item.planType==='1'">
                        <span v-if="item.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                        <span v-if="item.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                        <span v-if="item.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                        <span v-if="item.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                        <span v-if="item.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                        <span v-if="item.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                        <span v-if="item.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                      </template>
                      <template v-else>
                        <span v-for="(date, i) in item.date.split(',')" :key="i">{{+date | formatDateDate}}<span v-if="i===0">~</span></span>
                      </template>
                    </li>
                  </ul>
                </div>

                <div class="timingPlan-power-list" v-else>
                  <span style="color: #999;">{{$t('deviceManager.noPlan')}}</span>
                </div>
              </div>

              <div class="timingPlan-volume">
                <div style="white-space: nowrap;font-size: 16px;">{{$t('deviceManager.volumePlan')}}</div>

                <div class="timingPlan-volume-list" v-if="dialogInfo['2'] && dialogInfo['2'].length>0">
                  <div style="margin-bottom: 10px;">{{dialogInfo.name2}}</div>

                  <ul>
                    <li v-for="(item, index) in dialogInfo['2']" :key="index" style="margin-bottom: 10px">
                      <span v-if="item.planType==='1'">{{$t('deviceManager.fixedVolume')}}</span>
                      <span v-else>{{$t('deviceManager.plan') + ' ' + (index+1)}}</span>
                      &nbsp;
                      <template v-if="item.planType==='1'">
                        <span>{{item.volume}}</span>
                      </template>
                      <template v-else>
                        <span>{{$t('deviceManager.volume')}}: {{item.volume}}</span>
                        &nbsp;
                        <span v-for="(date, i) in item.date.split(',')" :key="i">{{+date | formatDateTime}}<span v-if="i===0">~</span></span>
                        &nbsp;
                        <span v-if="item.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                        <span v-if="item.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                        <span v-if="item.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                        <span v-if="item.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                        <span v-if="item.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                        <span v-if="item.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                        <span v-if="item.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                      </template>
                    </li>
                  </ul>
                </div>

                <div class="timingPlan-volume-list" v-else>
                  <span style="color: #999;">{{$t('deviceManager.noPlan')}}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <span style="color: #999;font-size: 12px;position: absolute;left: 0;bottom: 0;">
          * {{$t('deviceManager.lastUpdateTime')}} :
          {{dialogInfo.updateDate | formatDate}}
          ({{$t('deviceManager.hourlyUpdatedData')}})
        </span>
      </div>

      <!--修改-->
      <div class="details-dialog" v-if="dialogKey === 'modify' && dialogInfo">
        <el-form :model="dialogInfo" label-width="100px" label-position="left">
          <el-form-item :label="$t('deviceManager.deviceName') + ' *'">
            <div class="el-input">
              <input type="text"
                     @input="isChangeModifyDialog = true"
                     v-model="dialogInfo.name"
                     :maxlength="24"
                     :placeholder="$t('deviceManager.deviceNameNotExceed24')"
                     class="el-input__inner"/>
            </div>
          </el-form-item>

          <el-form-item :label="$t('deviceManager.mark')">
            <el-input type="textarea"
                      v-model="dialogInfo.remarks"
                      :rows="5"
                      @focus="isChangeModifyDialog = true"></el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary"
                     @click="modifyDevice(), dialogVisible = false"
                     :disabled="!isChangeModifyDialog || dialogInfo.name.trim().length===0">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="dialogVisible = false">{{$t('common.cancel')}}</el-button>
        </div>
      </div>

      <!--设置-->
      <div class="modify-dialog" v-if="dialogKey === 'settings' && dialogInfo.length>0" style="position: relative;">
        <el-tabs tab-position="left"
                 style="min-height: 300px;"
                 v-model="settingsDialogActiveTabsName"
                 :before-leave="leaveSettingsTabs">
          <!--基础设置-->
          <el-tab-pane :label="$t('deviceManager.basicSettings')" name="basicSettings" style="height: 500px;">
            <template v-if="settingsDialogActiveTabsName === 'basicSettings'">
              <div style="margin-bottom: 20px;border-bottom: 1px solid #DCDFE6;padding-bottom: 20px;">
                <div style="color: #333;font-size: 16px;margin-bottom: 20px;">{{$t('deviceManager.powerSettings')}}</div>

                <div v-if="dialogInfo.length===1" style="color: #666;margin-bottom: 20px;">
                  {{$t('deviceManager.currentState')}} :
                  <span v-if="dialogInfo[0].status==='1'" style="color: #333;">{{$t('deviceManager.online')}}</span>
                  <span v-else-if="dialogInfo[0].status==='2'" style="color: #333;">{{$t('deviceManager.standby')}}</span>
                  <span v-else style="color: #333;">{{$t('deviceManager.offline')}}</span>
                </div>

                <div style="color: #666;">
                  {{$t('deviceManager.switchingPower')}}

                  <div style="padding-top: 10px;">
                    <el-radio-group v-model="switchingPowerRadioGroup"
                                    style="width: 100%;display: flex;justify-content: space-between;"
                                    @change="isChangeSetDialog = true, isSettingsChangeNoSave = true">
                      <el-radio label="awake"
                                border
                                :disabled="(dialogInfo.length===1 && dialogInfo[0].status==='1') ||
                                         (dialogInfo.length===1 && dialogInfo[0].status==='0')">{{$t('deviceManager.awake')}}
                      </el-radio>

                      <el-radio label="powerOff"
                                border
                                :disabled="dialogInfo.length===1 && dialogInfo[0].status==='0'">{{$t('deviceManager.powerOff')}}
                      </el-radio>

                      <el-radio label="restart"
                                border
                                :disabled="dialogInfo.length===1 && dialogInfo[0].status==='0'">{{$t('deviceManager.restart')}}
                      </el-radio>

                      <el-radio label="standby"
                                border
                                :disabled="(dialogInfo.length===1 && dialogInfo[0].status==='0') ||
                                         (dialogInfo.length===1 && dialogInfo[0].status==='2')">{{$t('deviceManager.standby')}}
                      </el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </div>

              <div>
                <div style="color: #333;font-size: 16px;margin-bottom: 20px;">{{$t('deviceManager.volumeSettings')}} &nbsp;&nbsp;&nbsp;&nbsp;
                  <span v-show="dialogInfo[0].status==='0'" style="color: #999;font-size: 12px;">* {{$t('deviceManager.supportOfflineCommands')}}</span>
                </div>

                <div>
                  <el-checkbox v-model="isSetVolumeChecked"
                               @change="isChangeSetDialog = true, isSettingsChangeNoSave = true"
                               v-if="dialogInfo.length>1">{{$t('deviceManager.unifiedVolume')}}</el-checkbox>
                  <el-checkbox v-model="isSetVolumeChecked"
                               @change="isChangeSetDialog = true, isSettingsChangeNoSave = true"
                               v-else-if="dialogInfo[0].status==='0'"></el-checkbox>
                  <span v-else>{{$t('deviceManager.currentVolume')}}</span>

                  <el-slider
                    v-model="setVolumeSlider"
                    show-input
                    input-size="small"
                    :disabled="(dialogInfo.length>1 && !isSetVolumeChecked) ||
                               (dialogInfo.length===1 && dialogInfo[0].status==='0' && !isSetVolumeChecked)"
                    @change="isChangeSetDialog = true, isSettingsChangeNoSave = true">
                  </el-slider>
                </div>
              </div>

              <div v-show="isShowBasicSettingsResult" style="padding-top: 10px;">
                <template v-if="dialogInfo.length>1">
                  <div style="margin-bottom: 5px;">
                    <el-alert
                      :title="basicSettingsResult"
                      type="info"
                      :closable="false"
                      show-icon>
                    </el-alert>
                  </div>

                  <ul class="basicSettings-result">
                    <li v-for="(item, index) in basicSettingsResultList" :key="index">
                      <svg-icon icon-class="AIO" /> {{deviceIdTurnName(item.id)}} -
                      <span v-if="item.status==='0'">{{$t('deviceManager.offline')}}</span>
                      <span v-else-if="item.status==='1'">{{$t('deviceManager.online')}}</span>
                      <span v-else-if="item.status==='2'">{{$t('deviceManager.standby')}}</span>
                      <span v-else-if="item.status==='3'">{{$t('deviceManager.noPointsOffline')}}</span>
                    </li>
                  </ul>
                </template>

                <template v-else>
                  <el-alert
                    :title="item.title"
                    :type="item.type"
                    :closable="false"
                    show-icon
                    v-for="(item, index) in basicSettingsResultList"
                    :key="index" style="margin-bottom: 10px;">
                  </el-alert>
                </template>
              </div>
            </template>
          </el-tab-pane>

          <!--通道设置-->
          <!--<el-tab-pane name="channelSettings"-->
                       <!--class="channelSettings-box"-->
                       <!--style="height: 500px;">-->
            <!--<span slot="label">-->
              <!--<span :title="$t('deviceManager.cloudFeature')"><svg-icon icon-class="cloud" /></span>-->
              <!--{{$t('deviceManager.channelSettings')}}-->
            <!--</span>-->

            <!--<template v-if="settingsDialogActiveTabsName === 'channelSettings'">-->
              <!--<template v-if="dialogInfo.length===1">-->
                <!--<div style="color: #666;margin-bottom: 20px;padding-bottom: 20px;border-bottom: 1px solid #DCDFE6;">-->
                  <!--{{$t('deviceManager.bootChannel')}} :-->
                  <!--<span style="color: #333;" v-if="dialogInfo[0].apiKey && channelMap[dialogInfo[0].apiKey] && dialogInfo[0].defaultSources">-->
                    <!--{{[channelMap[dialogInfo[0].apiKey], dialogInfo[0].defaultSources] | findInMap}}</span>-->
                  <!--<span style="color: #333;" v-else>-</span>-->
                <!--</div>-->

                <!--<div style="color: #666;">-->
                  <!--<div style="margin-bottom: 10px;">-->
                    <!--{{$t('deviceManager.setBootChannel')}}-->
                  <!--</div>-->

                  <!--<el-radio-group v-model="switchChannelRadioGroup"-->
                                  <!--style="width: 100%;display: flex;flex-wrap: wrap;justify-content: space-between;"-->
                                  <!--@change="isSettingsChangeNoSave = true"-->
                                  <!--v-if="dialogInfo[0].apiKey && channelMap[dialogInfo[0].apiKey]">-->
                    <!--<el-radio v-for="(channel, index) in channelMap[dialogInfo[0].apiKey]"-->
                              <!--:key="index"-->
                              <!--:label="channel.name"-->
                              <!--border-->
                              <!--style="margin: 5px 0 5px;width: 20.1%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"-->
                              <!--@click.native="switchChannelRadioGroup = ''"-->
                              <!--:title="channel.detail">{{channel.detail}}</el-radio>-->
                  <!--</el-radio-group>-->

                  <!--<div v-else style="color: #999;padding-top: 10px;">-->
                    <!--{{$t('deviceManager.untypedPrompt')}}-->
                  <!--</div>-->
                <!--</div>-->
              <!--</template>-->

              <!--<template v-if="dialogInfo.length>1">-->
                <!--<div style="color: #666;">-->
                  <!--<div style="margin-bottom: 20px;">-->
                    <!--{{$t('deviceManager.setBootChannel')}}-->
                  <!--</div>-->

                  <!--<div v-for="(key, index) in Object.keys(dialogInfoClassifyMap)"-->
                       <!--:key="index"-->
                       <!--style="margin-bottom: 20px;padding-bottom: 10px;border-bottom: 1px solid #DCDFE6;" >-->
                    <!--<div style="color: #666;display: flex;">-->
                      <!--<div style="flex: 1;">-->
                        <!--<span>{{$t('deviceManager.type')}} {{index+1}}</span>-->
                        <!--<span style="padding-left: 10px;">{{dialogInfoClassifyMap[key].length}} {{$t('deviceManager.machine')}}</span>-->
                        <!--<span style="padding-left: 20px;">{{$t('deviceManager.bootChannel')}}</span>-->
                        <!--<span style="color: #409EFF;" v-show="switchChannelRadioGroupMap[key]">-->
                          <!--&gt;> {{[channelMap[key], switchChannelRadioGroupMap[key]] | findInMap}}</span>-->
                      <!--</div>-->

                      <!--<span style="cursor: pointer;"-->
                            <!--@click="switchChannelRadioGroupShowMap[key] = !switchChannelRadioGroupShowMap[key]">-->
                        <!--<i class="el-icon-arrow-down" v-show="switchChannelRadioGroupShowMap[key]"></i>-->
                        <!--<i class="el-icon-arrow-up" v-show="!switchChannelRadioGroupShowMap[key]"></i>-->
                      <!--</span>-->
                    <!--</div>-->

                    <!--<el-radio-group v-model="switchChannelRadioGroupMap[key]"-->
                                    <!--style="width: 100%;display: flex;flex-wrap: wrap;justify-content: space-between;padding-top: 10px;"-->
                                    <!--@change="isSettingsChangeNoSave = true"-->
                                    <!--v-show="switchChannelRadioGroupShowMap[key]">-->
                      <!--<el-radio v-for="(channel, i) in channelMap[key]"-->
                                <!--:key="i"-->
                                <!--:label="channel.name"-->
                                <!--border style="margin: 5px 0 5px;width: 20.1%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"-->
                                <!--@click.native="switchChannelRadioGroupMap[key] = ''"-->
                                <!--:title="channel.detail">{{channel.detail}}</el-radio>-->
                    <!--</el-radio-group>-->
                  <!--</div>-->

                  <!--<div v-if="dialogInfoUnknownNum > 0">-->
                    <!--<div style="color: #666;">-->
                      <!--<span>{{$t('deviceManager.untypedType')}}</span>-->
                      <!--<span style="padding-left: 10px;">{{dialogInfoUnknownNum}} {{$t('deviceManager.machine')}}</span>-->
                    <!--</div>-->

                    <!--<div style="color: #999;padding-top: 10px;">-->
                      <!--{{$t('deviceManager.untypedPrompt')}}-->
                    <!--</div>-->
                  <!--</div>-->
                <!--</div>-->
              <!--</template>-->
            <!--</template>-->
          <!--</el-tab-pane>-->

          <!--锁屏设置-->
          <el-tab-pane :label="$t('deviceManager.lockScreenSettings')"
                       name="lockScreenSettings"
                       class="lockScreenSettings-box"
                       style="height: 500px;">
            <template v-if="settingsDialogActiveTabsName === 'lockScreenSettings'">
              <template v-if="lockScreenResultList.length===0">
                <!--<el-form label-position="left" label-width="100">
                  <el-form-item :label="$t('deviceManager.enterLockScreen')">
                    <el-radio-group v-model="lockScreenRadio"
                                    @change="isSettingsChangeNoSave = true, lockScreenImgRadio = '0'">
                      <el-radio label="0">{{$t('deviceManager.notLockScreen')}}</el-radio>
                      <el-radio label="5">5{{$t('deviceManager.minute')}}</el-radio>
                      <el-radio label="10">10{{$t('deviceManager.minute')}}</el-radio>
                      <el-radio label="15">15{{$t('deviceManager.minute')}}</el-radio>
                      <el-radio label="30">30{{$t('deviceManager.minute')}}</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item :label="$t('deviceManager.lockScreenMode')" v-show="lockScreenRadio && lockScreenRadio!=='0'">
                    <el-radio-group v-model="lockScreenImgRadio"
                                    :disabled="!lockScreenRadio || lockScreenRadio==='0'"
                                    @change="isSettingsChangeNoSave = true">
                      <el-radio label="0">{{$t('deviceManager.default')}}</el-radio>
                      <el-radio label="1">{{$t('deviceManager.customImage')}}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>-->
                <el-form label-position="left" label-width="100">
                  <el-form-item :label="$t('deviceManager.currentImage')" style="text-decoration: solid" v-if=" dialogInfo.length===1">
                     <span>
                       {{dialogInfo[0].lockScreenStyle === '0' ? $t('deviceManager.default') : $t('deviceManager.customImage')}}
                     </span>
                  </el-form-item>


                  <el-form-item :label="$t('deviceManager.lockScreenImage')">
                    <el-radio-group v-model="lockScreenImgRadio"
                                    @change="isSettingsChangeNoSave = true">
                      <el-radio label="0">{{$t('deviceManager.default')}}</el-radio>
                      <el-radio label="1">{{$t('deviceManager.customImage')}}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>

                <div class="upload-box"
                     v-if="lockScreenImgRadio==='1'"
                     style="padding: 24px;">
                  <template v-if="!uploadFileInfo">
                    <div class="upload-wrapper" style="width: 360px;">
                      <div tabindex="0" class="el-upload el-upload--text">
                        <div id="uploadArea" class="el-upload-dragger">
                          <i class="el-icon-upload"></i>
                          <div class="el-upload__text">{{$t('deviceManager.dragFileHere')}}{{$t('deviceManager.or')}}<em>{{$t('deviceManager.clickUpload')}}</em></div>
                          <div class="el-upload__tip">{{$t('deviceManager.onlyUpload')}}jpg/png{{$t('deviceManager.file')}}{{$t('deviceManager.andNotExceed')}}2MB</div>
                        </div>

                        <webuploader ref="webuploader"
                                     accept="image"
                                     url="/prm-web/a/fileInfosa/uploader"
                                     uploadButton="#uploadArea"
                                     dndEle="#uploadArea"
                                     :fileNumLimit="1"
                                     :isChunked="false"
                                     @beforeFileQueued="webuploader_beforeFileQueued"
                                     @fileQueued="webuploader_fileQueued"
                                     @fileDequeued="webuploader_fileDequeued"
                                     @uploadFinished="webuploader_uploadFinished"
                                     @uploadStart="webuploader_uploadStart"
                                     @uploadBeforeSend="webuploader_uploadBeforeSend"
                                     @uploadProgress="webuploader_uploadProgress"
                                     @uploadSuccess="webuploader_uploadSuccess"
                                     @uploadError="webuploader_uploadError"
                                     @uploadComplete="webuploader_uploadComplete"
                                     @error="webuploader_error">
                        </webuploader>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="adaptive-img-box" style="width: 400px;height: 225px;margin-bottom: 10px;">
                      <img :src="uploadFileInfo.path" class="adaptive-img" alt="uploadImg" />
                    </div>

                    <el-button type="text" @click="uploadFileInfo = null;">{{$t('deviceManager.replaceImage')}}</el-button>
                  </template>
                </div>
              </template>

              <template v-else>
                <el-form label-position="left" label-width="100" style="margin-bottom: 10px;">
                <!--  <el-form-item :label="$t('deviceManager.enterLockScreen')">
                    {{lockScreenRadio!=='0' ?
                    (lockScreenRadio+'min'+$t('deviceManager.enterLockScreen')) :
                    $t('deviceManager.notLockScreen')}}
                  </el-form-item>-->

                  <el-form-item :label="$t('deviceManager.lockScreenChange')" >
                    {{lockScreenImgRadio==='0' ?
                    $t('deviceManager.default') :
                    $t('deviceManager.customImage')}}
                      <!--<el-popover
                      placement="right"
                      width="400"
                      trigger="click"
                    content="kkkk">
                        <span>kjkjlkjl</span>
                      <el-button slot="reference" size="mini">查看</el-button>
                    </el-popover>-->
                    <span style="color: #409EFF;cursor: pointer" @click="showadAptiveImage" v-if="lockScreenImgRadio ==='1'">查看</span>
                    <!--<img :src="uploadFileInfo.path" class="adaptive-img adaptiveImage" alt="uploadImg" style="position: absolute;z-index: 19999" v-if="isShowadAptiveImage" />-->
                    <div class="adaptive-img-box" style="width: 400px;height: 225px;position: absolute;z-index: 19999" v-show="isShowadAptiveImage" v-if="lockScreenImgRadio ==='1'">
                      <img :src="uploadFileInfo.path" class="adaptive-img adaptiveImage" alt="uploadImg" />
                    </div>

                  </el-form-item>
                </el-form>

                <template v-if="dialogInfo.length===1">
                  <el-alert
                    :title="lockScreenResultList[0].txt"
                    :type="lockScreenResultList[0].result===2 ? 'info' : (lockScreenResultList[0].result===1?'success':'error')"
                    :closable="false"
                    show-icon>
                  </el-alert>
                </template>

                <template v-else-if="dialogInfo.length>1">
                  <div style="margin-bottom: 10px;">
                    <el-alert
                      :title="$t('common.operatingResult') + ': ' +
                              $t('common.processing').replace('...', '') + listClassify(lockScreenResultList, 'result', 2) + '  ' +
                              $t('common.success') + listClassify(lockScreenResultList, 'result', 1) + '  ' +
                              $t('common.error') + listClassify(lockScreenResultList, 'result', 0)"
                      type="info"
                      :closable="false"
                      show-icon>
                    </el-alert>
                  </div>

                  <ul class="el-upload-list el-upload-list--text el-upload-list-result">
                    <li :class="['el-upload-list__item', { 'is-success': item.result===1 }]"
                        v-for="(item, index) in lockScreenResultList" :key="index">
                      <a class="el-upload-list__item-name">
                        <svg-icon icon-class="AIO" /> {{deviceIdTurnName(item.id)}} - {{item.txt}}
                      </a>
                      <!--<el-progress :percentage="item.result===1 ? 100 : (item.result===0 ? 0 : 50)"-->
                      <!--:status="item.result===1 ? 'success' : (item.result===0 ? 'exception' : '')"></el-progress>-->
                    </li>
                  </ul>
                </template>
              </template>
            </template>
          </el-tab-pane>

          <!--APK升级-->
          <el-tab-pane :label="$t('deviceManager.apkUpgrade')" name="apkSettings" style="height: 500px;">
            <template v-if="settingsDialogActiveTabsName === 'apkSettings'">
              <div style="width: 100%;position: relative;padding-bottom: 10px;border-bottom: 1px solid #DCDFE6;">
                <div style="display: flex;align-items: center;">
                  <div style="width: 80px;">{{$t('deviceManager.currentVersion')}} :</div>
                  <span v-if="updateApkStep==='3'">
                    >> {{updateApkversion}}
                  </span>
                  <span v-else>
                    <el-button type="text" @click="isShowApkList = !isShowApkList">{{$t('deviceManager.clickToView')}}</el-button>
                  </span>
                </div>

                <ul class="apk-list" v-if="isShowApkList">
                  <li v-for="(item, index) in dialogInfo" :key="index" style="width: 100%;padding: 10px;display: flex;justify-content: space-between;border-bottom: 1px solid #EBEEF5;">
                    <span>{{item.name}}</span>
                    <span>v{{item.androidVersion}}</span>
                  </li>
                </ul>
              </div>

              <div style="width: 100%;display: flex;margin-top: 20px;height: 445px;" class="ApkUpdate-box">
                <div style="width: 80px;">
                  {{$t('deviceManager.remoteUpdate')}}
                </div>

                <div style="width: 100%;">
                  <template v-if="updateApkStep==='1'">
                    <div class="upload-box" style="padding: 24px;">
                      <div class="upload-wrapper" style="width: 360px;">
                        <div tabindex="0" class="el-upload el-upload--text">
                          <div id="uploadApkArea" class="el-upload-dragger">
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">{{$t('deviceManager.dragFileHere')}}{{$t('deviceManager.or')}}<em>{{$t('deviceManager.clickUpload')}}</em></div>
                            <div class="el-upload__tip">{{$t('deviceManager.onlyUpload')}}apk{{$t('deviceManager.file')}}</div>
                          </div>

                          <webuploader ref="apkWebuploader"
                                       accept="apk"
                                       url="/prm-web/a/fileInfosa/uploader"
                                       uploadButton="#uploadApkArea"
                                       dndEle="#uploadApkArea"
                                       :fileNumLimit="1"
                                       :fileSingleSizeLimit="1024*1024*1024*1024"
                                       @beforeFileQueued="webuploader_beforeFileQueued"
                                       @fileQueued="webuploader_fileQueued"
                                       @fileDequeued="webuploader_fileDequeued"
                                       @uploadFinished="webuploader_uploadFinished"
                                       @uploadStart="webuploader_uploadStart"
                                       @uploadBeforeSend="webuploader_uploadBeforeSend"
                                       @uploadProgress="webuploader_uploadProgress"
                                       @uploadSuccess="webuploader_uploadSuccess"
                                       @uploadError="webuploader_uploadError"
                                       @uploadComplete="webuploader_uploadComplete"
                                       @error="webuploader_error">
                          </webuploader>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="updateApkStep==='2'">
                    <ul class="el-upload-list el-upload-list--text">
                      <li :class="['el-upload-list__item']">
                        <a class="el-upload-list__item-name">
                          <i class="el-icon-document"></i>{{uploadAPKInfo.name}}
                        </a>

                        <i class="el-icon-close" @click="apkCancelUpload"></i>

                        <el-progress :percentage="uploadAPKInfo.percentage"
                                     :status="uploadAPKInfo.status"></el-progress>
                      </li>
                    </ul>
                  </template>

                  <template v-else-if="updateApkStep==='3'">
                    <div style="margin-bottom: 10px;" v-show="updateAPKResultList.length>0">
                      <el-alert
                        :title="$t('common.operatingResult') + ': ' +
                              $t('common.processing').replace('...', '') + listClassify(updateAPKResultList, 'result', 2) + '  ' +
                              $t('common.success') + listClassify(updateAPKResultList, 'result', 1) + '  ' +
                              $t('common.error') + listClassify(updateAPKResultList, 'result', 0)"
                        type="info"
                        :closable="false"
                        show-icon>
                      </el-alert>
                    </div>

                    <ul class="el-upload-list el-upload-list--text el-upload-list-result">
                      <li :class="['el-upload-list__item', { 'is-success': item.result===1 }]"
                          v-for="(item, index) in updateAPKResultList" :key="index">
                        <a class="el-upload-list__item-name">
                          <svg-icon icon-class="AIO" /> {{deviceIdTurnName(item.id)}} - {{item.txt}}
                        </a>

                        <!--<el-progress :percentage="item.result===1 ? 100 : (item.result===0 ? 0 : 50)"-->
                                     <!--:status="item.result===1 ? 'success' : (item.result===0 ? 'exception' : '')"></el-progress>-->
                      </li>
                    </ul>
                  </template>
                </div>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>

        <template v-if="settingsDialogActiveTabsName === 'basicSettings'">
          <span style="position: absolute;left: 106px;bottom: 0;color: #999;font-size: 12px;">
          * {{$t('deviceManager.offlineDeviceTips')}}
        </span>

          <div slot="footer" style="text-align: right;">
            <el-button :disabled="!isChangeSetDialog ||
                                  (dialogInfo.length>1 && !switchingPowerRadioGroup && !isSetVolumeChecked) ||
                                  (dialogInfo.length===1 && dialogInfo[0].status==='0' && !isSetVolumeChecked)"
                       type="primary"
                       @click="setBasicDevice"
                       :loading="isSettingsLoading">{{$t('common.confirm')}}</el-button>
            <el-button plain @click="resetBasicSettings">{{$t('common.resetBtn')}}</el-button>
          </div>
        </template>

        <template v-else-if="settingsDialogActiveTabsName === 'channelSettings'">
          <div slot="footer" style="text-align: right;" v-if="isChannelConfirmShow">
            <el-button type="primary"
                       @click="isSettingsLoading = true, confirmChannel()"
                       :loading="isSettingsLoading">{{$t('common.confirm')}}</el-button>
            <el-button plain
                       @click="resetChannelSettings"
                       v-show="!isSettingsLoading">{{$t('common.resetBtn')}}</el-button>
          </div>

          <div slot="footer" style="height: 40px;" v-else></div><!--占位-->
        </template>

        <!--锁屏设置按钮-->
        <template v-else-if="settingsDialogActiveTabsName === 'lockScreenSettings'">
           <span style="position: absolute;left: 106px;bottom: 0;color: #999;font-size: 12px;">
          * {{$t('deviceManager.offlineDeviceTips')}}
        </span>
          <div slot="footer" style="text-align: right;"  v-if="lockScreenImgRadio ==='0' || lockScreenImgRadio ==='1'">

            <el-button :disabled="(!uploadFileInfo && lockScreenImgRadio==='1') ||
                                        lockScreenImgRadio !=='0' &&
                                        lockScreenImgRadio !=='1'"
                       type="primary"
                       @click="setLockScreenDevice"
                       :loading="isSettingsLoading" :class="{isShowBtn:isSuccessedActive}">{{$t('common.confirmBtn')}}</el-button>
            <el-button plain @click="resetLockScreenSettings">{{$t('common.returnBtn')}}</el-button>
          </div>

          <div slot="footer" style="height: 40px;" v-else></div><!--占位-->
        </template>

        <template v-else-if="settingsDialogActiveTabsName === 'apkSettings'">
          <div slot="footer" style="text-align: right;">
            <el-button :disabled="!uploadAPKInfo || (uploadAPKInfo&&uploadAPKInfo.percentage!==100) || !!timer"
                       type="primary"
                       @click="updateAPKDevice"
                       :loading="isSettingsLoading">{{$t('common.updateBtn')}}</el-button>
            <el-button plain @click="resetAPKSettings">{{$t('common.resetBtn')}}</el-button>
          </div>
        </template>
      </div>

      <!--定时计划-->
      <div class="manager-dialog" v-if="dialogKey === 'plan' && dialogInfo.length>0" style="min-height: 500px;position: relative;">
        <el-tabs v-model="planDialogActiveTabsName" @tab-click="handlePlanDialogClick">
          <el-tab-pane :label="$t('deviceManager.currentPlan')" name="currentPlan">
            <div  v-if="dialogInfo.length>1 && (!planDialogUniformPlan['1'] && !planDialogUniformPlan['2'])"
                  style="width: 100%;text-align: center;color: #999;">
              {{$t('deviceManager.uniformPlanTips')}}
            </div>

            <div class="timingPlan-box" v-else>
              <div class="timingPlan-power">
                <div style="white-space: nowrap;font-size: 16px;">
                  <div>{{$t('deviceManager.powerPlan')}}</div>
                  <div style="text-align: center;">
                    <el-button type="text"
                               style="color: #F56C6C;"
                               :disabled="!planDialogUniformPlan['1']"
                               @click="deleteTimingPlan(true)">{{$t('common.delete')}}</el-button>
                  </div>
                </div>

                <div class="timingPlan-power-list" v-if="planDialogUniformPlan['1'] && planDialogUniformPlan['1'].length>0">
                  <div style="margin-bottom: 10px;">{{planDialogUniformPlan.name1}}</div>

                  <ul>
                    <li v-for="(item, index) in planDialogUniformPlan['1']" :key="index" style="margin-bottom: 10px">
                      <span v-if="item.planType==='1'">{{$t('deviceManager.weeklyPlan') + ' ' + (index+1)}}</span>
                      <span v-else>{{$t('deviceManager.specialPlan')+ ' ' + (index+1)}}</span>
                      &nbsp;
                      <span v-if="item.operation==='1'">{{$t('deviceManager.startingUp')}}</span>
                      <span v-else-if="item.operation==='2'">{{$t('deviceManager.standby')}}</span>
                      <span v-else>{{$t('deviceManager.powerOff')}}</span>
                      &nbsp;
                      <span>{{+item.time | formatDateTime}}</span>
                      &nbsp;
                      <template v-if="item.planType==='1'">
                        <span v-if="item.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                        <span v-if="item.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                        <span v-if="item.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                        <span v-if="item.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                        <span v-if="item.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                        <span v-if="item.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                        <span v-if="item.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                      </template>
                      <template v-else>
                        <span v-for="(date, i) in item.date.split(',')" :key="i">{{+date | formatDateDate}}<span v-if="i===0">~</span></span>
                      </template>
                    </li>
                  </ul>
                </div>

                <div class="timingPlan-power-list" v-else>
                  <span style="color: #999;">{{$t('deviceManager.noPlan')}}</span>
                </div>
              </div>

              <div class="timingPlan-volume">
                <div style="white-space: nowrap;font-size: 16px;">
                  <div>{{$t('deviceManager.volumePlan')}}</div>
                  <div style="text-align: center;">
                    <el-button type="text"
                               style="color: #F56C6C;"
                               :disabled="!planDialogUniformPlan['2']"
                               @click="deleteTimingPlan(false)">{{$t('common.delete')}}</el-button>
                  </div>
                </div>

                <div class="timingPlan-volume-list" v-if="planDialogUniformPlan['2'] && planDialogUniformPlan['2'].length>0">
                  <div style="margin-bottom: 10px;">{{planDialogUniformPlan.name2}}</div>

                  <ul>
                    <li v-for="(item, index) in planDialogUniformPlan['2']" :key="index" style="margin-bottom: 10px">
                      <span v-if="item.planType==='1'">{{$t('deviceManager.fixedVolume')}}</span>
                      <span v-else>{{$t('deviceManager.plan') + ' ' + (index+1)}}</span>
                      &nbsp;
                      <template v-if="item.planType==='1'">
                        <span>{{item.volume}}</span>
                      </template>
                      <template v-else>
                        <span>{{$t('deviceManager.volume')}}: {{item.volume}}</span>
                        &nbsp;
                        <span v-for="(date, i) in item.date.split(',')" :key="i">{{+date | formatDateTime}}<span v-if="i===0">~</span></span>
                        &nbsp;
                        <span v-if="item.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                        <span v-if="item.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                        <span v-if="item.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                        <span v-if="item.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                        <span v-if="item.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                        <span v-if="item.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                        <span v-if="item.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                      </template>
                    </li>
                  </ul>
                </div>

                <div class="timingPlan-volume-list" v-else>
                  <span style="color: #999;">{{$t('deviceManager.noPlan')}}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="$t('deviceManager.selectPlan')" name="selectPlan">
            <div style="display: flex;justify-content: space-between;">
              <el-form ref="selectPlanForm" :model="selectPlanForm" label-width="80px" label-position="left">
                <el-form-item :label="$t('planManager.functionTypes') + ' *'" style="margin-bottom: 0;">
                  <el-radio-group v-model="selectPlanForm.type" @change="selectPlanFormChange">
                    <el-radio label="1">{{$t('planManager.powerSource')}}</el-radio>
                    <el-radio label="2">{{$t('planManager.volume')}}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>

              <div>
                <el-input @keyup.enter.native="handleSearchPlan"
                          style="width: 250px;margin-left: 10px;"
                          :placeholder="$t('deviceManager.searchPlanName')"
                          clearable
                          suffix-icon="el-icon-search"
                          v-model="planListQuery.searchKey"
                          @clear="handleSearchPlan">
                </el-input>
              </div>
            </div>


            <el-table :data="planTableData"
                      :span-method="objectSpanMethod"
                      border
                      style="width: 100%; margin: 20px 0 10px;"
                      @select="handleSelectPlan"
                      ref="planTable"
                      id="planTable"
                      v-loading="isPlanTableDataLoading"
                      @filter-change="planTableFilterChangeHandle">
              <el-table-column
                type="selection"
                width="35">
              </el-table-column>

              <el-table-column
                prop="name"
                :label="$t('planManager.planName')"
                width="100">
              </el-table-column>

              <el-table-column
                prop="type"
                :label="$t('planManager.functionTypes')"
                width="100">
                <template slot-scope="scope">
                  <span>{{ scope.row.type==='1' ? $t('planManager.powerSource') : $t('planManager.volume') }}</span>
                </template>
              </el-table-column>

              <el-table-column
                :label="$t('deviceManager.createdTime')"
                width="100">
                <template slot-scope="scope">
                  <span>{{ scope.row.updateDate | formatDate }}</span>
                </template>
              </el-table-column>

              <el-table-column :label="$t('deviceManager.details')">
                <template slot-scope="scope">
                  <div v-if="curCheckedPlanInfo">
                    <div style="margin-bottom: 10px;">{{curCheckedPlanInfo.name}}</div>

                    <template v-if="curCheckedPlanInfo.type==='1'">
                      <div v-for="(c, i) in curCheckedPlanInfo.content" :key="i" style="margin-bottom: 10px;">
                        <span v-if="c.planType==='1'">{{$t('deviceManager.weeklyPlan')}}</span>
                        <span v-else>{{$t('deviceManager.specialPlan')}}</span>
                        &nbsp;
                        <span v-if="c.operation==='1'">{{$t('deviceManager.startingUp')}}</span>
                        <span v-else-if="c.operation==='2'">{{$t('deviceManager.standby')}}</span>
                        <span v-else>{{$t('deviceManager.powerOff')}}</span>
                        &nbsp;
                        <span>{{+c.time | formatDateTime}}</span>
                        &nbsp;
                        <template v-if="c.planType==='1'">
                          <span v-if="c.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                          <span v-if="c.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                          <span v-if="c.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                          <span v-if="c.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                          <span v-if="c.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                          <span v-if="c.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                          <span v-if="c.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                        </template>
                        <template v-else>
                          <span v-for="(date, ind) in c.date.split(',')" :key="ind">{{+date | formatDateDate}}<span v-if="ind===0">~</span></span>
                        </template>
                      </div>
                    </template>

                    <template v-else>
                      <div v-for="(c, i) in curCheckedPlanInfo.content" :key="i" style="margin-bottom: 10px;">
                        <span v-if="c.planType==='1'">{{$t('deviceManager.fixedVolume')}}</span>
                        <span v-else>{{$t('deviceManager.plan') + ' ' + i}}</span>
                        &nbsp;
                        <template v-if="c.planType==='1'">
                          <span>{{c.volume}}</span>
                        </template>
                        <template v-else>
                          <span>{{$t('deviceManager.volume')}}: {{c.volume}}</span>
                          &nbsp;
                          <span v-for="(date, ind) in c.date.split(',')" :key="ind">{{+date | formatDateTime}}<span v-if="ind===0">~</span></span>
                          &nbsp;
                          <span v-if="c.weeks.indexOf('1')>-1">{{$t('deviceManager.monday')}}</span>
                          <span v-if="c.weeks.indexOf('2')>-1">{{$t('deviceManager.tuesday')}}</span>
                          <span v-if="c.weeks.indexOf('3')>-1">{{$t('deviceManager.wednesday')}}</span>
                          <span v-if="c.weeks.indexOf('4')>-1">{{$t('deviceManager.thursday')}}</span>
                          <span v-if="c.weeks.indexOf('5')>-1">{{$t('deviceManager.friday')}}</span>
                          <span v-if="c.weeks.indexOf('6')>-1">{{$t('deviceManager.saturday')}}</span>
                          <span v-if="c.weeks.indexOf('7')>-1">{{$t('deviceManager.sunday')}}</span>
                        </template>
                      </div>
                    </template>
                  </div>

                  <div v-else style="text-align: center;">
                    <span style="color: #999;">{{$t('deviceManager.pleaseSelectPlanTips')}}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div style="display: flex;align-items: center;justify-content: flex-end;">
              <el-pagination
                @current-change="planListCurrentChange"
                :current-page="1"
                :page-sizes="[5]"
                :page-size="5"
                layout="total, sizes, prev, pager, next, jumper"
                :total="planListQuery.count">
              </el-pagination>

              <el-button size="mini" style="margin-left: 8px;">{{$t('common.skip')}}</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <span style="color: #999;font-size: 12px;position: absolute;right: 0;bottom: 0;">
          * {{$t('deviceManager.selectPlanTips')}}
        </span>

        <div slot="footer" v-if="planDialogActiveTabsName === 'selectPlan'">
          <el-button :disabled="!curCheckedPlanInfo"
                     type="primary"
                     @click="uniformPlan">{{$t('common.confirm')}}
          </el-button>
        </div>
      </div>

      <!--移动分组-->
      <div class="manager-dialog" v-if="dialogKey === 'move' && dialogInfo.length>0">
        <el-tree
          class="move-tree"
          :data="moveOfficeTree"
          :props="moveOfficeProps"
          ref="moveOfficeTree"
          show-checkbox
          highlight-current
          node-key="id"
          check-on-click-node
          :expand-on-click-node="false"
          @node-click="clickMoveOfficeHandle"
          @check="checkMoveOfficeHandle"
          check-strictly
          :default-expanded-keys="[officeId]">
        </el-tree>

        <div slot="footer" class="dialog-footer">
          <el-button :disabled="!curCheckedMoveOfficeId"
                     type="primary"
                     @click="moveDevices()"
                     :loading="isMoveDevicesLoading">{{$t('common.confirm')}}</el-button>
          <el-button plain @click="dialogVisible = false">{{$t('common.cancel')}}</el-button>
        </div>
      </div>

      <!--删除-->
      <div class="manager-dialog" v-if="dialogKey === 'delete'">
        <div style="margin-bottom: 20px;">
          {{$t('deviceManager.deleteDevicesTips1')}} &nbsp;
          <template v-if="dialogInfo.length===1">
            <span style="color: #409EFF;">{{dialogInfo[0].name}}</span> &nbsp;
            {{$t('deviceManager.deleteDevicesTips2')}}
          </template>

          <template v-else-if="dialogInfo.length>1">
            <span style="color: #409EFF;">{{dialogInfo[0].name}}</span> &nbsp;
            {{$t('deviceManager.etc')}}
            {{dialogInfo.length}}
            {{$t('deviceManager.devices')}}{{$t('deviceManager.deleteDevicesTips2')}}
          </template>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">{{$t('common.cancel')}}</el-button>
          <el-button type="danger" plain @click="deleteDevices(), dialogVisible = false">{{$t('common.deleteBtn')}}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate, treeify, uniqueArr, imgHistoryScreenCapture, listClassifyMap } from '@/utils'
import Multiselect from 'vue-multiselect'
import { mapGetters } from 'vuex'
import { getDeviceList, getPlanOfDevice, movePlanToDevice, getPlanList, setDevice_powerOff, setDevice_standby,
          setDevice_awake, setDevice_restart, setDeviceVolume, setLockScreen, getLockScreenInfo,setDedicatedApk,
          getApkUpdateInfo, updateTeOffice, deleteTerminal, submitTeInfo, removePlanOfDevice } from '@/api/device'
import { getOfficeList } from '@/api/office'
import Webuploader from '@/components/Webuploader'
import { myMixin } from '@/assets/js/mixins'
import { terminalPassSetting } from '@/api/channel'

export default {
  name: 'complexTable',
  components: {
    Multiselect,
    Webuploader
  },
  props: {
    checkedOfficeIds: {
      type: Array,
      default: []
    },
  },
  mixins:[ myMixin ],
  watch: {
    checkedOfficeIds(val) {
      console.log(`稍后请求设备,已勾选机构id为：${val}`);
      this.resetData();
      this.getList();
    }
  },
  computed: {
    ...mapGetters([
      'roles',
      'officeId',
      'officeName',
      'language',
    ]),
    finalShowNum() {
      if (this.filterKeys.length===0) {
        return this.list.length;
      } else {
        let num = 0;

        this.list.map(item => {
          if (this.filterKeys.indexOf(item.status) > -1) {
            num++;
          }
        });
        console.log('当前显示数据数量为', num)
        return num;
      }
    },
//    isLazyLoading() {
//      console.log('当前是否显示加载中...', this.finalShowNum > Math.ceil((this.tableHeight/65)))
//      return this.finalShowNum > Math.ceil((this.tableHeight/65));
//    },
    dialogInfoOnlineNum() {
      let num = 0;

      if (Array.isArray(this.dialogInfo)) {
        this.dialogInfo.map(item => {
          if (item.status==='1') {
            num++;
          }
        })
      } else if (this.dialogInfo) {
        if (this.dialogInfo.status==='1') {
          num++;
        }
      }

      return num;
    },
    dialogInfoStandbyNum() {
      let num = 0;

      if (Array.isArray(this.dialogInfo)) {
        this.dialogInfo.map(item => {
          if (item.status==='2') {
            num++;
          }
        })
      } else if (this.dialogInfo) {
        if (this.dialogInfo.status==='2') {
          num++;
        }
      }

      return num;
    },
    dialogInfoOfflineNum() {
      let num = 0;

      if (Array.isArray(this.dialogInfo)) {
        this.dialogInfo.map(item => {
          if (item.status==='0') {
            num++;
          }
        })
      } else if (this.dialogInfo) {
        if (this.dialogInfo.status==='0') {
          num++;
        }
      }

      return num;
    },
    actions() {
      return this.roles.indexOf('root')>-1 ?
        [
          { label: this.$t('deviceManager.setting'), val: 'setting' },
          { label: this.$t('deviceManager.screen'), val: 'screen' },
          { label: this.$t('deviceManager.timingPlan'), val: 'timingPlan' },
          { label: this.$t('deviceManager.mobilePacket'), val: 'mobilePacket' },
          { label: this.$t('common.delete'), val: 'delete' }
        ] :
        [
          { label: this.$t('deviceManager.setting'), val: 'setting' },
          { label: this.$t('deviceManager.screen'), val: 'screen' },
          { label: this.$t('deviceManager.timingPlan'), val: 'timingPlan' },
          { label: this.$t('common.delete'), val: 'delete' }
        ];
    },
    isChannelConfirmShow() {
      let isShow = false;

      if (this.switchChannelRadioGroupMap) {
        isShow = Object.keys(this.switchChannelRadioGroupMap).some(key => !!this.switchChannelRadioGroupMap[key]);
      }

      return !!this.switchChannelRadioGroup || isShow;
    },
    batchSyncListItems() {
      let res = [];

      this.checkedDeviceList.map(item => {
        let index = this.list.findIndex(i => i.id === item.id);

        if (index > -1) {
          res.push(this.list[index]);
        } else {
          res.push(item);
        }
      });

      return res;
    }
  },
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
      },
      listTotalCount: 0,
      isShowTotalCount: true,
      tableHeight: document.documentElement.clientHeight - 180,
//      actions: [],
      dialogFormVisible: false,
      dialogStatus: '',
      checkedDeviceList: [],
      isShowCheckedDeviceList: false,
      searchVal: '',
      filterKeys: [],
      dialogKey: '',
      dialogVisible: false,
      dialogTitle: '',
      dialogInfo: null,
      dialogWidth: '50%',
      planDialogActiveTabsName: 'currentPlan', // 定时计划
      detailsDialogActiveTabsName: 'details', // 详情
      busy: false,
      isChangeModifyDialog: false,
      settingsDialogActiveTabsName: 'basicSettings',
      switchingPowerRadioGroup: '',
      isSetVolumeChecked: false,
      setVolumeSlider: 0,
      isChangeSetDialog: false,
      searchPlanVal: '',
      curCheckedPlanInfo: null,
      isShowadAptiveImage: false,
      isSuccessedActive:false,
      // 移动分组
      moveOfficeTree: [],
      moveOfficeProps: { // 移动机构树的设置
        children: 'children',
        label: 'name'
      },
      curCheckedMoveOfficeId: '',
      isMoveDevicesLoading: false,
      // 定时计划
      planDialogUniformPlan: {},
      planListQuery: {
        searchKey: '',
        pageNo: 1,
        pageSize: 5,
        type: '',
        count: 0
      },
      planTableData: [],
      isPlanTableDataLoading: false,
      selectPlanForm: {
        type: ''
      },
      // 锁屏设置
      lockScreenImgRadio: '',
      uploadFileInfo: null, // 记录上传队列中的文件信息
      appMainLoading: null,
      lockScreenResultList: [],
      // apk
      isShowApkList: false,
      updateApkStep: '1',
      uploadAPKInfo: null,
      updateAPKResultList: [],
      updateApkversion: '',
      // 定时器
      timer: null,
      searching: false,
      // 基础设置
      isShowBasicSettingsResult: false,
      basicSettingsResult: '',
      basicSettingsResultList: [],
      isSettingsChangeNoSave: false,
      isSettingsLoading: false,
      isSettingsChangeSubmit: false,
      //通道设置
      switchChannelRadioGroup: '',
      dialogInfoClassifyMap: null,
      dialogInfoUnknownNum: 0,
      switchChannelRadioGroupMap: null,
      switchChannelRadioGroupShowMap: null,
      channelMap: null,
    }
  },
  filters: {
    formatDate(time){
      let date = new Date(time);
      return formatDate(date,'yyyy-MM-dd hh:mm');
    },
    formatDateDate(time){
      let date = new Date(time);
      return formatDate(date,'yyyy-MM-dd');
    },
    formatDateTime(time){
      let date = new Date(time);
      return formatDate(date,'hh:mm');
    },
    formatDay(time) {
      let day = Math.floor(time/(1000*60*60*24)),
        hour = Math.floor((time-day*(1000*60*60*24))/(1000*60*60)),
        min = Math.floor((time-day*(1000*60*60*24)-hour*(1000*60*60))/(1000*60));

      return day + 'd' + ' ' + hour + 'h';
    },
    findInMap([map, label]){
      console.log('当前终端已设置的通道', map, label);
      let res = [];

      map.map(item => {
        if (label.indexOf(item.name) > -1) {
          res.push(item.detail)
        }
      });

      return res.length>0 ? res + '' : '-';
    }
  },
  created() {
//    this.actions = this.roles.indexOf('root')>-1 ?
//      [
//        { label: this.$t('deviceManager.setting'), val: 'setting' },
//        { label: this.$t('deviceManager.screen'), val: 'screen' },
//        { label: this.$t('deviceManager.timingPlan'), val: 'timingPlan' },
//        { label: this.$t('deviceManager.mobilePacket'), val: 'mobilePacket' },
//        { label: this.$t('common.delete'), val: 'delete' }
//      ] :
//      [
//        { label: this.$t('deviceManager.setting'), val: 'setting' },
//        { label: this.$t('deviceManager.screen'), val: 'screen' },
//        { label: this.$t('deviceManager.timingPlan'), val: 'timingPlan' },
//        { label: this.$t('common.delete'), val: 'delete' }
//      ];
  },
  mounted() {

  },
  methods: {
    getList(isRequestedAllData, isSelectAll) {
      if (!this.checkedOfficeIds || this.checkedOfficeIds.length===0) return this.resetData();

      this.listLoading = true;
      let params = {
        officeIds: this.checkedOfficeIds + '',
        pageNo: this.listQuery.pageNo,
        pageSize: this.listQuery.pageSize,
      };

      if (this.searchVal) params.searchKey = this.searchVal;

      // todo 根据机构id请求设备列表
      if (isRequestedAllData) { // 自调用请求完全部数据
        this.listQuery.pageNo++;
        params.pageNo = this.listQuery.pageNo;

        getDeviceList(params).then(res => {
          console.log(res);

          if (this.listQuery.pageNo*this.listQuery.pageSize < res.count) {
            this.listTotalCount = res.count;
            this.list.push(...res.data);
            this.getList(true, isSelectAll);
          } else {
            this.busy = false;
            this.listLoading = false;
            this.listTotalCount = res.count;
            this.list.push(...res.data);
            this.searching = false;
            this.channelMap = res.apiKeyPass;

            if (isSelectAll) {
              this.$refs['deviceTable'].toggleAllSelection();
            } else if (this.checkedDeviceList.length > 0) {
              this.$nextTick(() => {
                this.checkedDeviceList.map((row, index, arr) => {
                  if (!row) return;

                  let i = this.list.findIndex(item => row.id === item.id);

                  if (i > -1) this.$refs['deviceTable'].toggleRowSelection(this.list[i], true);
                });
              })

            }
          }
        }).catch(err => {
          console.log(err);

          this.$message.error(this.$t('common.getDeviceListError'));
          this.searching = false;
        });
      } else {  // 只请求一页数据（会新增数据）
        getDeviceList(params).then(res => {
          console.log(res);

          this.listTotalCount = res.count;
          this.list.push(...res.data);
          this.busy = false;
          this.listLoading = false;
          this.channelMap = res.apiKeyPass;

          if (this.checkedDeviceList.length > 0) {
              this.$nextTick(() => {
                this.checkedDeviceList.map((row, index, arr) => {
                  if (!row) return;

                  let i = this.list.findIndex(item => row.id === item.id);

                  if (i > -1) this.$refs['deviceTable'].toggleRowSelection(this.list[i], true);
                });
              })

          }
        }).catch(err => {
          console.log(err);

          this.$message.error(this.$t('common.getDeviceListError'));
        });
      }
    },
    handleSearch() {
      if (this.searching) return false;

      this.resetData();
      this.listQuery.pageNo =  0;
      this.searching = true;
      this.getList(true);
    },
    handleSelection(selection, row) {
      if (selection.length===0 && (this.checkedDeviceList.length-this.list.length===0)) {
        this.checkedDeviceList = [];
      } else if (selection.findIndex(item => item.id===row.id) === -1) {
        this.uncheckedOneRow(row)
      }
    },
    handleSelectionChange(selection) {
      if (selection.length > 0) {
        let ids = [];

        this.checkedDeviceList.map(item => {
          if (!item) return;

          ids.push(item.id);
        });

        selection.map(item => {
          if (!item) return;

          if (ids.indexOf(item.id) === -1) this.checkedDeviceList.push(item);
        });
      }
    },
    tableLoadMore() { // this.listQuery.pageNo*this.listQuery.pageSize this.listTotalCount
      if (!this.busy && this.listQuery.pageNo*this.listQuery.pageSize<this.listTotalCount) {
        this.busy = true;
        this.listQuery.pageNo++;
        this.getList();

        console.log('懒加载中...');
      }
    },
    renderDevicenameHeader(h, { column, $index }) {
      return h("span", {
          "style": {
            "position": "relative", //[this.$t('deviceManager.deviceName')],
          }
        },[
        h("span", {}, this.$t('deviceManager.deviceName')),
        h("i", {
          "class": {
            "el-icon-info": true
          },
          "style": {
            "position": "absolute",
            "top": "50%",
            "margin-top": "-7px",
            "right": "-50px",
            "color": "#F56C6C",
          },
          "attrs": { "title": this.$t('deviceManager.markedRedDevice') },
        }),
      ])
    },
    renderRunningTimeHeader(h, { column, $index }) {
      return h("span", {
        "style": {
          "position": "relative",
        }
      },[
        h("span", {}, this.$t('deviceManager.cumulativeRunningTime')),
        h("i", {
          "class": {
            "el-icon-info": true
          },
          "style": {
            "position": "absolute",
            "top": "50%",
            "margin-top": "-7px",
            "right": "-50px",
            "color": "#409EFF",
          },
          "attrs": { "title": this.$t('deviceManager.hourlyUpdatedData') },
        }),
      ])
    },
    renderHandleHeader(h, { column, $index }) {
      let self = this;

      return h("div",{
        "style": {
          "padding": "0",
          "margin": "0",
          "display": "flex",
          "align-items": "center",
          "justify-content": "space-between",
        }
      }, [
        h("span",{
          "style": {
          }
        }, this.$t('common.handle')),
        h("button", {
          "class": { "el-button": true, "el-button--default": true },
          "style": {},
          "on": { click(){ self.updateDevicesTableData(); } },
          "attrs": { "title": this.$t('deviceManager.refreshData') },
        }, [
            h("i", {
            "class": { "el-icon-refresh": true }
            })
        ]),
      ])
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    dispatchAction (action) {
      let actionVal = action.val;

      switch (actionVal) {
        case 'setting':
          this.batchSetting();
          break;
        case 'screen':
          this.batchScreen();
          break;
        case 'timingPlan':
          this.batchTimingPlan();
          break;
        case 'mobilePacket':
          this.batchMobilePacket();
          break;
        case 'delete':
          this.batchDelete();
          break;
        default:
          break;
      }

      console.log(actionVal);
    },
    batchSetting() {
      this.toggleDialog('settings', this.batchSyncListItems);
      console.log('批量设置', this.batchSyncListItems)
    },
    batchScreen() {
      this.$bus.emit('screen', this.batchSyncListItems);
    },
    batchTimingPlan() {
      this.toggleDialog('plan', this.batchSyncListItems);
      console.log('定时计划', this.batchSyncListItems);
    },
    batchMobilePacket() {
      this.toggleDialog('move', this.batchSyncListItems);
    },
    batchDelete() {
      this.toggleDialog('delete', this.batchSyncListItems);
    },
    resetChecked() {
      this.isShowCheckedDeviceList = false;
      this.checkedDeviceList = [];
      this.$refs['deviceTable'].clearSelection();
    },
    uncheckedOneRow(row) {
      let index = this.checkedDeviceList.findIndex(item => item.id === row.id);
      this.checkedDeviceList.splice(index, 1);

      let i = this.list.findIndex(item => item.id === row.id);
      this.$refs['deviceTable'].toggleRowSelection(this.list[i], false);
    },
    modifyDevice() {  // todo 修改终端信息
      submitTeInfo({
        name: this.dialogInfo.name,
        id: this.dialogInfo.id,
        remarks: this.dialogInfo.remarks,
      }).then(res => {
        console.log(res);

        this.updateDevicesTableData();
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
      }).catch(err => {
        console.log(err);
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    setBasicDevice() { // todo 基础设置 - 电源/音量
      if (this.isSettingsLoading) return false;

      console.log('基础设置', this.switchingPowerRadioGroup, this.setVolumeSlider, this.isSetVolumeChecked, this.isChangeSetDialog, this.dialogInfo);

      this.isSettingsLoading = true;
      let setDeviceIds = [];
      this.dialogInfo.map(item => {
        setDeviceIds.push(item.id)
      });
      this.basicSettingsResult = '';
      this.basicSettingsResultList = [];

      //先请求音量接口
      if (!this.isSetVolumeChecked && this.dialogInfo.length>1) { //多设备，不勾选“统一音量”，则不请求接口

      } else {
        setDeviceVolume({ terminalIds: setDeviceIds, volume: this.setVolumeSlider }).then(res => {
          console.log(res)

          if (this.dialogInfo.length===1) {
            this.basicSettingsResultList.push({
              title: this.$t('deviceManager.volumeSettings') + (res.pass===1?this.$t('common.operationSucceeds'):this.$t('common.operationFailure')),
              type: res.pass===1 ? 'success' : 'error'
            });
          } else if (this.dialogInfo.length>1) {
            this.basicSettingsResult += '  |  ' + (() => {
                return '(' + this.$t('deviceManager.volumeSettings') + ')' +
                  this.$t('common.operatingResult') + ': ' +
                  this.$t('common.success') + res.pass + '  ' +
                  this.$t('common.error') + res.fail + ' ';
              })();
            let result = Object.keys(res.teResultJson).map(item => {
              return {
                id: item,
                status: res.teResultJson[item]
              }
            });
            let tmp = this.basicSettingsResultList.map(item => item.id );
            this.basicSettingsResultList.push(...result.filter(item => tmp.indexOf(item.id) === -1));
          }

          this.isShowBasicSettingsResult = true;
          this.isSettingsChangeNoSave = false;
          this.isSettingsChangeSubmit = true;
          setTimeout(() => { this.isSettingsLoading = false; }, 500);
          console.log('音量设置结果列表', this.basicSettingsResultList);
        }).catch(err => {
          console.log(err);

          setTimeout(() => { this.isSettingsLoading = false; }, 500);
        });
      }

      //后请求电源接口
      if (this.switchingPowerRadioGroup) {
        setTimeout(() => {
          let fun = { setDevice_powerOff, setDevice_standby, setDevice_awake, setDevice_restart };
          fun['setDevice_' + this.switchingPowerRadioGroup]({ terminalIds: setDeviceIds }).then(res => {
            console.log(res);

            if (this.dialogInfo.length===1) {
              this.dialogInfo[0].status = this.switchingPowerRadioGroup;
              this.basicSettingsResultList.push({
                title: this.$t('deviceManager.powerSettings') + (res.pass===1?this.$t('common.operationSucceeds'):this.$t('common.operationFailure')),
                type: res.pass===1 ? 'success' : 'error'
              });
            } else if (this.dialogInfo.length>1) {
              this.basicSettingsResult += '  |  ' + (() => {
                  return '(' + this.$t('deviceManager.powerSettings') + ')' +
                    this.$t('common.operatingResult') + ': ' +
                    this.$t('common.success') + res.pass + '  ' +
                    this.$t('common.error') + res.fail + ' ';
                })();
              let result = Object.keys(res.teResultJson).map(item => {
                return {
                  id: item,
                  status: res.teResultJson[item]
                }
              });
              let tmp = this.basicSettingsResultList.map(item => item.id );
              this.basicSettingsResultList.push(...result.filter(item => tmp.indexOf(item.id) === -1));
            }

            this.isShowBasicSettingsResult = true;
            this.isSettingsChangeNoSave = false;
            this.isSettingsChangeSubmit = true;
            setTimeout(() => { this.isSettingsLoading = false; }, 500);
            console.log('电源设置结果列表', this.basicSettingsResultList);
          }).catch(err => {
            console.log(err);

            setTimeout(() => { this.isSettingsLoading = false; }, 500);
          });
        }, 1000);
      }
    },
    deleteDevices() { // todo   删除终端
      let deviceIds = [];
      this.dialogInfo.map(item => {
        deviceIds.push(item.id)
      });

      deleteTerminal({
        terminalIds: deviceIds + '',
      }).then(res => {
        console.log(res)

        this.updateDevicesTableData();
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
      }).catch(err => {
        console.log(err)
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    clickTotalBoxHandle() {
      if (this.checkedDeviceList.length===0) return false;

      this.isShowCheckedDeviceList = !this.isShowCheckedDeviceList;
    },
    filterChangeHandle(column) {
      for (let index in column) {
        this.filterKeys = column[index];
      }

      this.isShowTotalCount = this.filterKeys.length===0;

      console.log('筛选条件', this.filterKeys);
      // todo 通过 hasBeenRequestedAllData 判断首次筛选 则请求全部数据（不重复获取已有数据）
      if (this.list.length < this.listTotalCount) {
        console.log('第一次筛选请求全部数据！');

        this.getList(true);
      }
    },
    toggleDialog(title, data) {
      switch (title) {
        case 'details':
          this.dialogKey = 'details';
          this.dialogTitle = '';
          this.dialogInfo = data; // 单对象数据
          this.dialogWidth = '60%';
          this.detailsDialogActiveTabsName = 'details';
          getPlanOfDevice({ terminalId: data.id }).then(res => {
            console.log(res);
            if (res['1']) this.dialogInfo['1'] = res['1'];
            if (res['2']) this.dialogInfo['2'] = res['2'];
            if (res['name1']) this.dialogInfo['name1'] = res['name1'];
            if (res['name2']) this.dialogInfo['name2'] = res['name2'];
            if (res['id1']) this.dialogInfo['id1'] = res['id1'];
            if (res['id2']) this.dialogInfo['id2'] = res['id2'];

            console.log('根据设备查计划', this.dialogInfo); // todo =================================
          }).catch(err => {
            console.log(err)
          });
          break;
        case 'modify':
          this.dialogKey = 'modify';
          this.dialogTitle = this.$t('deviceManager.modifyDeviceInfo');
          this.dialogInfo = JSON.parse(JSON.stringify(data)); // 单对象数据
          this.dialogWidth = '40%';
          this.isChangeModifyDialog = false;
          break;
        case 'settings':
          this.dialogKey = 'settings';
          this.dialogInfo = JSON.parse(JSON.stringify(data)); // 多对象数组
          this.dialogWidth = '720px';
          this.isChangeSetDialog = false;
          this.settingsDialogActiveTabsName = 'basicSettings';
          this.isSetVolumeChecked = false;
          this.setVolumeSlider = this.dialogInfo.length===1 ? +this.dialogInfo[0].volume : 20;
          this.lockScreenImgRadio = '';
          this.uploadFileInfo = null;
          this.lockScreenResultList = [];
          this.isShowadAptiveImage = false;
          this.isSuccessedActive = false;
          this.updateApkStep = '1';
          this.isShowApkList = false;
          this.uploadAPKInfo = null;
          this.updateAPKResultList = [];
          this.updateApkversion = '';
          this.isShowBasicSettingsResult = false;
          this.basicSettingsResult = '';
          this.basicSettingsResultList = [];
          this.switchingPowerRadioGroup = '';
          this.isSettingsChangeNoSave = false;
          this.isSettingsChangeSubmit = false;
          this.switchChannelRadioGroup = '';
          this.dialogInfoClassifyMap = null;
          this.dialogInfoUnknownNum = 0;
          this.switchChannelRadioGroupMap = null;
          this.switchChannelRadioGroupShowMap = null;

          if (this.dialogInfo.length > 1) {
            this.dialogInfoClassifyMap = ( map => {
              if (map['undefined'].length > 0) {
                this.dialogInfoUnknownNum = map['undefined'].length;
                delete map['undefined'];
              }

              Object.keys(map).map(key => {
                if (!this.channelMap[key]) {
                  this.dialogInfoUnknownNum += map[key].length;
                  delete map[key];
                }
              });

              return map;
            })(listClassifyMap(this.dialogInfo, 'apiKey'));

            this.switchChannelRadioGroupMap = ( map => {
              let obj = {};

              Object.keys(map).map(key => { obj[key] = ''; });

              return obj;
            })(this.dialogInfoClassifyMap);

            this.switchChannelRadioGroupShowMap = ( map => {
              let obj = {};

              Object.keys(map).map(key => { obj[key] = true; });

              return obj;
            })(this.dialogInfoClassifyMap);

            console.log('通道分类', this.dialogInfoClassifyMap, this.switchChannelRadioGroupMap, this.dialogInfoUnknownNum);
          }
          break;
        case 'plan':
          this.dialogKey = 'plan';
          this.dialogTitle = '';
          this.dialogInfo = JSON.parse(JSON.stringify(data)); // 多对象数组
          this.dialogWidth = '60%';
          this.isPlanTableDataLoading = true;
          this.planDialogActiveTabsName = 'currentPlan';
          this.planDialogUniformPlan = {};
          this.selectPlanForm.type = '';
          this.planListQuery.type = '';

          getPlanList(this.planListQuery).then(res => {
            console.log(res)
            this.planTableData = res.data;
            this.planListQuery.count = res.count;
            this.curCheckedPlanInfo = null;
            this.isPlanTableDataLoading = false;
            console.log('定时计划请求计划表数据', this.planTableData);
          }).catch(err => {
            console.log(err)
          })

          if (this.dialogInfo.length===1) {
            getPlanOfDevice({ terminalId: this.dialogInfo[0].id }).then(res => {
              console.log('根据设备查计划', res);

              if (res['1']) this.planDialogUniformPlan['1'] = res['1'];
              if (res['2']) this.planDialogUniformPlan['2'] = res['2'];
              if (res['name1']) this.planDialogUniformPlan['name1'] = res['name1'];
              if (res['name2']) this.planDialogUniformPlan['name2'] = res['name2'];
              if (res['id1']) this.planDialogUniformPlan['id1'] = res['id1'];
              if (res['id2']) this.planDialogUniformPlan['id2'] = res['id2'];

              console.log('根据设备查计划', this.planDialogUniformPlan);
              this.dialogVisible = true;
            }).catch(err => {
              console.log(err)
            });
          } else {
            this.dialogVisible = true;
          }
          break;
        case 'move':
          this.dialogKey = 'move';
          this.dialogTitle = (() => {
            let title = '';

            if (data.length===1) {
              title = this.$t('deviceManager.will') + ' ' + data[0].name + ' ' + this.$t('deviceManager.moveTo')
            } else {
              title = this.$t('deviceManager.will') + ' ' + data[0].name + ' ' + this.$t('deviceManager.etc') + data.length + this.$t('deviceManager.devices') + this.$t('deviceManager.moveTo');
            }

            return title;
          })();
          this.dialogInfo = JSON.parse(JSON.stringify(data)); // 多对象数组
          this.dialogWidth = '40%';

          getOfficeList().then(res => {
            console.log('获取机构列表', res);

            if (res) {
              if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId

              let arr = [res.currentOffice].concat(res.officeMsg);
              let tree = treeify(arr, 'id', 'parentId', 'children');

              this.moveOfficeTree = [tree];

              if (this.dialogInfo.length === 1) {
                // 无法移动至原机构
                this.$nextTick(() => {
                  let pNode = this.$refs['moveOfficeTree'].getNode(this.dialogInfo[0].officeId).data;
                  pNode['disabled'] = true;
                });
              }
              console.log('转成树', arr, tree)
            }
          }).catch(err => {
            console.log('异常', err)
          });

          break;
        case 'delete':
          this.dialogKey = 'delete';
          this.dialogTitle = this.$t('common.notice');
          this.dialogInfo = JSON.parse(JSON.stringify(data)); // 多对象数组
          this.dialogWidth = '30%';
          break;
        default:
          this.dialogKey = '--';
          this.dialogTitle = '--';
          this.dialogInfo = null;
          this.dialogWidth = '50%';
          break;
      }

      if (this.dialogKey !== 'plan') this.dialogVisible = true;
      console.log('当前对话框信息', data)
    },
    handlePlanDialogClick(tab, event) {
    },
    handleDetailsDialogClick(tab, event) {
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 4) {
        if (rowIndex % 5 === 0) {
          return {
            rowspan: 5,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    },
    handleSearchPlan() {
      this.isPlanTableDataLoading = true;

      getPlanList(this.planListQuery).then(res => {
        console.log(res);

        this.planTableData= res.data;
        this.planListQuery.count = res.count;
        this.curCheckedPlanInfo = null;
        this.isPlanTableDataLoading = false;
      }).catch(err => {
        console.log(err)
      })
    },
    filterPlanHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleSelectPlan(selection, row) {
      this.$refs['planTable'].clearSelection();
      this.$refs['planTable'].toggleRowSelection(row);
      this.curCheckedPlanInfo = row;
      console.log('当前计划详细', this.curCheckedPlanInfo);
    },
    clickMoveOfficeHandle(data, node, component) {
      if (data.disabled) return false;
    },
    checkMoveOfficeHandle(data, checkedMap) {
      if (data.disabled) {
        this.$refs['moveOfficeTree'].setCheckedKeys([]);
        this.$message({
          message: this.$t('officeManager.cannotMoveToThisOffice'),
          type: 'warning'
        });
        return false;
      }

      let checkedList = this.$refs['moveOfficeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反

      if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
        this.$refs['moveOfficeTree'].setCheckedKeys([data.id]);
        this.$refs['moveOfficeTree'].setCurrentKey(data.id);
      } else { // 已选 -> 去选
        this.$refs['moveOfficeTree'].setCheckedKeys([]);
      }

      this.curCheckedMoveOfficeId = this.$refs['moveOfficeTree'].getCheckedKeys() + '';
      console.log('移动机构id', this.curCheckedMoveOfficeId);
    },
    resetData() {
      this.list = [];
      this.listTotalCount = 0;
      this.listQuery.pageNo =  1;
      this.isShowCheckedDeviceList = false;
      this.isShowTotalCount = true;

//      this.$refs['deviceTable'].clearSelection();
//      this.$refs['deviceTable'].clearSort();
//      this.$refs['deviceTable'].clearFilter();
    },
    uniformPlan() {
      movePlanToDevice({
        strategyId: this.curCheckedPlanInfo.id,
        terminalIds: (() => {
          let ids = [];

          this.dialogInfo.map(item => {
            ids.push(item.id);
          });

          return ids + '';
        })(),
      }).then(res => {
        console.log(res)

        console.log('统一定时计划', this.curCheckedPlanInfo);
        if (this.curCheckedPlanInfo.type === '1') {
          this.planDialogUniformPlan['1'] = this.curCheckedPlanInfo.content;
          this.planDialogUniformPlan.name1 = this.curCheckedPlanInfo.name;
          this.planDialogUniformPlan.id1 = this.curCheckedPlanInfo.id;
        } else if (this.curCheckedPlanInfo.type === '2') {
          this.planDialogUniformPlan['2'] = this.curCheckedPlanInfo.content;
          this.planDialogUniformPlan.name2 = this.curCheckedPlanInfo.name;
          this.planDialogUniformPlan.id2 = this.curCheckedPlanInfo.id;
        }
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
        this.planDialogActiveTabsName = 'currentPlan';
      }).catch(err => {
        console.log(err)
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    deleteTimingPlan(isPower) {
      let deviceIds = [];
      this.appMainLoading = this.showLoading('#deviceDialog');
      this.dialogInfo.map(item => {
        deviceIds.push(item.id)
      });

      removePlanOfDevice({
        strategyId: isPower ? this.planDialogUniformPlan.id1 : this.planDialogUniformPlan.id2,
        terminalIds: deviceIds + '',
      }).then(res => {
        console.log(res)

        let tmp = this.planDialogUniformPlan;
        this.planDialogUniformPlan = {};
        if (isPower) {
          if (tmp['2']) this.planDialogUniformPlan['2'] = tmp['2'];
          if (tmp['name2']) this.planDialogUniformPlan['name2'] = tmp['name2'];
          if (tmp['id2']) this.planDialogUniformPlan['id2'] = tmp['id2'];
        } else {
          if (tmp['1']) this.planDialogUniformPlan['1'] = tmp['1'];
          if (tmp['name1']) this.planDialogUniformPlan['name1'] = tmp['name1'];
          if (tmp['id1']) this.planDialogUniformPlan['id1'] = tmp['id1'];
        }

        console.log(this.planDialogUniformPlan);
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
        this.appMainLoading.close();
      }).catch(err => {
        console.log(err)
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    planListCurrentChange(val) {
      this.planListQuery.pageNo = val;
      this.isPlanTableDataLoading = true;

      getPlanList(this.planListQuery).then(res => {
        console.log(res)

        this.planTableData= res.data;
        this.planListQuery.count = res.count;
        this.curCheckedPlanInfo = null;
        this.isPlanTableDataLoading = false;
      }).catch(err => {
        console.log(err)
      })
    },
    planTableFilterChangeHandle(column) {
      let keys = [];

      for (let index in column) {
        keys = column[index];
      }

      if (keys.length===0 || keys.length===2) {
        this.planListQuery.type = '';
      } else if (keys.indexOf('1') > -1) {
        this.planListQuery.type = '1';
      } else if (keys.indexOf('2') > -1) {
        this.planListQuery.type = '2';
      }

      getPlanList(this.planListQuery).then(res => {
        console.log(res)

        this.planTableData= res.data;
        this.planListQuery.count = res.count;
        this.curCheckedPlanInfo = null;
        this.isPlanTableDataLoading = false;
      }).catch(err => {
        console.log(err)
      })
    },
    resetBasicSettings() { // todo 重置基础设置
      this.switchingPowerRadioGroup = '';
      this.setVolumeSlider = +this.dialogInfo[0].volume;
      this.isSetVolumeChecked = false;
      this.isChangeSetDialog = false;
      this.isShowBasicSettingsResult = false;
      this.basicSettingsResult = '';
      this.basicSettingsResultList = [];
      this.isSettingsChangeNoSave = false;
    },
    resetLockScreenSettings() {
        this.isSuccessedActive = false;
      this.isShowadAptiveImage = false;
      this.lockScreenImgRadio = '';
      this.uploadFileInfo =  null;
      this.lockScreenResultList = [];
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.isSettingsChangeNoSave = false;
    },
    setLockScreenDevice() { // todo 锁屏设置
      let deviceIds = [];
      this.dialogInfo.map(item => {
        deviceIds.push(item.id)
      });
      this.isSettingsLoading = true;

      setLockScreen({
        terminalIds: deviceIds + '',
        lockScreenImgRadio: this.lockScreenImgRadio,
        fid: this.uploadFileInfo ? this.uploadFileInfo.fid : '',
      }).then(res => {
        console.log('请求锁屏设置', res);

        if (this.lockScreenImgRadio==='1' && res.uuid) { // 自定义图像
          let uuid = res.uuid;
          let count = 1;

          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }

          //轮询查看后台是否下载完成图片
          this.timer = setInterval(() => {
            getLockScreenInfo({ uuid }).then(r => {
              console.log(r)
              const isHas2 = (Object.keys(r.data).map(item => r.data[item] ).indexOf(2) > -1);

              if (r.data.updateDate) delete r.data.updateDate;
              this.lockScreenResultList = Object.keys(r.data).map(item => {
                return {
                  id: item,
                  result: r.data[item],
                  txt: r.data[item]===0 ? this.$t('common.operationFailure') : (r.data[item]===1?this.$t('common.operationSucceeds'):this.$t('common.processing'))
                };
              });
              this.isSettingsLoading = false;

              if (isHas2) { // 继续轮询
//                count++;
//                if(count >= 5) {
//                  clearInterval(this.timer);
//                  if (r.data.updateDate) delete r.data.updateDate;
//                  this.lockScreenResultList = Object.keys(r.data).map(item => {
//                    return { id: item, result: r.data[item] };
//                  });
//                  this.appMainLoading.close();
//                  this.$message.error(this.$t('common.operationFailure'));
//                }
              } else { // 没有2（处理中）状态则轮询结束 8126
                this.isSettingsChangeNoSave = false;
                this.isSettingsChangeSubmit = true;
                clearInterval(this.timer);
              }
              this.isSuccessedActive = true;
            }).catch(e => {
              console.log(e)

              clearInterval(this.timer);
              this.isSettingsLoading = false;
              this.isSuccessedActive = true;
              this.$message.error(this.$t('common.operationFailure'));
            });
          }, 3000);

        } else { // 不锁屏/默认锁屏
          if (res.data.updateDate) delete res.data.updateDate;

//          deviceIds.map(item => {
//            let index = this.list.findIndex(i => i.id === item);
//
//            this.list[index].lockScreenStyle = this.lockScreenImgRadio;
//          });
          this.lockScreenResultList = Object.keys(res.data).map(item => {
            return {
              id: item,
              result: res.data[item],
              txt: res.data[item]===1 ? this.$t('common.operationSucceeds') : this.$t('common.operationFailure'),
            };
          });
          this.isSettingsLoading = false;
          this.isSettingsChangeNoSave = false;
          this.isSettingsChangeSubmit = true;
          this.isSuccessedActive = true;
        }
      }).catch(err => {
        console.log(err);

        this.isSettingsLoading = false;
        this.isSuccessedActive = true;
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    apkCancelUpload() { // todo    更新APK
      this.uploadAPKInfo = null;
      this.updateApkStep = '1';
    },
    updateAPKDevice() {
      let deviceIds = [];
      this.isSettingsLoading = true;
      this.updateApkStep = '3';
      this.dialogInfo.map(item => {
        deviceIds.push(item.id)
      });

      setDedicatedApk({
        terminalIds: deviceIds + '',
        fid: this.uploadAPKInfo.fid,
      }).then(res => {
        console.log('请求APK设置', res);
        this.updateApkversion = res.apkversion;

        if (res.uuid) {
          let uuid = res.uuid;
          let count = 1;

          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }

          this.timer = setInterval(() => {
            getApkUpdateInfo({ uuid }).then(r => {
              console.log(r)
              const isHas2 = (Object.keys(r.data).map(item => r.data[item] ).indexOf(2) > -1);

              if (r.data.updateDate) delete r.data.updateDate;
              this.updateAPKResultList = Object.keys(r.data).map(item => {
                return {
                  id: item,
                  result: r.data[item],
                  txt: r.data[item]===0 ? this.$t('common.error') : (r.data[item]===1?this.$t('common.success'):this.$t('common.processing'))
                };
              });
              this.isSettingsLoading = false;

              if (isHas2) { // 继续轮询
//                count++;
//                if(count >= 5) {
//                  clearInterval(this.timer);
//                  if (r.data.updateDate) delete r.data.updateDate;
//                  this.updateAPKResultList = Object.keys(r.data).map(item => {
//                    return { id: item, result: r.data[item] };
//                  });
//                  this.appMainLoading.close();
//                  this.$message.error(this.$t('common.operationFailure'));
//                }
              } else { // 没有2（处理中）状态则轮询结束
                clearInterval(this.timer);

                this.isSettingsChangeNoSave = false;
                this.isSettingsChangeSubmit = true;
              }
            }).catch(e => {
              console.log(e);

              clearInterval(this.timer);
              this.isSettingsLoading = false;
              this.$message.error(this.$t('common.operationFailure'));
//              count++;
//              if(count >= 5) {
//                clearInterval(this.timer);
//                this.appMainLoading.close();
//                this.$message.error(this.$t('common.operationFailure'));
//              }
            });
          }, 3000);
        }
      }).catch(err => {
        console.log(err);

        if (err.data === 'apkNotJikong') {
          this.uploadAPKInfo = null;
          this.$message.error(this.$t('deviceManager.apkNotJikong'));
        } else {
          this.$message.error(this.$t('common.operationFailure'));
        }
        this.updateApkversion = '--';
        this.isSettingsLoading = false;
      })
    },
    resetAPKSettings() {
      this.isShowApkList = false;
      this.updateApkStep = '1';
      this.uploadAPKInfo = null;
      this.updateAPKResultList = [];
      this.updateApkversion = '';
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.isSettingsChangeNoSave = false;
    },
    moveDevices() { // todo
      let deviceIds = [];
      this.dialogInfo.map(item => {
        deviceIds.push(item.id)
      });
      this.isMoveDevicesLoading = true;

      updateTeOffice({
        terminalIds: deviceIds + '',
        officeId: this.curCheckedMoveOfficeId
      }).then(res => {
        console.log(res);

        this.updateDevicesTableData();
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
        this.dialogVisible = false;
        this.isMoveDevicesLoading = false;
      }).catch(err => {
        console.log(err);

        this.$message.error(this.$t('common.operationFailure'));
        this.isMoveDevicesLoading = false;
      });
    },
    updateDevicesTableData() { //  todo 根据当前条件重新请求数据
      this.resetData();
      this.getList();
    },
    beforeCloseDialog(done) {
      if (this.dialogKey === 'settings' && this.isSettingsChangeNoSave) {
        this.$confirm(this.$t('deviceManager.sureNoSaveLeaveTips'), this.$t('common.notice'), {
          confirmButtonText: this.$t('common.cancelBtn'),
          cancelButtonText: this.$t('common.confirmBtn'),
          type: 'warning',
          showClose: false,
          closeOnClickModal: false
        }).then(() => {
        }).catch(() => {
          done();
        });
      } else {
        done();
      }
    },
    handleCloseDialog() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      if (this.dialogKey === 'settings' && this.isSettingsChangeSubmit) {
        this.updateDevicesTableData();
      }

      this.dialogKey = '';
    },
    showadAptiveImage(){
      this.isShowadAptiveImage === false ? this.isShowadAptiveImage = true : this.isShowadAptiveImage = false ;
      imgHistoryScreenCapture($('.adaptiveImage').attr('src'), $('.adaptiveImage'));
      console.log($('.adaptiveImage').attr('src'))
    },
    leaveSettingsTabs() {
      if (this.timer) {
        return new Promise((resolve, reject) => {
          this.$confirm(this.$t('deviceManager.sureLeaveTips'), this.$t('common.notice'), {
            confirmButtonText: this.$t('common.cancelBtn'),
            cancelButtonText: this.$t('common.confirmBtn'),
            type: 'warning',
            showClose: false,
            closeOnClickModal: false,
          }).then(() => {
            reject();
          }).catch(() => {
            clearInterval(this.timer);
            this.timer = null;
            this.resetAPKSettings();
            this.resetLockScreenSettings();
            resolve();
          });
        })
      }
    },
    handleSelectAll(selection) {
      if (this.list.length < this.listTotalCount && selection.length>0) {
        console.log('第一次筛选请求全部数据！')

        this.getList(true, true);
      } else if (selection.length===0) {
        if (this.checkedDeviceList.length-this.list.length === 0) {
          this.checkedDeviceList = [];
        } else {
          this.list.map(item => {
            this.uncheckedOneRow(item)
          });
        }
      }
    },
    deviceIdTurnName(id) {
      const index = this.checkedDeviceList.findIndex(item => item.id === id);

      return  this.checkedDeviceList[index].name;
    },
    selectPlanFormChange(val) {
      console.log('筛选类型',val);
      this.planListQuery.type = val;
      this.isPlanTableDataLoading = true;

      getPlanList(this.planListQuery).then(res => {
        console.log(res)

        this.planTableData= res.data;
        this.planListQuery.count = res.count;
        this.curCheckedPlanInfo = null;
        this.isPlanTableDataLoading = false;
      }).catch(err => {
        console.log(err)
      })
    },
    // 数组元素分类，返回同类数量
    listClassify(list, key, val) {
      if (!list || list.length===0) return null;

      let obj = {};

      list.reduce( (total, item) => {
        if (total.indexOf(item[key]) === -1) {
          total.push(item[key]);
          obj[item[key]] = [];
        }

        obj[item[key]].push(item);

        return total;
      }, []);

      return obj[val] ? obj[val].length : 0;
    },
    confirmChannel() {
      let json = [];

      if (this.dialogInfo.length === 1) {
        json.push({
          "terminalIds": this.dialogInfo[0].id,
          "defaultSources": this.switchChannelRadioGroup // 目前仅支持单选通道
        })
      } else if (this.dialogInfo.length > 1 && this.dialogInfoClassifyMap) {
        Object.keys(this.dialogInfoClassifyMap).map(key => {
          if (this.switchChannelRadioGroupMap[key]) {
            json.push({
              "terminalIds": this.dialogInfoClassifyMap[key].reduce((total, item) => {
                total.push(item.id);
                return total;
              }, []) + '',
              "defaultSources": this.switchChannelRadioGroupMap[key] // 目前仅支持单选通道
            });
          }
        })
      }

      terminalPassSetting({
        json: JSON.stringify(json)
      }).then(res => {
        console.log('发送设置终端通道命令成功', res);

        if (this.dialogInfo.length === 1) {
//          let index = this.list.findIndex(item => item.id === this.dialogInfo[0].id);
//
//          this.list[index].defaultSources = this.switchChannelRadioGroup;
          this.dialogInfo[0].defaultSources = this.switchChannelRadioGroup;
        }
//        else if (this.dialogInfo.length > 1 && this.dialogInfoClassifyMap) {
//          Object.keys(this.dialogInfoClassifyMap).map(key => {
//            if (this.switchChannelRadioGroupMap[key]) {
//              this.dialogInfoClassifyMap[key].map(item => {
//                let index = this.list.findIndex(i => i.id === item.id);
//
//                this.list[index].defaultSources = this.switchChannelRadioGroupMap[key];
//              })
//            }
//          });
//        }

        this.resetChannelSettings();
        this.isSettingsLoading = false;
        this.isSettingsChangeNoSave = false;
        this.isSettingsChangeSubmit = true;
        this.$message({
          message: this.$t('common.operationSucceeds'),
          type: 'success'
        });
      }).catch(err => {
        console.log('发送设置终端通道命令失败', err);

        this.isSettingsLoading = false;
        this.$message.error(this.$t('common.operationFailure'));
      })
    },
    resetChannelSettings() {
      if (this.switchChannelRadioGroupMap) {
        Object.keys(this.switchChannelRadioGroupMap).map(key => {
          this.switchChannelRadioGroupMap[key] = '';
        });
      }

      this.switchChannelRadioGroup = '';
      this.isSettingsChangeNoSave = false;
    },
    /** 以下为 webuploader 监听处理方法
     *
     */
    webuploader_beforeFileQueued(file) {
      this.appMainLoading = this.showLoading('#deviceDialog');
      console.log('beforeFileQueued', file)
    },
    // fileQueued -> 每个入队列文件均进入预览列表
    webuploader_fileQueued(file) {
      console.log('fileQueued', file);
      if (file.ext === 'apk') {
        this.uploadAPKInfo = {
          md5: file.md5,
          name: file.name,
          id: file.id,
        };
      }
    },
    webuploader_fileDequeued(file) {
      console.log('fileDequeued', file)
    },
    webuploader_uploadFinished() {
      console.log('uploadFinished')
      this.appMainLoading.close();
      if (this.settingsDialogActiveTabsName==='apkSettings') this.updateApkStep = '2';
    },
    webuploader_uploadStart(file) {
      console.log('uploadStart', file)
    },
    webuploader_uploadBeforeSend(object, data, headers) {
      console.log('uploadBeforeSend', object, data, headers)
      // todo 后台规定需要的数据
      data.md5 = object.file.md5;
      if (object.file.ext === 'apk') {
        data.folderName = 'dedicated_apk_path';
      } else {
        data.folderName = 'img_path';
      }
    },
    webuploader_uploadProgress(file, percentage) {
      console.log('uploadProgress', file, percentage);
      if (file.ext === 'apk') {
        this.uploadAPKInfo.percentage = percentage*100;
      }
    },
    webuploader_uploadSuccess(file, response) {
      console.log('uploadSuccess', file, response)

      if (file.ext === 'apk') {
        this.uploadAPKInfo.fid = response.fid;
        this.uploadAPKInfo.status = 'success';

        console.log('上传APK成功数据', this.uploadAPKInfo);
      } else {
        this.uploadFileInfo = {
          md5: file.md5,
          name: file.name,
          fid: response.fid,
          path: response.path,
        };
        this.$nextTick(() => {
          console.log('轮播图', $('.adaptive-img'));

          imgHistoryScreenCapture($('.adaptive-img').attr('src'), $('.adaptive-img'));
        });

        console.log('上传图片成功数据', this.uploadFileInfo);
      }
      this.isSettingsChangeNoSave = true;
      this.isSettingsChangeSubmit = true;
    },
    webuploader_uploadError(file, reason) {
      console.log('uploadError', file, reason);

      if (reason.msg === 'success' && reason.fid) {
        if (file.ext === 'apk') {
          this.uploadAPKInfo.fid = reason.fid;
          this.uploadAPKInfo.percentage = 100;
          this.uploadAPKInfo.status = 'success';

          console.log('秒传APK成功数据', this.uploadAPKInfo);
        } else {
          this.uploadFileInfo = {
            md5: file.md5,
            name: file.name,
            fid: reason.fid,
            path: reason.path,
          };
          this.$nextTick(() => {
            console.log('轮播图', $('.adaptive-img'));

            imgHistoryScreenCapture($('.adaptive-img').attr('src'), $('.adaptive-img'));
          });

          console.log('秒传图片成功数据', this.uploadFileInfo);
        }
      } else {
        if (file.ext === 'apk') {
          this.uploadAPKInfo.status = 'exception';
          this.uploadAPKInfo.percentage = 0;
        } else {
          this.uploadFileInfo = null;
          this.$refs['webuploader'].removeFile(file, true);
        }
        this.$message.error(this.$t('common.operationFailure'));
      }

      this.isSettingsChangeNoSave = true;
      this.isSettingsChangeSubmit = true;
    },
    webuploader_uploadComplete(file) {
      console.log('uploadComplete', file);
      this.appMainLoading.close();
      if (this.settingsDialogActiveTabsName==='apkSettings') this.updateApkStep = '2';
    },
    webuploader_error(errorMessage) {
      console.log('uploadComplete', errorMessage);

      if (errorMessage === 'F_EXCEED_SIZE') {
        this.$message.error(this.$t('common.fileSizeCannotExceed') + '2M');
      } else if (errorMessage === 'Q_EXCEED_NUM_LIMIT') {
        this.$message.error(this.$t('common.fileNumberReachedMaximum'));
      } else if (errorMessage === 'Q_TYPE_DENIED') {
        this.$message.error(this.$t('common.fileTypeNotFit'));
      } else {
        this.$message.error(this.$t('common.unknownError'));
      }
    },
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style rel="stylesheet/scss" lang="scss">
  @import "src/styles/mixin.scss";

  /* reset element-ui css */
  .complexTable-wrapper {
    .el-table th{
      background-color: #C0C4CC;
      color: #fff;
    }
    .el-table .sort-caret.descending {
      border-top-color: #fff;
    }

    .el-table .sort-caret.ascending {
      border-bottom-color: #fff;
    }

    .el-table__column-filter-trigger i {
      color: #fff;
    }

    .el-table .ascending .sort-caret.ascending {
      border-bottom-color: #409EFF;
    }

    .el-table .descending .sort-caret.descending {
      border-top-color: #409EFF;
    }

    .el-table__column-filter-trigger {
      margin-left: 5px;
    }

    .el-table--scrollable-y .el-table__body-wrapper, .el-table--scrollable-x .el-table__body-wrapper {
      @include scrollBar;
    }

    .multiselect__option--highlight {
      background: #ECF5FF !important;
    }
  }

  #planTable th .el-checkbox{
    display: none;
  }

  #tab-basicSettings, #tab-channelSettings, #tab-lockScreenSettings, #tab-apkSettings {
    font-weight: bold;
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

.complexTable-wrapper {
  .filter-container {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .handle-box {
    display: flex;
    align-items: center;
  }

  .selected-box {
    width: 278px;
    background-color: #fff;
    height: 40px;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
    border: 1px solid #DCDFE6;
    .total {
      width: 100%;
      color: #606266;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      &-disabled {
        background-color: #ccc;
        color: #fff !important;
        cursor: not-allowed !important;
      }
    }

    .list {
      @include scrollBar;
      width: calc(100% + 2px);
      max-height: 531px;
      position: absolute;
      left: -1px;
      top: 40px;
      background-color: #fff;
      border: 1px solid #DCDFE6;
      border-top: none;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 3px 4px 5px rgba(0, 0, 0, 0.4);

    }

    .list-item {
      width: 100%;
      display: flex;
      align-items: center;
      color: #303133;
      height: 50px;
      border-bottom: 1px solid #F2F6FC;
      padding: 0 10px;
      &:hover {
        background-color: #F0F7FF;
      }

      .list-office {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
        &>span {
          width: calc(100% - 30px);
          white-space: nowrap;		/*禁止文本自动换行*/
          text-overflow: ellipsis;		/*超出文本省略号处理*/
          overflow: hidden;
          &:nth-child(2) {
            padding-top: 5px;
          }
        }
      }

      &:last-of-type {
        border-bottom: none;
      }
    }
  }


  .timingPlan-box {
    width: 100%;
    height: 500px;
    margin-bottom: 20px;
    .timingPlan-power {
      width: 100%;
      height: 50%;
      display: flex;
      align-items: center;
      padding: 10px;
    }

    .timingPlan-volume {
      width: 100%;
      height: 50%;
      display: flex;
      align-items: center;
      padding: 10px;
    }

    .timingPlan-power-list {
      @include scrollBar;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 10px;
      margin-left: 20px;
      border-left: 1px solid #DCDFE6;
    }

    .timingPlan-volume-list {
      @include scrollBar;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 10px;
      margin-left: 20px;
      border-left: 1px solid #DCDFE6;
    }

  }

  .move-tree {
    @include scrollBar;
    width: 400px;
    min-height: 400px;
    max-height: 500px;
    overflow: auto;
    border: 1px solid #DCDFE6;
    margin-bottom: 20px;
  }

  .channelSettings-box, .lockScreenSettings-box, .ApkUpdate-box {
    @include scrollBar;
    overflow: auto;
  }

  .el-upload-list-result {
    @include scrollBar;
    padding: 0 20px;
    height: 300px;
    overflow: auto;
  }
   .isShowBtn{
     display: none;
   }
  .apk-list {
    @include scrollBar;
    width: 50%;
    height: 300px;
    overflow: auto;
    position: absolute;
    left: 78px;
    top: 36px;
    border: 1px solid #DCDFE6;
    z-index: 2;
    background-color: #fff;
  }

  .basicSettings-result {
    @include scrollBar;
    width: 100%;
    height: 200px;
    overflow: auto;
    color: #696969;
    li {
      margin-bottom: 5px;
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
