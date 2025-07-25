#!/usr/bin/env node

/**
 * 🚀 기본 MCP 서버 - Hello World!
 * 
 * 이 서버는 MCP 프로토콜의 기본 구조를 보여줍니다:
 * - 툴(도구) 제공
 * - 리소스 관리 
 * - 프롬프트 처리
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// 🔧 사용 가능한 툴 정의
const TOOLS: Tool[] = [
  {
    name: 'hello',
    description: '친근한 인사를 건네는 툴입니다',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '인사할 대상의 이름',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'echo',
    description: '입력된 메시지를 그대로 반환하는 에코 툴',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: '반복할 메시지',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'add',
    description: '두 숫자를 더하는 계산기 툴',
    inputSchema: {
      type: 'object',
      properties: {
        a: {
          type: 'number',
          description: '첫 번째 숫자',
        },
        b: {
          type: 'number',
          description: '두 번째 숫자',
        },
      },
      required: ['a', 'b'],
    },
  },
];

// 🎯 MCP 서버 생성
const server = new Server(
  {
    name: 'hello-world-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 📋 툴 목록 요청 처리
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('🔍 클라이언트가 툴 목록을 요청했습니다');
  return {
    tools: TOOLS,
  };
});

// ⚙️ 툴 실행 요청 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.log(`🛠️ 툴 "${name}" 실행 요청:`, args);

  switch (name) {
    case 'hello': {
      const { name: userName } = args as { name: string };
      return {
        content: [
          {
            type: 'text',
            text: `안녕하세요, ${userName}님! 🎉 MCP 서버에서 인사드립니다!`,
          },
        ],
      };
    }

    case 'echo': {
      const { message } = args as { message: string };
      return {
        content: [
          {
            type: 'text',
            text: `🔄 에코: ${message}`,
          },
        ],
      };
    }

    case 'add': {
      const { a, b } = args as { a: number; b: number };
      const result = a + b;
      return {
        content: [
          {
            type: 'text',
            text: `🧮 계산 결과: ${a} + ${b} = ${result}`,
          },
        ],
      };
    }

    default:
      throw new Error(`알 수 없는 툴입니다: ${name}`);
  }
});

// 🚀 서버 시작
async function main() {
  console.log('🎯 MCP 서버 시작중...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('✅ Hello World MCP 서버가 준비되었습니다!');
  console.log('📋 사용 가능한 툴:', TOOLS.map(t => t.name).join(', '));
}

main().catch((error) => {
  console.error('❌ 서버 오류:', error);
  process.exit(1);
}); 