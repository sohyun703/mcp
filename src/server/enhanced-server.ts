#!/usr/bin/env node

/**
 * 🚀 향상된 MCP 서버
 * 
 * 실용적인 툴들을 제공하는 더 강력한 MCP 서버입니다:
 * - 파일 시스템 조작
 * - 간단한 계산
 * - 유틸리티 기능들
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile, listDirectory, searchFiles } from '../tools/file-tools.js';

// 🛠️ 향상된 툴 목록
const ENHANCED_TOOLS: Tool[] = [
  {
    name: 'read_file',
    description: '파일 내용을 읽어옵니다',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '읽을 파일의 경로' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: '파일에 내용을 작성합니다',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '작성할 파일의 경로' },
        content: { type: 'string', description: '파일에 쓸 내용' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory',
    description: '디렉토리 내용을 나열합니다',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '나열할 디렉토리 경로 (기본값: 현재 디렉토리)' },
      },
    },
  },
  {
    name: 'search_files',
    description: '파일명으로 파일을 검색합니다',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: '검색할 단어' },
        path: { type: 'string', description: '검색할 디렉토리 경로 (기본값: 현재 디렉토리)' },
      },
      required: ['term'],
    },
  },
  {
    name: 'calculate',
    description: '수학 계산을 수행합니다',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: '계산할 수식 (예: 2 + 3 * 4)' },
      },
      required: ['expression'],
    },
  },
  {
    name: 'get_current_time',
    description: '현재 시간을 반환합니다',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', description: '시간 형식 (iso, local, timestamp)' },
      },
    },
  },
];

// 🧮 안전한 계산기
function safeCalculate(expression: string): string {
  try {
    // 안전한 수식만 허용 (숫자, 연산자, 공백, 괄호)
    const safePattern = /^[0-9+\-*/().\s]+$/;
    if (!safePattern.test(expression)) {
      return '❌ 허용되지 않는 문자가 포함되었습니다. 숫자와 +, -, *, /, (), . 만 사용 가능합니다.';
    }

    const result = Function(`"use strict"; return (${expression})`)();
    return `🧮 계산 결과: ${expression} = ${result}`;
  } catch (error) {
    return `❌ 계산 오류: ${error}`;
  }
}

// ⏰ 현재 시간 가져오기
function getCurrentTime(format: string = 'local'): string {
  const now = new Date();
  
  switch (format) {
    case 'iso':
      return `🕐 현재 시간 (ISO): ${now.toISOString()}`;
    case 'timestamp':
      return `🕐 현재 시간 (timestamp): ${now.getTime()}`;
    case 'local':
    default:
      return `🕐 현재 시간: ${now.toLocaleString('ko-KR')}`;
  }
}

// 🎯 서버 생성
const server = new Server(
  {
    name: 'enhanced-mcp-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 📋 툴 목록 요청 처리
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('🔍 클라이언트가 향상된 툴 목록을 요청했습니다');
  return { tools: ENHANCED_TOOLS };
});

// ⚙️ 툴 실행 요청 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.log(`🛠️ 툴 "${name}" 실행 요청:`, args);

  try {
    switch (name) {
      case 'read_file': {
        const { path } = args as { path: string };
        const result = readFile(path);
        return {
          content: [{ type: 'text', text: result.content || result.error || '알 수 없는 오류' }],
        };
      }

      case 'write_file': {
        const { path, content } = args as { path: string; content: string };
        const result = writeFile(path, content);
        return {
          content: [{ type: 'text', text: result.content || result.error || '알 수 없는 오류' }],
        };
      }

      case 'list_directory': {
        const { path = '.' } = args as { path?: string };
        const result = listDirectory(path);
        return {
          content: [{ type: 'text', text: result.content || result.error || '알 수 없는 오류' }],
        };
      }

      case 'search_files': {
        const { term, path = '.' } = args as { term: string; path?: string };
        const result = searchFiles(term, path);
        return {
          content: [{ type: 'text', text: result.content || result.error || '알 수 없는 오류' }],
        };
      }

      case 'calculate': {
        const { expression } = args as { expression: string };
        const result = safeCalculate(expression);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_current_time': {
        const { format = 'local' } = args as { format?: string };
        const result = getCurrentTime(format);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      default:
        throw new Error(`알 수 없는 툴입니다: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `❌ 오류: ${error}` }],
    };
  }
});

// 🚀 서버 시작
async function main() {
  console.log('🎯 향상된 MCP 서버 시작중...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('✅ 향상된 MCP 서버가 준비되었습니다!');
  console.log('🛠️ 사용 가능한 툴:', ENHANCED_TOOLS.map(t => t.name).join(', '));
}

main().catch((error) => {
  console.error('❌ 서버 오류:', error);
  process.exit(1);
}); 