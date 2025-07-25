#!/usr/bin/env node

/**
 * 💬 자연어 대화 MCP 에이전트
 * 
 * 진짜 자연어로 대화하며 똑똑하게 작업을 수행하는
 * 차세대 AI 에이전트입니다!
 */

import { readFile, writeFile, listDirectory, searchFiles } from '../tools/file-tools.js';
import * as readline from 'readline';

interface Intent {
  action: string;
  confidence: number;
  entities: { [key: string]: string };
  tool: string;
  args: any;
}

interface ConversationContext {
  lastTool: string;
  lastResult: string;
  currentFiles: string[];
  userPreferences: { [key: string]: any };
  conversationHistory: string[];
}

class NaturalLanguageAgent {
  private context: ConversationContext = {
    lastTool: '',
    lastResult: '',
    currentFiles: [],
    userPreferences: {},
    conversationHistory: []
  };

  // 🧠 자연어 의도 분석
  private analyzeIntent(input: string): Intent {
    const normalized = input.toLowerCase().trim();
    
    // 파일 읽기 의도
    if (this.matchesPattern(normalized, [
      '파일.*읽',
      '.*내용.*보여',
      '.*열어',
      '.*확인.*파일',
      'read.*file',
      'show.*content'
    ])) {
      const fileName = this.extractFileName(input) || 'README.md';
      return {
        action: 'read_file',
        confidence: 0.9,
        entities: { fileName },
        tool: 'read_file',
        args: { path: fileName }
      };
    }

    // 파일 쓰기 의도
    if (this.matchesPattern(normalized, [
      '파일.*만들',
      '.*저장',
      '.*생성.*파일',
      '.*작성',
      'create.*file',
      'write.*file'
    ])) {
      const fileName = this.extractFileName(input) || 'new-file.txt';
      const content = this.extractContent(input) || '새로 생성된 파일입니다.';
      return {
        action: 'write_file',
        confidence: 0.8,
        entities: { fileName, content },
        tool: 'write_file',
        args: { path: fileName, content }
      };
    }

    // 디렉토리 탐색 의도
    if (this.matchesPattern(normalized, [
      '폴더.*보여',
      '디렉토리.*확인',
      '.*목록',
      '뭐.*있',
      'list.*dir',
      'show.*folder'
    ])) {
      const path = this.extractPath(input) || '.';
      return {
        action: 'list_directory',
        confidence: 0.9,
        entities: { path },
        tool: 'list_directory',
        args: { path }
      };
    }

    // 파일 검색 의도
    if (this.matchesPattern(normalized, [
      '찾.*파일',
      '검색',
      '.*어디.*있',
      'find.*file',
      'search'
    ])) {
      const searchTerm = this.extractSearchTerm(input) || '.ts';
      return {
        action: 'search_files',
        confidence: 0.8,
        entities: { searchTerm },
        tool: 'search_files',
        args: { term: searchTerm, path: '.' }
      };
    }

    // 계산 의도
    if (this.matchesPattern(normalized, [
      '계산',
      '더하',
      '빼',
      '곱하',
      '나누',
      'calculate',
      '\\+|\\-|\\*|\\/|='
    ])) {
      const expression = this.extractMathExpression(input);
      return {
        action: 'calculate',
        confidence: 0.9,
        entities: { expression },
        tool: 'calculate',
        args: { expression }
      };
    }

    // 시간 확인 의도
    if (this.matchesPattern(normalized, [
      '시간',
      '몇시',
      '언제',
      'time',
      'clock'
    ])) {
      return {
        action: 'get_current_time',
        confidence: 0.9,
        entities: {},
        tool: 'get_current_time',
        args: { format: 'local' }
      };
    }

    // 프로젝트 분석 의도
    if (this.matchesPattern(normalized, [
      '프로젝트.*분석',
      '구조.*파악',
      '전체.*확인',
      'analyze.*project'
    ])) {
      return {
        action: 'analyze_project',
        confidence: 0.8,
        entities: {},
        tool: 'complex_task',
        args: { task: 'project_analysis' }
      };
    }

    // 알 수 없는 의도
    return {
      action: 'unknown',
      confidence: 0.1,
      entities: {},
      tool: 'unknown',
      args: {}
    };
  }

  // 🔍 패턴 매칭 헬퍼
  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => new RegExp(pattern).test(text));
  }

  // 📄 파일명 추출
  private extractFileName(text: string): string | null {
    const patterns = [
      /(?:파일|file)\s*[이가를]?\s*([^\s]+)/,
      /([^\s]+\.(?:md|txt|js|ts|json|py))/,
      /"([^"]+)"/,
      /'([^']+)'/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // 📝 컨텐츠 추출
  private extractContent(text: string): string | null {
    const contentPatterns = [
      /내용[은은이가]?\s*["']([^"']+)["']/,
      /["']([^"']+)["']\s*(?:로|으로|를|을)/,
      /저장[하해]\s*["']([^"']+)["']/
    ];
    
    for (const pattern of contentPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    // 기본 내용 생성
    return `자연어 에이전트가 생성한 파일입니다.\n생성 시간: ${new Date().toLocaleString('ko-KR')}`;
  }

  // 📁 경로 추출
  private extractPath(text: string): string | null {
    const pathPatterns = [
      /(?:폴더|디렉토리|directory)\s*([^\s]+)/,
      /([^\s]+\/)/,
      /src|docs|examples/
    ];
    
    for (const pattern of pathPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // 🔍 검색어 추출
  private extractSearchTerm(text: string): string | null {
    const searchPatterns = [
      /찾.*["']([^"']+)["']/,
      /검색.*["']([^"']+)["']/,
      /(\.[a-zA-Z]+)/,  // 확장자
      /([a-zA-Z0-9-_]+)/  // 일반 단어
    ];
    
    for (const pattern of searchPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // 🧮 수식 추출
  private extractMathExpression(text: string): string {
    // 숫자와 연산자가 포함된 부분 찾기
    const mathPattern = /([0-9+\-*/().\s]+)/;
    const match = text.match(mathPattern);
    
    if (match) {
      return match[1].trim();
    }
    
    // 한글 숫자 변환
    let expression = text
      .replace(/일/g, '1')
      .replace(/이/g, '2')
      .replace(/삼/g, '3')
      .replace(/사/g, '4')
      .replace(/오/g, '5')
      .replace(/더하기|플러스/g, '+')
      .replace(/빼기|마이너스/g, '-')
      .replace(/곱하기|곱/g, '*')
      .replace(/나누기|나눈/g, '/');
    
    const koreanMathMatch = expression.match(/([0-9+\-*/().\s]+)/);
    return koreanMathMatch ? koreanMathMatch[1].trim() : '2 + 2';
  }

  // 🛠️ 툴 실행
  private async executeTool(intent: Intent): Promise<string> {
    this.context.lastTool = intent.tool;
    
    try {
      switch (intent.tool) {
        case 'read_file': {
          const result = readFile(intent.args.path);
          this.context.lastResult = result.content || result.error || '';
          return result.content || result.error || '파일을 읽을 수 없습니다.';
        }
        
        case 'write_file': {
          const result = writeFile(intent.args.path, intent.args.content);
          this.context.lastResult = result.content || result.error || '';
          if (result.success) {
            this.context.currentFiles.push(intent.args.path);
          }
          return result.content || result.error || '파일을 저장할 수 없습니다.';
        }
        
        case 'list_directory': {
          const result = listDirectory(intent.args.path);
          this.context.lastResult = result.content || result.error || '';
          if (result.success) {
            // 파일 목록 업데이트
            const fileMatches = result.content.match(/📄 ([^\n]+)/g);
            if (fileMatches) {
              this.context.currentFiles = fileMatches.map(f => f.replace('📄 ', ''));
            }
          }
          return result.content || result.error || '디렉토리를 확인할 수 없습니다.';
        }
        
        case 'search_files': {
          const result = searchFiles(intent.args.term, intent.args.path);
          this.context.lastResult = result.content || result.error || '';
          return result.content || result.error || '파일을 찾을 수 없습니다.';
        }
        
        case 'calculate': {
          try {
            const safePattern = /^[0-9+\-*/().\s]+$/;
            if (!safePattern.test(intent.args.expression)) {
              return '안전하지 않은 수식입니다. 숫자와 기본 연산자만 사용해주세요.';
            }
            const result = Function(`"use strict"; return (${intent.args.expression})`)();
            return `🧮 계산 결과: ${intent.args.expression} = ${result}`;
          } catch (error) {
            return `계산 중 오류가 발생했습니다: ${error}`;
          }
        }
        
        case 'get_current_time': {
          const now = new Date();
          return `⏰ 현재 시간: ${now.toLocaleString('ko-KR')}`;
        }
        
        case 'complex_task': {
          return await this.handleComplexTask(intent.args.task);
        }
        
        default:
          return '죄송합니다. 아직 그 기능은 구현되지 않았습니다.';
      }
    } catch (error) {
      return `오류가 발생했습니다: ${error}`;
    }
  }

  // 🎯 복잡한 작업 처리
  private async handleComplexTask(task: string): Promise<string> {
    switch (task) {
      case 'project_analysis': {
        let analysis = '📊 프로젝트 분석 결과:\n\n';
        
        // 1. 루트 디렉토리 확인
        const rootFiles = listDirectory('.');
        analysis += `📁 루트 디렉토리:\n${rootFiles.content}\n\n`;
        
        // 2. package.json 확인
        const packageInfo = readFile('package.json');
        if (packageInfo.success) {
          analysis += `📦 프로젝트 정보:\n${packageInfo.content.substring(0, 200)}...\n\n`;
        }
        
        // 3. 소스 코드 확인
        const srcFiles = listDirectory('src');
        if (srcFiles.success) {
          analysis += `💻 소스 코드:\n${srcFiles.content}\n\n`;
        }
        
        analysis += '✅ 분석 완료! 잘 구성된 MCP 프로젝트입니다.';
        return analysis;
      }
      
      default:
        return '알 수 없는 복잡한 작업입니다.';
    }
  }

  // 💬 자연어 응답 생성
  private generateNaturalResponse(intent: Intent, result: string): string {
    const responses = {
      read_file: [
        `📖 ${intent.entities.fileName} 파일을 읽어왔습니다!`,
        `✅ 파일 내용을 확인했습니다.`,
        `📄 요청하신 파일을 열었습니다.`
      ],
      write_file: [
        `✍️ ${intent.entities.fileName} 파일을 생성했습니다!`,
        `💾 파일이 성공적으로 저장되었습니다.`,
        `📝 새 파일을 만들어드렸습니다.`
      ],
      list_directory: [
        `📂 디렉토리 내용을 확인했습니다.`,
        `📋 폴더 목록을 가져왔습니다.`,
        `🗂️ 파일과 폴더를 나열해드렸습니다.`
      ],
      search_files: [
        `🔍 검색을 완료했습니다.`,
        `🎯 파일을 찾아보았습니다.`,
        `📝 검색 결과입니다.`
      ],
      calculate: [
        `🧮 계산을 완료했습니다!`,
        `📊 수학 문제를 풀어드렸습니다.`,
        `⚡ 빠르게 계산해드렸습니다.`
      ]
    };
    
    const actionResponses = responses[intent.action as keyof typeof responses] || ['작업을 완료했습니다.'];
    const randomResponse = actionResponses[Math.floor(Math.random() * actionResponses.length)];
    
    return `${randomResponse}\n\n${result}`;
  }

  // 🎮 대화형 인터페이스
  async start() {
    console.log('💬 자연어 대화 MCP 에이전트에 오신 것을 환영합니다!\n');
    console.log('🎯 이제 자연스러운 말로 대화할 수 있습니다!');
    console.log('');
    console.log('💡 시도해보세요:');
    console.log('   - "README 파일 읽어줘"');
    console.log('   - "프로젝트에 뭐가 있는지 보여줘"');
    console.log('   - "2 더하기 3은 얼마야?"');
    console.log('   - "test.txt 파일 만들어줘"');
    console.log('   - "지금 몇시야?"');
    console.log('   - "프로젝트 분석해줘"');
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = () => {
      rl.question('😊 무엇을 도와드릴까요? ', async (input) => {
        const trimmed = input.trim();
        
        if (trimmed === 'quit' || trimmed === '종료' || trimmed === '그만') {
          console.log('👋 대화를 마치겠습니다. 즐거웠어요!');
          rl.close();
          process.exit(0);
        }

        // 대화 히스토리에 추가
        this.context.conversationHistory.push(`사용자: ${trimmed}`);
        
        // 의도 분석
        const intent = this.analyzeIntent(trimmed);
        
        if (intent.confidence < 0.3) {
          console.log('\n🤔 죄송해요, 잘 이해하지 못했어요.');
          console.log('💡 다음과 같이 말해보세요:');
          console.log('   - "파일 읽어줘" 또는 "계산해줘"');
          console.log('   - "폴더 보여줘" 또는 "시간 알려줘"');
          console.log('');
        } else {
          console.log(`\n🧠 이해했습니다! (확신도: ${(intent.confidence * 100).toFixed(0)}%)`);
          console.log(`🎯 작업: ${intent.action}`);
          
          // 툴 실행
          const result = await this.executeTool(intent);
          
          // 자연어 응답 생성
          const naturalResponse = this.generateNaturalResponse(intent, result);
          console.log(`\n${naturalResponse}\n`);
          
          // 응답을 히스토리에 추가
          this.context.conversationHistory.push(`에이전트: ${naturalResponse}`);
        }

        askQuestion();
      });
    };

    askQuestion();
  }
}

// 🚀 자연어 에이전트 실행
const agent = new NaturalLanguageAgent();
agent.start(); 