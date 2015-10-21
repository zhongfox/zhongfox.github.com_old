---
layout: link
category : link
link: http://naleid.com/blog/2012/01/17/finding-and-purging-big-files-from-git-history
title: git 检测并删除大文件
---

* What object SHA is associated with each file in the Repo?

  `git rev-list --objects --all | sort -k 2 > allfileshas.txt`


* What Unique Files Exist Throughout The History of My Git Repo?

  `git rev-list --objects --all | sort -k 2 | cut -f 2 -d\  | uniq`

* How Big Are The Files In My Repo?

  * Get the last object SHA for all committed files and sort them in biggest to smallest order:

    `git gc && git verify-pack -v .git/objects/pack/pack-*.idx | egrep "^\w+ blob\W+[0-9]+ [0-9]+ [0-9]+$" | sort -k 3 -n -r > bigobjects.txt`

  * Take that result and iterate through each line of it to find the SHA, file size in bytes, and real file name (you also need the allfileshas.txt output file from above):

        for SHA in `cut -f 1 -d\  < bigobjects.txt`; do
        echo $(grep $SHA bigobjects.txt) $(grep $SHA allfileshas.txt) | awk '{print $1,$3,$7}' >> bigtosmall.txt
        done;


* Purging a file or directory from history

  `git filter-branch --prune-empty --index-filter 'git rm -rf --cached --ignore-unmatch MY-BIG-DIRECTORY-OR-FILE' --tag-name-filter cat -- --all`

* 最后还要推送:

  `git push origin --tags --force`

  `git push origin --all --force`

* 想知道是这个文件是哪个commit: `git log --all -p -- doc/all.rar`
