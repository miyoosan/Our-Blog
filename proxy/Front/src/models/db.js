
import { message, notification } from 'antd';
import constants from '../utils/constants';
import ReconnectingWebSocket from '../utils/ReconnectingWebSocket';
import TimeCounter from '../utils/TimeCounter';
import moment from 'moment';

const Timer = new TimeCounter()
const { MAX_QUERY, FS_FMAX, EFF_MIN_LEN } = constants

var ws;

function init(dispatch, callback) {
  // Connect to Web Socket
  ws = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  ws.onopen = function() {
    output("与服务端成功建立连接");
    callback && callback();
  };

  ws.onmessage = function(e) {
    // e.data contains received string.
    e.data && dispatch({
      type: 'receivedMsg',
      payload: {
        data: e.data,
        dispatch
      }
    })
  };

  ws.onclose = function() {
    notification.error({
      duration: null,
      message: '与服务连接断开或服务出错',
      description: '请打开新的页面进行检测（提示：可以查看结果表格最后一页最后一条记录，看检测到哪段文本了，然后再复制粘贴剩下的去新页面查。原页面不再可用，看完详情就可以关闭）...',
    });
    output("服务关闭了");
  };
  ws.onerror = function(e) {
    output("服务出错了");
  };
}

function sendMessage(data) {
  for (let i = 0; i < data.length; i++) {
    ws.send(JSON.stringify(data[i]))
  }
}

function output(str) {
  console.warn('WebSocket Connection：', str)
}

function max(arr) {
  if (!arr.length) return 0;
  return Math.max.apply(null, arr);
}

export default {

  namespace: 'db',

  state: {
    text: '',
    tbdata: [],
    result: [],
    loading: false,
    inputText: undefined,
    progressPercent: 0,
    createPercent: '待检测',
    startTime: '无',
    times: '00:00:00'
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      !ws && dispatch({
        type: 'openWebSocket',
        payload: {
          dispatch
        }
      })
    },
  },

  effects: {
    *openWebSocket({ payload: { dispatch, callback } }, { call, put, select }) {
      ws && ws.close();
      yield init(dispatch, callback);
    },
    *checkDuplicate({ payload: { dispatch } }, { call, put, select }) {  // eslint-disable-line
      // 清空缓存与结果
      Timer.Reset();
      yield put({
        type: 'save',
        payload: {
          tbdata: [],
          result: [],
          progressPercent: 0,
          createPercent: '待检测'
        }
      })
      // 获取待检测的文本
      const { text } = yield select(state => state.db);
      if (!text) return message.warning('请输入文本', 3);
      console.log('开始检测，字数共', text.length)
      let _text = text.substring(0, MAX_QUERY);
      const tbdata = [_text];
      while(_text.length >= MAX_QUERY) {
        const len = tbdata.length;
        _text = text.substring(MAX_QUERY*FS_FMAX*len, MAX_QUERY*(FS_FMAX*len+1));
        tbdata[len] = _text;
      }
      if(tbdata[tbdata.length-1].length < EFF_MIN_LEN && tbdata.length > 1) tbdata.pop();
      console.log('tbdata.length', tbdata.length)
      // 由于Python json decode的长度限制，(46252)，所以MAX_QUERY=34的时候，对tbdata进行分割
      // 1200*34= 40800 < 46252
      // let _data = [];
      // let index = 0;
      // while(tbdata.length > 0) {
      //   _data[index] = tbdata.splice(0, 1200);
      //   index += 1;
      // }
      // 开始统计进度，提示正在检测
      yield put({
        type: 'save',
        payload: {
          tbdata: tbdata,
          loading: true,
          startTime: moment().format('HH:mm:ss')
        }
      });
      Timer.Start();
      if (ws.readyState !== 1) {
        yield put({
          type: 'openWebSocket',
          payload: {
            dispatch,
            callback: () => { sendMessage(tbdata) }
          }
        })
      } else {
        // 将分段好的数据发送给后端，让爬虫开始工作。每当一个爬虫返回结果，就刷新一次tbdata
        sendMessage(tbdata)
      }
    },
    *clearChecktext({ payload }, { call, put, select }) {
      Timer.Reset();
      yield put({
        type: 'save',
        payload: {
          text: '',
          inputText: undefined,
          progressPercent: 0,
          createPercent: '待检测',
          startTime: '无',
          tbdata: [],
          result: []
        }
      })
    },
    *receivedMsg({ payload: { data, dispatch } }, { call, put, select }) {
      const { result, tbdata } = yield select(state => state.db);
      // 如果收到IP被封禁消息,提示用户，五分钟后检测ws链接状态，如果已断开，就重连
      if (data === '"block_detected"') {
          notification.error({
            duration: null,
            message: 'IP被封禁通知',
            description: '检测到IP被封禁，暂停五分钟，过后会自动继续检测，请耐心等待...',
          });
          // setTimeout(() => {
          //   if (ws.readyState !== 1) {
          //     init(dispatch);
          //   }
          // }, 300000)
          return;
      } else if (data === 'keep_alive') {
        // 保持通信连接，什么也不做
        return;
      }
      let msg = {};
      try {
        msg = JSON.parse(data);
        // 飘红算法，取最大值
        msg.redshot = max(msg.redlist.map(emlist => {
          return max(emlist)
        }))
      } catch(err) {
        msg = {
          keyword: `Oh!检测出错了：${unescape((data || '').replace(/\\u/g, '%u'))}`,
          redshot: 0,
          error: true
        }
      }
      result[result.length] = msg;
      const resultLen = result.length;
      const tbdataLen = tbdata.length;
      const loading = resultLen !== tbdataLen;
      let createPercent = '待检测';
      if (!loading) {
        const totalCheck = tbdataLen*MAX_QUERY + tbdata[tbdataLen-1].length - MAX_QUERY;
        const redshotList = result.map(res => res.redshot);
        const redshotNum = resultLen ? redshotList.reduce((prev, next) => prev + next) : 0;
        const redPercent = 100*(totalCheck-redshotNum)/totalCheck;
        createPercent = totalCheck ? `${(redPercent >= 0 ? redPercent : 0).toFixed(2)}%` : '0%';
      }
      yield put({
        type: 'save',
        payload: {
          result,
          loading,
          progressPercent: tbdataLen ? Number((100*resultLen/tbdataLen).toFixed(2)) : 0,
          createPercent
        }
      });
      if (!loading) {
        Timer.Stop();
        message.success('检测结束', 3);
      }
    },
    *closeWebSocket({ payload }, { call, put, select }) {
      yield ws.close();
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
