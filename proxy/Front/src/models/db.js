
import { message, notification } from 'antd';
import constants from '../utils/constants';
// import ReconnectingWebSocket from '../utils/ReconnectingWebSocket';
import TimeCounter from '../utils/TimeCounter';
import moment from 'moment';

const Timer = new TimeCounter()
const { MAX_QUERY, FS_FMAX, EFF_MIN_LEN } = constants

var ws;

const INI_STATUS = 0;
const OPEN_STATUS = 1;
const ERROR_STATUS = 2;
const CLOSE_STATUS = 3;

var WebscoketStatus = INI_STATUS;

function init({ dispatch, sendMsg }) {
  // Connect to Web Socket
  ws = new WebSocket("ws://localhost:9001/");
  // Set event handlers.
  ws.onopen = function () {
    output("与服务端成功建立连接");
    WebscoketStatus = OPEN_STATUS;
    sendMsg && sendMsg();
  };

  ws.onmessage = function (e) {
    // e.data contains received string.
    e.data && dispatch({
      type: 'receivedMsg',
      payload: {
        data: e.data,
        dispatch
      }
    })
  };

  ws.onclose = function () {
    output("服务断开了");
    if (WebscoketStatus === OPEN_STATUS) {
      dispatch({
        type: 'processException'
      })
      return notification.error({
        duration: null,
        message: '与服务连接断开或服务出错',
        description: '请打开新的页面进行检测（提示：可以点击复制，去新页面查剩余未检测的文本。原页面不再可用，看完详情就可以关闭）...',
      });
    }
    if (WebscoketStatus === INI_STATUS) {
      return notification.error({
        duration: null,
        message: '服务未开启',
        description: '请先通过命令行启动服务，再刷新此页面',
      });
    }
  };
  ws.onerror = function (e) {
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
    isServiceDown: false,
    progressPercent: 0,
    createPercent: '待检测',
    startTime: '--:--:--',
    times: '00:00:00',
    usefulProxyNum: '',
    hasException: false
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      !ws && dispatch({
        type: 'openWebSocket',
        payload: {
          dispatch,
        }
      })
    },
  },

  effects: {
    *openWebSocket({ payload: { dispatch, sendMsg } }, { call, put, select }) {
      ws && ws.close();
      yield init({ dispatch, sendMsg });
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
      if (WebscoketStatus === INI_STATUS) return message.warning('服务未开启，请先通过命令行启动服务，再刷新此页面', 3);
      if (!text) return message.warning('请输入文本', 3);
      console.log('开始检测，字数共', text.length)
      let _text = text.substring(0, MAX_QUERY);
      const tbdata = [_text];
      while (_text.length >= MAX_QUERY) {
        const len = tbdata.length;
        _text = text.substring(MAX_QUERY * FS_FMAX * len, MAX_QUERY * (FS_FMAX * len + 1));
        tbdata[len] = _text;
      }
      if (tbdata[tbdata.length - 1].length < EFF_MIN_LEN && tbdata.length > 1) tbdata.pop();
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
            sendMsg: () => { sendMessage(tbdata) }
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
          startTime: '--:--:--',
          tbdata: [],
          result: []
        }
      })
    },
    *receivedMsg({ payload: { data, dispatch } }, { call, put, select }) {
      const { result, tbdata } = yield select(state => state.db);
      // 如果收到IP被封禁消息,提示用户
      if (data === '"WAIT"') {
        notification.error({
          duration: 600,
          message: '服务中断通知',
          description: '检测到要人工输入验证码或IP被封禁，停止查重。请打开360搜索进行验证，验证后，请开新页面进行查重。如果查重立即又被封，请十分钟后再开新页面进行查重。否则继续到360搜索去验证...',
        });
        yield put({
          type: 'processException'
        })
        setTimeout(() => {
          notification.error({
            duration: null,
            message: '十分钟已过',
            description: '现在可以在新页面进行检测了，或者，刷新本页面进行检测...',
          });
        }, 600000)
        return;
      } else if (data === '"KEEP"') {
        console.warn('WebSocket Connection：保持与服务的连接')
        // 保持通信连接，什么也不做
        return;
      } else if (data && data[1] === 'U' && data[data.length - 2] === 'U') {
        // 返回有效代理IP数量
        const usefulProxyNum = data.slice(2, data.length - 2);
        console.log('有效代理IP数量：', usefulProxyNum)
        yield put({
          type: 'save',
          payload: {
            usefulProxyNum
          }
        });
        return;
      }
      let msg = {};
      try {
        msg = JSON.parse(data);
        // 飘红算法，取最大值
        msg.redshot = max(msg.redlist.map(emlist => {
          return max(emlist)
        }))
      } catch (err) {
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
        const totalCheck = tbdataLen * MAX_QUERY + tbdata[tbdataLen - 1].length - MAX_QUERY;
        const redshotList = result.map(res => res.redshot);
        const redshotNum = resultLen ? redshotList.reduce((prev, next) => prev + next) : 0;
        const redPercent = 100 * (totalCheck - redshotNum) / totalCheck;
        createPercent = totalCheck ? `${(redPercent >= 0 ? redPercent : 0).toFixed(2)}%` : '0%';
      }
      yield put({
        type: 'save',
        payload: {
          result,
          loading,
          progressPercent: tbdataLen ? Number((100 * resultLen / tbdataLen).toFixed(2)) : 0,
          createPercent
        }
      });
      if (!loading) {
        Timer.Stop();
        message.success('检测结束', 3);
      }
    },
    *processException({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: {
          hasException: true,
          loading: false
        }
      })
      Timer.Stop();
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
