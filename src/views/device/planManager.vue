<template>
  <div class="planManager-wrapper">
    <div class="filter">
      <div class="total" v-if="!selectedCount">
        {{$t('planManager.total')}} <span>{{count}}</span> {{$t('planManager.plans')}}
      </div>
      <div class="selected" v-if="selectedCount">
        {{ language ==='zh' ?  $t('planManager.selected') : ''}} <span>{{selectedCount}}</span> {{$t('planManager.countPlan')}}
      </div>

      <div class="newBtn">
        <el-button type="primary" @click="toggleDialog('create');isborderColor = false;isBorderColor = false;isVolumeBorderColor = false;createForm.type = '1';isChangeContent = 'source'">{{$t('planManager.newPlan')}}</el-button>
      </div>
      <div class="delBtn" style="margin-left: 20px;">
        <el-button v-if="deleteEquip" type="danger">{{$t('planManager.deleteEquipment')}}</el-button>
        <el-button v-if="!deleteEquip" type="info" disabled @click="deletePlan">{{$t('planManager.deleteEquipment')}}</el-button>
      </div>
      <div class="search">

       <!-- <div class="el-input el-input&#45;&#45;suffix" style="width: 200px;">
          <input type="text"
                 v-model="searchVal"
                 @keyup.enter.native="handleSearch"
                 :placeholder="$t('planManager.searchPlanName')"
                 class="el-input__inner" />
          <span class="el-input__suffix" v-show="!searchVal">
              <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
            </span>
          <span class="el-input__suffix" v-show="searchVal" @click="searchVal = '', handleSearch()">
              <span class="el-input__suffix-inner" style="cursor: pointer;"><i class="el-input__icon el-icon-circle-close"></i></span>
            </span>
        </div>-->

        <el-input
                  @keyup.enter.native="handleSearch"
                  style="width: 250px;margin-left: 15px;"
                  :placeholder="$t('planManager.searchPlanName')"
                  v-model="searchVal"
                  clearable
                  @clear="handleSearch">
          <i slot="suffix" style="cursor: pointer;" class="el-input__icon el-icon-search" @click="handleSearch"></i>
        </el-input>

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
        style="width: 100%" @select-all="selectAllHandle" @select="selectHandle">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>

        <el-table-column
        sortable
        prop="name"
        :label="$t('planManager.planName')">
      </el-table-column>

        <el-table-column
          prop="type"
          :filters="[
                      { text: $t('planManager.powerSource'), value: $t('planManager.powerSource') },
                      { text: $t('planManager.volume'), value: $t('planManager.volume') }
                    ]"
          :filter-method="filterHandler"
          :label="$t('planManager.functionTypes')">
          <template slot-scope="scope">
            <span>{{ scope.row.type==='1' ? $t('planManager.powerSource') : $t('planManager.volume') }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="count"
          :label="$t('planManager.associatedApparatus')">
        </el-table-column>

        <el-table-column
          sortable
          prop="updateDate"
          :label="$t('common.createdTime')">
          <template slot-scope="scope">
            {{scope.row.updateDate | formatDate}}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.handle')">
          <template slot-scope="scope">
            <el-button @click="toggleDialog('details', scope.row)" type="text">{{$t('planManager.details')}}</el-button>
            <el-button @click="toggleDialog('modify', scope.row);isborderColor = false;isBorderColor = false" type="text">{{$t('common.modify')}}</el-button>
            <el-button @click="toggleDialog('manager', scope.row)" type="text">{{$t('planManager.deviceManagementBtn')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <el-dialog :title="dialogTitle"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
                @close="dialogKey = ''" >
      <!--新建定时计划-->
      <div class="create-dialog" v-if = "dialogKey === 'create'">
        <div style="height: 100%;padding-right: 20px;">
          <el-form ref="form" :model="createForm"
                   :label-width="language==='zh' ? '80px' : '136px'"
                   style="width: 100%;" label-position="left">
            <el-form-item :label="$t('planManager.functionTypes') + ' *'">
              <el-radio-group v-model="createForm.type">
                <el-radio label="1" @change = "isChangeContents('source')">{{$t('planManager.powerSource')}}</el-radio>
                <el-radio label="2" @change = "isChangeContents('volume')">{{$t('planManager.volume')}}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('planManager.strategyName') + ' *'">
              <el-input v-model="createForm.name" maxlength = 24 style="display: inline-block;width: 60%;"></el-input>
              <el-button type="primary" plain style="display: inline-block" @click = "emptySetting">{{$t('planManager.emptySet')}}</el-button>
            </el-form-item>

            <div class="weekly-plan-box" v-if="isChangeContent === 'source'">
              <el-checkbox v-model="createForm.weeklyPlan.isOpen">{{$t('planManager.weeklyPlan')}}</el-checkbox>
              <ul style="position: relative">
                <div class="shade" v-if="!createForm.weeklyPlan.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
                <li v-for="(item, index) in createForm.weeklyPlan.planList"
                    :key="index"
                    style="position:relative;display: flex;align-items: center;justify-content: space-between;margin-top: 10px;" >
                  <el-select v-model="item.operation" size="mini" style="width: 100px;">
                    <el-option
                      v-for="(o, i) in actionOptions"
                      :key="o.value"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>

                  <!--<span style="display: inline-block;width: 130px;height: 20px;border: 1px solid #000;position: absolute;top: -15px;left: 110px">{{errorTips}}</span>-->

                  <el-time-picker
                  v-model="item.time"
                  value-format="timestamp"
                  format="HH:mm"
                  :placeholder="$t('planManager.timePickerPlaceholder')"
                  size="mini"
                  style="width: 120px;"
                  default-value=""
                  @change="changeFn"
                  @blur="changeFn"
                  :class="{'borderColor':isborderColor}">
                </el-time-picker>

                  <el-checkbox v-model="item.isAllCheckedWeek" @change="changeAllWeeksHandle(arguments, index);">{{$t('planManager.totalSelection')}}</el-checkbox>
                  <el-checkbox-group v-model="item.weeks" size="mini" @change="changeWeeksHandle(arguments, index)">
                    <el-checkbox-button label="1" name="weeks" >{{$t('planManager.monday')}}</el-checkbox-button>
                    <el-checkbox-button label="2" name="weeks">{{$t('planManager.tuesday')}}</el-checkbox-button>
                    <el-checkbox-button label="3" name="weeks">{{$t('planManager.wednesday')}}</el-checkbox-button>
                    <el-checkbox-button label="4" name="weeks">{{$t('planManager.thursday')}}</el-checkbox-button>
                    <el-checkbox-button label="5" name="weeks">{{$t('planManager.friday')}}</el-checkbox-button>
                    <el-checkbox-button label="6" name="weeks">{{$t('planManager.saturday')}}</el-checkbox-button>
                    <el-checkbox-button label="7" name="weeks">{{$t('planManager.sunday')}}</el-checkbox-button>
                  </el-checkbox-group>

                  <el-button type="text" v-if="index===0" @click="addWeekPlan"><i class="el-icon-plus"></i></el-button>
                  <el-button type="text" v-else><i class="el-icon-minus" @click="delWeekPlan(index)"></i></el-button>
                </li>
              </ul>
            </div>

            <div class="special-plan-box" v-if="isChangeContent === 'source'">
              <el-checkbox v-model="createForm.specialPlan.isOpen">{{$t('planManager.specialPlan')}}</el-checkbox>
              <ul style="position: relative">
                <div class="shade1" v-if="!createForm.specialPlan.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
                <li v-for="(item, index) in createForm.specialPlan.planList" :key="index" style="margin-top: 10px;">
                  <el-select v-model="item.operation" size="mini" style="width: 100px;">
                    <el-option
                      v-for="(o, i) in actionOptions"
                      :key="o.value"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>

                  <el-time-picker
                    v-model="item.time"
                    value-format="timestamp"
                    format="HH:mm"
                    :placeholder="$t('planManager.timePickerPlaceholder')"
                    size="mini"
                    style="width: 120px;"
                    :class="{'borderColor':isBorderColor}"
                    @change="changeSpecialFn"
                    @blur="changeSpecialFn">
                  </el-time-picker>


                  <el-date-picker
                    v-model="item.date"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="-"
                    :start-placeholder="$t('planManager.datePickerStartPlaceholder')"
                    :end-placeholder="$t('planManager.datePickerEndPlaceholder')"
                    :picker-options="pickerOptions"
                    value-format="timestamp"
                    size="mini"
                   @change="specialPlanChange">
                  </el-date-picker>

                  <el-button type="text" v-if="index===0" @click="addSpecialPlan"><i class="el-icon-plus"></i></el-button>
                  <el-button type="text" v-else><i class="el-icon-minus" @click="delSpecialPlan(index)"></i></el-button>
                </li>
              </ul>
            </div>

            <div class="defaultVol-plan-box" v-if="isChangeContent === 'volume'" v-for="(key,index) in createVol.defaultVol.volList" :key="index">
              <el-checkbox v-model="createVol.defaultVol.isOpen">{{$t('planManager.defaultVol')}}</el-checkbox>
              <el-row style="display: flex;justify-content: center;align-items: center">
                <div class="shade1" v-if="!createVol.defaultVol.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
                <svg-icon v-if="key.volume !== 0" icon-class="volume2" style="width: 20px;height: 41px;line-height: 41px"/>
                <svg-icon v-if="key.volume === 0" icon-class="volume-off" style="width: 20px;height: 41px;line-height: 41px"/>
                <div class="block" style="width: 80%; margin-left: 10px;margin-right: 10px">
                  <el-slider v-model="key.volume" showInput></el-slider>
                </div>
                <!--<el-input v-model="key.volume" style="width: 55px;padding: 0;" size="mini"  maxlength="3"></el-input>-->
              </el-row>
            </div>
            <div class="timingVol-plan-box" v-if="isChangeContent === 'volume'">
              <el-checkbox v-model="createVol.timingVol.isOpen">{{$t('planManager.timingVol')}}</el-checkbox>
              <ul style="position: relative">
                <div class="shade1" v-if="!createVol.timingVol.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
                <li v-for="(option, index) in createVol.timingVol.volList" :key="index" style="position: relative;margin-top: 10px;">
                  <el-row>
                    <el-row style="display: flex;justify-content: center;align-items: center">
                      <el-time-picker
                        is-range
                        v-model="option.date"
                        range-separator="-"
                        start-placeholder=""
                        end-placeholder=""
                        format="HH:mm"
                        size="mini"
                        style="width: 30%;margin-right: 15px"
                        @change="changeVolumeTimePicker"
                        value-format="timestamp"
                        :class="{'borderColor':isVolumeBorderColor}">
                      </el-time-picker>
                      <el-checkbox v-model="option.isAllCheckedWeek" @change="changeAllVolHandle(arguments, index)" style="margin-right: 5px">{{$t('planManager.totalSelection')}}</el-checkbox>
                      <el-checkbox-group v-model="option.weeks" size="mini" @change="changeVolHandle(arguments, index)">
                        <el-checkbox-button label="1" name="weeks" >{{$t('planManager.monday')}}</el-checkbox-button>
                        <el-checkbox-button label="2" name="weeks">{{$t('planManager.tuesday')}}</el-checkbox-button>
                        <el-checkbox-button label="3" name="weeks">{{$t('planManager.wednesday')}}</el-checkbox-button>
                        <el-checkbox-button label="4" name="weeks">{{$t('planManager.thursday')}}</el-checkbox-button>
                        <el-checkbox-button label="5" name="weeks">{{$t('planManager.friday')}}</el-checkbox-button>
                        <el-checkbox-button label="6" name="weeks">{{$t('planManager.saturday')}}</el-checkbox-button>
                        <el-checkbox-button label="7" name="weeks">{{$t('planManager.sunday')}}</el-checkbox-button>
                      </el-checkbox-group>
                    </el-row>
                    <el-row style="display: flex;justify-content: center;align-items: center">
                      <svg-icon v-if="option.volume !== 0" icon-class="volume2" style="width: 20px;height: 41px;line-height: 41px"/>
                      <svg-icon v-if="option.volume === 0" icon-class="volume-off" style="width: 20px;height: 41px;line-height: 41px"/>
                      <div class="block" style="width: 80%; margin-left: 10px;margin-right: 10px">
                        <el-slider v-model="option.volume" showInput></el-slider>
                      </div>
                      <!--<el-input v-model="option.volume" style="width: 55px;padding: 0;" size="mini"  min="0" max="100"></el-input>-->
                    </el-row>
                  </el-row>

                  <el-button type="text" v-if="index===0" @click="addTimingVol" style="position: absolute;top: 15%;right: 10px"><i class="el-icon-plus"></i></el-button>
                  <el-button type="text" v-else style="position: absolute;top: 15%;right: 10px"><i class="el-icon-minus" @click="delTimingVol(index)"></i></el-button>
                </li>
              </ul>
            </div>

          </el-form>
        </div>
      </div>
      <!--计划详情-->
      <div class="details-dialog" v-if="dialogKey === 'details'">
        <el-dialog title="$t('planManager.planDetails')"></el-dialog>
        <el-row style="width: 100%;height: 250px;overflow: auto; padding: 0;">
          <el-col style="margin-bottom: 10px;margin-top: 5px;"><div class="grid-content">{{funcName}}</div></el-col>
          <el-col style="margin-bottom: 10px;"><span>{{$t('planManager.functionTypes')}}</span><span style="margin-left: 20px;">{{funcType === '1' ? $t('planManager.powerSource') : $t('planManager.volume')}}</span></el-col>
          <el-col v-if="funcType ==='1'" v-for="(item,index) in detailData" :key="index" style="margin-bottom: 10px;margin-top: 10px;" >
            <span style="margin-right: 10px;">{{item.planType === '1' ? $t('planManager.weeklyPlan') : $t('planManager.specialPlan')}}</span>
            <span style="margin-right: 10px;">{{item.operation === '1' ? $t('planManager.startingUp') : item.operation === '2' ? $t('planManager.standBy') : $t('planManager.powerOff')}}</span>
            <span style="margin-right: 10px;">{{item.time | formatDated}}</span>
            <span  v-for="(week,k) in item.weeks" :key="k">
              <span v-if="week ==='1'"> {{language === 'zh' ? '周一' : $t('planManager.monday')}}   </span>
              <span v-if="week ==='2'"> {{language === 'zh' ? '周二' : $t('planManager.tuesday')}}  </span>
              <span v-if="week ==='3'"> {{language === 'zh' ? '周三' : $t('planManager.wednesday')}}</span>
              <span v-if="week ==='4'"> {{language === 'zh' ? '周四' : $t('planManager.thursday')}} </span>
              <span v-if="week ==='5'"> {{language === 'zh' ? '周五' : $t('planManager.friday')}}   </span>
              <span v-if="week ==='6'"> {{language === 'zh' ? '周六' : $t('planManager.saturday')}} </span>
              <span v-if="week ==='7'"> {{language === 'zh' ? '周日' : $t('planManager.sunday')}}   </span>
            </span>
            <span v-for="(t,k) in item.date" :key="k" class="span_line" >
               {{+t | formatDatet}}<span v-if="k === 0">~</span>
            </span>
          </el-col>
          <el-col v-if="funcType ==='2'" v-for="(item,index) in detailData" style="margin-bottom: 10px;margin-top: 10px;" :key="index">

          <span style="margin-right: 10px;">{{item.planType === '1' ? $t('planManager.defaultVol') : $t('planManager.timingVol')}}</span>
          <span style="margin-right: 10px;">{{item.volume}}</span>
          <span  v-for="week in item.weeks">
              <span v-if="week ==='1'">{{language === 'zh' ? '周一' : $t('planManager.monday')}}   </span>
              <span v-if="week ==='2'">{{language === 'zh' ? '周二' : $t('planManager.tuesday')}}  </span>
              <span v-if="week ==='3'">{{language === 'zh' ? '周三' : $t('planManager.wednesday')}}</span>
              <span v-if="week ==='4'">{{language === 'zh' ? '周四' : $t('planManager.thursday')}} </span>
              <span v-if="week ==='5'">{{language === 'zh' ? '周五' : $t('planManager.friday')}}   </span>
              <span v-if="week ==='6'">{{language === 'zh' ? '周六' : $t('planManager.saturday')}} </span>
              <span v-if="week ==='7'">{{language === 'zh' ? '周日' : $t('planManager.sunday')}}   </span>
            </span>
          <span v-for="(t,ind) in item.date" class="span_line" :key="ind">
               {{+t | formatDated}}<span v-if="ind === 0">~</span>
            </span>
        </el-col>
          <!--<el-table
            :data="tableData"
            height="250"
            style="width: 100%">
            <el-table-column
              prop="type"
              :label="$t('planManager.functionTypes')">
              <template slot-scope="scope">
                <span>{{ scope.row.type==='1' ? $t('planManager.powerSource') : $t('planManager.volume') }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('planManager.powerSupplyPlan')"
              width="350">
              <template slot-scope="scope">-->
             <!--   <template v-if="scope.row.type==='1'">
                  <ul v-for="(item, index) in scope.row.content" :key="index">
                    <li>{{ item.planType==='1' ? "周计划" : "特殊计划"}}</li>
                    <div>
                    <li style="float: left;margin-left: 5px;">{{ item.time | formatDated  }}</li>
                    <li style="float: left;margin-left: 5px;">{{ item.operation === '1' ? "开机" : item.operation === '2' ? "待机" : "关机"}}</li>
                    <li  v-for="week in item.weeks" style="float: left;margin-left: 5px;" >
                      <span v-if="week ==='1'">周一</span>
                      <span v-if="week ==='2'">周二</span>
                      <span v-if="week ==='3'">周三</span>
                      <span v-if="week ==='4'">周四</span>
                      <span v-if="week ==='5'">周五</span>
                      <span v-if="week ==='6'">周六</span>
                      <span v-if="week ==='7'">周日</span>
                    </li>
                    <li v-if="item.date" v-for="t in item.date" style="float: left;margin-left: 5px;">
                      {{t | formatDatet}}
                    </li>
                      <li style="display: block;clear: both"></li>
                    </div>
                  </ul>
                </template>-->
             <!--   <template v-else>
                  <ul v-for="(item, index) in scope.row.content" :key="index">
                    <li>{{ item.planType==='1' ? "默认音量" : "定时音量"}}</li>
                    <li>{{ item.volume }}</li>
                    <li>{{ item.week }}</li>
                    <li>{{ item.time }}</li>
                  </ul>
                </template>-->

              <!--</template>
            </el-table-column>
            <el-table-column
              prop="address"
              label="">
            </el-table-column>
          </el-table>-->
        </el-row>

        <el-row style="width: 100%;height: 250px; margin-top: 30px;">
          <el-col><div class="grid-content">{{$t('planManager.associatedEquipmen')}}</div></el-col>
          <el-table
            :data="equipData"
            height="250"
            border
            style="width: 100%">
            <el-table-column
              prop="name"
              :label="$t('planManager.deviceName')"
              width="180">
            </el-table-column>
            <el-table-column
              prop="officeName"
              :label="$t('planManager.organization')"
              width="180">
            </el-table-column>
            <el-table-column
              prop="id"
              :label="$t('planManager.equipmentID')">
            </el-table-column>
          </el-table>
        </el-row>
      </div>
      <!--修改-->
      <div class="modify-dialog" v-if="dialogKey === 'modify'">
        <el-form ref="form" :model="createForm"
                 :label-width="language==='zh' ? '80px' : '136px'"
                 style="width: 100%;" label-position="left">
          <el-form-item :label="$t('planManager.functionTypes') + ' *'">
            <span>{{createForm.type === '1' ? $t('planManager.powerSource') : $t('planManager.volume')}}</span>
            <!--<el-radio-group v-model="createForm.type">
              <span>{{createForm.type}}</span>
              el-radio label="1" @change = "isChangeContents('source')">{{$t('planManager.powerSource')}}</el-radio>
              <el-radio label="2" @change = "isChangeContents('volume')">{{$t('planManager.volume')}}</el-radio>
            </el-radio-group>-->
          </el-form-item>

          <el-form-item :label="$t('planManager.strategyName') + ' *'">
            <el-input v-model="createForm.name" maxlength = 24 style="display: inline-block;width: 60%;" @input="isModifyNameFn"></el-input>
            <el-button type="primary" plain style="display: inline-block" @click = "emptySetting">{{$t('planManager.emptySet')}}</el-button>
          </el-form-item>

          <div class="weekly-plan-box" v-if="isChangeContent === 'source'">
            <el-checkbox v-model="createForm.weeklyPlan.isOpen" @change="changeChoiseWeekly">{{$t('planManager.weeklyPlan')}}</el-checkbox>
            <ul style="position: relative">
              <div class="shade" v-if="!createForm.weeklyPlan.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
              <li v-for="(item, index) in createForm.weeklyPlan.planList"
                  :key="index"
                  style="display: flex;align-items: center;justify-content: space-between;margin-top: 15px;">
                <el-select v-model="item.operation" size="mini" style="width: 100px;" @change="clickInput">
                  <el-option
                    v-for="(o, i) in actionOptions"
                    :key="o.value"
                    :label="o.label"
                    :value="o.value">
                  </el-option>
                </el-select>

                <el-time-picker
                  v-model="item.time"
                  value-format="timestamp"
                  format="HH:mm"
                  :placeholder="$t('planManager.timePickerPlaceholder')"
                  size="mini"
                  style="width: 120px;"
                  @change="changeModifySourceWeeklyTimes"
                  @blur="changeModifySourceWeeklyTimes"
                  :class="{'borderColor':isborderColor}" >
                </el-time-picker>

                <el-checkbox v-model="item.isAllCheckedWeek" @change="changeAllWeeksHandle(arguments, index)">{{$t('planManager.totalSelection')}}</el-checkbox>
                <el-checkbox-group v-model="item.weeks" size="mini" @change="changeWeeksHandle(arguments, index)">
                  <el-checkbox-button label="1" name="weeks" >{{$t('planManager.monday')}}</el-checkbox-button>
                  <el-checkbox-button label="2" name="weeks">{{$t('planManager.tuesday')}}</el-checkbox-button>
                  <el-checkbox-button label="3" name="weeks">{{$t('planManager.wednesday')}}</el-checkbox-button>
                  <el-checkbox-button label="4" name="weeks">{{$t('planManager.thursday')}}</el-checkbox-button>
                  <el-checkbox-button label="5" name="weeks">{{$t('planManager.friday')}}</el-checkbox-button>
                  <el-checkbox-button label="6" name="weeks">{{$t('planManager.saturday')}}</el-checkbox-button>
                  <el-checkbox-button label="7" name="weeks">{{$t('planManager.sunday')}}</el-checkbox-button>
                </el-checkbox-group>

                <el-button type="text" v-if="index===0" @click="addWeekPlan"><i class="el-icon-plus"></i></el-button>
                <el-button type="text" v-else><i class="el-icon-minus" @click="delWeekPlan(index)"></i></el-button>
              </li>
            </ul>
          </div>

          <div class="special-plan-box" v-if="isChangeContent === 'source'">
            <el-checkbox v-model="createForm.specialPlan.isOpen" @change="changeChoiseSpecial">{{$t('planManager.specialPlan')}}</el-checkbox>
            <ul style="position: relative">
              <div class="shade1" v-if="!createForm.specialPlan.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
              <li v-for="(item, index) in createForm.specialPlan.planList" :key="index" style="margin-top: 15px;">
                <el-select v-model="item.operation" size="mini" style="width: 100px;" @change="clickInput">
                  <el-option
                    v-for="(o, i) in actionOptions"
                    :key="o.value"
                    :label="o.label"
                    :value="o.value">
                  </el-option>
                </el-select>

                <el-time-picker
                  v-model="item.time"
                  value-format="timestamp"
                  format="HH:mm"
                  :placeholder="$t('planManager.timePickerPlaceholder')"
                  size="mini"
                  style="width: 120px;"
                  @change="changeSpecialTime"
                  @blur="changeSpecialTime"
                  :class="{'borderColor':isBorderColor}">
                </el-time-picker>

                <el-date-picker
                  v-model="item.date"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="-"
                  :start-placeholder="$t('planManager.datePickerStartPlaceholder')"
                  :end-placeholder="$t('planManager.datePickerEndPlaceholder')"
                  :picker-options="pickerOptions"
                  value-format="timestamp"
                  size="mini"
                  @change="changeSpecialDay"
                  @blue="changeSpecialDay" >
                </el-date-picker>

                <el-button type="text" v-if="index===0" @click="addSpecialPlan"><i class="el-icon-plus"></i></el-button>
                <el-button type="text" v-else><i class="el-icon-minus" @click="delSpecialPlan(index)"></i></el-button>
              </li>
            </ul>
          </div>

          <div class="defaultVol-plan-box" v-if="isChangeContent === 'volume'" v-for="(key,index) in createVol.defaultVol.volList" :key="index">
            <el-checkbox v-model="createVol.defaultVol.isOpen" @change="changeChoiseDefaultVolume">{{$t('planManager.defaultVol')}}</el-checkbox>
            <el-row style="display: flex;justify-content: center;align-items: center">
              <div class="shade1" v-if="!createVol.defaultVol.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
              <svg-icon v-if="key.volume !== 0" icon-class="volume2" style="width: 20px;height: 41px;line-height: 41px"/>
              <svg-icon v-if="key.volume === 0" icon-class="volume-off" style="width: 20px;height: 41px;line-height: 41px"/>
              <div class="block" style="width: 80%; margin-left: 10px;margin-right: 10px">
                <el-slider v-model="key.volume" @change="changePlanType" showInput></el-slider>
              </div>
           <!--   <el-input type="number" v-model="key.volume" style="width: 55px;padding: 0;" size="mini" ></el-input>-->
            </el-row>
          </div>

          <div class="timingVol-plan-box" v-if="isChangeContent === 'volume'">
            <el-checkbox v-model="createVol.timingVol.isOpen" @change="changeChoiseTimingVolume">{{$t('planManager.timingVol')}}</el-checkbox>
            <ul style="position: relative">
              <div class="shade1" v-if="!createVol.timingVol.isOpen" style="width: 100%;height: 100%; background: #fff;opacity: 0.5;z-index: 9999;position: absolute;top: 0;left: 0;"></div>
              <li v-for="(option, index) in createVol.timingVol.volList" :key="index" style="position: relative;margin-top: 10px;">
                <el-row>
                  <el-row style="display: flex;justify-content: center;align-items: center">
                    <el-time-picker
                      is-range
                      v-model="option.date"
                      range-separator="-"
                      start-placeholder=""
                      end-placeholder=""
                      size="mini"
                      style="width: 30%;margin-right: 15px"
                      @change="changeVolumeTimePicker"
                      value-format="timestamp"
                      format="HH:mm"
                     :class="{'borderColor':isVolumeBorderColor}">
                    </el-time-picker>
                    <el-checkbox v-model="option.isAllCheckedWeek" @change="changeAllVolHandle(arguments, index)" style="margin-right: 5px">{{$t('planManager.totalSelection')}}</el-checkbox>
                    <el-checkbox-group v-model="option.weeks" size="mini" @change="changeVolHandle(arguments, index)">
                      <el-checkbox-button label="1" name="weeks" >{{$t('planManager.monday')}}</el-checkbox-button>
                      <el-checkbox-button label="2" name="weeks">{{$t('planManager.tuesday')}}</el-checkbox-button>
                      <el-checkbox-button label="3" name="weeks">{{$t('planManager.wednesday')}}</el-checkbox-button>
                      <el-checkbox-button label="4" name="weeks">{{$t('planManager.thursday')}}</el-checkbox-button>
                      <el-checkbox-button label="5" name="weeks">{{$t('planManager.friday')}}</el-checkbox-button>
                      <el-checkbox-button label="6" name="weeks">{{$t('planManager.saturday')}}</el-checkbox-button>
                      <el-checkbox-button label="7" name="weeks">{{$t('planManager.sunday')}}</el-checkbox-button>
                    </el-checkbox-group>
                  </el-row>
                  <el-row style="display: flex;justify-content: center;align-items: center">
                    <svg-icon v-if="option.volume !== 0" icon-class="volume2" style="width: 20px;height: 41px;line-height: 41px"/>
                    <svg-icon v-if="option.volume === 0" icon-class="volume-off" style="width: 20px;height: 41px;line-height: 41px"/>
                    <div class="block" style="width: 80%; margin-left: 10px;margin-right: 10px">
                      <el-slider v-model="option.volume"  @change="changePlanType" show-input></el-slider>
                    </div>
                    <!--<el-input v-model="option.volume" style="width: 55px;padding: 0;" size="mini" ></el-input>-->
                  </el-row>
                </el-row>

                <el-button type="text" v-if="index===0" @click="addTimingVol" style="position: absolute;top: 15%;right: 10px"><i class="el-icon-plus"></i></el-button>
                <el-button type="text" v-else style="position: absolute;top: 15%;right: 10px"><i class="el-icon-minus" @click="delTimingVol(index)"></i></el-button>
              </li>
            </ul>
          </div>
        </el-form>
      </div>
      <!--设备管理-->
      <div class="manager-dialog" v-if="dialogKey === 'manager'">
         <el-row style="position: relative">
           <div class="grid-content" style="display: inline-block">{{$t('planManager.associatedEquipmen')}}</div>
           <el-button style="position: absolute;right: 140px" @click="addDevice">{{$t('planManager.addDevice')}}</el-button>
          <!-- <el-button v-if="delPlan" type="danger" style="position: absolute;right: 10px" @click="disassociation">{{$t('planManager.disassociate')}}</el-button>-->
           <!--<el-button v-if="!delPlan" type="info"  style="position: absolute;right: 10px" disabled>{{$t('planManager.disassociate')}}</el-button>-->
           <el-popover
             placement="bottom"
             width="160"
             v-model="visible2"
             style="position: absolute;right: 10px;z-index: 1200" >
             <p>{{$t('planManager.cancleTips')}}</p>
             <div style="text-align: right; margin: 0">
               <el-button size="mini" type="text" @click="visible2 = false">{{$t('planManager.cancel')}}</el-button>
               <el-button type="primary" size="mini" @click="visible2 = false;delDevice()">{{$t('planManager.confirm')}}</el-button>
             </div>
             <el-button slot="reference" v-if="delPlan" type="danger" >{{$t('planManager.disassociate')}}</el-button>
             <el-button slot="reference" v-if="!delPlan" type="info" disabled="disabled">{{$t('planManager.disassociate')}}</el-button>
           </el-popover>

           <el-table
             :data="equipDatad"
             fit
             border
             height="350px"
             size="mini"
             v-loading="listLoading"
             highlight-current-row
             stripe
             style="width: 100%;margin-top: 35px;" @select-all="selectAllPlanHandle" @select="selectPlanHandle" >

             <el-table-column
               type="selection"
               width="55">
             </el-table-column>

             <el-table-column
               sortable
               prop="name"
               :label="$t('planManager.deviceName')">
             </el-table-column>



             <el-table-column
               prop="id"
               :label="$t('planManager.equipmentID')">
             </el-table-column>

             <el-table-column
               prop="officeName"
               :label="$t('planManager.organization')">
             </el-table-column>

           <!--  <el-table-column
               :label="$t('common.handle')">
               <template slot-scope="scope">
                 <el-button type="text" @click="deleteSingleEquipment">{{$t('planManager.deleteEquipment')}}</el-button>
               </template>
             </el-table-column>-->
           </el-table>
         </el-row>
      </div>
      <!--添加设备-->
      <div class="" v-if="dialogKey === 'device'" style="width: 800px">

        <div class="search" style="display: inline-block;"  v-if="isofficeShow">
          <el-input @keyup.enter.native="handleSearchDev" style="width: 200px;" :placeholder="$t('planManager.searchDeviceName')" v-model="searchV">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="handleSearchDev"></i>
          </el-input>
        </div>
        <el-row style="margin-top: 10px;" v-if="isofficeShow">
          <span><a style="color:#409EFF;margin-right: 10px;" @click="changezIndex">{{$t('planManager.back')}}</a>{{officeName}}</span>
        </el-row>
        <div class="whiteBox"
             :style="{'width': '120px','height': '120px','background':'#fff','position': 'absolute','top': '200px','left': '340px','z-index': wIndex +'' }">
        </div>
        <div class="whiteSmallBox"
             :style="{'width': '50px','height': '20px','background':'#f5f7fa','position': 'absolute','top': '110px','left': '280px','z-index': zIndex+1 +'' }"
        ></div>
        <el-transfer
          :style="{ 'width': '100%', 'height': '300px','overflow':'auto','position': 'absolute', 'top': '100px', 'left': '18px', 'z-index': zIndex +'' }"
          v-model="officeVal"
          :left-default-checked="officeVal"
          :data="officeData"
          @change="handleChange"
          :titles="[$t('planManager.deviceName'),$t('planManager.selectedEquipment')]"
          :button-texts="[$t('planManager.deleteEquipment'), $t('planManager.addEquipment')]">
          <span slot-scope="{ option }"
                :class="{ 'cjc_isHidden': (option.officeid!==curofficeId) && (officeVal.indexOf(option.key)===-1),
                           'cjc_isShow': (option.officeid===curofficeId) && (officeVal.indexOf(option.key)===-1) }"
                :title="option.label">{{ option.label }}</span>
        </el-transfer>
       <!-- <el-transfer
          style="width: 100%;position: absolute;top: 100px;left: 10px;"
          v-model="value1"
          :data="data"
          :titles="[$t('planManager.choiceDevice'),$t('planManager.selectedEquipment')]"
          :button-texts="[$t('planManager.deleteEquipment'), $t('planManager.addEquipment')]"></el-transfer>-->
        <el-form style="width: 320px;height: 310px;overflow:auto;position: absolute;top: 100px;left: 18px;z-index: 1111" v-if="zIndex === 1">
       <!-- <el-form-item>
          <el-input
            :placeholder="$t('common.searchOrganizationName')"
            v-model="filterText"
            style="margin-bottom: 1px;"
            suffix-icon="el-icon-search"
            clearable
            :closable="false">
          </el-input>

          <el-tree
            class="filter-tree"
            :data="dataTree"
            :props="defaultProps"
            ref="officeTree"
            show-checkbox
            highlight-current
            node-key="id"
            check-on-click-node
            :expand-on-click-node="false"
            @node-click="clickOfficeHandle"
            @check="checkOfficeHandle"
            check-strictly
          style="border: 1px solid #d3dce6;min-height: 248px;">
          </el-tree>
        </el-form-item>-->
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
              :default-expanded-keys="[curofficeId]"
              :filter-node-method="filterNode"
              ref="officeTree"
              highlight-current
              node-key="id"
              check-on-click-node
              :expand-on-click-node="false"
              @node-click="clickOfficeHandle"
              @check="checkOfficeHandle"
              check-strictly
              style="border: 1px solid #d3dce6;min-height: 248px;">
              <span class="custom-tree-node"
                    slot-scope="{ node, data }"
                    :title="node.label">{{ node.label }}</span>
            </el-tree>
          </el-form-item>
        </el-form>
      </div>
      <!--底部按钮-->
      <div slot="footer" class="dialog-footer"  v-if="dialogKey === 'create'" style="position: relative">
        <el-alert
          :title="$t('planManager.timeErrorTips')"
          type="error"
          show-icon
          :closable="false"
          v-if="isborderColor || isBorderColor"
        style="width: 300px;position: absolute;top: 0;right: 200px">
        </el-alert>
        <el-alert
          :title="$t('planManager.timeCopySameDay')"
          type="error"
          show-icon
          :closable="false"
          v-if="isVolumeBorderColor"
          style="width: 300px;position: absolute;top: 0;right: 200px">
        </el-alert>
        <el-button @click="dialogVisible = false;isborderColor = false;isBorderColor = false;isVolumeBorderColor = false" >{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary"
                   v-if="isChangeContent === 'source'"
                   @click="addSource()"
                   :disabled="!createForm.name ||
                              (!createForm.weeklyPlan.isOpen && !createForm.specialPlan.isOpen) ||
                              ((createForm.weeklyPlan.isOpen && !isChoiseWeeklyFn) ||
                              (createForm.weeklyPlan.isOpen && !isChoiseWTimeFn) ||
                              (createForm.specialPlan.isOpen && !isChoiseSTimeFn) ||
                              (createForm.specialPlan.isOpen && !isChoiseSDateFn ))">{{$t('common.confirmBtn')}}
        </el-button>
        <el-button type="primary"
                   v-if="isChangeContent === 'volume'"
                   @click="dialogVisible = false;addVolume()"
                   :disabled="!createForm.name ||
                    (!createVol.defaultVol.isOpen) && (!createVol.timingVol.isOpen) ||
                    (createVol.timingVol.isOpen && !isChoiseVolumeWeekFn) ||
                     (createVol.timingVol.isOpen && !isChooiseVolumeTimeFn)">{{$t('common.confirmBtn')}}</el-button>
      </div>
      <div slot="footer" class="dialog-footer"  v-if="dialogKey === 'modify'" style="position: relative">
        <el-alert
          :title="$t('planManager.timeErrorTips')"
          type="error"
          show-icon
          :closable="false"
          v-if="isborderColor"
          style="width: 300px;position: absolute;top: 0;right: 200px">
        </el-alert>
        <el-button @click="dialogVisible = false;isborderColor = false;isBorderColor = false;isVolumeBorderColor = false" >{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary"
                   v-if="isChangeContent === 'source'"
                   @click="dialogVisible = false;addSource('true')"
                     :disabled="!isChangePlan || !createForm.name ||
                              (!createForm.weeklyPlan.isOpen && !createForm.specialPlan.isOpen) ||
                              ((createForm.weeklyPlan.isOpen && !isChoiseWeeklyFn) ||
                              (createForm.weeklyPlan.isOpen && !isChoiseWTimeFn) ||
                              (createForm.specialPlan.isOpen && !isChoiseSTimeFn) ||
                              (createForm.specialPlan.isOpen && !isChoiseSDateFn )) ">{{$t('common.confirmBtn')}}</el-button>
        <el-button type="primary"
                   v-if="isChangeContent === 'volume'"
                   @click="dialogVisible = false;addVolume('true')"
                   :disabled="!isChangePlan ||
                      (createVol.timingVol.isOpen && !isChoiseVolumeWeekFn) ||
                      (createVol.timingVol.isOpen && !isChooiseVolumeTimeFn)">{{$t('common.confirmBtn')}}</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-if="false">  <!--v-if="dialogKey === 'manager'"-->
        <el-button @click="dialogVisible = false" >{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" v-if="isChangeContent === 'source'" @click="dialogVisible = false;delDevice()" :disabled="!isManagerDel && !delPlan">{{$t('common.confirmBtn')}}</el-button>
      </div>
      <div slot="footer" class="dialog-footer"  v-if="dialogKey === 'device'" style="margin-top: 264px" :class="{marginTop : isMarginTop}">
        <el-button @click="isShowFn" >{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" v-if="isChangeContent === 'source'" @click="addDecial()" :disabled="!isAddDevice">{{$t('common.confirmBtn')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ElRow from "element-ui/packages/row/src/row"
  import { getPlanList,saveStrategy,delStrategys,strategyTerminal,terminalPageByOffices,strategyRelatedTerminal,delStrategyterminal } from '@/api/plan'
  import { getOfficeList } from '@/api/office'
  import { formatDate, treeify } from '@/utils'

  export default {
    name: 'planManager',
    components: {ElRow},
    data() {
      return {
        count: 100,
        searchVal: '',
        searchV: '',
        zIndex:1,
        wIndex:1200,
        isAddDevice:false,
        listLoading: false,
        tableData: [],
        equipData:[],
        equipDatad:[],
        equipDatadCopy: [],
        officeData:[],
        officeDataCopy:[],
        totalOfficeDataList:[],
        officeVal:[],
        selectedCount:"",
        deleteEquip:"",
        delPlan:"",
        planId:"",
        idArr:[],
        idstr: "",
        funcType: "",
        funcName: "",
        errorTips: "",
        visible2: false,
        detailData:[],
        isManagerDel:false,
        isChangePlan: false,
        isSourceTimes: true,
        isSourceSpcialTimes:true,
        isVolTimes: true,
        isSpecialDate: true,
        isMarginTop:true,
        isChoiseWeekly: true,
        isChoiseSpecial: true,
        isChoiseDefault: true,
        isChoiseTiming: true,
        isModifySourceWeeklyTime: true,
        isModifySourceWeeklyDay: true,
        isModifySourceSpecialTime: true,
        isModifySourceSpecialDay: true,
        isModifyVolumeTimingTime: true,
        isModifyVolumeTimingDay: true,
        filterText: '',
        treeData: null,
        curofficeId:'',
        officeName: '',
        isofficeShow: false,
        isborderColor: false,
        isBorderColor: false,
        isVolumeBorderColor: false,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        listQuery: {
          page: 1,
          limit: 10,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        },
        isSubRoute: false, // 判断当前是二级还是三级路由（true为三级路由，即创建/编辑账号页面）
        curAccountInfo: null,
        dialogKey: '',
        dialogTitle: '',
        dialogVisible: false,
        dialogPlanInfo: null,
        createForm: { // createForm.weeklyPlan.planList
          type: '1',
          name: '',
          weeklyPlan: {
            isOpen: false,
            planList: [
              {
                id: Date.now(),
                isAllCheckedWeek: false,
                time: new Date(1534262400000),
                planType:"1",
                operation: '1',
                weeks: [],
              }
            ]
          },
          specialPlan: {
            isOpen: false,
            planList: [
              {
                id: Date.now(),
                time: new Date(1534262400000),
                planType:"2",
                operation: '2',
                date: (function () {
                  const end = new Date();
                  const start = new Date();
                  end.setTime(start.getTime() + 3600 * 1000 * 24);
                  return [start.getTime(), end.getTime()];
                })(),

              }
            ]
          }
        },
        createVol: {
          name: '',
          defaultVol: {
            isOpen: false,
            volList: [
              {
                id: Date.now(),
                planType:"1",
                volume: 20,
              }
            ]
          },
          timingVol: {//createVol.timingVol.volList
            isOpen: false,
            volList: [
              {
                id: Date.now(),
                isAllCheckedWeek: false,
                planType:"2",
                volume: 20,
                weeks: [],
                date: (function () {
                  const end = new Date();
                  const start = new Date();
                  end.setTime(start.getTime() + 1000*60*60);
                  return [start.getTime(), end.getTime()];
                })(),
              }
            ]
          }
        },
//        actionOptions: [
//          {
//            value: '1',
//            label: this.$t('planManager.startingUp'),
//          }, {
//            value: '3',
//            label: this.$t('planManager.powerOff'),
//          }, {
//            value: '2',
//            label: this.$t('planManager.standBy'),
//          }
//        ],
        pickerOptions: {
          shortcuts: [{
            text: this.$t('planManager.nextDay'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t('planManager.nextWeek'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t('planManager.nextMonth'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
        isChangeContent: "source"
      }
    },
    computed: {
      ...mapGetters([
        'language',
        'officeId'
      ]),
      isChoiseSDateFn(){
        return this.createForm.specialPlan.planList.every(item => item.date !== null)
      },
      isChoiseSTimeFn() {
        return this.createForm.specialPlan.planList.every(item => item.time !== null)
      },
      isChoiseWTimeFn() {
        return this.createForm.weeklyPlan.planList.every(item => item.time !== null)
      },
      isChoiseWeeklyFn() {
          return this.createForm.weeklyPlan.planList.every(item => item.weeks.length >0)
/*          let isChoiseWeek = false
          this.createForm.weeklyPlan.planList.map(item => {
              if(item.weeks.length >0){
                isChoiseWeek = true;
              }else {
                isChoiseWeek = false
              }
          })
        if (isChoiseWeek === true){
          console.log(isChoiseWeek);
              return true;
        }else{
          console.log(isChoiseWeek);
            return false;
        }*/
      },
      isChooiseVolumeTimeFn(){
        return this.createVol.timingVol.volList.every(item => item.date !== null)
      },
      isChoiseVolumeWeekFn(){
        return this.createVol.timingVol.volList.every(item => item.weeks.length >0)
        /*let isChoiseWeek = false
        this.createVol.timingVol.volList.filter(item => {
          if(item.weeks.length >0){
            isChoiseWeek = true
          }else {
            isChoiseWeek = false
          }
        })
        if (isChoiseWeek === true){
          return true
        }else{
          return false
        }*/
      },
      actionOptions() {
        return [
          {
            value: '1',
            label: this.$t('planManager.startingUp'),
          }, {
            value: '3',
            label: this.$t('planManager.powerOff'),
          }, {
            value: '2',
            label: this.$t('planManager.standBy'),
          }
        ];
      }
    },
    watch: {
      filterText(val) {
        this.$refs.officeTree.filter(val);
      },

    },
    filters:{
      formatDate(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd hh:mm');
      },
      formatDated(time){
        let date = new Date(time);
        return formatDate(date,'hh:mm');
      },
      formatDatet(time){
        let date = new Date(time);
        return formatDate(date,'yyyy-MM-dd');
      },
    },
    created() {
      this.listLoading = true
      getOfficeList().then(res => {
        if (res.currentOffice.parentId) delete res.currentOffice.parentId; // 不能有parentId
        let arr = [res.currentOffice].concat(res.officeMsg);
        let tree = treeify(arr, 'id', 'parentId', 'children');
        this.treeData = JSON.parse(JSON.stringify([tree]))
        this.curofficeId = this.officeId;
      }).catch(err => {
        console.log(err)
      })
      getPlanList({pageSize: this.listQuery.limit}).then(res => {
        this.count = res.count
        this.tableData = res.data
        this.listLoading = false
      }).catch(err => {
          console.log(err)
      })
    },
    mounted() {

    },

    methods: {
      handleSearch() {
        getPlanList({searchKey:this.searchVal,pageSize: this.listQuery.limit}).then(res => {
          this.tableData = res.data
        }).catch(err => {
          console.log(err)
        })
      },
      handleSizeChange(val) {
        this.idstr = ""
        this.idArr = []
        this.selectedCount = ""
        this.listQuery.limit = val
        getPlanList({pageSize: this.listQuery.limit}).then(res => {
          this.tableData = res.data
        }).catch(err => {
          console.log(err)
        })
      },
      handleCurrentChange(val) {
        this.idstr = ""
        this.idArr = []
        this.selectedCount = ""
        this.listQuery.page = val
        getPlanList({pageNo: this.listQuery.page,pageSize: this.listQuery.limit}).then(res => {
          this.tableData = res.data
        }).catch(err => {
          console.log(err)
        })
      },
      filterHandler(value, row, column) {
        const property = column['property'];
        return (row[property]==='1' ? this.$t('planManager.powerSource') : this.$t('planManager.volume')) === value;
      },
      switchPageToEditAccount(info) {
        this.curAccountInfo = info;
      },
      toggleDialog(title, data) {
        this.isChangePlan = false
        switch (title) {
          case 'create':
            this.createForm.name = ''
            this.createForm.weeklyPlan.isOpen = false
            this.createForm.specialPlan.isOpen = false
            this.createVol.defaultVol.isOpen = false
            this.createVol.timingVol.isOpen = false
            this.dialogKey = 'create';
            this.dialogTitle = this.$t('planManager.newTimingPlan');
            this.dialogPlanInfo = null;
            this.createForm.specialPlan.planList = [
              {
                id: Date.now(),
                time: new Date(1534262400000),
                planType:"2",
                operation: '2',
                date: (function () {
                  const end = new Date();
                  const start = new Date();
                  end.setTime(start.getTime() + 3600 * 1000 * 24);
                  return [start.getTime(), end.getTime()];
                })(),

              }
            ]
            this.createForm.weeklyPlan.planList = [
              {
                id: Date.now(),
                isAllCheckedWeek: false,
                time: new Date(1534262400000),
                planType:"1",
                operation: '1',
                weeks: [],
              }
            ]
            this.createVol.defaultVol.volList = [
              {
                id: Date.now(),
                planType:"1",
                volume: 20,
              }]
            this.createVol.timingVol.volList = [
              {
                id: Date.now(),
                isAllCheckedWeek: false,
                planType:"2",
                volume: 20,
                weeks: [],
                date: (function () {
                  const end = new Date();
                  const start = new Date();
                  end.setTime(start.getTime() + 1000*60*60);
                  return [start.getTime(), end.getTime()];
                })(),
              }
            ]
            break;
          case 'details':
            this.dialogKey = 'details';
            this.dialogTitle = this.$t('planManager.planDetails');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            this.funcType = data.type;
            this.funcName = data.name;
            this.equipData = []
            strategyTerminal({strategyId :data.id}).then(res => {
              this.equipData = res.data
            }).catch(err => {
              console.log(err)
            })

            if(data.type === '2'){
              this.detailData = []
              for(let key in data.content){
                let obj = {}
                if(data.content[key].planType === '1'){
                  let planType = data.content[key].planType
                  let volume = data.content[key].volume
                  obj.planType = planType
                  obj.volume = volume
                  this.detailData.push(obj)
                }else {
                   let dat = data.content[key].date
                   let date = dat.split(',')
                   let planType = data.content[key].planType
                   let volume = data.content[key].volume
                   let week = data.content[key].weeks
                   let weeks=week.split(',')
                   obj.date = date
                   obj.planType = planType
                   obj.volume = volume
                   obj.weeks = weeks
                  this.detailData.push(obj)
                }
              }
            }else{
              this.detailData = []
              for(let key in data.content){
                let obj = {}
                if(data.content[key].planType === '1'){
                  let planType = data.content[key].planType
                  let operation = data.content[key].operation
                  let week = data.content[key].weeks
                  let weeks = week.split(',')
                  let time = data.content[key].time
                  obj.planType = planType
                  obj.weeks = weeks
                  obj.operation = operation
                  obj.time = time
                  this.detailData.push(obj)
                }else {
                  let planType = data.content[key].planType
                  let operation = data.content[key].operation
                  let dat = data.content[key].date
                  let date = dat.split(',')
                  let time = data.content[key].time
                  obj.planType = planType
                  obj.date = date
                  obj.operation = operation
                  obj.time = time
                  this.detailData.push(obj)
                }
              }
            }

            break;
          case 'modify':
            this.dialogKey = 'modify';
            this.dialogTitle = this.$t('planManager.modifyTimingPlan');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            this.createForm.weeklyPlan.planList = []
            this.createForm.specialPlan.planList = []
            this.createVol.defaultVol.volList = []
            this.createVol.timingVol.volList = []
            if(data.type === '1') {
              this.isChangeContent = 'source'
              this.createForm.type = data.type
              this.createForm.name=data.name;
              this.createForm.id = data.id
              let choseType = '1'
              for(let i=0,length=data.content.length;i<length;i++){
                for(let j =1,len=data.content.length;j<len;j++){
                  if(data.content[i].planType != data.content[j].planType){
                    choseType = '2'
                  }
                }
              }
              if(choseType === '1'){
                for(let index in data.content){
                  if(data.content[index].planType === '1'){
                    //this.createForm.weeklyPlan.planList = []
                    this.createForm.weeklyPlan.isOpen = true
                    this.createForm.specialPlan.isOpen = false
                    let operation = data.content[index].operation
                    let planType = data.content[index].planType
                    let time = new Date(data.content[index].time)
                    let weeks = data.content[index].weeks.split(',')
                    let isAllCheckedWeek = false
                    if(weeks.length === 7){
                      isAllCheckedWeek = true;
                    }else{
                      isAllCheckedWeek = false;
                    }
                    let arr = {}
                    arr.operation = operation
                    arr.planType = planType
                    arr.time = time
                    arr.weeks = weeks
                    arr.isAllCheckedWeek = isAllCheckedWeek
                    this.createForm.weeklyPlan.planList.push(arr)

                  }else {
                    //this.createForm.specialPlan.planList=[]
                    this.createForm.specialPlan.isOpen = true
                    this.createForm.weeklyPlan.isOpen = false
                    let operation = data.content[index].operation
                    let planType = data.content[index].planType
                    let time = new Date(data.content[index].time)
                    let date = data.content[index].date.split(',')
                    let arr = {}
                    arr.operation = operation
                    arr.planType = planType
                    arr.time = time
                    arr.date = date
                    this.createForm.specialPlan.planList.push(arr)
                    //this.createForm.specialPlan.planList = data.content[index]
                  }
                }
              }else{
                for(let index in data.content){
                  if(data.content[index].planType === '1'){
                    this.createForm.weeklyPlan.isOpen = true
                    let operation = data.content[index].operation
                    let planType = data.content[index].planType
                    let time = new Date(data.content[index].time)
                    let weeks = data.content[index].weeks.split(',')
                    let isAllCheckedWeek = false
                    if(weeks.length === 7){
                      isAllCheckedWeek = true;
                    }else{
                      isAllCheckedWeek = false;
                    }
                    let arr = {}
                    arr.operation = operation
                    arr.planType = planType
                    arr.time = time
                    arr.weeks = weeks
                    arr.isAllCheckedWeek = isAllCheckedWeek
                    this.createForm.weeklyPlan.planList.push(arr)

                  }else {
                    this.createForm.specialPlan.isOpen = true
                    let operation = data.content[index].operation
                    let planType = data.content[index].planType
                    let time = new Date(data.content[index].time)
                    let date = data.content[index].date.split(',')
                    let arr = {}
                    arr.operation = operation
                    arr.planType = planType
                    arr.time = time
                    arr.date = date
                    this.createForm.specialPlan.planList.push(arr)
                    //this.createForm.specialPlan.planList = data.content[index]
                  }
                }
              }

              if(!this.createForm.weeklyPlan.isOpen){
                this.createForm.weeklyPlan.planList.push( {
                  id: Date.now(),
                  isAllCheckedWeek: false,
                  time: new Date(1534262400000),
                  planType:"1",
                  operation: '1',
                  weeks: [],
                })
              }else if(!this.createForm.specialPlan.isOpen){
                this.createForm.specialPlan.planList.push( {
                  id: Date.now(),
                  time: new Date(1534262400000),
                  planType:"2",
                  operation: '2',
                  date: (function () {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(start.getTime() + 3600 * 1000 * 24);
                    return [start.getTime(), end.getTime()];
                  })(),

                })
              }

              /* -------------------------------------------------------------------*/
            }else {
              this.isChangeContent = 'volume'
              this.createForm.type = data.type
              this.createForm.name=data.name;
              this.createForm.id = data.id
              let choseType = '1'
              for(let i=0,length=data.content.length;i<length;i++){
                for(let j =1,len=data.content.length;j<len;j++){
                  if(data.content[i].planType != data.content[j].planType){
                    choseType = '2'
                  }
                }
              }
              if(choseType === '1'){
                for(let index in data.content){
                  if(data.content[index].planType ==='1'){
                    this.createVol.defaultVol.isOpen = true
                    this.createVol.timingVol.isOpen = false
                    let planType = data.content[index].planType
                    let volume = data.content[index].volume
                    let arr = {}
                    arr.planType = planType
                    arr.volume = volume
                    this.createVol.defaultVol.volList.push(arr)
                    this.createVol.defaultVol.volList.push()
                  }else {
                    this.createVol.timingVol.isOpen = true
                    this.createVol.defaultVol.isOpen = false
                    let planType = data.content[index].planType
                    let volume = data.content[index].volume
                    let dated = data.content[index].date
                    let date = dated.split(',')
                    let weeks = data.content[index].weeks.split(',')
                    let isAllCheckedWeek = false
                    if(weeks.length === 7){
                      isAllCheckedWeek = true;
                    }else{
                      isAllCheckedWeek = false;
                    }
                    let arr = {}
                    arr.planType = planType
                    arr.volume = volume
                    arr.date = date
                    arr.weeks = weeks
                    arr.isAllCheckedWeek = isAllCheckedWeek
                    this.createVol.timingVol.volList.push(arr)
                  }
                }
              }else{
                for(let index in data.content){
                  if(data.content[index].planType ==='1'){
                    this.createVol.defaultVol.isOpen = true
                    let planType = data.content[index].planType
                    let volume = data.content[index].volume
                    let arr = {}
                    arr.planType = planType
                    arr.volume = volume
                    this.createVol.defaultVol.volList.push(arr)
                    this.createVol.defaultVol.volList.push()
                  }else {
                    this.createVol.timingVol.isOpen = true
                    let planType = data.content[index].planType
                    let volume = data.content[index].volume
                    let dated = data.content[index].date
                    let date = dated.split(',')
                    let weeks = data.content[index].weeks.split(',')
                    let isAllCheckedWeek = false
                    if(weeks.length === 7){
                      isAllCheckedWeek = true;
                    }else{
                      isAllCheckedWeek = false;
                    }
                    let arr = {}
                    arr.planType = planType
                    arr.volume = volume
                    arr.date = date
                    arr.weeks = weeks
                    arr.isAllCheckedWeek = isAllCheckedWeek
                    this.createVol.timingVol.volList.push(arr)
                  }
                }
              }
              if(!this.createVol.defaultVol.isOpen){
                this.createVol.defaultVol.volList.push({
                  id: Date.now(),
                  planType:"1",
                  volume: 20,
                })
              }else if(!this.createVol.timingVol.isOpen){
                this.createVol.timingVol.volList.push({
                  id: Date.now(),
                  isAllCheckedWeek: false,
                  planType:"2",
                  volume: 20,
                  weeks: [],
                  date: (function () {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(start.getTime() + 1000*60*60);
                    return [start.getTime(), end.getTime()];
                  })(),
                })
              }
            }
            break;
          case 'manager':
            this.dialogKey = 'manager';
            this.dialogTitle = this.$t('planManager.deviceManagement');
            this.dialogPlanInfo = JSON.parse(JSON.stringify(data));
            this.createForm.id = data.id
            this.isChangeContent = 'source'
            this.delPlan = ""
            this.equipDatad = []
            this.planId = ''
            this.planId = data.id
            strategyTerminal({strategyId :data.id}).then(res => {
              this.equipDatad = res.data
              this.dialogVisible = true;
            }).catch(err => {
              console.log(err)
            })
            break;
          default:
            this.dialogKey = '--';
            this.dialogTitle = '--';
            this.dialogPlanInfo = null;
            break;
        }
        if (title !== 'manager') this.dialogVisible = true;

      },
      isChangeContents(type) {
          this.isChangeContent = type
      },
      emptySetting() {
        this.isVolumeBorderColor = false
        this.isBorderColor = false
        this.isborderColor = false
        this.createVol.timingVol.isOpen = false
        this.createVol.defaultVol.isOpen = false
        this.createForm.weeklyPlan.isOpen = false
        this.createForm.specialPlan.isOpen = false
        this.createForm.name = ''
        this.createForm.weeklyPlan.planList.splice('')
        this.createForm.weeklyPlan.planList.push({
          id: Date.now(),
          isAllCheckedWeek: false,
          action: '1',
          operation: '1',
          time: new Date(1534262400000),
          weeks: [],
        })
        this.createForm.specialPlan.planList.splice('');
        this.createForm.specialPlan.planList.push({
          id: Date.now(),
          action: '1',
          operation:'1',
          time: new Date(1534262400000),
          date: (function () {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24);
            return [start.getTime(), end.getTime()];
          })(),

        })
        this.createVol.timingVol.volList.splice('')
        this.createVol.timingVol.volList.push({
          id: Date.now(),
          isAllCheckedWeek: false,
          planType:"2",
          volume: 20,
          weeks: [],
          date: (function () {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 1000*60*60);
            return [start.getTime(), end.getTime()];
          })(),
        })
        this.createVol.defaultVol.volList.splice('')
        this.createVol.defaultVol.volList.push({
          id: Date.now(),
          planType: '1',
          volume: 20,
        })


      },
      selectAllHandle(selection) {
          this.selectedCount = selection.length;
          if(selection.length ===0){
            this.deleteEquip = ""
          }else {
            for (let key in selection){
              this.deleteEquip += selection[key].device
            }
          }
          for (let a in selection){
              this.idArr.push(selection[a].id)
              this.idstr = this.idArr.join();
          }
      },
      selectHandle(s) {
        this.selectedCount = s.length
        this.idArr = []
        this.deleteEquip = ""
        for (let key in s) {
          this.deleteEquip += s[key].device
        }
        for (let a in s){
          this.idArr.push(s[a].id)
          this.idstr = this.idArr.join();
        }
      },
      selectAllPlanHandle(selection) {
        if(selection.length ===0){
          this.delPlan = ""
        }else {
          for (let key in selection){
            this.delPlan += selection[key].id
          }
        }
        this.equipDatadCopy = []
        this.equipDatadCopy = this.equipDatad;

      },

      selectPlanHandle(s) {
        this.delPlan = ""
        for (let key in s) {
          this.delPlan += s[key].id
        }
        this.equipDatadCopy = []
        for(let k in s){
          this.equipDatadCopy.push(s[k]);
        }

      },
      changeAllWeeksHandle(arg, id) {
          this.isChangePlan = true
          /*if(this.createForm.weeklyPlan.planList.length > 1){
            if(arg[0] === true){
              this.isWeeks = true;
              this.isModifySourceWeeklyDay = false
            }else{
              this.isWeeks = false;
              this.isModifySourceWeeklyDay = true
            }
          }else {
            if(arg[0] === true){
              this.isWeeks = true;
              this.isModifySourceWeeklyDay = false
            }else{
              this.isWeeks = false;
              this.isModifySourceWeeklyDay = true
            }
          }*/

          if(arg[0] ===true){
            this.createForm.weeklyPlan.planList[id].isAllCheckedWeek = true;
            this.createForm.weeklyPlan.planList[id].weeks.push('1','2','3','4','5','6','7')
          }else {
            this.createForm.weeklyPlan.planList[id].isAllCheckedWeek = false;
            this.createForm.weeklyPlan.planList[id].weeks.splice('')
          }
      },
      changeWeeksHandle(arg, id) {
        this.isChangePlan = true
        if(arg[0].length< 7){
          this.createForm.weeklyPlan.planList[id].isAllCheckedWeek = false;
        }else {
          this.createForm.weeklyPlan.planList[id].isAllCheckedWeek = true;
        }
      },
      changeAllVolHandle(arg, id) {
        this.isChangePlan = true;
        if(arg[0] ===true){
          this.createVol.timingVol.volList[id].isAllCheckedWeek = true;
          this.createVol.timingVol.volList[id].weeks.push('1','2','3','4','5','6','7');
        }else {
          this.createVol.timingVol.volList[id].isAllCheckedWeek = false;
          this.createVol.timingVol.volList[id].weeks.splice('');
        }
      },
      changeVolHandle(arg, id) {
        this.isChangePlan = true;
        if(arg[0].length< 7){
          this.createVol.timingVol.volList[id].isAllCheckedWeek = false;
        }else {
          this.createVol.timingVol.volList[id].isAllCheckedWeek = true;
        }
      },
      addWeekPlan() {
        this.isChangePlan = true
          this.createForm.weeklyPlan.planList.push({
            id: Date.now(),
            isAllCheckedWeek: false,
            time: new Date(1534262400000),
            planType:"1",
            operation: '1',
            weeks: [],
          })
      },
      delWeekPlan(planId) {
        this.isChangePlan = true
        this.createForm.weeklyPlan.planList.splice(planId,1)
      },
      addSpecialPlan() {
        this.isChangePlan = true
        this.createForm.specialPlan.planList.push({
          id: Date.now(),
          time: new Date(1534262400000),
          planType:"2",
          operation: '2',
          date: (function () {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24);
            return [start.getTime(), end.getTime()];
          })(),
        })
      },
      delSpecialPlan(planId) {
        this.isChangePlan = true
          this.createForm.specialPlan.planList.splice(planId,1)
      },
      addTimingVol() {
        this.isChangePlan = true
        this.createVol.timingVol.volList.push({
          id: Date.now(),
          isAllCheckedWeek: false,
          planType:"2",
          volume: 20,
          weeks: [],
          date: (function () {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 1000*60*60);
            return [start.getTime(), end.getTime()];
          })(),
        })
      },
      delTimingVol(planId) {
        this.isChangePlan = true
        this.createVol.timingVol.volList.splice(planId,1)
      },
      changeVolumeTimePicker(val) {
          this.isChangePlan = true
        if(val === null){
           this.isVolTimes = false
           this.isModifyVolumeTimingTime = false
        }else{
          this.isVolTimes = true
          this.isModifyVolumeTimingDay = true
        }
      },
      addDevice(){
        this.dialogTitle = this.$t('planManager.addDevice');
        this.dialogKey = "device";
        this.zIndex = 1
        this.isofficeShow = false
        this.isMarginTop = true
        this.wIndex = 1200
      },
      deleteSingleEquipment(){
          this.isManagerDel = true
      },
      addSource(type){
        //1534262402000 00:00
        this.isVolumeBorderColor = false
        let weeklyTimeArr = []
        this.createForm.weeklyPlan.planList.filter(item => {
          weeklyTimeArr.push(new Date(item.time).getTime())
        })
        weeklyTimeArr.sort(function (a,b) {
          return a-b;
        })
        const gthat = this
        let trueOrFalse = '1';
        let SpecialTrueOrFalse = 'false'
        if(this.createForm.weeklyPlan.planList.length > 1){
          for(let i = 0,length = this.createForm.weeklyPlan.planList.length;i<length;i++){
            for(let j = i+1,len = this.createForm.weeklyPlan.planList.length;j<len;j++){
              $.each(gthat.createForm.weeklyPlan.planList[i].weeks,function () {
                let that = this
                $.each(gthat.createForm.weeklyPlan.planList[j].weeks,function () {
                  if(that === this){
                    if( weeklyTimeArr[i]+300000 > weeklyTimeArr[j]){
                        console.log(weeklyTimeArr[i]+300000)
                      console.log(weeklyTimeArr[j])
                      trueOrFalse = '2'
                      gthat.dialogVisible = true
                      gthat.isborderColor = true
                    }
                  }
                })
              })
            }
          }
        }

        let weeklySpecialArr = []
        this.createForm.specialPlan.planList.filter(item => {
          weeklySpecialArr.push(item.date)
        })
        let weeklySpecialTimeArr = []
        this.createForm.specialPlan.planList.filter(item => {
          weeklySpecialTimeArr.push(new Date(item.time).getTime())
        })
        weeklySpecialTimeArr.sort(function (a,b) {
          return a-b;
        })
        if (weeklySpecialArr.length > 1){
            let iscopyDate = false
            for(let i = 0,length = weeklySpecialArr.length;i<length;i++){
                for(let j = i+1,len = weeklySpecialArr.length;j<len;j++){
                  if( weeklySpecialArr[j][0] >  weeklySpecialArr[i][0] &&  weeklySpecialArr[j][0] < weeklySpecialArr[i][1]){
                    iscopyDate = true
                  }else if( weeklySpecialArr[j][0] <  weeklySpecialArr[i][0] &&  weeklySpecialArr[j][1] > weeklySpecialArr[i][0]){
                    iscopyDate = true
                  }else if( weeklySpecialArr[j][0] <  weeklySpecialArr[i][1] &&  weeklySpecialArr[j][1] > weeklySpecialArr[i][1]){
                    iscopyDate = true
                  }else {
                    iscopyDate = false
                  }

                }
            }
            if(iscopyDate === true){
              for (let i = 0,length = weeklySpecialTimeArr.length;i<length;i++){
                for (let j = i+1,len = weeklySpecialTimeArr.length;j<len;j++){
                  if(weeklySpecialTimeArr[i]+300000> weeklySpecialTimeArr[j]){
                    SpecialTrueOrFalse = 'true'
                    gthat.dialogVisible = true
                    gthat.isBorderColor = true
                  }else {
                    SpecialTrueOrFalse =  'false'
                    if(trueOrFalse === '1'){
                      gthat.dialogVisible = false
                      gthat.isBorderColor = false
                    }else {
                      gthat.dialogVisible = true
                      gthat.isBorderColor = true
                    }

                  }
                }
              }
            }
        }

     if(trueOrFalse === '1' && SpecialTrueOrFalse === 'false'){
        var content = [];
        if (this.createForm.weeklyPlan.isOpen){
        for(let key in this.createForm.weeklyPlan.planList){
          /*delete this.createForm.weeklyPlan.planList[key].id
          delete this.createForm.weeklyPlan.planList[key].isAllCheckedWeek*/
          let obj = {}
          for(let k in this.createForm.weeklyPlan.planList){
             if(!this.createForm.weeklyPlan.planList[k].time || this.createForm.weeklyPlan.planList[k].weeks.length ===0){
               this.$message.error(this.$t("common.failTips"));
               return
             }
          }
          let time = this.createForm.weeklyPlan.planList[key].time;
          let planType = this.createForm.weeklyPlan.planList[key].planType;
          let operation = this.createForm.weeklyPlan.planList[key].operation;
          let weeks = this.createForm.weeklyPlan.planList[key].weeks;
          let weeksStr = weeks.join();
          obj.time = time;
          obj.planType = planType;
          obj.operation = operation;
          obj.weeks = weeksStr;
          content.push(obj)
        }
        }
        if (this.createForm.specialPlan.isOpen){
        for(let key in this.createForm.specialPlan.planList){
          /* delete this.createForm.specialPlan.planList[key].id
         content.push(this.createForm.specialPlan.planList[key])*/
          let obj = {}
          let time = this.createForm.specialPlan.planList[key].time;
          for(let k in this.createForm.specialPlan.planList){
            if(!this.createForm.specialPlan.planList[k].time){
              this.$message.error(this.$t("common.failTips"));
              return
            }
          }
          let planType = this.createForm.specialPlan.planList[key].planType;
          let operation = this.createForm.specialPlan.planList[key].operation;
          let date = this.createForm.specialPlan.planList[key].date;
          let dateStr = date.join();
          obj.time = time;
          obj.planType = planType;
          obj.operation = operation;
          obj.date = dateStr;
          content.push(obj)
        }
        }
        if(type){
         saveStrategy({
            strategyId:this.createForm.id,
            name: this.createForm.name,
            content:JSON.stringify(content),
            type: this.createForm.type
          }).then(res => {
            this.isborderColor = false
            this.isBorderColor = false
            this.isVolumeBorderColor = false
            this.$message({
               message: this.$t('common.operationSucceeds'),
               type: 'success'
             });
           getPlanList({searchKey:this.searchVal,pageSize: this.listQuery.limit}).then(res => {
             this.tableData = res.data
           }).catch(err => {
             console.log(err)
           })

          }).catch(err => {
            this. delerrored()
            console.log(err)
          })


        }else {
          saveStrategy({
            name: this.createForm.name,
            content:JSON.stringify(content),
            type: this.createForm.type
          }).then(res => {
            this.isborderColor = false
            this.isBorderColor = false
            this.isVolumeBorderColor = false
            this.addSourceSuccess()
          }).catch(err => {
            this. delerrored()
            console.log(err)
          })
        }
        this.dialogVisible = false
      }},
      addVolume(type) {
        let volumeTimeArr = []
        this.createVol.timingVol.volList.filter(item => {
          volumeTimeArr.push(item.date)
        })
        const gthat = this
        let trueOrFalse = '1';
        let isVolumeDayCopy = false
        for(let i = 0,length = this.createVol.timingVol.volList.length;i<length;i++){
          for(let j = i+1,len = this.createVol.timingVol.volList.length;j<len;j++){
            $.each(gthat.createVol.timingVol.volList[i].weeks,function () {
              let that = this
              $.each(gthat.createVol.timingVol.volList[j].weeks,function () {
                if(that === this){
                 isVolumeDayCopy = true
                }else {
                    isVolumeDayCopy = false
                }
              })
            })
          }
        }
        let isVolumeTimeCopy = false
        if(isVolumeDayCopy === true){
          for(let i = 0,length = volumeTimeArr.length;i<length;i++){
            for(let j = i+1,len = volumeTimeArr.length;j<len;j++){
              if( volumeTimeArr[j][0] >  volumeTimeArr[i][0] &&  volumeTimeArr[j][0] < volumeTimeArr[i][1]){
                isVolumeTimeCopy = true
              }else if( volumeTimeArr[j][0] <  volumeTimeArr[i][0] &&  volumeTimeArr[j][1] > volumeTimeArr[i][0]){
                isVolumeTimeCopy = true
              }else if( volumeTimeArr[j][0] <  volumeTimeArr[i][1] &&  volumeTimeArr[j][1] > volumeTimeArr[i][1]){
                isVolumeTimeCopy = true
              }else {
                isVolumeTimeCopy = false
              }
            }
          }
        }else {
          isVolumeTimeCopy = false
        }
        this.isBorderColor = false
        this.isborderColor = false
        if(isVolumeTimeCopy === true){
          trueOrFalse = '2'
          //出现提示框以及标红
          this.dialogVisible = true
          this.isVolumeBorderColor = true
        }else {
          trueOrFalse = '1'
          this.dialogVisible = false
          this.isVolumeBorderColor = false
        }

        if(trueOrFalse === '1'){
        var content = []
        if(this.createVol.defaultVol.isOpen){
         for (let i in this.createVol.defaultVol.volList){
          /* delete this.createVol.defaultVol.volList[i].id
            content.push(this.createVol.defaultVol.volList[i])*/
           let obj = {}
           let planType =this.createVol.defaultVol.volList[i].planType;
           let volume = this.createVol.defaultVol.volList[i].volume;
           obj.planType = planType;
           obj.volume = volume
           content.push(obj)
         }
        }
        if (this.createVol.timingVol.isOpen){
         for (let j in this.createVol.timingVol.volList){
          /* delete this.createVol.timingVol.volList[j].id
           delete this.createVol.timingVol.volList[j].isAllCheckedWeek
           content.push(this.createVol.timingVol.volList[j])*/
           let obj = {}
           let date =this.createVol.timingVol.volList[j].date;
           let planType = this.createVol.timingVol.volList[j].planType;
           let volume = this.createVol.timingVol.volList[j].volume;
           let weeks = this.createVol.timingVol.volList[j].weeks;
           let weeksStr = weeks.join();
           let dateStr = date.join();
           obj.date = dateStr;
           obj.planType = planType;
           obj.volume = volume;
           obj.weeks = weeksStr;
           content.push(obj)
         }
        }
        if(type){
          saveStrategy({
            strategyId:this.createForm.id,
            name: this.createForm.name,
            type: this.createForm.type,
            content:JSON.stringify(content)
          }).then(res => {
            this.isborderColor = false
            this.isBorderColor = false
            this.isVolumeBorderColor = false
            this.$message({
              message: this.$t('common.operationSucceeds'),
              type: 'success'
            });
            getPlanList({searchKey:this.searchVal,pageSize: this.listQuery.limit}).then(res => {
              this.tableData = res.data
            }).catch(err => {
              console.log(err)
            })
          }).catch(err => {
            this. delerrored()
            console.log(err)
          })

        }else {
          saveStrategy({
            name: this.createForm.name,
            type: this.createForm.type,
            content:JSON.stringify(content)
          }).then(res => {
            this.isborderColor = false
            this.isBorderColor = false
            this.isVolumeBorderColor = false
            this.addSourceSuccess()
          }).catch(err => {
            this. delerrored()
            console.log(err)
          })
        }
      }},
      deletePlan(){
        this.$confirm(this.$t('accountManager.isDeletePlan'),this.$t('accountManager.attention'), {
          confirmButtonText: this.$t('accountManager.del'),
          cancelButtonText:this.$t('accountManager.cancle'),
          type: 'warning'
        }).then(() => {
          delStrategys(this.idstr).then(res => {
            this.addSourceSuccess();
            this.selectedCount = ""
          }).catch(err => {
            this.delerrored()
            console.log(err)
          })
          this.deleteEquip = ""
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('accountManager.deletedDeleted')
          });
        });



      },

      changezIndex(){
        this.isMarginTop = true
        this.wIndex = 1200
        this.zIndex = 1;
        this.isofficeShow = false
      },
      clickInput() {
         this.isChangePlan = true
      },
      changePlanType() {
        this.isChangePlan = true
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      clickOfficeHandle(data, node, component) {

      },
      checkOfficeHandle(data, checkedMap) {
        let checkedList = this.$refs['officeTree'].getCheckedKeys(); // 触发自定义勾选执行方法前，已经将勾选状态改变，故逻辑与点击处理相反
        if (checkedList.indexOf(data.id) > -1) { // 无选 -> 选中
          this.zIndex = 1200;
          this.wIndex = 1
          this.isMarginTop = false
         $('.el-transfer-panel input[type="checkbox"]').attr('disabled','disabled')
          this.isofficeShow = true
          this.$refs['officeTree'].setCurrentKey(data.id);
          this.curofficeId = data.id
          this.officeName = data.name
            let _this = this;
            let pageNo = 1;
            let pageSize = 17;
         //this.officeDataCopy = []
            //自调用，获取机构下所有的设备
          (function getoffices(){
            terminalPageByOffices({officeIds: _this.curofficeId,pageNo: pageNo}).then(res => {
              let arr = [], tmp = [];
              for(let key in res.data){
                let id = res.data[key].id
                let decimalId = res.data[key].decimalId
                let decaimalName = res.data[key].name
                let obj = {}
                obj.key = id
                obj.label = decaimalName
                obj.officeid = res.data[key].officeId;
                arr.push(obj)
              }

              //totalOfficeDataList 所有已选的设备
              _this.equipDatad.map(item => tmp.push(item.id) );
              _this.officeData.map(item => {
                tmp.push(item.key);
              })
              arr = arr.filter(item => {
                return tmp.indexOf(item.key) === -1;
              })
              _this.officeData.push(...arr);

              $('.cjc_isHidden').parents('.el-transfer-panel__item').hide();
              $('.cjc_isShow').parents('.el-transfer-panel__item').show();

              if (pageNo*pageSize < res.count) {
                pageNo++;
                getoffices();
              }else {
                  //过滤掉本机构的和右侧已存在的设备
                _this.officeData = _this.officeData.map(item => {
                  item.disabled = (item.officeid!==_this.curofficeId) && (_this.officeVal.indexOf(item.key)===-1);
                  return item
                });

              }
            }).catch(err => {
              console.log(err)
            })
          })()

        } else { // 已选 -> 去选
          this.$refs['officeTree'].setCheckedKeys([]);
          this.curofficeId = ''
          this.officeName = ''
        }
      },
      specialPlanChange(date){
        //console.log(date)
        if(!date){
            this.isSpecialDate = false
        }else{
          this.isSpecialDate = true
        }
//        if(date[0]<Date.now()){
//            //console.log('jfdlf')
//          this.createForm.specialPlan.planList.date=[Date.now(),Date.now()]
//        }
      },
      delDevice(){
        if(this.equipDatadCopy) {
          let arr = []
          for(let key in this.equipDatadCopy){
              arr.push(this.equipDatadCopy[key].id)
          }
          delStrategyterminal({strategyId:this.createForm.id,terminalIds:arr.join()}).then(res => {
                this.addSourceSuccess()
           }).catch(err => {
               this.delerrored
           console.log(err)
           })
        }
      },
      addDecial() {
        //this.totalOfficeDataList = this.officeVal;
        let officeV = this.officeVal.join();
        strategyRelatedTerminal({strategyId:this.createForm.id,terminalIds:officeV}).then(res => {
          this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          })
          this.dialogKey = "manager";
          this.dialogTitle = this.$t('planManager.deviceManagement');

         }).then(() => {
          this.delPlan = ""
          this.equipDatad = []
          strategyTerminal({strategyId :this.planId}).then(res => {
            this.equipDatad = res.data
          }).catch(err => {
            console.log(err)
          })
        }).catch(err => {
         console.log(err)
         })
        this.officeVal = []
        this.officeData = []
        this.isAddDevice = false

      },
      disassociation() {
          /*for (let k in this.equipDatadCopy){
              for (let j in this.equipDatad){
                  console.log(this.equipDatad[j].id)
                console.log(this.equipDatadCopy[k].id)
                  if (this.equipDatad[j].id === this.equipDatadCopy[k].id){
                      var index = this.equipDatad.indexOf(this.equipDatad[j].id)
                    console.log(index)
                    this.equipDatad.splice(index,1)
                  }
              }
          }*/
      },
      //获取机构下的设备列表
      handleSearchDev() {
        this.officeDataCopy = JSON.parse(JSON.stringify(this.officeData))
        terminalPageByOffices({officeIds:this.curofficeId,searchKey:this.searchV}).then(res => {
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

        }).catch(err => {
         console.log(err)
        })

        if(!this.searchV){
          this.officeData = this.officeDataCopy
        }

      },
      changeFn(data) {
        if(data ===  null){
          this.isSourceTimes = false
        }else{
            this.isSourceTimes = true
        }
      },
      isModifyNameFn(data) {
          if (data) {
            this.isChangePlan = true;
          }else{
            this.isChangePlan = false;
          }
      },
      changeSpecialFn(data){

        if(data ===  null){
          this.isSourceSpcialTimes = false
        }else{
          this.isSourceSpcialTimes = true
        }
      },

      handleChange(val, f, k) {
         if(this.officeVal.length !== 0){
           this.isAddDevice = true
         }else {
           this.isAddDevice = false
         }
      },

      isShowFn() {
        this.dialogKey = "manager";
        this.dialogTitle = this.$t('planManager.deviceManagement');

      },
      timePickFn(){
          this.isborderColor = false
      },
      changeModifySourceWeeklyTimes(data) {
        this.isChangePlan = true
        if(data ===null) {
              this.isModifySourceWeeklyTime = false
        }else  {
          this.isModifySourceWeeklyTime = true
        }
      },
      changeChoiseWeekly(data) {
        this.isChangePlan = true
        if(data === true){
            this.isChoiseWeekly = true
        }else{
            this.isChoiseWeekly = false
        }
      },
      changeChoiseSpecial(data) {
        this.isChangePlan = true
        if(data === true){
          this.isChoiseSpecial = true
        }else{
          this.isChoiseSpecial = false
        }
      },
      changeSpecialTime(data) {
       // this.isChangePlan = true
        if(data === null) {
          this.isModifySourceSpecialTime = false
        }else  {
          this.isModifySourceSpecialTime = true
        }
      },
      changeSpecialDay(data) {
        this.isChangePlan = true
        if(data ===null) {
          this.isModifySourceSpecialDay = false
        }else  {
          this.isModifySourceSpecialDay = true
        }
      },
      changeChoiseDefaultVolume(data) {
        this.isChangePlan = true
        if(data === true){
          this.isChoiseDefault = true
        }else{
          this.isChoiseDefault = false
        }
      },
      changeChoiseTimingVolume(data) {
        this.isChangePlan = true
        if(data === true){
          this.isChoiseTiming = true
        }else{
          this.isChoiseTiming = false
        }
      },

     addSourceSuccess() {
        this.$message({
            message: this.$t('common.operationSucceeds'),
            type: 'success'
          },
          getPlanList({pageSize: this.listQuery.limit}).then(res => {
            this.count = res.count
            this.tableData = res.data
            this.listLoading = false
          }).catch(err => {
            console.log(err)
          })
        );
        this.dialogVisible = false
      },
      delerrored() {
        this.$message.error(this.$t('common.operationFailure'));
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import "src/styles/mixin.scss";

  /* reset element-ui css */
  .planManager-wrapper {
    .el-dialog .el-dialog__body .el-transfer .el-transfer-panel{
      width: 320px;
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
.marginTop{
  margin-top: 330px !important;
}
.planManager-wrapper {
  .filter {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .total {
      flex: 1;
    }
    .selected {
      flex:1;
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
  .borderColor{
    border-radius: 5px;
    border: 1px solid #f00;
  }

  .create-dialog {
    @include scrollBar;
    max-height: 500px;
    overflow: auto;
  }
  .modify-dialog {
    @include scrollBar;
    max-height: 500px;
    overflow: auto;
  }
}
</style>
