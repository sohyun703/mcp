#!/usr/bin/env node

/**
 * 🎮 대화형 MCP 툴 테스터
 * 
 * 향상된 MCP 툴들을 쉽게 테스트할 수 있는 
 * 대화형 인터페이스를 제공합니다.
 */

import { readFile, writeFile, listDirectory, searchFiles } from './tools/file-tools.js';
import * as readline from 'readline';

class MCPTester {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  // 🎯 시작
  async start() {
    console.log('🎮 MCP 대화형 테스터에 오신 것을 환영합니다!\n');
    this.showHelp();
    this.askQuestion();
  }

  // 💡 도움말 표시
  private showHelp() {
    console.log('💡 사용 가능한 명령어:');
    console.log('  📖 read <파일경로>           - 파일 읽기');
    console.log('  ✍️  write <파일경로> <내용>    - 파일 쓰기');
    console.log('  📂 list [디렉토리]           - 디렉토리 목록');
    console.log('  🔍 search <검색어> [디렉토리] - 파일 검색');
    console.log('  🧮 calc <수식>               - 계산하기');
    console.log('  ⏰ time [형식]               - 현재 시간');
    console.log('  💡 help                     - 도움말');
    console.log('  👋 quit                     - 종료\n');
  }

  // ❓ 질문하기
  private askQuestion() {
    this.rl.question('💻 명령어를 입력하세요: ', async (input) => {
      const trimmed = input.trim();
      
      if (trimmed === 'quit') {
        console.log('👋 안녕히 가세요!');
        this.rl.close();
        process.exit(0);
      }

      await this.handleCommand(trimmed);
      this.askQuestion();
    });
  }

  // 🎯 명령어 처리
  private async handleCommand(command: string) {
    const parts = command.split(' ');
    const cmd = parts[0];

    try {
      switch (cmd) {
        case 'help':
          this.showHelp();
          break;

        case 'read': {
          const path = parts[1];
          if (!path) {
            console.log('❌ 파일 경로를 입력해주세요. 예: read README.md');
            return;
          }
          
          const result = readFile(path);
          this.printResult(result);
          break;
        }

        case 'write': {
          const path = parts[1];
          const content = parts.slice(2).join(' ');
          if (!path || !content) {
            console.log('❌ 파일 경로와 내용을 입력해주세요. 예: write test.txt 안녕하세요');
            return;
          }
          
          const result = writeFile(path, content);
          this.printResult(result);
          break;
        }

        case 'list': {
          const path = parts[1] || '.';
          const result = listDirectory(path);
          this.printResult(result);
          break;
        }

        case 'search': {
          const term = parts[1];
          const path = parts[2] || '.';
          if (!term) {
            console.log('❌ 검색어를 입력해주세요. 예: search .md');
            return;
          }
          
          const result = searchFiles(term, path);
          this.printResult(result);
          break;
        }

        case 'calc': {
          const expression = parts.slice(1).join(' ');
          if (!expression) {
            console.log('❌ 계산할 수식을 입력해주세요. 예: calc 2 + 3 * 4');
            return;
          }
          
          const result = this.safeCalculate(expression);
          console.log(`\n${result}\n`);
          break;
        }

        case 'time': {
          const format = parts[1] || 'local';
          const result = this.getCurrentTime(format);
          console.log(`\n${result}\n`);
          break;
        }

        default:
          console.log('❌ 알 수 없는 명령어입니다. "help"를 입력해서 사용법을 확인하세요.');
      }
    } catch (error) {
      console.log(`❌ 오류 발생: ${error}`);
    }
  }

  // 📊 결과 출력
  private printResult(result: { success: boolean; content: string; error?: string }) {
    if (result.success) {
      console.log(`\n${result.content}\n`);
    } else {
      console.log(`\n❌ ${result.error}\n`);
    }
  }

  // 🧮 안전한 계산기
  private safeCalculate(expression: string): string {
    try {
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

  // ⏰ 현재 시간
  private getCurrentTime(format: string = 'local'): string {
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
}

// 🚀 실행
const tester = new MCPTester();
tester.start(); 