import { Timestamp } from 'firebase/firestore';

// User document
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  providerData: Array<{
    providerId: string;
    email: string;
  }>;
  defaultOrgId: string;
  githubAccessToken?: string;
}

// Organization document
export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'team';
  createdAt: Timestamp;
  settings: {
    rulesProfile: RulesProfile;
    emailTemplates?: Record<string, string>;
    notificationPreferences: NotificationPrefs;
  };
}

// Organization member
export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Timestamp;
}

// Project (GitHub repo connection)
export interface Project {
  id: string;
  orgId: string;
  githubRepoId: number;
  githubOwner: string;
  githubRepoName: string;
  defaultBranch: string;
  webhookId?: number;
  webhookSecret: string;
  active: boolean;
  language?: string;
  rulesProfile?: RulesProfile;
  createdAt: Timestamp;
}

// Analysis run
export interface AnalysisRun {
  id: string;
  orgId: string;
  projectId: string;
  commitSha: string;
  branch: string;
  triggerType: 'push' | 'pull_request';
  prNumber?: number;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  summary?: string;
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  createdAt: Timestamp;
  completedAt?: Timestamp;
  aiUsageStats: {
    tokensUsed: number;
    latencyMs: number;
    chunksProcessed: number;
  };
  emailStatus?: 'pending' | 'sent' | 'failed';
  error?: string;
}

// Issue found during analysis
export interface Issue {
  id: string;
  orgId: string;
  projectId: string;
  analysisRunId: string;
  filePath: string;
  line: number;
  endLine?: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'readability' | 'bug' | 'test' | 'style';
  message: string;
  suggestedFix?: string;
  explanation?: string;
  ruleId?: string;
  isMuted: boolean;
  codeSnippet?: string;
}

// Rules profile configuration
export interface RulesProfile {
  strictness: 'relaxed' | 'moderate' | 'strict';
  categories: {
    security: boolean;
    performance: boolean;
    readability: boolean;
    bugs: boolean;
    tests: boolean;
    style: boolean;
  };
  ignorePatterns: string[];
  severityThreshold: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

// Notification preferences
export interface NotificationPrefs {
  emailOnPush: boolean;
  emailOnPR: boolean;
  onlyIfSeverity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  additionalEmails: string[];
}

// Default rules profile
export const defaultRulesProfile: RulesProfile = {
  strictness: 'moderate',
  categories: {
    security: true,
    performance: true,
    readability: true,
    bugs: true,
    tests: true,
    style: false,
  },
  ignorePatterns: ['node_modules/**', '*.min.js', '*.min.css', 'dist/**', 'build/**'],
  severityThreshold: 'low',
};

// Default notification preferences
export const defaultNotificationPrefs: NotificationPrefs = {
  emailOnPush: false,
  emailOnPR: true,
  onlyIfSeverity: 'medium',
  additionalEmails: [],
};
