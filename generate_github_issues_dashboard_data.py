#!/usr/bin/env python

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import datetime
import json
import sys

from github import Github


class GithubIssuesAggregator(object):

    def __init__(self, gh_token):
        self.config_data = json.load(open('config.json'))
        self.gh_api = Github(gh_token)
        rate_limit = self.gh_api.get_rate_limit()
        if rate_limit.rate.limit < 5000:
            raise ValueError('The Github rate limit is less than 5000. The api token is likely incorrect.')

    def process_issues(self):
        all_issues = []
        org = self.gh_api.get_organization('Mozilla')
        repos = [repo.split('/')[-1] for repo in self.config_data['repos']]
        for repo in repos:
            print 'Retrieving issues for %s...' % repo
            issues = []
            for issue in org.get_repo(repo).get_issues(state='Open'):
                if issue.assignee:
                    assignee = {'name': issue.assignee.name, 'avatar_url': issue.assignee.avatar_url}
                else:
                    assignee = ''
                issue_dict = {'assignee': assignee,
                              'pull_request': issue.pull_request and issue.pull_request.html_url or '',
                              'updated_at': str(issue.updated_at)
                              }
                for item in ('title', 'body', 'number', 'html_url', 'comments'):
                    issue_dict[item] = getattr(issue, item)
                labels = []
                for label in issue.labels:
                    labels.append({'name': label.name, 'color': label.color})
                issue_dict['labels'] = labels
                issues.append(issue_dict)
            all_issues.append({'repo': repo, 'issues': issues})
        final = {'last_updated': str(datetime.datetime.now()), 'issues': all_issues}
        with open('data/repos_issues.json', 'w') as outfile:
            json.dump(final, outfile)
        return True


if __name__ == '__main__':

    if len(sys.argv) < 2:
        raise ValueError('Must provide Github API token.')

    print 'Starting job ...'
    aggregator = GithubIssuesAggregator(sys.argv[1])
    print 'Job successful: %s' % aggregator.process_issues()
