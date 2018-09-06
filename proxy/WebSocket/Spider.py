from WebSocket.WebsocketServer import WebsocketServer
import requests
import json
import time
from bs4 import BeautifulSoup
from Manager.ProxyManager import ProxyManager
from flask import jsonify
from Util.LogHandler import LogHandler
from fake_useragent import UserAgent
import threading

log = LogHandler('spider_getHtml')

ua = UserAgent()
request_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1'
}

def get_proxy():
    proxy = ProxyManager().get()
    return proxy if proxy else None

def delete_proxy(proxy):
    ProxyManager().delete(proxy)

def get_useful_proxy():
    useful_proxy = ProxyManager().getUsefulNumber()
    return useful_proxy

clientQueque = []

def send_message_to_client(client,server):
    # 保持连接6个小时，每隔三十秒与网页通信
    try:
        keep_alive_count = 720
        while keep_alive_count > 0:
            server.send_message(client, json.dumps('KEEP'))
            keep_alive_count -= 1
            time.sleep(30)
        print("网页(%d)号将断开服务连接" % client['id'])
    except Exception:
            print('一个网页已经断开连接')

# Called for every client connecting (after handshake)
def new_client(client, server):
    print("网页(%d)号连接服务成功" % client['id'])
    useful_proxy = 'U' + get_useful_proxy() + 'U'
    server.send_message(client, json.dumps(useful_proxy))
    t = threading.Timer(1, send_message_to_client, (client,server,))
    t.start()
    # server.send_message_to_all("Hey all, a new client has joined us")


# Called for every client disconnecting
def client_left(client, server):
    print("网页(%d)号断开服务连接" % client['id'])


# your spider code
def getHtml(keyword):
    # ....
    retry_count = 5
    proxy = get_proxy()
    # print('proxy============{}'.format(proxy))
    while retry_count > 0:
        try:
            # 使用代理访问
            global ua
            global request_headers
            headers = request_headers
            headers['User-Agent'] = ua.random
            print('User-Agent={}'.format(headers['User-Agent']))
            res = requests.get('https://www.so.com/s?q={}'.format(keyword), headers=headers, proxies={'http': 'http://{}'.format(proxy)}, timeout=5)
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
        # server.res_counter += 1
        listlen = len(redlist)
        server.res_empty_counter += str(listlen)
        # 如果检测到IP被封禁，休眠十分钟，并通知页面，显示被封禁的提示
        if listlen == 0:
            if '00000' in server.res_empty_counter:
                server.send_message(client, json.dumps('WAIT'))
                print('检测到IP被封禁，停止查重')
                server.res_empty_counter = ''
                time.sleep(1)
                raise Exception('检测到IP被封禁，停止查重')
        msg['redlist'] = redlist
        msg['proxy'] = proxy_ip
        server.send_message(client, json.dumps(msg))
    except Exception as e:
        print('检测服务出现错误，请另开页面进行检测')
        server._client_left_(client)
        time.sleep(60000)



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

