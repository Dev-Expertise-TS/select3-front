#!/usr/bin/env node

/**
 * 빌드 스크립트 - baseline-browser-mapping 경고 필터링
 * 크로스 플랫폼 호환 (Windows, Linux, macOS)
 */

const { spawn } = require('child_process');
const { platform } = require('os');

// 플랫폼에 따라 명령어 결정
const isWindows = platform() === 'win32';
const command = isWindows ? 'pnpm.cmd' : 'pnpm';
const args = ['next', 'build'];

// 빌드 프로세스 실행
const buildProcess = spawn(command, args, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows, // Windows에서는 shell 옵션 필요
});

// 실시간 출력 필터링 함수
function filterAndWrite(data, isStderr = false) {
  const lines = data.toString().split('\n');
  const filtered = lines.filter((line) => !line.includes('baseline-browser-mapping'));
  
  if (filtered.length > 0) {
    const output = filtered.join('\n');
    if (isStderr) {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }
}

// 표준 출력 처리 (실시간)
buildProcess.stdout.on('data', (data) => {
  filterAndWrite(data, false);
});

// 표준 에러 처리 (실시간)
buildProcess.stderr.on('data', (data) => {
  filterAndWrite(data, true);
});

// 프로세스 종료 처리
buildProcess.on('close', (code) => {
  process.exit(code || 0);
});

// 에러 처리
buildProcess.on('error', (error) => {
  console.error('빌드 프로세스 실행 오류:', error);
  process.exit(1);
});

