        《笔记——学习git命令》
 安装git之后
 1 git user.name "yourname"
 2 git user.email "youremail"
 指定用户名与邮件
 
 3 git init
 在合适的地方，初始化一个本地git仓库，会生成./git这个文件，默认隐藏不可见
 
 4 pwd
 可以查询当前所在路径
 
 5 git ls -ah
 可以查看当前仓库里的文件，包括隐藏文件
 
 6 git add <file_1> <file_2> ...<file_n>
 添加文件到仓库，可以一次性添加多个文件
 
 7 git commit -m "change decription"
 提交已添加的文件到仓库，并给出改动的描述
 
 8 git status
 查询当前仓库所有文件的状态，即是否被更改
 
 9 git diff <file>
 查看指定文件具体修改了什么内容
 
 10 git log
 查看版本历史
 
 11 git log --pretty=oneline
 查看版本历史，每个版本只以一行显示
 
 12 git reset --hard HEAD^
 回退到上一个版本
 
 13 git reset --hard HEAD^^
 回退到上上个版本
 
 14 git reset --hard HEAD~100
 回退到第前一百个版本
 
 15 cat <file>
 查看某文件的内容
 
 16 git reset --hard xxxxxxx
 xx为7位版本号id，即版本序列号前七位（可以更多或更少位），只要命令行窗口还没关，回退的xx版本还可以找回来
 
 17 git reset --hard commit_id
 id为版本号，这个命令可以让我们自由穿梭去指定的版本，包括过去与未来
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 