// src/types/index.ts

export type AuraStage = 'a' | 'u' | 'r' | 'a_final';

export interface ScriptBlock {
  audio: string;
  visual: string;
}

export interface ScriptContent {
  a: ScriptBlock;
  u: ScriptBlock;
  r: ScriptBlock;
  a_final: ScriptBlock;
}

export type ScriptStatus = 'draft' | 'ready' | 'recording' | 'editing' | 'published' | 'rejected';

export interface Script {
  id: string;
  profileId: string;
  gancho: string; // Ex: "Curiosidade", "Visual"
  content: ScriptContent;
  status: ScriptStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string; // Ex: "Burger Kingui"
  niche: string;
  avatarColor: string;
}