import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JiraIssue {
  key: string;
  id: string;
  self: string;
  summary: string;
  description?: string;
  status: string;
  assignee?: string;
  reporter: string;
  created: string;
  updated: string;
}

export interface ConfluencePage {
  id: string;
  title: string;
  type: string;
  status: string;
  space: {
    key: string;
    name: string;
  };
  body: {
    storage: {
      value: string;
      representation: string;
    };
  };
  _links: {
    webui: string;
  };
}

@Injectable()
export class AtlassianService {
  private readonly logger = new Logger(AtlassianService.name);
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ATLASSIAN_BASE_URL') || '';
    this.email = this.configService.get<string>('ATLASSIAN_EMAIL') || '';
    this.apiToken = this.configService.get<string>('ATLASSIAN_API_TOKEN') || '';

    if (!this.baseUrl || !this.email || !this.apiToken) {
      this.logger.warn(
        'Atlassian credentials not configured. Atlassian features will not work.',
      );
    }
  }

  private getAuthHeaders() {
    if (!this.email || !this.apiToken) {
      throw new Error('Atlassian credentials not configured');
    }

    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new Jira issue
   */
  async createJiraIssue(
    project: string,
    summary: string,
    description: string,
    issueType: string = 'Task',
    assignee?: string,
    priority?: string
  ): Promise<JiraIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          fields: {
            project: { key: project },
            summary: summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      text: description,
                      type: 'text'
                    }
                  ]
                }
              ]
            },
            issuetype: { name: issueType },
            ...(assignee && { assignee: { emailAddress: assignee } }),
            ...(priority && { priority: { name: priority } })
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create Jira issue: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(`Created Jira issue: ${result.key}`);
      
      return {
        key: result.key,
        id: result.id,
        self: result.self,
        summary: summary,
        description: description,
        status: 'Open',
        reporter: this.email,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error creating Jira issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for Jira issues using JQL
   */
  async searchJiraIssues(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const params = new URLSearchParams({
        jql: jql,
        maxResults: maxResults.toString(),
        fields: 'summary,description,status,assignee,reporter,created,updated'
      });

      const response = await fetch(`${this.baseUrl}/rest/api/3/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to search Jira issues: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(`Found ${result.issues.length} Jira issues`);

      return result.issues.map((issue: any) => ({
        key: issue.key,
        id: issue.id,
        self: issue.self,
        summary: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || '',
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.emailAddress,
        reporter: issue.fields.reporter?.emailAddress,
        created: issue.fields.created,
        updated: issue.fields.updated
      }));
    } catch (error) {
      this.logger.error(`Error searching Jira issues: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create or update a Confluence page
   */
  async createConfluencePage(
    spaceKey: string,
    title: string,
    content: string,
    parentId?: string
  ): Promise<ConfluencePage> {
    try {
      const storageContent = this.markdownToConfluenceStorage(content);
      
      const response = await fetch(`${this.baseUrl}/wiki/rest/api/content`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          type: 'page',
          title: title,
          space: { key: spaceKey },
          body: {
            storage: {
              value: storageContent,
              representation: 'storage'
            }
          },
          ...(parentId && { ancestors: [{ id: parentId }] })
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create Confluence page: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(`Created Confluence page: ${result.title}`);
      
      return {
        id: result.id,
        title: result.title,
        type: result.type,
        status: result.status,
        space: {
          key: result.space.key,
          name: result.space.name
        },
        body: {
          storage: {
            value: storageContent,
            representation: 'storage'
          }
        },
        _links: {
          webui: `${this.baseUrl}/wiki${result._links.webui}`
        }
      };
    } catch (error) {
      this.logger.error(`Error creating Confluence page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search Confluence pages
   */
  async searchConfluencePages(query: string, spaceKey?: string, maxResults: number = 25): Promise<ConfluencePage[]> {
    try {
      const cql = spaceKey 
        ? `text ~ "${query}" AND space.key = "${spaceKey}"` 
        : `text ~ "${query}"`;
      
      const params = new URLSearchParams({
        cql: cql,
        limit: maxResults.toString(),
        expand: 'body.storage,space'
      });

      const response = await fetch(`${this.baseUrl}/wiki/rest/api/content/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to search Confluence pages: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(`Found ${result.results.length} Confluence pages`);

      return result.results.map((page: any) => ({
        id: page.id,
        title: page.title,
        type: page.type,
        status: page.status,
        space: {
          key: page.space.key,
          name: page.space.name
        },
        body: {
          storage: {
            value: page.body?.storage?.value || '',
            representation: 'storage'
          }
        },
        _links: {
          webui: `${this.baseUrl}/wiki${page._links.webui}`
        }
      }));
    } catch (error) {
      this.logger.error(`Error searching Confluence pages: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert markdown to Confluence storage format
   */
  private markdownToConfluenceStorage(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<[^>]+>)/g, '$1')
      .replace(/(<\/[^>]+>)<\/p>/g, '$1');
  }
}