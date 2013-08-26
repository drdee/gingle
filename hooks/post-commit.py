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

from gingle import main as gingle

mingle_task = re.compile('#(finish|for)\s(\d{1,4}\.\d{1,2})', re.IGNORECASE)

def parse_commit_msg(message):
	'''
	#for 704.1
	#for 704.2
	#finish 704.1
	'''
	tasks = re.findall(mingle_task, message)
	for task in tasks:
		print task
		func = task[0].lower()
		feature_id = task[1]
		if func == 'for':
                        gingle(['modify', feature_id])
		elif func == 'finish':
			gingle(['finish', feature_id])
	

def main():
	cmd = ['git', 'log', '--format="%s %b"', '-n', '1']
	p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	stdout, stderr = p.communicate()
	if stderr:
		print stderr
		exit(-1)
	else:
		parse_commit_msg(stdout)


if __name__ == '__main__':
	main()
