#!python
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


import re
from os.path import dirname, abspath, join
from setuptools import setup, find_packages

HERE = abspath(dirname(__file__))
readme = open(join(HERE, 'README.md'), 'rU').read()

package_file = open(join(HERE, 'gingle/__init__.py'), 'rU')
__version__ = re.sub(
    r".*\b__version__\s+=\s+'([^']+)'.*",
    r'\1',
    [line.strip() for line in package_file if '__version__' in line].pop(0)
)


setup(
    name='gingle',
    version=__version__,
    description='Git <-> Mingle integration',
    long_description=readme,
    url='https://gerrit.wikimedia.org/gitweb/analytics/gingle.git',

    author='Diederik van Liere',
    author_email='dvanliere@wikimedia.org',

    packages=find_packages(exclude="server"),
    entry_points={'console_scripts': ['gingle = gingle:main']},
        install_requires=[
                'requests', 'argparse', 'BeautifulSoup',
        ],

    # install_requires = [
    #     "bunch  >= 1.0",
    #     "PyYAML >= 3.10",
    # ],

    keywords=['git', 'mingle', 'user acceptance criteria'],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Topic :: Utilities"
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: GPLv2 License",
    ],
    zip_safe=False,
    license="GPLv2",
)
