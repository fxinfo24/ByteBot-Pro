/**
 * Atlassian integration constants
 */

export const ATLASSIAN_CONFIG = {
  DEFAULT_MAX_RESULTS: {
    JIRA_SEARCH: 50,
    CONFLUENCE_SEARCH: 25
  },
  ISSUE_TYPES: [
    'Bug',
    'Story', 
    'Task',
    'Epic',
    'Subtask',
    'Improvement',
    'New Feature'
  ],
  PRIORITIES: [
    'Highest',
    'High', 
    'Medium',
    'Low',
    'Lowest'
  ],
  STATUSES: [
    'Open',
    'In Progress',
    'In Review',
    'Done',
    'Closed',
    'Resolved',
    'Backlog'
  ]
};

export const ATLASSIAN_ENDPOINTS = {
  JIRA: {
    ISSUE: '/rest/api/3/issue',
    SEARCH: '/rest/api/3/search',
    MYSELF: '/rest/api/3/myself',
    PROJECT: '/rest/api/3/project'
  },
  CONFLUENCE: {
    CONTENT: '/wiki/rest/api/content',
    SEARCH: '/wiki/rest/api/content/search',
    SPACE: '/wiki/rest/api/space'
  }
};

export const JQL_TEMPLATES = {
  MY_ISSUES: 'assignee = currentUser()',
  RECENT_ISSUES: 'created >= -{days}d',
  PROJECT_ISSUES: 'project = "{project}"',
  OPEN_ISSUES: 'status != Done',
  HIGH_PRIORITY: 'priority in (High, Highest)',
  UPDATED_RECENTLY: 'updated >= -{days}d'
};