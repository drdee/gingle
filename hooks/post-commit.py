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

from gingle import main as gingle

mingle_task = re.compile('#(finish|for)\s(\d{1,4}\.\d{1,2})', re.IGNORECASE)

def get_git_root_folder():
	cmd = ['git', 'rev-parse', '--show-toplevel']
	root_folder = run_external_process(cmd)
	return root_folder.replace('\n', '')		

def determine_repo_type():
	is_gerrit = False
	github = None
	root_folder = get_git_root_folder()
        try:
	    fh = open('%s/.git/config' % root_folder, 'r')
        except IOError:
            print 'Could not find git config.'
            exit(-1)
	for line in fh:
                line = line.strip()
		#FIXME: Disable linking to gerrit repo's now as
                #post commit hooks will lead to links
                #that don't work
		#if line.find('gerrit') > -1:
		#	is_gerrit = True
		if line.find('github.com') > -1:
			github = line.replace('url = ', '')
			github = github.replace('.git', '')
	fh.close()
	return (is_gerrit, github)

def create_link_to_commit(is_gerrit, github):
	cmd = ['git', 'log', '--format=%H', '-n', '1']
	sha1 = run_external_process(cmd)
	sha1 = sha1.strip()
        if is_gerrit:
		request = requests.get('https://gerrit.wikimedia.org/r/changes/?q=commit:%s' % sha1)
		text = request.text.strip()
                text = text.replace(")]}'\n", '')
                json_response = json.loads(text);
		if json_response == []:
			return 'Could not find a gerrit patchset belonging to sha1: %s' % sha1
		elif len(json_response) > 1:
                        return 'Found more than 1 gerrit patchset belonging to sha1: %s' % sha1
                else:
			return '%s%s' % ('https://gerrit.wikimedia.org/r/#/c/', json_response[0]['_number'])
	elif github:
		return '%s/commit/%s' % (github, sha1)
	else:
		return 'Could not determine repository type (github or gerrit).'
		
def parse_commit_msg():
	'''
	#for 704.1
	#for 704.2
	#finish 704.1
	'''
        is_gerrit, github = determine_repo_type()
	link = create_link_to_commit(is_gerrit, github)
	
	cmd = ['git', 'log', '--format="%s %b"', '-n', '1']
	message = run_external_process(cmd)	
	tasks = re.findall(mingle_task, message)
	for task in tasks:
		func = task[0].lower()
		feature_id = task[1]
		if func == 'for':
                        gingle(['modify', link, feature_id])
		elif func == 'finish':
			gingle(['finish', link, feature_id])
	

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
