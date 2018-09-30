/**
 * Created by jiachenpan on 16/11/18.
 */

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

// 格式化时间
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 *get getByteLen
 * @param {Sting} val input value
 * @returns {number} output value
 */
export function getByteLen(val) {
  let len = 0
  for (let i = 0; i < val.length; i++) {
    if (val[i].match(/[^\x00-\xff]/ig) != null) {
      len += 1
    } else { len += 0.5 }
  }
  return Math.floor(len)
}

export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

export function param(json) {
  if (!json) return ''
  return cleanArray(Object.keys(json).map(key => {
    if (json[key] === undefined) return ''
    return encodeURIComponent(key) + '=' +
      encodeURIComponent(json[key])
  })).join('&')
}

export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function objectMerge(target, source) {
  /* Merges two  objects,
   giving the last one precedence */

  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

export function scrollTo(element, to, duration) {
  if (duration <= 0) return
  const difference = to - element.scrollTop
  const perTick = difference / duration * 10
  setTimeout(() => {
    console.log(new Date())
    element.scrollTop = element.scrollTop + perTick
    if (element.scrollTop === to) return
    scrollTo(element, to, duration - 10)
  }, 10)
}

export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

export const pickerOptions = [
  {
    text: '今天',
    onClick(picker) {
      const end = new Date()
      const start = new Date(new Date().toDateString())
      end.setTime(start.getTime())
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一周',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }]

export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 *  递归遍历树，获取某节点及其所有子节点某属性的值，以数组形式展示
 *  source      对象   遍历的树
 *  source.data 对象   数据节点的数据对象
 *  key         字符串 获取的属性名
 *  childKey    字符串 子节点数组属性名
 *
 *  return      数组   结果
 *
 *  仅能在结合 element-ui tree 控件下使用,仅供参考
 *  注意：遍历的层级超过 8000 会导致栈溢出，建议 try catch 一下
 * */
export function BFS(source, key, childKey) {
  let res = [];

  !(function traverseTree(tree){
    if (!tree || !tree.data || !tree.data[key]) return;
    res.push(tree.data[key])

    if (tree[childKey] && tree[childKey].length > 0) {
      let len = tree[childKey].length

      for (let i=0; i < len; i++) {
        traverseTree(tree[childKey][i]);
      }
    }
  })(source)

  return uniqueArr(res);
}

/**
 *  递归遍历树，获取某节点的所有子节点对象，以数组形式展示（不包括本节点）
 *  source      对象   遍历的树
 *  childKey    字符串 子节点数组属性名
 *
 *  return      数组   结果
 *
 *  注意：遍历的层级超过 8000 会导致栈溢出，建议 try catch 一下
 * */
export function getChildrenByBFS(source, childKey) {
  let res = [];

  !(function traverseTree(tree){
    if (!tree) return;

    if (tree[childKey] && tree[childKey].length > 0) {
      let len = tree[childKey].length

      for (let i=0; i < len; i++) {
        res.push(tree[childKey][i])
        traverseTree(tree[childKey][i]);
      }
    }
  })(source)

  return res;
}

/**
 *  递归遍历树，统一设置某节点的所有子节点某属性的值（不包括根节点，会改变原数组）
 *  source      对象   遍历的树
 *  source.data 对象   数据节点的数据对象
 *  key         字符串 获取的属性名
 *  val         无限制 设置的属性值
 *  childKey    字符串 子节点数组属性名
 *  idKey       字符串 类似id的区分属性名
 *
 *  return      null
 *
 *  仅能在结合 element-ui tree 控件下使用,仅供参考
 *  注意：遍历的层级超过 8000 会导致栈溢出，建议 try catch 一下
 * */
export function setBFS(tree, key, val, childKey, idKey) {
  if (!tree) return;

  if (tree[idKey]) tree[key] = val;

  if (tree[childKey] && tree[childKey].length > 0) {
    let len = tree[childKey].length;

    for (let i=0; i < len; i++) {
      setBFS(tree[childKey][i], key, val, childKey, idKey);
    }
  }
}

/**
 *  构造树
 *  data      数组   扁平的数组
 *  idKey     字符串 id属性名
 *  parentKey 字符串 父id属性名
 *  childKey  字符串 子节点数组属性名
 *
 *  return    对象   树
 *
 *  注意：此方法根节点不能有 parentKey ！！！
 * */
export function treeify(data, idKey, parentKey, childKey) {
  var disposable = {}, top, item;

  for (var index in data) {
    item = data[index];

    if (!(item[idKey] in disposable)) {
      disposable[item[idKey]] = [];
    }

    if (!(item[parentKey] in disposable)) {
      disposable[item[parentKey]] = [];
    }

    item[childKey] = disposable[item[idKey]];

    if (item[parentKey]) {
      disposable[item[parentKey]].push(item);
    } else {
      top = item;
    }
  }

  return top;
}

/**
 *  递归遍历树，获取某节点的所有父节点某属性的值
 *
 *  仅能在结合 element-ui tree 控件下使用,仅供参考
 * */

/**
 getParentOfficeKey(pid, key) {
   if (pid && this.$refs.officeTree.getNode(pid)) {
     let curNode = this.$refs.officeTree.getNode(pid).data;
     if (pid === curNode.pid) {
       console.log('机构树id重复，陷入死循环...');
       return '/--';
     }

     return '/' + curNode[key||'label'] + this.getParentOfficeKey(curNode.pid, key||'label')
   } else {
     return '';
   }
 }
* */

/**
 *  时间戳格式化
 * */
export function formatDate(date,fmt){
  if(/(y+)/.test(fmt)){
    fmt = fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4-RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth()+1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for(let k in o){
    let str = o[k]+'';
    if(new RegExp(`(${k})`).test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1)?str:padLeftZero(str));
    }
  }
  return fmt;
};

function padLeftZero(str){
  return ('00'+str).substr(str.length);
}

/**
 *  对象数组根据指定元素属性进行分类，返回一个根据此属性区分的对象（默认附带倒排序）
 * */

export function listClassify(list, key, between) {
  if (!list || list.length===0) return null;

  let obj = {};

  list.reduce(function (total, item) {
    if (total.indexOf(Math.floor(item[key]/between)) === -1) {
      total.push(Math.floor(item[key]/between));
      obj[Math.floor(item[key]/between)] = [];
    }

    obj[Math.floor(item[key]/between)].push(item);

    return total;
  }, []);

  obj = Object.keys(obj).map(item => {
    obj[item].sort((now, next) => {
      return next[key] - now[key];
    });
    return obj[item];
  });

  return obj;
}

/**
 *  对象数组根据指定元素属性进行分类，返回一个根据此属性区分的对象
 *  key 不能为 'undefined'
 * */

export function listClassifyMap(list, key) {
  if (!list || list.length===0) return null;

  let obj = {
    'undefined': []
  };

  list.reduce(function (total, item) {
    if (item.hasOwnProperty(key) && item[key]) {
      if (total.indexOf(item[key]) === -1) {
        total.push(item[key]);
        obj[item[key]] = [];
      }

      obj[item[key]].push(item);
    } else {
      obj['undefined'].push(item);
    }

    return total;
  }, []);

  return obj;
}

/**
 *  图片自适应处理函数（基于JQ的DOM操作）
 *
 * */
export function imgHistoryScreenCapture(src,o){
  updateImgRatio(src,function(imgWidth,imgHeight,o){
    //对象
    var obj =  o;
    var p = obj.parent();
    //父宽高
    var pw = p.width();
    var ph = p.height();
    //img对父比例
    var pws = pw/imgWidth;
    var phs = ph/imgHeight;
    var tw,th,tt,tl;

    if(pws > phs){
      //横
      tw = imgWidth*phs;
      th = imgHeight*phs;
      tt = 0;
      tl = (pw - tw)/2;

    }else{
      //竖
      tw = imgWidth*pws;
      th = imgHeight*pws;
      tl = 0;
      tt = (ph - th)/2;
    }
    obj.css("margin-top",tt+'px');
    obj.css("margin-left",tl+'px');
    obj.animate({width:tw+'px',height:th+'px'});
  },o);
}

/**
 * 更新图片分辨率(异步、公用)
 * @param src 图片路径
 * @param func 参数为自定义方法，参数1是是图片宽，参数2是图片高,参数3是传入的str
 * @param str func方法第3个参数（如果自定义方法没用到，可以不传该参数）
 */
export function updateImgRatio(src,func,str){
  //更新图片分辨率
  var img = new Image();
  img.src = src;
  img.onload = function(){
    func(img.width,img.height,str);
  };
}
