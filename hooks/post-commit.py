#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Gingle: git <-> mingle integration for user acceptance criteria
Copyright (C) 2013  Diederik van Liere (dvanliere@wikimedia.org),
Wikimedia Foundation

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
"""

import subprocess
import re
import json
import requests
import urlparse

from gingle import main as gingle

'''
Capture the following variants of mingle references
analytics card 42.1
analytics card #42.1
analytics-card 42.1
analytics-card #42.1
Card: analytics 42.1
Card: analytics-42.1
Card:analytics#42.1
'''
mingle_task = re.compile('\\b([aA]nalytics\\s*[:-]?\\s*[cC]ard|[cC]ard\\s*[:-]?\\s*[aA]nalytics)\\s*\\#?\\s*(\\d+\\.\\d+)\\s?([a-z]*)\\b')


def get_git_root_folder():
    cmd = ['git', 'rev-parse', '--show-toplevel']
    root_folder = run_external_process(cmd)
    return root_folder.replace('\n', '')        

def determine_repo_type():
    is_gerrit = False
    is_github = False
    repo_url = ''
    root_folder = get_git_root_folder()
    try:
        fh = open('%s/.git/config' % root_folder, 'r')
    except IOError:
        print 'Could not find git config, is this folder part of a git project?'
        exit(-1)
    for line in fh:
        line = line.strip()
        if line.find('gerrit.wikimedia.org') > -1:
            is_gerrit = True
            repo_url = line
        if line.find('github.com') > -1:
            is_github = True
            repo_url = line
    fh.close()

    repo_names = {
        'analytics-kraken': 'kraken',
        'analytics-limn': 'limn',
    }

    repo_url = repo_url.replace('.git', '')
    if is_gerrit:
        repo_url = repo_url.replace('url = ssh://', 'https://')
        print repo_url

        repo_url = urlparse.urlparse(repo_url)
        path = repo_url.path[1:].replace('/', '-')
        path = repo_names.get(path, path)
        repo_url = 'https://github.com/wikimedia/%s' % (path)
    elif is_github:   
        repo_url = repo_url.replace('url = ', '')
    return repo_url

def create_link_to_commit(repo_url):
    cmd = ['git', 'log', '--format=%H', '-n', '1']
    sha1 = run_external_process(cmd)
    sha1 = sha1.strip()
    #if is_gerrit:
    #    request = requests.get('https://gerrit.wikimedia.org/r/changes/?q=commit:%s' % sha1)
    #    text = request.text.strip()
    #    text = text.replace(")]}'\n", '')
    #    json_response = json.loads(text);
    #    if json_response == []:
    #        return 'Could not find a gerrit patchset belonging to sha1: %s' % sha1
    #    elif len(json_response) > 1:
    #        return 'Found more than 1 gerrit patchset belonging to sha1: %s' % sha1
    #    else:
    #        return '%s%s' % ('https://gerrit.wikimedia.org/r/#/c/', json_response[0]['_number'])
    if repo_url:
        return '%s/commit/%s' % (repo_url, sha1)
    else:
        return 'Could not determine repository type (github or gerrit).'
        
def parse_commit_msg():
    repo_url = determine_repo_type()
    link = create_link_to_commit(repo_url)
    print link
    cmd = ['git', 'log', '--format="%B"', '-n', '1']
    message = run_external_process(cmd) 
    tasks = re.findall(mingle_task, message)
    for task in tasks:
        feature_id = task[1]
        func = 'modify' if task[2] == None else task[2].lower()
        if func == 'finish':
            gingle(['finish', link, feature_id])
        else:
            gingle(['modify', link, feature_id])
    

def run_external_process(cmd):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate()
    if stderr:
        print stderr
        exit(-1)
    else:
        return stdout


if __name__ == '__main__':
    parse_commit_msg()
