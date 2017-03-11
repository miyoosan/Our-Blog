        《笔记——学习git命令》
 安装git之后
 1 git user.name "yourname"
 2 git user.email "youremail"
 指定用户名与邮件
 
 3 git init
 在合适的地方，初始化一个本地git仓库，会生成./git目录，这是Git版本库，默认隐藏不可见
 
 4 pwd
 可以查询当前所在路径
 
 5 ls -ah
 可以查看当前文件夹里的文件，包括隐藏文件
 
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
 
 18 git reflog
 查看命令历史记录
 
 19 git add 的原理
 将文件添加到暂存区stage（或者叫index），这个暂存区在版本库里，而使用git commit -m 则是将暂存区里的文件都提交到本地仓库
 
 20 git diff HEAD -- <file>
 查看该文件在工作区和版本库里面最新版本的区别
 
 21 git checkout -- <file> 
 撤销文件在工作区的修改，回到最近一次git commit 或 git add 时的状态
 
 22 git reset HEAD <file>
 可以把暂存区的修改撤销掉，重新放回工作区。其中，HEAD表示最新版本，可以用其他版本id取代
 
 23 rm <file>
 从文件夹里删除文件
 
 24 git rm <file>
 从版本库里删除文件
 
 25 git commit -m "decription"
 确认删除该文件
 
 26 git checkout -- <file>
 在确认删除之前，可以取消删除
 
 
 
 
 
 
 
 
 
 