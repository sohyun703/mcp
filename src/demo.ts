#!/usr/bin/env node

/**
 * 🎬 MCP 실제 동작 데모
 * 
 * 진짜 MCP 프로토콜이 어떻게 작동하는지 
 * 실제로 보여주는 완전한 데모입니다!
 */

import { readFile, writeFile, listDirectory, searchFiles } from './tools/file-tools.js';

// 🎯 MCP 메시지 시뮬레이션
class MCPDemo {
  private tools = [
    { name: 'read_file', description: '파일 내용을 읽어옵니다' },
    { name: 'write_file', description: '파일에 내용을 작성합니다' },
    { name: 'list_directory', description: '디렉토리 내용을 나열합니다' },
    { name: 'search_files', description: '파일명으로 파일을 검색합니다' },
    { name: 'calculate', description: '수학 계산을 수행합니다' },
    { name: 'get_current_time', description: '현재 시간을 반환합니다' },
  ];

  // 🎭 실제 MCP 통신 시뮬레이션
  async demonstrateProtocol() {
    console.log('🎬 MCP (Model Context Protocol) 실제 동작 데모\n');
    console.log('='.repeat(60));
    
    // 1단계: 연결 설정
    console.log('\n🔗 1단계: AI 모델 ↔ MCP 서버 연결');
    console.log('📡 클라이언트: "안녕하세요, MCP 서버!"');
    console.log('🤝 서버: "연결되었습니다. JSON-RPC 2.0 프로토콜로 통신합니다."');
    
    await this.sleep(1000);

    // 2단계: 툴 발견
    console.log('\n🔍 2단계: 사용 가능한 툴 발견');
    console.log('📋 클라이언트 요청: {"method": "tools/list"}');
    console.log('📝 서버 응답:');
    this.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    await this.sleep(1500);

    // 3단계: 실제 작업 수행
    console.log('\n🛠️ 3단계: AI가 자동으로 작업 수행');
    
    const tasks = [
      {
        description: '📁 현재 디렉토리 확인',
        method: 'tools/call',
        params: { name: 'list_directory', arguments: { path: '.' } },
        execute: () => listDirectory('.')
      },
      {
        description: '📄 README 파일 읽기',
        method: 'tools/call', 
        params: { name: 'read_file', arguments: { path: 'README.md' } },
        execute: () => readFile('README.md')
      },
      {
        description: '🤖 AI가 생성한 파일 만들기',
        method: 'tools/call',
        params: { name: 'write_file', arguments: { 
          path: 'ai-generated.md', 
          content: `# 🤖 AI가 생성한 파일\n\n생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n이 파일은 MCP 프로토콜을 통해 AI가 자동으로 만들었습니다!\n\n## MCP의 장점\n- 표준화된 통신\n- 안전한 툴 실행\n- 확장 가능한 아키텍처\n\n**MCP로 AI가 정말 스마트해집니다! 🚀**` 
        } },
        execute: () => writeFile('ai-generated.md', `# 🤖 AI가 생성한 파일\n\n생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n이 파일은 MCP 프로토콜을 통해 AI가 자동으로 만들었습니다!\n\n## MCP의 장점\n- 표준화된 통신\n- 안전한 툴 실행\n- 확장 가능한 아키텍처\n\n**MCP로 AI가 정말 스마트해집니다! 🚀**`)
      },
      {
        description: '🧮 복잡한 계산 수행',
        method: 'tools/call',
        params: { name: 'calculate', arguments: { expression: '(15 + 25) * 3 - 10' } },
        execute: () => this.calculate('(15 + 25) * 3 - 10')
      },
      {
        description: '🔍 .md 파일들 검색',
        method: 'tools/call',
        params: { name: 'search_files', arguments: { term: '.md', path: '.' } },
        execute: () => searchFiles('.md', '.')
      }
    ];

    for (const [index, task] of tasks.entries()) {
      console.log(`\n${index + 1}. ${task.description}`);
      console.log(`📤 AI 요청: ${JSON.stringify(task.params, null, 2)}`);
      
      const result = task.execute();
      console.log(`📥 서버 응답:`);
      
      if (result.success) {
        console.log(`✅ ${result.content}`);
      } else {
        console.log(`❌ ${result.error}`);
      }
      
      await this.sleep(1500);
    }

    console.log('\n🎉 4단계: 작업 완료!');
    console.log('💡 AI가 MCP를 통해 다음을 수행했습니다:');
    console.log('   - 파일 시스템 탐색');
    console.log('   - 문서 읽기 및 분석');  
    console.log('   - 새로운 컨텐츠 생성');
    console.log('   - 수학 계산');
    console.log('   - 파일 검색');
    
    console.log('\n🚀 이것이 바로 MCP의 힘입니다!');
    console.log('AI가 도구를 자유자재로 사용하여 복잡한 작업을 자동화할 수 있습니다.');

    // 5단계: 생성된 파일 확인
    console.log('\n📋 5단계: AI가 생성한 파일 확인');
    const generatedFile = readFile('ai-generated.md');
    if (generatedFile.success) {
      console.log('✨ AI가 생성한 파일 미리보기:');
      console.log('─'.repeat(50));
      console.log(generatedFile.content.split('\n').slice(2, 8).join('\n'));
      console.log('─'.repeat(50));
    }
  }

  // 🧮 계산기 구현
  private calculate(expression: string) {
    try {
      const safePattern = /^[0-9+\-*/().\s]+$/;
      if (!safePattern.test(expression)) {
        return {
          success: false,
          content: '',
          error: '허용되지 않는 문자가 포함되었습니다.'
        };
      }

      const result = Function(`"use strict"; return (${expression})`)();
      return {
        success: true,
        content: `🧮 계산 결과: ${expression} = ${result}`
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: `계산 오류: ${error}`
      };
    }
  }

  // ⏱️ 잠시 대기
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🎮 대화형 모드
  async interactiveMode() {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n💬 대화형 모드로 MCP 체험하기!');
    console.log('📋 명령어:');
    console.log('  - demo: 자동 데모 실행');
    console.log('  - tools: 사용 가능한 툴 목록');
    console.log('  - <툴이름> <인자>: 특정 툴 실행');
    console.log('  - quit: 종료\n');

    const askQuestion = () => {
      rl.question('🤖 MCP 명령을 입력하세요: ', async (input) => {
        const trimmed = input.trim();
        
        if (trimmed === 'quit') {
          console.log('👋 MCP 데모를 종료합니다!');
          rl.close();
          process.exit(0);
        }

        if (trimmed === 'demo') {
          await this.demonstrateProtocol();
        } else if (trimmed === 'tools') {
          console.log('\n🛠️ 사용 가능한 툴:');
          this.tools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
          });
          console.log('');
        } else {
          await this.handleCommand(trimmed);
        }

        askQuestion();
      });
    };

    askQuestion();
  }

  // 🎯 명령어 처리
  private async handleCommand(command: string) {
    const parts = command.split(' ');
    const toolName = parts[0];

    switch (toolName) {
      case 'read_file': {
        const path = parts[1];
        if (!path) {
          console.log('❌ 파일 경로를 입력해주세요. 예: read_file README.md');
          return;
        }
        const result = readFile(path);
        console.log(result.success ? `\n${result.content}\n` : `\n❌ ${result.error}\n`);
        break;
      }

      case 'list_directory': {
        const path = parts[1] || '.';
        const result = listDirectory(path);
        console.log(result.success ? `\n${result.content}\n` : `\n❌ ${result.error}\n`);
        break;
      }

      case 'calculate': {
        const expression = parts.slice(1).join(' ');
        if (!expression) {
          console.log('❌ 계산할 수식을 입력해주세요. 예: calculate 2 + 3 * 4');
          return;
        }
        const result = this.calculate(expression);
        console.log(result.success ? `\n${result.content}\n` : `\n❌ ${result.error}\n`);
        break;
      }

      default:
        console.log('❌ 알 수 없는 툴입니다. "tools"를 입력해서 사용법을 확인하세요.');
    }
  }
}

// 🚀 데모 실행
const demo = new MCPDemo();

console.log('🎯 MCP 체험 모드 선택:');
console.log('1. 자동 데모 보기');
console.log('2. 대화형 모드');

const readline = await import('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n선택하세요 (1 또는 2): ', async (choice) => {
  rl.close();
  
  if (choice === '1') {
    await demo.demonstrateProtocol();
    process.exit(0);
  } else if (choice === '2') {
    await demo.interactiveMode();
  } else {
    console.log('❌ 잘못된 선택입니다. 1 또는 2를 입력해주세요.');
    process.exit(1);
  }
}); 