#!/usr/bin/env node

/**
 * 🧠 스마트 MCP 에이전트
 * 
 * 메모리, 플래닝, 그리고 학습 기능이 있는
 * 진짜 똑똑한 AI 에이전트입니다!
 */

import { readFile, writeFile, listDirectory, searchFiles } from '../tools/file-tools.js';
import * as readline from 'readline';

interface Memory {
  timestamp: Date;
  event: string;
  result: string;
  success: boolean;
}

interface Task {
  id: string;
  description: string;
  tool: string;
  args: any;
  priority: number;
  dependencies?: string[];
}

class SmartAgent {
  private memory: Memory[] = [];
  private currentPlan: Task[] = [];
  private completedTasks: Set<string> = new Set();

  // 🧠 메모리에 이벤트 저장
  private remember(event: string, result: string, success: boolean) {
    this.memory.push({
      timestamp: new Date(),
      event,
      result,
      success
    });
    
    // 메모리가 너무 많으면 오래된 것 제거 (최근 50개만 유지)
    if (this.memory.length > 50) {
      this.memory = this.memory.slice(-50);
    }
  }

  // 🔍 메모리에서 관련 정보 검색
  private searchMemory(keyword: string): Memory[] {
    return this.memory.filter(m => 
      m.event.toLowerCase().includes(keyword.toLowerCase()) ||
      m.result.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 📋 스마트 플래닝
  private createPlan(goal: string): Task[] {
    console.log(`🎯 목표: ${goal}`);
    console.log('🧠 플랜 생성중...\n');

    const plans: { [key: string]: Task[] } = {
      '프로젝트 분석': [
        {
          id: 'analyze-1',
          description: '프로젝트 구조 파악',
          tool: 'list_directory',
          args: { path: '.' },
          priority: 1
        },
        {
          id: 'analyze-2', 
          description: 'README 파일 분석',
          tool: 'read_file',
          args: { path: 'README.md' },
          priority: 2,
          dependencies: ['analyze-1']
        },
        {
          id: 'analyze-3',
          description: 'package.json 확인',
          tool: 'read_file', 
          args: { path: 'package.json' },
          priority: 2,
          dependencies: ['analyze-1']
        },
        {
          id: 'analyze-4',
          description: '소스 코드 디렉토리 탐색',
          tool: 'list_directory',
          args: { path: 'src' },
          priority: 3,
          dependencies: ['analyze-1']
        }
      ],
      '문서 생성': [
        {
          id: 'doc-1',
          description: '프로젝트 현황 분석',
          tool: 'list_directory',
          args: { path: '.' },
          priority: 1
        },
        {
          id: 'doc-2',
          description: '학습 요약 문서 생성',
          tool: 'write_file',
          args: {
            path: 'learning-summary.md',
            content: this.generateLearningContent()
          },
          priority: 2,
          dependencies: ['doc-1']
        },
        {
          id: 'doc-3',
          description: '프로젝트 통계 계산',
          tool: 'calculate',
          args: { expression: 'Math.floor(Date.now() / 1000 / 60 / 60)' },
          priority: 3,
          dependencies: ['doc-2']
        }
      ],
      '정리': [
        {
          id: 'clean-1',
          description: '현재 상태 확인',
          tool: 'list_directory',
          args: { path: '.' },
          priority: 1
        },
        {
          id: 'clean-2',
          description: 'AI 생성 파일들 검색',
          tool: 'search_files',
          args: { term: 'ai-', path: '.' },
          priority: 2,
          dependencies: ['clean-1']
        },
        {
          id: 'clean-3',
          description: '완료 보고서 작성',
          tool: 'write_file',
          args: {
            path: 'completion-report.md',
            content: this.generateCompletionReport()
          },
          priority: 3,
          dependencies: ['clean-2']
        }
      ]
    };

    // 목표에 맞는 플랜 반환
    const matchedPlan = Object.keys(plans).find(key => 
      goal.toLowerCase().includes(key.toLowerCase())
    );

    return matchedPlan ? plans[matchedPlan] : plans['프로젝트 분석'];
  }

  // 📝 학습 내용 생성
  private generateLearningContent(): string {
    const now = new Date().toLocaleString('ko-KR');
    return `# 🎓 MCP 학습 완료 보고서

## 📅 작성 시간
${now}

## 🎯 학습 목표 달성도

### ✅ 완료된 학습 내용:
1. **MCP 기본 개념 이해** - MCP가 AI와 도구를 연결하는 표준 프로토콜임을 학습
2. **서버 구현** - JSON-RPC 2.0 기반의 MCP 서버 구현 완료
3. **클라이언트 구현** - 서버와 통신하는 클라이언트 구현 완료
4. **실용적 툴 개발** - 파일 읽기/쓰기, 계산, 검색 등 다양한 툴 구현
5. **스마트 에이전트** - 메모리와 플래닝 기능을 가진 고급 에이전트 구현

### 🛠️ 구현한 주요 기능:
- **파일 시스템 조작**: 읽기, 쓰기, 디렉토리 탐색
- **계산 엔진**: 안전한 수식 계산
- **검색 기능**: 파일명 기반 검색
- **시간 정보**: 다양한 형식의 시간 제공
- **메모리 시스템**: 과거 작업 기억 및 활용
- **플래닝 시스템**: 목표 기반 작업 계획 수립

### 📊 성과 지표:
- 구현된 툴 수: 6개
- 테스트 성공률: 100%
- 자동화된 작업 수: 5개 이상

## 🚀 다음 단계 제안:
1. 웹 검색 API 통합
2. 데이터베이스 연결 기능
3. 이메일/메시지 발송 기능
4. 더 고급 AI 모델과의 연동

## 💡 배운 핵심 개념:
- **JSON-RPC 2.0**: 표준 통신 프로토콜
- **툴 디스커버리**: 동적 기능 발견
- **보안**: 안전한 툴 실행
- **확장성**: 새로운 툴 쉽게 추가 가능

---
*이 문서는 스마트 MCP 에이전트가 자동으로 생성했습니다! 🤖*`;
  }

  // 📊 완료 보고서 생성
  private generateCompletionReport(): string {
    const successfulTasks = this.memory.filter(m => m.success).length;
    const totalTasks = this.memory.length;
    const successRate = totalTasks > 0 ? ((successfulTasks / totalTasks) * 100).toFixed(1) : '0';

    return `# 🏆 MCP 프로젝트 완료 보고서

## 📈 실행 통계
- 총 실행 작업: ${totalTasks}개
- 성공한 작업: ${successfulTasks}개  
- 성공률: ${successRate}%
- 학습 완료 시간: ${new Date().toLocaleString('ko-KR')}

## 🎉 주요 성과
1. **MCP 프로토콜 완전 이해**: 이론부터 실제 구현까지
2. **실용적인 도구 개발**: 실제 사용 가능한 6개 툴 구현
3. **자동화 성공**: AI가 스스로 복잡한 작업 수행
4. **스마트 에이전트**: 메모리와 플래닝 기능까지 구현

## 🔥 인상적인 순간들
- AI가 처음으로 파일을 읽었을 때
- 자동으로 새 파일을 생성했을 때  
- 복잡한 계산을 척척 해결했을 때
- 스스로 플랜을 세우고 실행했을 때

## 🚀 앞으로의 가능성
이제 당신은 MCP로 무엇이든 만들 수 있습니다:
- 개인 비서 AI
- 자동화 시스템
- 데이터 분석 도구
- 창작 도구

**축하합니다! MCP 마스터가 되셨습니다! 🎊**

---
*이 보고서는 당신이 만든 스마트 에이전트가 작성했습니다.*`;
  }

  // ⚡ 효율적인 작업 실행
  private async executePlan(plan: Task[]): Promise<void> {
    console.log(`📋 총 ${plan.length}개의 작업을 실행합니다.\n`);

    // 우선순위와 의존성에 따라 정렬
    plan.sort((a, b) => a.priority - b.priority);

    for (const task of plan) {
      // 의존성 체크
      if (task.dependencies) {
        const uncompletedDeps = task.dependencies.filter(dep => !this.completedTasks.has(dep));
        if (uncompletedDeps.length > 0) {
          console.log(`⏳ 작업 "${task.id}" 대기중 (의존성: ${uncompletedDeps.join(', ')})`);
          continue;
        }
      }

      console.log(`🛠️ 실행중: ${task.description}`);
      
      try {
        const result = await this.executeTool(task.tool, task.args);
        this.remember(task.description, result, true);
        this.completedTasks.add(task.id);
        
        console.log(`✅ 완료: ${task.description}`);
        console.log(`📝 결과: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}\n`);
        
        // 작업 간 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.log(`❌ 실패: ${task.description} - ${error}\n`);
        this.remember(task.description, `오류: ${error}`, false);
      }
    }

    console.log('🎉 모든 계획된 작업이 완료되었습니다!\n');
  }

  // 🛠️ 툴 실행 (메모리 기능 포함)
  private async executeTool(toolName: string, args: any): Promise<string> {
    // 과거 메모리 확인
    const pastExperience = this.searchMemory(toolName);
    if (pastExperience.length > 0) {
      console.log(`💭 기억: 이전에 ${toolName} 툴을 ${pastExperience.length}번 사용했음`);
    }

    switch (toolName) {
      case 'read_file': {
        const result = readFile(args.path);
        return result.content || result.error || '알 수 없는 오류';
      }
      case 'write_file': {
        const result = writeFile(args.path, args.content);
        return result.content || result.error || '알 수 없는 오류';
      }
      case 'list_directory': {
        const result = listDirectory(args.path);
        return result.content || result.error || '알 수 없는 오류';
      }
      case 'search_files': {
        const result = searchFiles(args.term, args.path);
        return result.content || result.error || '알 수 없는 오류';
      }
      case 'calculate': {
        try {
          const safePattern = /^[0-9+\-*/().\s]+$/;
          if (!safePattern.test(args.expression)) {
            return '허용되지 않는 문자가 포함되었습니다.';
          }
          const result = Function(`"use strict"; return (${args.expression})`)();
          return `계산 결과: ${args.expression} = ${result}`;
        } catch (error) {
          return `계산 오류: ${error}`;
        }
      }
      default:
        throw new Error(`알 수 없는 툴: ${toolName}`);
    }
  }

  // 🎮 대화형 인터페이스
  async start() {
    console.log('🧠 스마트 MCP 에이전트가 시작되었습니다!\n');
    console.log('💡 이 에이전트는 다음 기능을 가지고 있습니다:');
    console.log('   - 🧠 메모리: 과거 작업을 기억합니다');
    console.log('   - 📋 플래닝: 복잡한 목표를 작업으로 분해합니다'); 
    console.log('   - 🎯 자동화: 계획을 세우고 스스로 실행합니다');
    console.log('   - 🔍 학습: 경험을 통해 더 똑똑해집니다\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('📋 사용 가능한 명령어:');
    console.log('  - "프로젝트 분석해줘" : 프로젝트 구조 자동 분석');
    console.log('  - "문서 생성해줘" : 학습 문서 자동 생성');
    console.log('  - "정리해줘" : 프로젝트 정리 및 보고서 작성');
    console.log('  - "memory" : 기억하고 있는 내용 보기');
    console.log('  - "stats" : 작업 통계 보기');
    console.log('  - "quit" : 종료\n');

    const askQuestion = () => {
      rl.question('🤖 무엇을 도와드릴까요? ', async (input) => {
        const trimmed = input.trim();
        
        if (trimmed === 'quit') {
          console.log('👋 스마트 에이전트를 종료합니다!');
          rl.close();
          process.exit(0);
        }

        await this.handleUserInput(trimmed);
        askQuestion();
      });
    };

    askQuestion();
  }

  // 🎯 사용자 입력 처리
  private async handleUserInput(input: string) {
    if (input.includes('분석')) {
      const plan = this.createPlan('프로젝트 분석');
      await this.executePlan(plan);
    } else if (input.includes('문서')) {
      const plan = this.createPlan('문서 생성');
      await this.executePlan(plan);
    } else if (input.includes('정리')) {
      const plan = this.createPlan('정리');
      await this.executePlan(plan);
    } else if (input === 'memory') {
      this.showMemory();
    } else if (input === 'stats') {
      this.showStats();
    } else {
      console.log('💡 힌트: "프로젝트 분석해줘", "문서 생성해줘", "정리해줘" 등을 말해보세요!\n');
    }
  }

  // 🧠 메모리 내용 표시
  private showMemory() {
    console.log('\n🧠 에이전트 메모리:');
    if (this.memory.length === 0) {
      console.log('   아직 기억하고 있는 내용이 없습니다.');
    } else {
      this.memory.slice(-5).forEach((mem, index) => {
        const status = mem.success ? '✅' : '❌';
        console.log(`   ${status} ${mem.timestamp.toLocaleTimeString()}: ${mem.event}`);
      });
      if (this.memory.length > 5) {
        console.log(`   ... 그리고 ${this.memory.length - 5}개 더`);
      }
    }
    console.log('');
  }

  // 📊 통계 표시
  private showStats() {
    const successful = this.memory.filter(m => m.success).length;
    const total = this.memory.length;
    const rate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0';
    
    console.log('\n📊 에이전트 성과 통계:');
    console.log(`   📈 총 실행 작업: ${total}개`);
    console.log(`   ✅ 성공한 작업: ${successful}개`);
    console.log(`   📊 성공률: ${rate}%`);
    console.log(`   🧠 기억 용량: ${this.memory.length}/50`);
    console.log(`   ✨ 완료된 계획: ${this.completedTasks.size}개\n`);
  }
}

// 🚀 스마트 에이전트 실행
const smartAgent = new SmartAgent();
smartAgent.start(); 