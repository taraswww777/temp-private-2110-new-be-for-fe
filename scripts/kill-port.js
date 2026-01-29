#!/usr/bin/env node

/**
 * Скрипт для освобождения порта в Windows
 * Использование: node kill-port.js <port>
 */

const { exec } = require('child_process');
const port = process.argv[2];

if (!port) {
  console.error('❌ Error: Port number is required');
  console.log('Usage: node kill-port.js <port>');
  process.exit(1);
}

console.log(`🔍 Searching for processes on port ${port}...`);

// Команда для Windows
const findCommand = `netstat -ano | findstr :${port}`;

exec(findCommand, (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log(`✅ Port ${port} is free`);
    return;
  }

  // Парсим вывод netstat для получения PID
  const lines = stdout.trim().split('\n');
  const pids = new Set();

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') {
      pids.add(pid);
    }
  });

  if (pids.size === 0) {
    console.log(`✅ Port ${port} is free`);
    return;
  }

  console.log(`⚠️  Found ${pids.size} process(es) using port ${port}`);

  // Убиваем каждый процесс
  let killed = 0;
  pids.forEach(pid => {
    exec(`taskkill /PID ${pid} /F`, (killError, killStdout) => {
      if (!killError) {
        console.log(`✅ Killed process PID ${pid}`);
        killed++;
      } else {
        console.log(`⚠️  Could not kill process PID ${pid}`);
      }

      if (killed === pids.size) {
        console.log(`✨ Port ${port} is now free`);
      }
    });
  });
});
