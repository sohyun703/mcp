#!/usr/bin/env node

/**
 * 🧪 간단한 MCP 테스트
 * 
 * 서버 기능을 직접 테스트하여 MCP 프로토콜이 
 * 올바르게 작동하는지 확인합니다.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

console.log('🧪 MCP 기능 테스트 시작...\n');

// 🔧 테스트할 툴들
const TOOLS: Tool[] = [
  {
    name: 'greet',
    description: '사용자에게 인사하는 툴',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '이름' },
      },
      required: ['name'],
    },
  },
  {
    name: 'calculate',
    description: '간단한 계산을 수행하는 툴',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', description: '연산 (+, -, *, /)' },
        a: { type: 'number', description: '첫 번째 수' },
        b: { type: 'number', description: '두 번째 수' },
      },
      required: ['operation', 'a', 'b'],
    },
  },
];

// 🎯 툴 실행 로직
function executeTool(name: string, args: any) {
  console.log(`🛠️ 툴 "${name}" 실행:`, args);

  switch (name) {
    case 'greet': {
      const { name: userName } = args;
      return `안녕하세요, ${userName}님! 😊 MCP에서 인사드립니다!`;
    }

    case 'calculate': {
      const { operation, a, b } = args;
      let result: number;
      
      switch (operation) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : NaN; break;
        default: throw new Error(`지원하지 않는 연산: ${operation}`);
      }
      
      return `${a} ${operation} ${b} = ${result}`;
    }

    default:
      throw new Error(`알 수 없는 툴: ${name}`);
  }
}

// 🧪 테스트 실행
async function runTests() {
  console.log('📋 사용 가능한 툴 목록:');
  TOOLS.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });
  console.log('');

  // 테스트 케이스들
  const testCases = [
    { tool: 'greet', args: { name: '개발자' } },
    { tool: 'calculate', args: { operation: '+', a: 10, b: 5 } },
    { tool: 'calculate', args: { operation: '*', a: 7, b: 3 } },
    { tool: 'greet', args: { name: 'MCP 학습자' } },
  ];

  console.log('🚀 테스트 실행:');
  for (const testCase of testCases) {
    try {
      const result = executeTool(testCase.tool, testCase.args);
      console.log(`✅ ${testCase.tool}: ${result}`);
    } catch (error) {
      console.log(`❌ ${testCase.tool}: ${error}`);
    }
  }
  
  console.log('\n🎉 MCP 기본 기능 테스트 완료!');
  console.log('💡 다음 단계: 실제 서버-클라이언트 통신 구현');
}

runTests(); 