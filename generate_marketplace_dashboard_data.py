#!/usr/bin/env python

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
import sys
import xml.etree.cElementTree as et

import requests


class JenkinsResultsAggregator(object):

    def __init__(self, jobs_file, jenkins_artifact_url):
        self.jobs_file = jobs_file
        self.jenkins_artifact_url = jenkins_artifact_url
        with open('%s.txt' % jobs_file) as f:
            self.job_names = f.read().splitlines()

    def process_results(self):
        json_results = self._generate_json_results()
        self._generate_json_file(json_results)
        return True

    def _generate_json_results(self):
        jobs = {}
        aggregated_results = {'Firefox OS': {}, 'Android': {}, 'Desktop': {}}
        final = []

        for job_name in self.job_names:
            jobs[job_name] = self._process_xml_results(job_name)

        for job_name in jobs:
            group = self._get_group(job_name)
            environment = self._get_environment(job_name)

            target_group = aggregated_results[group]
            for test_name in jobs[job_name]:
                test = jobs[job_name][test_name]
                if not test_name in target_group:
                    path_to_result = test['classname']
                    class_name = test['classname'].split('.')[-1]
                    path_to_result = path_to_result.replace('.%s' % class_name, '')
                    path_to_result += '/%s/%s/' % (class_name, test_name)
                    target_group[test_name] = {'test_name': test_name, 'path_to_result': path_to_result, 'passed': [], 'skipped': {}, 'failed': [], 'environments': []}
                if not environment in target_group[test_name]['environments']:
                    target_group[test_name]['environments'].append(environment)
                if test['result'] == 'passed':
                    target_group[test_name]['passed'].append(job_name)
                elif test['result'] == 'skipped':
                    if 'jobs' in target_group[test_name]['skipped']:
                        target_group[test_name]['skipped']['jobs'].append(job_name)
                    else:
                        target_group[test_name]['skipped'] = {'result': test['result'], 'detail': test['detail'], 'jobs': [job_name]}
                else:
                    target_group[test_name]['failed'].append({'result': test['result'], 'detail': test['detail'], 'jobs': [job_name]})

        for group_key in aggregated_results:
            target_group = aggregated_results[group_key]
            new_group = []
            for test_key in target_group:
                test = target_group[test_key]
                test['all_passed'] = not bool(len(test['failed']))
                new_group.append(test)
            final.append({'group': group_key, 'test_results': new_group})

        return final

    def _process_xml_results(self, job_name):
        response = requests.get(self.jenkins_artifact_url % job_name)
        response.raise_for_status()
        tree = et.fromstring(response.content)
        test_results = {}
        for el in tree.findall('testcase'):
            test = {'classname': el.attrib['classname']}
            if len(el.getchildren()) == 0:
                test['result'] = 'passed'
            else:
                result = el.getchildren()[0]
                test['result'] = result.tag
                test['detail'] = '%s: %s' % (result.attrib['message'], result.text)

            test_results[el.attrib['name']] = test
        return test_results

    def _get_group(self, job_name):
        if 'b2g' in job_name:
            return 'Firefox OS'
        if 'mobile' in job_name:
            return 'Android'
        return 'Desktop'

    def _get_environment(self, job_name):
        if job_name.startswith('marketplace.dev'):
            return 'dev'
        if job_name.startswith('marketplace.stage'):
            return 'stage'
        if job_name.startswith('marketplace.prod'):
            return 'prod'
        return 'unknown'

    def _generate_json_file(self, json_results):
        with open('%s_results.json' % self.jobs_file, 'w') as outfile:
            json.dump(json_results, outfile)


if __name__ == '__main__':

    if len(sys.argv) < 3:
        raise ValueError('Must provide name of jobs file and jenkins artifact url pattern.')

    print 'Starting job for %s using %s' % (sys.argv[1], sys.argv[2])
    aggregator = JenkinsResultsAggregator(sys.argv[1], sys.argv[2])
    print 'Job successful: %s' % aggregator.process_results()
