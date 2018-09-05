from WebSocket.WebsocketServer import WebsocketServer
import requests
import json
import time
from bs4 import BeautifulSoup
from Manager.ProxyManager import ProxyManager
from flask import jsonify
from Util.LogHandler import LogHandler

log = LogHandler('spider_getHtml')

def get_proxy():
    proxy = ProxyManager().get()
    return proxy if proxy else None

def delete_proxy(proxy):
    ProxyManager().delete(proxy)

def get_useful_proxy():
    useful_proxy = ProxyManager().getUsefulNumber()
    return useful_proxy

# Called for every client connecting (after handshake)
def new_client(client, server):
    print("检测到网页断开websocket连接，重新连接服务...")
    print("服务连接成功")
    useful_proxy = 'U' + get_useful_proxy() + 'U'
    server.send_message(client, json.dumps(useful_proxy))
    # server.send_message_to_all("Hey all, a new client has joined us")


# Called for every client disconnecting
def client_left(client, server):
    print("Client(%d) disconnected" % client['id'])


# your spider code
def getHtml(keyword):
    # ....
    retry_count = 5
    proxy = get_proxy()
    # print('proxy============{}'.format(proxy))
    while retry_count > 0:
        try:
            # 使用代理访问
            res = requests.get('https://www.so.com/s?q={}'.format(keyword), proxies={'http': 'http://{}'.format(proxy)})
            
            soup = BeautifulSoup(res.content.decode('utf-8', 'ignore'), 'html.parser')
            res_list = soup.body.find_all('li', 'res-list')
            em_list = [[len(y.get_text()) for y in x.find_all('em')] for x in res_list]
            # # [[3, 5, 12], [1, 2]]
            print('请求状态码=={}, 飘红列表={}'.format(res, em_list))
            return { 'em_list': em_list, 'proxy_ip': proxy }
        except Exception:
            retry_count -= 1
    # 出错5次, 删除代理池中代理
    delete_proxy(proxy)
    return { 'em_list': [[]], 'proxy_ip': proxy }


# Called when a client sends a message
def message_received(client, server, message):
    msg = []
    try:
        print("将对此文本进行检测: %s" % (message))
        # msg = [{ 'keyword': x } for x in json.loads(message, encoding='utf-8-sig')]
        # for x in msg:
        msg = { 'keyword': json.loads(message, encoding='utf-8-sig') }
        check_result = getHtml(msg['keyword'])
        redlist = check_result['em_list']
        proxy_ip = check_result['proxy_ip']
        server.res_counter += 1
        listlen = len(redlist)
        server.res_empty_counter += str(listlen)
        # 如果检测到IP被封禁，休眠五分钟零2秒，并通知页面，显示被封禁的提示
        if listlen == 0:
            if server.res_counter >= 590 or '0000' in server.res_empty_counter:
                server.send_message(client, json.dumps('WAIT'))
                print('检测到IP被封禁，暂停五分钟')
                count = 10
                while count>0:
                    time.sleep(30)
                    count -= 1
                    # 每隔30秒与页面通信，保持链接
                    server.send_message(client, json.dumps('KEEP'))
                server.res_counter = 0
                server.res_empty_counter = ''
        msg['redlist'] = redlist
        msg['proxy'] = proxy_ip
        server.send_message(client, json.dumps(msg))
        # server.send_message(client, json.dumps('block_detected'))
        time.sleep(0.1)
    except Exception as e:
        print('检测服务出现错误，请另开页面进行检测')



def run():
    PORT=9001
    server = WebsocketServer(PORT)
    server.res_counter = 0
    server.res_empty_counter = ''
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    print('服务开启！最好十秒后再打开检测网址...')
    server.run_forever()

if __name__ == 'main':
    run()

