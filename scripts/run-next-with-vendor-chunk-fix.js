const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mode = process.argv[2];

if (!mode || !['dev', 'build', 'start'].includes(mode)) {
  console.error('Usage: node scripts/run-next-with-vendor-chunk-fix.js <dev|build|start>');
  process.exit(1);
}

const projectRoot = process.cwd();
const serverRoot = path.join(projectRoot, '.next', 'server');
const chunksDir = path.join(serverRoot, 'chunks');
const vendorChunksDir = path.join(serverRoot, 'vendor-chunks');
const runtimeVendorChunksPath = path.join(chunksDir, 'vendor-chunks');

function ensureVendorChunkLink() {
  fs.mkdirSync(chunksDir, { recursive: true });

  try {
    const stat = fs.lstatSync(runtimeVendorChunksPath);
    if (stat.isSymbolicLink()) {
      return;
    }

    fs.rmSync(runtimeVendorChunksPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (!fs.existsSync(vendorChunksDir)) {
    fs.mkdirSync(vendorChunksDir, { recursive: true });
  }

  fs.symlinkSync('../vendor-chunks', runtimeVendorChunksPath, 'dir');
}

ensureVendorChunkLink();

const nextBin = path.join(projectRoot, 'node_modules', '.bin', 'next');
const child = spawn(nextBin, [mode], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const interval =
  mode === 'dev'
    ? setInterval(() => {
        try {
          ensureVendorChunkLink();
        } catch (error) {
          console.error('Failed to maintain vendor chunk symlink:', error);
        }
      }, 1000)
    : null;

const cleanup = () => {
  if (interval) {
    clearInterval(interval);
  }
};

child.on('exit', (code, signal) => {
  cleanup();
  if (mode !== 'dev') {
    ensureVendorChunkLink();
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  cleanup();
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  cleanup();
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  cleanup();
  child.kill('SIGTERM');
});
