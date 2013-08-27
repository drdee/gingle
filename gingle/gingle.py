#!/usr/bin/env python

'''
Gingle: git <-> mingle integration for user acceptance criteria
Copyright (C) 2013  Diederik van Liere (dvanliere@wikimedia.org)

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
'''

import argparse
import requests
from BeautifulSoup import BeautifulSoup

server = 'http://localhost:3000'


def list_user_acceptance_criteria(args):
    feature_id = args.feature_id
    response = requests.get('%s/%s' % (server, feature_id))
    soup = BeautifulSoup(response.text)
    table = soup.find('tbody')
    rows = table.findAll('tr')
    for tr in rows:
        cols = tr.findAll('td')
        for td in cols:
            text = ''.join(td.find(text=True))
            text = text.replace('&nbsp;', ' ')
            print text + ' | ',
        print


def add_user_criteria(args):
    feature_id = args.feature_id
    payload = {'feature_id': feature_id}
    response = requests.post('%s/%s' % (server, feature_id), payload)
    print response.text


def modify_user_criteria(args):
    try:
        feature_id, task_id = args.feature_id.split('.')
    except ValueError:
        print '''You forgot to add the task id that you want to modify.
The correct format is <feature_id>.<task_id>'''
        exit(-1)
    payload = {'feature_id': feature_id, 'task_id': task_id, 'link': args.link}
    response = requests.post('%s/%s' % (
        server, payload.get('feature_id')), payload)
    print response.text


def finish_user_criteria(namespace):
    pass


def main(cli_args=None):
    parser = argparse.ArgumentParser(description='')
    subparsers = parser.add_subparsers()

    subparser_list = subparsers.add_parser('list', help='')
    subparser_list.set_defaults(func=list_user_acceptance_criteria)

    subparser_add = subparsers.add_parser('add', help='')
    subparser_add.set_defaults(func=add_user_criteria)

    subparser_modify = subparsers.add_parser('modify', help='')
    subparser_modify.add_argument('link', help='')
    subparser_modify.set_defaults(func=modify_user_criteria)

    subparser_finish = subparsers.add_parser('finish', help='')
    subparser_finish.add_argument('link', help='')
    subparser_finish.set_defaults(func=finish_user_criteria)

    parser.add_argument('feature_id', help='')
    if cli_args:
        args = parser.parse_args(cli_args)
    else:
        args = parser.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
