《笔记——学习git命令》

 安装git之后...
 
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
 
 //以下是创建与连接远程仓库的过程（以\\结尾）
 27 ssh-keygen -t rsa -C "youremail@example.com"
 创建SSH KEY，在用户主目录下可以看到有两个文件，一个是id_rsa私钥，一个是id_rsa.pub公钥，敲完命令，一路回车即可
 
 28 登录GitHub，在settings的SSH KEYS页面，Create新的KEY，随意命名title，然后将id_rsa.pub里的内容粘贴进去，确认。
 GitHub允许添加多个KEY，比如办公电脑一个KEY，私人电脑一个KEY，家用电脑一个KEY等等，很方便，只要添加了KEY，都可以将文件推送到远程建立好的仓库里
 
 29 在GitHub页面右上角，找到Create a new repository选项，创建一个新的仓库，填好仓库名字（比如factory)，其他默认，确认即创建完毕。
 
 30 git remote add origin git@github.com:yourGitHubName/factory.git
 执行这个命令，可以让本地关联GitHub上的factory仓库，其中yourGitHubName应该换成自己GitHub的帐户名，而origin便是远程仓库的默认名字，可修改
 
 31 git push -u origin master
 远程仓库为空时，加上-u参数，不仅可以推送master分支，还可以将本地master分支与远程仓库的master分支关联起来，如此以后的推送或拉取就可以简化命令，省略-u
 
 32 SSH警告
 在电脑上第一次使用clone或者push命令链接GitHub时，会得到一个established的警告，只要输入yes回车即可；这是在确认GtiHub的KEY指纹信息是否真的来自GitHub.

 \\ 过程结束
 
 
 
 
 
 
 
 