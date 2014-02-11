import os
from setuptools import setup, find_packages

# get documentation from the README
try:
    here = os.path.dirname(os.path.abspath(__file__))
    description = file(os.path.join(here, 'README.md')).read()
except (OSError, IOError):
    description = ''

# dependencies
with open('requirements.txt') as f:
    deps = f.read().splitlines()

setup(name='mozwebqa-dashboard',
      version='1.1',
      description="Dashboard data generators and UI for Mozilla Web QA",
      long_description=description,
      classifiers=[],  # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
      keywords='mozilla',
      author='WebQA Team and contributors',
      author_email='mozwebqa@mozilla.org',
      url='https://github.com/mozilla/mozwebqa-dashboard',
      license='MPL',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
      install_requires=deps,
      include_package_data=True,
      )
