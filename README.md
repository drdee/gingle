
x## Background
Gingle is a small utility that the Analytics team at the Wikimedia Foundation uses to automatically add commit links to story cards. While mingle does have native support for Git integration, it only supports a single Git repo. The Analytics team uses many repos and we would like a more granular tracking of the progresss of individual story cards.

Gingle consists of three parts
- a Git post-commit hook
- a cli utility called gingle
- a node.js app


       -----------         -----------        -----------
       |  post   |  send   |         | send   |  nodejs |
       | commit  |-------> | gingle  |------->|   app   |
       |  hook   | commit  |         | data   |         |
       -----------  msg    -----------        -----------

The nodejs app gets the Mingle card and can do the following:
- add a new user acceptance criteria to a Mingle card
- add a link to the commit that addresses a particular user acceptance criteria
- updates the 'Progress' property

## Installation Client Side

Installation is straightforward and like any other python module:
```bash
sudo python setup.py install
```

Once you have installed gingle, then copy the post-commit.py file to /git/repo/.git/hooks

## Installation Server Side

- To install Node.js follow the instructions from https://github.com/joyent/node/wiki/Installation
- Install npm
```bash
curl https://npmjs.org/install.sh | sh
```
- Edit config.json and add your Mingle username and password.
- Run nodejs app
```bash
node app.js
```

## Usage

To trigger the post-commit hook, you will have to add '#for <card_id>.<task_id>' in the git commit message.
ATTENTION: if you use # as the first character of a line then git will ignore it because it will be treated as 
comment.

This commit message would work

```shell
Implementing foobar #for 822.1
```

This will add a link to the commit (either in Gerrit or Github) that implemetns user acceptance criteria 1 in Mingle story card 822.

