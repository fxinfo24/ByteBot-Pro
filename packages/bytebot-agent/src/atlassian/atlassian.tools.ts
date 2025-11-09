/**
 * Atlassian tools for Jira and Confluence integration
 */

export const atlassianTools = [
  {
    name: 'create_jira_issue',
    description: 'Create a new Jira issue in a specified project',
    input_schema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project key (e.g., PROJ, DEV, BUG)'
        },
        summary: {
          type: 'string',
          description: 'Brief summary of the issue'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue'
        },
        issueType: {
          type: 'string',
          description: 'Type of issue (Bug, Story, Task, Epic, etc.)',
          enum: ['Bug', 'Story', 'Task', 'Epic', 'Subtask', 'Improvement']
        },
        assignee: {
          type: 'string',
          description: 'Email address of the assignee (optional)'
        },
        priority: {
          type: 'string',
          description: 'Priority level (optional)',
          enum: ['Highest', 'High', 'Medium', 'Low', 'Lowest']
        }
      },
      required: ['project', 'summary', 'description', 'issueType']
    }
  },
  {
    name: 'search_jira_issues',
    description: 'Search for Jira issues using JQL (Jira Query Language)',
    input_schema: {
      type: 'object',
      properties: {
        jql: {
          type: 'string',
          description: 'JQL query string (e.g., "project = PROJ AND status = Open", "assignee = currentUser()", "created >= -7d")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 50,
          minimum: 1,
          maximum: 100
        }
      },
      required: ['jql']
    }
  },
  {
    name: 'create_confluence_page',
    description: 'Create a new Confluence page with markdown content',
    input_schema: {
      type: 'object',
      properties: {
        spaceKey: {
          type: 'string',
          description: 'Confluence space key (e.g., TEAM, DOC, KB)'
        },
        title: {
          type: 'string',
          description: 'Page title'
        },
        content: {
          type: 'string',
          description: 'Page content in markdown format'
        },
        parentId: {
          type: 'string',
          description: 'Parent page ID (optional, for creating child pages)'
        }
      },
      required: ['spaceKey', 'title', 'content']
    }
  },
  {
    name: 'search_confluence_pages',
    description: 'Search for Confluence pages by text content',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query text'
        },
        spaceKey: {
          type: 'string',
          description: 'Confluence space key to limit search (optional)'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 25,
          minimum: 1,
          maximum: 50
        }
      },
      required: ['query']
    }
  },
  {
    name: 'update_jira_issue',
    description: 'Update an existing Jira issue',
    input_schema: {
      type: 'object',
      properties: {
        issueKey: {
          type: 'string',
          description: 'Jira issue key (e.g., PROJ-123)'
        },
        summary: {
          type: 'string',
          description: 'Updated summary (optional)'
        },
        description: {
          type: 'string',
          description: 'Updated description (optional)'
        },
        assignee: {
          type: 'string',
          description: 'Email address of new assignee (optional)'
        },
        status: {
          type: 'string',
          description: 'New status (optional)',
          enum: ['Open', 'In Progress', 'Done', 'Closed', 'Resolved']
        },
        comment: {
          type: 'string',
          description: 'Add a comment to the issue (optional)'
        }
      },
      required: ['issueKey']
    }
  }
];

/**
 * Example JQL queries for common use cases
 */
export const COMMON_JQL_QUERIES = {
  myOpenIssues: 'assignee = currentUser() AND status != Done',
  recentIssues: 'created >= -7d ORDER BY created DESC',
  highPriorityBugs: 'project = PROJ AND issuetype = Bug AND priority in (High, Highest)',
  overdueTasks: 'due < now() AND status != Done',
  myRecentActivity: 'assignee = currentUser() AND updated >= -3d ORDER BY updated DESC',
  openEpics: 'issuetype = Epic AND status != Done'
};

/**
 * Common Confluence search patterns
 */
export const CONFLUENCE_SEARCH_EXAMPLES = {
  recentUpdates: 'lastModified >= yesterday',
  userContent: 'contributor:john.doe',
  spaceContent: 'space.key:TEAM',
  typeFilter: 'type:page',
  labelSearch: 'label:meeting-notes'
};