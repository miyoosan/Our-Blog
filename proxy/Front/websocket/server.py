from websocket_server import WebsocketServer
import requests
import json
import time
from bs4 import BeautifulSoup

# Called for every client connecting (after handshake)
def new_client(client, server):
    print("New client connected and was given id %d" % client['id'])
    # server.send_message_to_all("Hey all, a new client has joined us")


# Called for every client disconnecting
def client_left(client, server):
    print("Client(%d) disconnected" % client['id'])


# your spider code
def getHtml(keyword):
    # ....
    retry_count = 5
    # proxy = get_proxy()
    while retry_count > 0:
        try:
            # 使用代理访问
            res = requests.get('https://www.so.com/s?q={}'.format(keyword))
            soup = BeautifulSoup(res.text[:], 'html.parser')
            res_list = soup.body.find_all('li', 'res-list')
            em_list = [[len(y.get_text()) for y in x.find_all('em')] for x in res_list]
            # em_list = []
            # for x in res_list:
            #   # 取出所有em元素
            #   res_em = x.find_all('em')
            #   text_list = []
            #   for y in res_em:
            #     # 取出em元素的文本，并计算文本的长度
            #     text_list.append(len(y.get_text()))
            #   em_list.append(text_list)
            # # [[3, 5, 12], [1, 2]]
            print(em_list)
            return em_list
        except Exception:
            retry_count -= 1
    # 出错5次, 删除代理池中代理
    # delete_proxy(proxy)
    return [[]]


# Called when a client sends a message
def message_received(client, server, message):
    msg = [{ 'keyword': x } for x in json.loads(message)]
    for x in msg:
        redlist = getHtml(x['keyword'])
        x['redlist'] = redlist
        server.send_message(client, json.dumps(x))
        time.sleep(2)
    print("Client(%d) said: %s" % (client['id'], msg))


PORT=9001
server = WebsocketServer(PORT)
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()
