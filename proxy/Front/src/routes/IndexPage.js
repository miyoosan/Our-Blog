import React from 'react';
import { connect } from 'dva';
import { Input, Button, Row, Col, Table, Progress, Tooltip, Icon, message } from 'antd';
import styles from './IndexPage.css';
import Clipboard from '../utils/Clipboard';

const clipboard = new Clipboard();

function checkTxt(e, dispatch) {
  // 去除空格和回车换行符
  let text = e.target.value.replace(/[\s]||[\r]/g, '');
  dispatch({
    type: 'db/save',
    payload: {
      text,
      inputText: e.target.value
    }
  })
}

const columns = [{
  title: '已检测文本',
  dataIndex: 'keyword',
  render: (text, record) => {
    return <span style={{ color: record.error ? 'red' : 'rgba(0, 0, 0, 0.65)' }}>{text}</span>
  }
}, {
  title: '代理IP',
  dataIndex: 'proxy',
  width: '200px'
}, {
  title: '飘红',
  dataIndex: 'redshot',
  width: '100px',
  sorter: (a, b) => a.redshot - b.redshot,
  render: (text, record) => {
    return <span style={{ color: `${text}` !== '0' ? 'red' : 'rgba(0, 0, 0, 0.65)' }}>{text}</span>
  }
}, {
  title: '操作',
  dataIndex: 'relinks',
  width: '100px',
  render: (text, record) => {
    return <a href={`https://www.so.com/s?q=${encodeURIComponent(record.keyword)}`} target="_blank" rel="noopener noreferrer">查看详情</a>
  }
}]

function checkDuplicate(e, dispatch) {
  dispatch({
    type: 'db/checkDuplicate',
    payload: {
      dispatch
    }
  })
}

function clearChecktext(e, dispatch) {
  dispatch({
    type: 'db/clearChecktext'
  })
}

function getCopyText(state) {
  const { text, inputText, result, tbdata } = state;
  let copytext = inputText;
  if (result.length > 1 && result.length !== tbdata.length) {
    const lastCheckedText = result[result.length-1].keyword;
    copytext = text.slice(text.indexOf(lastCheckedText)+lastCheckedText.length,text.length);
  }
  return copytext;
}

function IndexPage({ dispatch, history, location, match, staticContext, ...state }) {
  const { text, inputText, result, createPercent, progressPercent, loading, startTime, usefulProxyNum, hasException } = state;
  return (
    <div className={styles.normal}>
      <h1 className={styles.title}>Novel Duplication</h1>
      <Input.TextArea
        value={inputText}
        autosize={{ minRows: 6, maxRows: 6 }}
        placeholder="待检测文本，仅支持360查重"
        onChange={e => checkTxt(e, dispatch)}
      />
      <Row className={styles.actionRow}>
        <Col span={4} className={styles.actionCol}>
          <Button onClick={e => checkDuplicate(e, dispatch)} disabled={hasException} loading={loading} type="primary">{hasException ? '无法检测' : loading ? '检测中' : '开始检测'}</Button>
          <Button onClick={e => clearChecktext(e, dispatch)}>清空文本</Button>
        </Col>
        <Col span={20} className={styles.progressCol}>
          <span>检测时刻：{startTime}</span>
          <span className={styles.times}>耗时：<span id="times">00:00:00</span></span>
          <span>进度：</span>
          <Progress
            percent={progressPercent}
            status={progressPercent === 100 ? 'success' : 'active'}
            strokeWidth={18}
          />
          <span className={styles.totalText}>已测/总字数：{Math.round(progressPercent*text.length/100)}/{text.length}字</span>
          <span>360原创度：{createPercent}</span>
          <span style={{ padding: '0 16px 0 32px' }}><a href="/" target="_blank" rel="noopener noreferrer">新页面</a></span>
          <span><Tooltip title="复制未检测到的文本">
            <a onClick={(e=> {
                if(clipboard.copy(getCopyText(state))) {
                  message.success('复制成功');
                }
                e.stopPropagation();
              })}>
              复制<Icon type="copy" />
            </a>
          </Tooltip>
          </span>
          {/* <span style={{ paddingLeft: '16px' }}>
            <a href="http://127.0.0.1:5010/get_all" target="_blank" rel="noopener noreferrer" title="代理IP列表">
              代理IP：{usefulProxyNum || 0}
            </a>
          </span> */}
        </Col>
      </Row>
      <Table
        dataSource={result}
        columns={columns}
        size="default"
        rowKey="keyword"
      />
    </div>
  );
}

IndexPage.propTypes = {
};

function mapStateToProps(state) {
  return {
    ...state.db
  }
}

export default connect(mapStateToProps)(IndexPage);
