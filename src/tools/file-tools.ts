/**
 * 📁 파일 관련 MCP 툴들
 * 
 * 실제 파일 시스템과 상호작용하는 유용한 툴들을 제공합니다.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface ToolResult {
  success: boolean;
  content: string;
  error?: string;
}

// 📖 파일 읽기 툴
export function readFile(filePath: string): ToolResult {
  try {
    if (!existsSync(filePath)) {
      return {
        success: false,
        content: '',
        error: `파일을 찾을 수 없습니다: ${filePath}`
      };
    }

    const content = readFileSync(filePath, 'utf-8');
    return {
      success: true,
      content: `📖 파일 내용 (${filePath}):\n\n${content}`
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: `파일 읽기 오류: ${error}`
    };
  }
}

// ✍️ 파일 쓰기 툴
export function writeFile(filePath: string, content: string): ToolResult {
  try {
    writeFileSync(filePath, content, 'utf-8');
    return {
      success: true,
      content: `✅ 파일이 성공적으로 저장되었습니다: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: `파일 쓰기 오류: ${error}`
    };
  }
}

// 📂 디렉토리 목록 보기 툴
export function listDirectory(dirPath: string = '.'): ToolResult {
  try {
    if (!existsSync(dirPath)) {
      return {
        success: false,
        content: '',
        error: `디렉토리를 찾을 수 없습니다: ${dirPath}`
      };
    }

    const items = readdirSync(dirPath, { withFileTypes: true });
    const fileList = items.map(item => {
      const icon = item.isDirectory() ? '📁' : '📄';
      return `${icon} ${item.name}`;
    }).join('\n');

    return {
      success: true,
      content: `📂 디렉토리 내용 (${dirPath}):\n\n${fileList}`
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: `디렉토리 읽기 오류: ${error}`
    };
  }
}

// 🔍 파일 검색 툴
export function searchFiles(searchTerm: string, dirPath: string = '.'): ToolResult {
  try {
    if (!existsSync(dirPath)) {
      return {
        success: false,
        content: '',
        error: `디렉토리를 찾을 수 없습니다: ${dirPath}`
      };
    }

    const items = readdirSync(dirPath, { withFileTypes: true });
    const matches = items
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => {
        const icon = item.isDirectory() ? '📁' : '📄';
        return `${icon} ${item.name}`;
      });

    if (matches.length === 0) {
      return {
        success: true,
        content: `🔍 검색 결과: "${searchTerm}"과 일치하는 파일이 없습니다.`
      };
    }

    return {
      success: true,
      content: `🔍 검색 결과 "${searchTerm}":\n\n${matches.join('\n')}`
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: `파일 검색 오류: ${error}`
    };
  }
} 