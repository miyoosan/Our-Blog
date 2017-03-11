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
 
 33 git clone git@github.com:yourGitHubName/factory.git
 克隆一个远程仓库到本地，还支持https://github.com/yourGitHubName/factory.git这样的地址。实际上，Git支持多种协议，默认是SSH，还可以使用https。不过https速度比较慢，而且每次需要输入口令，一般只在限定环境下使用
 
 34 git checkout -b dev
 创建dev分支，并切换到dev分支，相当于以下命令git branch dev 和 git checkout dev 的结合
 分支与主分支master的切换，是靠指针的移动，当HEAD指针移动到哪个分支上时，就表明当前是哪个分支。
 当有多个分支存在时，查看当前分支时，当前分支前面会有*号
 
 35 git branch
 查看当前分支
 
 36 git checkout dev
 切换到dev分支
 
 37 git merge dev
 把指定分支dev合并到当前分支，即在master分支下输入该命令，会把dev分支与合并到master分支，这样两个分支的内容就完全一样了。
 这种合并方式，属于快进模式，即只改变指针的指向，合并速度非常快。合并完成后，可以放心删除dev分支了
 
 38 git branch -d dev
 删除dev分支。因为创建、合并、删除分支非常快，所以通常鼓励在分支完成任务，然后合并，删除分支，过程很安全。Git鼓励大量使用分支
 
 39 git log --graph --pretty=oneline --abbrev-commit
 该命令可以看到分支合并的情况，并以图表形式显示
 
 40 git merge --no-ff -m "merge with no fast forward pattern" dev
 合并dev分支到当前分支，禁用ff模式，git会在合并时生成一个新的commit，这样，可以从分支历史上看出分支信息，也就是保留了合并的历史
 
 41 分支策略
 master分支应该是非常稳定的，只用来发布新版本，平时都在dev上干活，而每个人都在dev上有自己的分支，完成工作就合并到dev上
 等到需要发布版本时，就把dev合并到master上，如此团队合作就可以形成
 
 42 git stash
 手头工作没完成时，需要创建另外的分支进行工作，这时候用这个命令可以保存现有工作现场。
 
 43 git stash list
 查看所有保存的工作现场
 
 44 git stash apply stash@{0}
 恢复指定的工作现场stash@{0}，这是类似数组形式存储的，可以推论，第二个工作现场是stash@{1}
 
 45 git stash drop
 apply恢复现场时，并没有删除stash里面的内容，这个命令可以删除
 
 46 git stash pop
 恢复最近一次保存的工作现场，并删除stash
 
 47 git branch -D dev
 强制删除dev分支。小tips：开发一个新的功能时，最好新建一个分支，如果要丢弃一个没有被合并过的分支，就使用该命令强行删除
 
 48 git合并两个分支时，有时会有冲突，cat <file> 查看冲突的文件，里面有自动标记出的不同分支的冲突内容
 手动修改令其内容一样，然后再合并，删除分支
 
 49 git push origin dev
 推送dev分支到远程仓库。一般情况下，master作为主分支，时刻要与远程同步，而dev是团队的开发分支，也需要同步
 bug分支一般没必要推送远程，feature这样的功能分支，取决于是否需要多人协助完成
 
 50 git checkout -b dev origin/dev
 创建远程origin的dev分支
 
 51 git branch --set-upstream dev origin/dev
 设置本地dev分支与远程origin/dev的链接
 
 52 git pull
 抓取对应当前分支的远程分支
 
 53 多人协作开发时，如果合并有冲突，先解决冲突，参见48。解决后，提交，再push
 
 54 git remote -v
 查看远程库的信息
 注意：本地新建的分支如果不推送到远程，对其他人就是不可见的
 
 55 创建标签
 标签对应于commit，但commit的id是一串字符串，太难记，不好查找，所以一般给它绑定标签tag
 
 56 git tag v1.0
 给当前分支最后一次提交的commit添加一个新标签v1.0，即对应的版本号
 
 57 git tag
 查看所有标签；标签不是按时间顺序排列，而是按字母排列
 
 58 git tag v0.5 id
 给指定的commit id添加标签v0.5。如果忘了id，可以先git log查找id。
 
 59 git show v0.5
 查看标签v0.5的详细信息
 
 60 git tag -a v0.6 -m "version0.6 released" id
 给指定的id添加标签，-a指定标签名，-m指定说明文字。还可以通过-s用私钥签名一个标签，参考廖雪峰教程
 
 61 git tag -d v0.1
 删除标签v0.1。注意，标签默认存储在本地，不会自动推送到远程
 
 62 git push origin v0.1
 推送指定标签v0.1到远程
 
 63 git push origin --tags
 一次性推送全部尚未推送到远程的本地标签
 
 64 git push orign :refs/tags/v0.9
 如果标签已经推送到远程，要删除，先在本地删除，即61，然后再使用该命令进行删除
 
 
 
 
 
 
 
 
 