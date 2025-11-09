#!/usr/bin/env node

/**
 * Custom v0 MCP Server using v0-sdk
 * v0 Platform API를 MCP 프로토콜로 래핑
 */

import { V0 } from 'v0-sdk';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const V0_API_KEY = process.env.V0_API_KEY;

if (!V0_API_KEY) {
  console.error('Error: V0_API_KEY environment variable is required');
  process.exit(1);
}

// v0 클라이언트 초기화
const v0 = new V0({
  apiKey: V0_API_KEY,
});

// MCP 서버 생성
const server = new Server(
  {
    name: 'v0-platform-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 사용 가능한 도구 목록
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_component',
        description: 'v0를 사용하여 React/Next.js 컴포넌트 생성',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: '생성하고 싶은 컴포넌트에 대한 설명',
            },
            framework: {
              type: 'string',
              enum: ['react', 'nextjs'],
              description: '프레임워크 선택 (기본값: nextjs)',
              default: 'nextjs',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'create_chat',
        description: 'v0와 새로운 채팅 세션 시작',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '첫 메시지',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'list_projects',
        description: 'v0 프로젝트 목록 가져오기',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'generate_component') {
      // v0로 컴포넌트 생성
      const chat = await v0.chats.create({
        messages: [
          {
            role: 'user',
            content: args.prompt,
          },
        ],
      });

      return {
        content: [
          {
            type: 'text',
            text: `Chat created with ID: ${chat.id}\n\nGenerated code:\n${JSON.stringify(chat, null, 2)}`,
          },
        ],
      };
    } else if (name === 'create_chat') {
      const chat = await v0.chats.create({
        messages: [
          {
            role: 'user',
            content: args.message,
          },
        ],
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(chat, null, 2),
          },
        ],
      };
    } else if (name === 'list_projects') {
      const projects = await v0.projects.list();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('v0 Platform MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});



