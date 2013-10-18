## Background
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
```
sudo python setup.py install
```
Then 
```
mkdir /home/<username>/.gingle/
touch /home/<username>/.gingle/gingle.ini
```
and with your favorite text editor add:
```
[auth]
username=ask diederik/ottomata
password=ask diederik/ottomata
```

Once you have installed gingle, then copy the post-commit.py file to either the hooks folder 
of each indivdual git repo like /git/repo/.git/hooks or install it in the global git template folder like:
```
git config --global init.templatedir '~/.git_template'
cp /path/to/gingle/hooks/post-commit.py ~/.git_template/post-commit
```
all future repo's will now include the gingle post-commit hook. For existing git repos run:
```
git init --template ~/.git_template 
```

## Installation Server Side

- To install Node.js follow the instructions from https://github.com/joyent/node/wiki/Installation
- Install npm
```
curl https://npmjs.org/install.sh | sh
```
- Edit config.json and add your Mingle username and password.
- Run nodejs app
```
node app.js
```

## Usage in git commit message

To trigger the post-commit hook, you will have to add '#for <card_id>.<task_id>' in the git commit message.
ATTENTION: if you use # as the first character of a line then git will ignore it because it will be treated as 
comment.

This commit message would work

```
Analytics card 822.1
```

This will add a link to the commit (either in Gerrit or Github) that implements user acceptance criteria 1 in Mingle story card 822.

If you want to indicate that you finished a task then enter: 
```
Analytics card 822.1 finish
```

## Usage on command line

To list the user-acceptanace criteria, enter the following command
```
python gingle.py list 1112
```
This will output the criteria from Mingle card 1112

To add a user-acceptance criteria, enter the following command
```
python gingle.py add 'Diederik loves Mingle' 'Analytics members use gingle' 'Diederik is a happy camper' 1112
```
it follows the given, when, then structure, given is first positonal argument, when is the second positional argument and then is the third positional argument.
Put the arguments in quotation marks so it can be properly parsed.
