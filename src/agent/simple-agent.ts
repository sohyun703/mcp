#!/usr/bin/env node

/**
 * 🤖 간단한 MCP 에이전트
 * 
 * 실제로 MCP 서버와 JSON-RPC로 통신하여
 * 자동으로 작업을 수행하는 AI 에이전트입니다.
 */

import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPResponse {
  content?: Array<{ type: string; text: string }>;
  tools?: MCPTool[];
  error?: string;
}

class SimpleAgent {
  private serverProcess: ChildProcess | null = null;
  private availableTools: MCPTool[] = [];
  private requestId = 1;

  // 🚀 에이전트 시작
  async start() {
    console.log('🤖 MCP 에이전트 시작중...\n');
    
    await this.startMCPServer();
    await this.discoverTools();
    await this.startInteractiveMode();
  }

  // 🔧 MCP 서버 시작
  private async startMCPServer(): Promise<void> {
    console.log('📡 MCP 서버 연결중...');
    
    this.serverProcess = spawn('tsx', ['src/server/enhanced-server.ts'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    if (!this.serverProcess.stdout || !this.serverProcess.stdin) {
      throw new Error('서버 프로세스 생성 실패');
    }

    console.log('✅ MCP 서버 연결 완료!\n');
  }

  // 🔍 사용 가능한 툴 발견
  private async discoverTools(): Promise<void> {
    console.log('🔍 사용 가능한 툴 검색중...');
    
    const response = await this.sendRequest('tools/list', {});
    
    if (response && response.tools) {
      this.availableTools = response.tools;
      console.log(`✅ ${this.availableTools.length}개의 툴을 발견했습니다:`);
      this.availableTools.forEach(tool => {
        console.log(`  🛠️ ${tool.name}: ${tool.description}`);
      });
      console.log('');
    }
  }

  // 📡 MCP 서버에 요청 보내기
  private async sendRequest(method: string, params: any): Promise<MCPResponse | null> {
    if (!this.serverProcess?.stdin || !this.serverProcess?.stdout) {
      console.error('❌ 서버가 연결되지 않았습니다');
      return null;
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params,
    };

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('❌ 요청 시간 초과');
        resolve(null);
      }, 5000);

      const onData = (data: Buffer) => {
        clearTimeout(timeout);
        if (this.serverProcess?.stdout) {
          this.serverProcess.stdout.off('data', onData);
        }
        
        try {
          const response = JSON.parse(data.toString());
          resolve(response.result || response);
        } catch (error) {
          console.error('❌ 응답 파싱 오류:', error);
          resolve(null);
        }
      };

      if (this.serverProcess.stdout && this.serverProcess.stdin) {
        this.serverProcess.stdout.on('data', onData);
        this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
      }
    });
  }

  // 🛠️ 툴 실행
  private async executeTool(toolName: string, args: any): Promise<string> {
    console.log(`🛠️ "${toolName}" 툴 실행중...`, args);
    
    const response = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });

    if (response?.content && response.content.length > 0) {
      return response.content[0].text;
    }

    return response?.error || '알 수 없는 오류가 발생했습니다';
  }

  // 🎯 자동 작업 수행
  private async performAutomaticTasks(): Promise<void> {
    console.log('🎯 자동 작업 수행 모드\n');

    const tasks = [
      {
        name: '현재 시간 확인',
        tool: 'get_current_time',
        args: { format: 'local' }
      },
      {
        name: '프로젝트 디렉토리 확인',
        tool: 'list_directory',
        args: { path: '.' }
      },
      {
        name: '간단한 계산',
        tool: 'calculate',
        args: { expression: '15 * 7 + 25' }
      },
      {
        name: '테스트 파일 생성',
        tool: 'write_file',
        args: { 
          path: 'agent-test.txt', 
          content: '🤖 이 파일은 MCP 에이전트가 자동으로 생성했습니다!\n생성 시간: ' + new Date().toLocaleString('ko-KR')
        }
      },
      {
        name: '생성된 파일 확인',
        tool: 'read_file',
        args: { path: 'agent-test.txt' }
      }
    ];

    for (const task of tasks) {
      console.log(`📋 작업: ${task.name}`);
      try {
        const result = await this.executeTool(task.tool, task.args);
        console.log(`✅ 결과: ${result}\n`);
        
        // 작업 간 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`❌ 실패: ${error}\n`);
      }
    }

    console.log('🎉 모든 자동 작업 완료!\n');
  }

  // 💬 대화형 모드
  private async startInteractiveMode(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('💬 대화형 모드 시작! (명령어 입력 또는 "auto"로 자동 작업 실행)');
    console.log('📋 사용법:');
    console.log('  - auto: 자동 작업 수행');
    console.log('  - tools: 사용 가능한 툴 목록');
    console.log('  - <툴이름> <인자>: 특정 툴 실행');
    console.log('  - quit: 종료\n');

    const askQuestion = () => {
      rl.question('🤖 에이전트에게 명령하세요: ', async (input) => {
        const trimmed = input.trim();
        
        if (trimmed === 'quit') {
          console.log('👋 에이전트를 종료합니다!');
          this.cleanup();
          rl.close();
          process.exit(0);
        }

        if (trimmed === 'auto') {
          await this.performAutomaticTasks();
        } else if (trimmed === 'tools') {
          console.log('\n🛠️ 사용 가능한 툴:');
          this.availableTools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
          });
          console.log('');
        } else {
          await this.handleUserCommand(trimmed);
        }

        askQuestion();
      });
    };

    askQuestion();
  }

  // 🎯 사용자 명령 처리
  private async handleUserCommand(command: string): Promise<void> {
    const parts = command.split(' ');
    const toolName = parts[0];
    
    const tool = this.availableTools.find(t => t.name === toolName);
    if (!tool) {
      console.log(`❌ 알 수 없는 툴: ${toolName}\n`);
      return;
    }

    // 간단한 인자 파싱 (실제로는 더 정교해야 함)
    let args: any = {};
    
    if (toolName === 'get_current_time') {
      args = { format: parts[1] || 'local' };
    } else if (toolName === 'calculate') {
      args = { expression: parts.slice(1).join(' ') };
    } else if (toolName === 'list_directory') {
      args = { path: parts[1] || '.' };
    } else if (toolName === 'read_file') {
      args = { path: parts[1] };
    } else if (toolName === 'write_file') {
      args = { path: parts[1], content: parts.slice(2).join(' ') };
    } else if (toolName === 'search_files') {
      args = { term: parts[1], path: parts[2] || '.' };
    }

    try {
      const result = await this.executeTool(toolName, args);
      console.log(`\n${result}\n`);
    } catch (error) {
      console.log(`❌ 오류: ${error}\n`);
    }
  }

  // 🧹 정리
  private cleanup(): void {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// 🚀 에이전트 실행
const agent = new SimpleAgent();
agent.start().catch(error => {
  console.error('❌ 에이전트 오류:', error);
  process.exit(1);
}); 