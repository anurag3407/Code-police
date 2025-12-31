// Code chunking utilities for AI analysis

const MAX_CHUNK_TOKENS = 4000; // Conservative limit for Gemini context

// Language detection by file extension
const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  php: 'php',
  vue: 'vue',
  svelte: 'svelte',
};

export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return LANGUAGE_MAP[ext || ''] || 'plaintext';
}

// Rough token estimation (1 token ≈ 4 chars for code)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface CodeChunk {
  filePath: string;
  content: string;
  language: string;
  startLine?: number;
  endLine?: number;
}

export interface DiffFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  patch?: string;
  additions: number;
  deletions: number;
}

/**
 * Chunk code by file and hunk, respecting token limits
 */
export function chunkCodeByFile(files: DiffFile[]): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    // Skip deleted files and binary files (no patch)
    if (file.status === 'removed' || !file.patch) {
      continue;
    }

    // Skip common ignore patterns
    if (shouldIgnoreFile(file.filename)) {
      continue;
    }

    const language = detectLanguage(file.filename);

    // If patch is small enough, send as single chunk
    if (estimateTokens(file.patch) <= MAX_CHUNK_TOKENS) {
      chunks.push({
        filePath: file.filename,
        content: file.patch,
        language,
      });
    } else {
      // Split by hunks (sections starting with @@)
      const hunks = splitByHunks(file.patch);
      let currentChunk = '';
      let currentStartLine: number | undefined;

      for (const hunk of hunks) {
        const hunkTokens = estimateTokens(hunk.content);

        if (estimateTokens(currentChunk) + hunkTokens > MAX_CHUNK_TOKENS) {
          // Save current chunk if not empty
          if (currentChunk) {
            chunks.push({
              filePath: file.filename,
              content: currentChunk,
              language,
              startLine: currentStartLine,
            });
          }
          currentChunk = hunk.content;
          currentStartLine = hunk.startLine;
        } else {
          if (!currentStartLine) currentStartLine = hunk.startLine;
          currentChunk += '\n' + hunk.content;
        }
      }

      // Don't forget the last chunk
      if (currentChunk) {
        chunks.push({
          filePath: file.filename,
          content: currentChunk,
          language,
          startLine: currentStartLine,
        });
      }
    }
  }

  return chunks;
}

interface Hunk {
  content: string;
  startLine: number;
}

function splitByHunks(patch: string): Hunk[] {
  const hunks: Hunk[] = [];
  const lines = patch.split('\n');
  let currentHunk: string[] = [];
  let currentStartLine = 0;

  for (const line of lines) {
    // Hunk header format: @@ -oldStart,oldCount +newStart,newCount @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    
    if (hunkMatch) {
      // Save previous hunk
      if (currentHunk.length > 0) {
        hunks.push({
          content: currentHunk.join('\n'),
          startLine: currentStartLine,
        });
      }
      // Start new hunk
      currentHunk = [line];
      currentStartLine = parseInt(hunkMatch[1], 10);
    } else {
      currentHunk.push(line);
    }
  }

  // Don't forget the last hunk
  if (currentHunk.length > 0) {
    hunks.push({
      content: currentHunk.join('\n'),
      startLine: currentStartLine,
    });
  }

  return hunks;
}

// Files to skip
const IGNORE_PATTERNS = [
  /node_modules\//,
  /\.min\.(js|css)$/,
  /dist\//,
  /build\//,
  /\.next\//,
  /\.git\//,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.ico$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
];

function shouldIgnoreFile(filename: string): boolean {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filename));
}
