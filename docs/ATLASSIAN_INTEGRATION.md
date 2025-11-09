# 🚀 ByteBot + Atlassian RovoDev Integration

## 🎯 Overview

Your ByteBot deployment is now configured with powerful Atlassian integration! This enables AI automation for Jira and Confluence tasks using the RovoDev (Atlassian) API alongside your LLM providers.

## ⚙️ Configuration Status

**🔧 CONFIGURED BUT NEEDS VERIFICATION:** Your Atlassian credentials are set up:
- **Site**: https://deshitomat1.atlassian.net
- **Email**: izhar.azaria@dunefee.com  
- **API Token**: Configured in environment variables

**⚠️ CONNECTION ISSUE:** Currently getting 404 error - requires troubleshooting (see below)

## 🔧 Integration Options

### Option 1: Direct API Integration (Recommended)
Create custom tools that interact with Atlassian APIs directly within Bytebot tasks.

### Option 2: MCP Extension
Extend the existing MCP framework to include Atlassian-specific tools.

### Option 3: Workflow Integration
Use Bytebot to automate Atlassian workflows through the web interface.

## 🛠️ Implementation Approaches

### 1. Custom Atlassian Tools

Create tools for common Atlassian operations:

```typescript
// packages/bytebot-agent/src/atlassian/atlassian.tools.ts
export const atlassianTools = [
  {
    name: "create_jira_issue",
    description: "Create a new Jira issue",
    input_schema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project key" },
        summary: { type: "string", description: "Issue summary" },
        description: { type: "string", description: "Issue description" },
        issueType: { type: "string", description: "Issue type (Bug, Story, etc.)" }
      },
      required: ["project", "summary", "issueType"]
    }
  },
  {
    name: "update_confluence_page",
    description: "Update or create a Confluence page",
    input_schema: {
      type: "object", 
      properties: {
        spaceKey: { type: "string", description: "Confluence space key" },
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content in markdown" },
        parentId: { type: "string", description: "Parent page ID (optional)" }
      },
      required: ["spaceKey", "title", "content"]
    }
  },
  {
    name: "search_jira_issues",
    description: "Search for Jira issues using JQL",
    input_schema: {
      type: "object",
      properties: {
        jql: { type: "string", description: "JQL query string" },
        maxResults: { type: "number", description: "Maximum number of results" }
      },
      required: ["jql"]
    }
  }
];
```

### 2. Atlassian Service Integration

```typescript
// packages/bytebot-agent/src/atlassian/atlassian.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtlassianService {
  private readonly logger = new Logger(AtlassianService.name);
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ATLASSIAN_BASE_URL');
    this.email = this.configService.get<string>('ATLASSIAN_EMAIL');
    this.apiToken = this.configService.get<string>('ATLASSIAN_API_TOKEN');
  }

  async createJiraIssue(project: string, summary: string, description: string, issueType: string) {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
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
          issuetype: { name: issueType }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create Jira issue: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateConfluencePage(spaceKey: string, title: string, content: string, parentId?: string) {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    
    // Convert markdown to Confluence storage format
    const storageContent = this.markdownToConfluenceStorage(content);
    
    const response = await fetch(`${this.baseUrl}/wiki/rest/api/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
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
      throw new Error(`Failed to create Confluence page: ${response.statusText}`);
    }

    return await response.json();
  }

  private markdownToConfluenceStorage(markdown: string): string {
    // Basic markdown to Confluence storage format conversion
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  }
}
```

### 3. Environment Configuration

Add Atlassian credentials to your environment:

```bash
# Add to docker/.env
ATLASSIAN_BASE_URL=https://your-domain.atlassian.net
ATLASSIAN_EMAIL=your-email@domain.com
ATLASSIAN_API_TOKEN=your-atlassian-api-token
```

## 🎯 Use Cases

### 1. Automated Issue Creation
"Analyze this error log and create a Jira bug report with relevant details"

### 2. Documentation Generation  
"Take screenshots of this workflow and create a Confluence page documenting the process"

### 3. Status Updates
"Check the status of project tickets and update the team dashboard"

### 4. Code Review Integration
"Review this code change and create appropriate Jira tasks for any issues found"

## 🚀 Quick Implementation

### 1. Add Atlassian Tools to Agent
```typescript
// In packages/bytebot-agent/src/agent/agent.tools.ts
import { atlassianTools } from '../atlassian/atlassian.tools';

export const agentTools = [
  ...computerTools,
  ...atlassianTools,  // Add Atlassian tools
  ...existingTools
];
```

### 2. Handle Tool Execution
```typescript
// In packages/bytebot-agent/src/agent/agent.computer-use.ts
export async function handleAtlassianToolUse(
  toolUseBlock: ToolUseContentBlock,
  atlassianService: AtlassianService
): Promise<ToolResultContentBlock> {
  switch (toolUseBlock.name) {
    case 'create_jira_issue':
      const result = await atlassianService.createJiraIssue(
        toolUseBlock.input.project,
        toolUseBlock.input.summary,
        toolUseBlock.input.description,
        toolUseBlock.input.issueType
      );
      return {
        type: MessageContentType.ToolResult,
        tool_use_id: toolUseBlock.id,
        content: [
          {
            type: MessageContentType.Text,
            text: `Created Jira issue: ${result.key}\nURL: ${result.self}`
          }
        ]
      };
    // Handle other Atlassian tools...
  }
}
```

## 🔧 Advanced Integration

### Web Interface Automation
Use Bytebot's computer use capabilities to interact with Atlassian web interfaces:

```typescript
// Example task: "Navigate to Jira, create a new issue, and add screenshots"
const task = {
  description: "Create a bug report in Jira with screenshots",
  steps: [
    "Take screenshot of the current error",
    "Navigate to Jira in browser", 
    "Click 'Create Issue'",
    "Fill in issue details",
    "Upload screenshot",
    "Submit issue"
  ]
};
```

### RovoDev API Integration
For advanced Atlassian integrations, you could create an MCP server that connects to RovoDev:

```typescript
// packages/bytebotd/src/mcp/atlassian-mcp.module.ts
@Module({
  providers: [
    {
      provide: 'ATLASSIAN_MCP_SERVER',
      useFactory: () => {
        return new MCPServer({
          name: 'atlassian-integration',
          version: '1.0.0',
          capabilities: {
            tools: {
              jira: ['create', 'update', 'search'],
              confluence: ['create', 'update', 'search']
            }
          }
        });
      }
    }
  ]
})
export class AtlassianMCPModule {}
```

## 📋 Next Steps

1. **Set up Atlassian API tokens** in your Atlassian account
2. **Choose integration approach** (direct API vs MCP vs web automation)
3. **Add environment variables** for Atlassian credentials
4. **Implement core tools** you need most
5. **Test with simple workflows** before complex automation

## 🔧 Troubleshooting Connection Issues

### Current Issue: 404 Error
If you're getting a 404 error when testing the connection:

**1. Verify Site URL:**
- Ensure `https://deshitomat1.atlassian.net` is the correct URL
- Try accessing it directly in a browser
- Check if your organization uses a different subdomain

**2. API Token Verification:**
- Go to: https://id.atlassian.com/manage-profile/security/api-tokens
- Verify the token is still active and not expired
- Regenerate if necessary

**3. Permissions Check:**
- Ensure your Atlassian account has appropriate permissions
- Verify access to both Jira and Confluence
- Check if your organization has IP restrictions

**4. Network/Firewall:**
- Confirm ByteBot can reach external Atlassian URLs
- Check if corporate firewall blocks API calls

### Testing Connection

Once ByteBot is deployed, test with these commands:

```bash
# 1. Test basic connectivity
curl -u your-email@example.com:your-atlassian-api-token \
  https://your-site.atlassian.net/rest/api/3/myself

# 2. Test Jira projects
curl -u your-email@example.com:your-atlassian-api-token \
  https://your-site.atlassian.net/rest/api/3/project
```

### Next Steps for Integration

Once connectivity is resolved, you'll have powerful AI automation capabilities:

**🎯 Smart Jira Workflows:**
- "Take a screenshot and create a detailed bug report"
- "Search for similar issues and update this ticket" 
- "Generate a sprint summary with progress updates"

**📚 Intelligent Confluence:**
- "Document this process with step-by-step screenshots"
- "Create a troubleshooting guide for this issue"
- "Update our knowledge base with this solution"

**🤖 Combined AI + Atlassian Power:**
- "Analyze current desktop issues, create Jira tickets, and document solutions in Confluence"
- "Generate weekly reports combining Jira metrics with Confluence documentation"