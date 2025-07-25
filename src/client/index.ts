#!/usr/bin/env node

/**
 * 🤖 기본 MCP 클라이언트
 * 
 * 이 클라이언트는 MCP 서버와 통신하여:
 * - 사용 가능한 툴 확인
 * - 툴 실행 및 결과 받기
 * - 대화형 인터페이스 제공
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import * as readline from 'readline';

class MCPClient {
  private client: Client;
  private isConnected = false;

  constructor() {
    this.client = new Client(
      {
        name: 'mcp-learning-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  // 🔗 서버에 연결
  async connect() {
    console.log('🔗 MCP 서버에 연결 중...');
    
    // 서버 프로세스 시작
    const serverProcess = spawn('tsx', ['src/server/index.ts'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    // 클라이언트 transport 설정
    const transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });

    await this.client.connect(transport);
    this.isConnected = true;
    
    console.log('✅ 서버 연결 완료!');
  }

  // 📋 사용 가능한 툴 목록 가져오기
  async listTools() {
    if (!this.isConnected) {
      throw new Error('서버에 연결되지 않았습니다');
    }

    const response = await this.client.request(
      { method: 'tools/list' },
      { tools: {} }
    );

    return response.tools;
  }

  // ⚙️ 툴 실행하기
  async callTool(name: string, args: any) {
    if (!this.isConnected) {
      throw new Error('서버에 연결되지 않았습니다');
    }

    const response = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name,
          arguments: args,
        },
      },
      { tools: {} }
    );

    return response.content;
  }

  // 💬 대화형 인터페이스 시작
  async startInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🎉 MCP 대화형 클라이언트에 오신 것을 환영합니다!');
    console.log('💡 사용법:');
    console.log('  - "tools" : 사용 가능한 툴 목록 보기');
    console.log('  - "hello 홍길동" : hello 툴 실행');
    console.log('  - "echo 안녕하세요" : echo 툴 실행');
    console.log('  - "add 5 3" : add 툴 실행');
    console.log('  - "quit" : 종료');
    console.log('');

    const askQuestion = () => {
      rl.question('💻 명령어를 입력하세요: ', async (input) => {
        const trimmed = input.trim();
        
        if (trimmed === 'quit') {
          console.log('👋 안녕히 가세요!');
          rl.close();
          process.exit(0);
        }

        try {
          await this.handleCommand(trimmed);
        } catch (error) {
          console.error('❌ 오류:', error);
        }

        askQuestion();
      });
    };

    askQuestion();
  }

  // 🎯 명령어 처리
  private async handleCommand(command: string) {
    const parts = command.split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case 'tools': {
        const tools = await this.listTools();
        console.log('\n📋 사용 가능한 툴:');
        tools.forEach((tool: any) => {
          console.log(`  - ${tool.name}: ${tool.description}`);
        });
        console.log('');
        break;
      }

      case 'hello': {
        const name = parts.slice(1).join(' ') || '익명';
        const result = await this.callTool('hello', { name });
        console.log(`\n${result[0].text}\n`);
        break;
      }

      case 'echo': {
        const message = parts.slice(1).join(' ');
        if (!message) {
          console.log('❌ 메시지를 입력해주세요. 예: echo 안녕하세요');
          return;
        }
        const result = await this.callTool('echo', { message });
        console.log(`\n${result[0].text}\n`);
        break;
      }

      case 'add': {
        const a = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        if (isNaN(a) || isNaN(b)) {
          console.log('❌ 두 개의 숫자를 입력해주세요. 예: add 5 3');
          return;
        }
        const result = await this.callTool('add', { a, b });
        console.log(`\n${result[0].text}\n`);
        break;
      }

      default:
        console.log('❌ 알 수 없는 명령어입니다. "tools"를 입력해서 사용법을 확인하세요.');
    }
  }
}

// 🚀 클라이언트 실행
async function main() {
  const client = new MCPClient();
  
  try {
    await client.connect();
    await client.startInteractive();
  } catch (error) {
    console.error('❌ 클라이언트 오류:', error);
    process.exit(1);
  }
}

main(); 