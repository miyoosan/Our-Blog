# import multiprocessing as mul

# def proc1(pipe):
#     pipe.send('hello')
#     print('proc1 rec:',pipe.recv())

# def proc2(pipe):
#     print('proc2 rec:',pipe.recv())
#     pipe.send('hello, too')

# def run1():
#     # Build a pipe
#     pipe = mul.Pipe()

#     # Pass an end of the pipe to process 1
#     p1   = mul.Process(target=proc1, args=(pipe[0],))
#     # Pass the other end of the pipe to process 2
#     p2   = mul.Process(target=proc2, args=(pipe[1],))
#     p1.start()
#     p2.start()
#     p1.join()
#     p2.join()

# # Written by Vamei
# import os
# import multiprocessing
# import time
# #==================
# # input worker
# def inputQ(queue):
#     info = str(os.getpid()) + '(put):' + str(time.time())
#     queue.put(info)

# # output worker
# def outputQ(queue,lock):
#     info = queue.get()
#     lock.acquire()
#     print (str(os.getpid()) + '(get):' + info)
#     lock.release()

# def run():
#     #===================
#     # Main
#     record1 = []   # store input processes
#     record2 = []   # store output processes
#     lock  = multiprocessing.Lock()    # To prevent messy print
#     queue = multiprocessing.Queue(3)

#     # input processes
#     for i in range(10):
#         process = multiprocessing.Process(target=inputQ,args=(queue,))
#         process.start()
#         record1.append(process)

#     # output processes
#     for i in range(10):
#         process = multiprocessing.Process(target=outputQ,args=(queue,lock))
#         process.start()
#         record2.append(process)

#     for p in record1:
#         p.join()

#     queue.close()  # No more object will come, close the queue

#     for p in record2:
#         p.join()

# if __name__ == '__main__':
#     run()

# from fake_useragent import UserAgent
# ua = UserAgent()

# def printf(url, *args, **kwargs):
#     print('url={}'.format(url))
#     print('*args={}'.format(args))
#     print('**kwargs={}'.format(kwargs))

# def get(url, header=None, *args, **kwargs):
#     return printf(url, ww='123', *args, **kwargs)

# get('127.0.0.1', proxies={'http': '10.10.11.1'})

# if __name__ == '__main__':
#     get('127.0.0.1', proxies={'http': '10.10.11.1'})

'''
Created on 2013-7-31
@author: Eric
'''
import time
import threading
 
def timer_start():
    t = threading.Timer(1, test_func, ("Parameter1",))
    t.start()
 
def test_func(msg1):
    print("I'm test_func,", msg1)
    timer_start()
 
def timer2():
    timer_start()
    while True:
        time.sleep(1)
 
if __name__ == "__main__":
    timer2()
