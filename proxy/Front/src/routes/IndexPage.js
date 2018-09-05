import React from 'react';
import { connect } from 'dva';
import { Input, Button, Row, Col, Table, Progress, Tooltip, Icon, message } from 'antd';
import styles from './IndexPage.css';


const defaultMessage = 'Copy to clipboard: #{key}, Enter';

function deselectCurrent () {
  var selection = document.getSelection();
  if (!selection.rangeCount) {
    return function () {};
  }
  var active = document.activeElement;

  var ranges = [];
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i));
  }

  switch (active.tagName.toUpperCase()) { // .toUpperCase handles XHTML
    case 'INPUT':
    case 'TEXTAREA':
      active.blur();
      break;

    default:
      active = null;
      break;
  }

  selection.removeAllRanges();
  return function () {
    selection.type === 'Caret' &&
    selection.removeAllRanges();

    if (!selection.rangeCount) {
      ranges.forEach(function(range) {
        selection.addRange(range);
      });
    }

    active &&
    active.focus();
  };
};

function format(message) {
  var copyKey = (/mac os x/i.test(navigator.userAgent) ? '⌘' : 'Ctrl') + '+C';
  return message.replace(/#{\s*key\s*}/g, copyKey);
}

function copy(text, options) {
  var debug, message, reselectPrevious, range, selection, mark, success = false;
  if (!options) { options = {}; }
  debug = options.debug || false;
  try {
    reselectPrevious = deselectCurrent();

    range = document.createRange();
    selection = document.getSelection();

    mark = document.createElement('span');
    mark.textContent = text;
    // reset user styles for span element
    mark.style.all = 'unset';
    // prevents scrolling to the end of the page
    mark.style.position = 'fixed';
    mark.style.top = 0;
    mark.style.clip = 'rect(0, 0, 0, 0)';
    // used to preserve spaces and line breaks
    mark.style.whiteSpace = 'pre';
    // do not inherit user-select (it may be `none`)
    mark.style.webkitUserSelect = 'text';
    mark.style.MozUserSelect = 'text';
    mark.style.msUserSelect = 'text';
    mark.style.userSelect = 'text';

    document.body.appendChild(mark);

    range.selectNode(mark);
    selection.addRange(range);

    var successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('copy command was unsuccessful');
    }
    success = true;
  } catch (err) {
    debug && console.error('unable to copy using execCommand: ', err);
    debug && console.warn('trying IE specific stuff');
    try {
      window.clipboardData.setData('text', text);
      success = true;
    } catch (err) {
      debug && console.error('unable to copy using clipboardData: ', err);
      debug && console.error('falling back to prompt');
      message = format('message' in options ? options.message : defaultMessage);
      window.prompt(message, text);
    }
  } finally {
    if (selection) {
      if (typeof selection.removeRange == 'function') {
        selection.removeRange(range);
      } else {
        selection.removeAllRanges();
      }
    }

    if (mark) {
      document.body.removeChild(mark);
    }
    reselectPrevious();
  }

  return success;
}


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

function IndexPage({ dispatch, history, location, match, staticContext, ...state }) {
  const { text, inputText, result, createPercent, tbdata, progressPercent, loading, startTime } = state;
  let copytext = inputText;
  if (result.length > 1 && result.length !== tbdata.length) {
    const lastCheckedText = result[result.length-1].keyword;
    copytext = text.slice(text.indexOf(lastCheckedText)+lastCheckedText.length,text.length);
  }
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
          <Button onClick={e => checkDuplicate(e, dispatch)} loading={loading} type="primary">{loading ? '检测中' : '开始检测'}</Button>
          <Button onClick={e => clearChecktext(e, dispatch)}>清空文本</Button>
        </Col>
        <Col span={20} className={styles.progressCol}>
          <span>开始时间：{startTime}</span>
          <span className={styles.times}>检测耗时：<span id="times">00:00:00</span></span>
          <span>检测进度：</span>
          <Progress
            percent={progressPercent}
            status={progressPercent === 100 ? 'success' : 'active'}
            strokeWidth={18}
          />
          <span className={styles.totalText}>总字数：{text.length}字</span>
          <span>360原创度：{createPercent}</span>
          <span style={{ padding: '0 16px' }}><a href="/" target="_blank" rel="noopener noreferrer">打开新页面</a></span>
          <span><Tooltip title="复制未检测到的文本">
            <a onClick={(e=> {
                if(copy(copytext)) {
                  message.success('复制成功');
                }
                e.stopPropagation();
              })}>
              复制<Icon type="copy" />
            </a>
          </Tooltip>
          </span>
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
