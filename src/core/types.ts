export type GameShellState = 'title' | 'playing' | 'paused' | 'gameover';

export type CasePhase = 'intro' | 'explore' | 'hypothesis' | 'fix' | 'resolved';

export type NoorakMood = 'normal' | 'surprised' | 'thinking' | 'guiding' | 'happy';
export type RahaMood = 'normal' | 'curious' | 'thinking' | 'happy';
export type SpeakerId = 'nane_bahar' | 'noorak' | 'raha';

export type HintLevel = 1 | 2 | 3;

export interface DialogueLine {
  id: string;
  speaker: SpeakerId;
  speakerNameFa: string;
  textFa: string;
  noorakMood: NoorakMood;
  rahaMood?: RahaMood;
  voiceClipKey?: string;
}

export interface ClueHints {
  level1AreaFa: string;
  level2ObjectFa: string;
  level3SpotlightFa: string;
}

export interface ClueDefinition {
  id: string;
  titleFa: string;
  shortLabelFa: string;
  descriptionFa: string;
  noorakReactionFa: string;
  alreadyFoundFa: string;
  illustrationKey: 'basin_low' | 'valve_closed' | 'pipe_intact';
  sceneObjectId: string;
  hints: ClueHints;
  voiceClipKey?: string;
}

export interface NonKeyPropDefinition {
  id: string;
  titleFa: string;
  reactionFa: string;
  speaker: SpeakerId;
  sceneObjectId: string;
  illustrationKey: 'flowerpot' | 'bench' | 'butterfly' | 'fountain';
  voiceClipKey?: string;
}

export interface HypothesisOption {
  id: string;
  textFa: string;
  isCorrect: boolean;
  wrongFeedbackFa: string;
  voiceClipKey?: string;
}

export interface CaseReward {
  id: string;
  type: 'card' | 'badge';
  titleFa: string;
  descriptionFa: string;
  iconKey: 'fountain_card' | 'sharp_eye_badge';
}

export interface CaseDefinition {
  id: string;
  caseNumber: number;
  titleFa: string;
  titleEn: string;
  worldNameFa: string;
  sceneId: string;
  summaryFa: string;
  introDialogue: DialogueLine[];
  clues: ClueDefinition[];
  nonKeyProps: NonKeyPropDefinition[];
  hypothesisQuestionFa: string;
  evidencePromptFa: string;
  hypotheses: HypothesisOption[];
  correctHypothesisId: string;
  requiredEvidenceIds: string[];
  missingPrimaryEvidenceHintFa: string;
  correctReasoningFeedbackFa: string;
  fixInstructionFa: string;
  fixTargetSceneObjectId: string;
  celebrationDialogue: DialogueLine[];
  rewards: CaseReward[];
}

export interface CaseProgressState {
  caseId: string;
  phase: CasePhase;
  introStepIndex: number;
  discoveredClueIds: string[];
  inspectedPropIds: string[];
  selectedHypothesisId: string | null;
  selectedEvidenceIds: string[];
  reasoningAttempts: number;
  hintsUsedCount: number;
  maxHintLevelUsed: number;
  fountainFixed: boolean;
  completedAtIso: string | null;
}

export interface BrightLandSaveData {
  schemaVersion: number;
  updatedAtIso: string;
  audio: {
    muted: boolean;
    volume: number;
  };
  unlockedRewardIds: string[];
  cases: Record<string, CaseProgressState>;
}

export interface BrightLandWorldAdapter {
  getWorldSummary: () => {
    worldNameFa: string;
    totalCasesPlanned: number;
    completedCaseIds: string[];
    unlockedRewardIds: string[];
    detectiveProgressPercent: number;
  };
  syncCaseCompletion: (caseId: string, rewardIds: string[]) => void;
}
