import { CASE_REGISTRY, TOTAL_PLANNED_WORLD_CASES } from '../cases/registry';
import { createInitialCaseProgress } from './caseEngine';
import type {
  BrightLandSaveData,
  BrightLandWorldAdapter,
  CaseDefinition,
  CaseProgressState,
} from './types';

export const SAVE_STORAGE_KEY = 'noorak_brightland_save_v1';
export const CURRENT_SAVE_SCHEMA_VERSION = 1;

export function createDefaultSaveData(): BrightLandSaveData {
  return {
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    updatedAtIso: new Date().toISOString(),
    audio: {
      muted: false,
      volume: 0.7,
    },
    unlockedRewardIds: [],
    cases: {},
  };
}

export function loadSaveData(): BrightLandSaveData {
  if (typeof window === 'undefined') {
    return createDefaultSaveData();
  }

  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return createDefaultSaveData();
    }

    const parsed = JSON.parse(raw) as Partial<BrightLandSaveData>;
    if (!parsed || typeof parsed !== 'object') {
      return createDefaultSaveData();
    }

    // Unknown schemas are not interpreted as current game progress.
    if (parsed.schemaVersion !== CURRENT_SAVE_SCHEMA_VERSION) return createDefaultSaveData();
    const save = createDefaultSaveData();
    save.updatedAtIso = validDate(parsed.updatedAtIso) ?? save.updatedAtIso;
    save.audio = {
      muted: parsed.audio?.muted === true,
      volume: typeof parsed.audio?.volume === 'number' && Number.isFinite(parsed.audio.volume)
        ? Math.max(0, Math.min(1, parsed.audio.volume)) : 0.7,
    };
    const knownRewards = CASE_REGISTRY.flatMap((c) => c.rewards.map((r) => r.id));
    save.unlockedRewardIds = validIds(parsed.unlockedRewardIds, knownRewards);
    const cases = parsed.cases;
    if (cases && typeof cases === 'object' && !Array.isArray(cases)) {
      for (const caseDef of CASE_REGISTRY) {
        if (Object.hasOwn(cases, caseDef.id)) {
          save.cases[caseDef.id] = normalizeCaseProgress(cases[caseDef.id], caseDef);
          if (save.cases[caseDef.id].phase === 'resolved') {
            save.unlockedRewardIds = [...new Set([
              ...save.unlockedRewardIds, ...caseDef.rewards.map((r) => r.id),
            ])];
          }
        }
      }
    }
    return save;
  } catch {
    return createDefaultSaveData();
  }
}

export function persistSaveData(data: BrightLandSaveData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: BrightLandSaveData = {
      ...data,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      updatedAtIso: new Date().toISOString(),
    };
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function getOrCreateCaseProgress(
  saveData: BrightLandSaveData,
  caseDef: CaseDefinition,
): CaseProgressState {
  return normalizeCaseProgress(saveData.cases[caseDef.id], caseDef);
}

function validIds(value: unknown, allowed: string[]): string[] {
  return Array.isArray(value) ? [...new Set(value.filter(
    (id): id is string => typeof id === 'string' && allowed.includes(id),
  ))] : [];
}

function validDate(value: unknown): string | null {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
}

function counter(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function normalizeCaseProgress(value: unknown, caseDef: CaseDefinition): CaseProgressState {
  const initial = createInitialCaseProgress(caseDef);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return initial;
  const raw = value as Partial<CaseProgressState>;
  const clues = validIds(raw.discoveredClueIds, caseDef.clues.map((c) => c.id));
  const evidence = validIds(raw.selectedEvidenceIds, clues);
  const hypothesis = caseDef.hypotheses.some((h) => h.id === raw.selectedHypothesisId)
    ? raw.selectedHypothesisId! : null;
  let phase = raw.phase ?? 'intro';
  if (!['intro', 'explore', 'hypothesis', 'fix', 'resolved'].includes(phase)) phase = 'intro';
  const introStep = Math.min(counter(raw.introStepIndex), caseDef.introDialogue.length);
  if (phase === 'intro' && introStep >= caseDef.introDialogue.length) phase = 'explore';
  const allClues = clues.length === caseDef.clues.length;
  const validReasoning = allClues && hypothesis === caseDef.correctHypothesisId &&
    caseDef.requiredEvidenceIds.every((id) => evidence.includes(id));
  if (['hypothesis', 'fix', 'resolved'].includes(phase) && !allClues) phase = 'explore';
  if (['fix', 'resolved'].includes(phase) && !validReasoning) phase = 'hypothesis';
  return {
    ...initial, caseId: caseDef.id, phase,
    introStepIndex: phase === 'intro' ? introStep : caseDef.introDialogue.length,
    discoveredClueIds: clues,
    inspectedPropIds: validIds(raw.inspectedPropIds, caseDef.nonKeyProps.map((p) => p.id)),
    selectedHypothesisId: hypothesis, selectedEvidenceIds: evidence,
    reasoningAttempts: counter(raw.reasoningAttempts), hintsUsedCount: counter(raw.hintsUsedCount),
    maxHintLevelUsed: Math.min(counter(raw.maxHintLevelUsed), 3),
    fountainFixed: phase === 'resolved',
    completedAtIso: phase === 'resolved' ? validDate(raw.completedAtIso) : null,
  };
}

export function createBrightLandWorldAdapter(
  getSave: () => BrightLandSaveData,
  updateSave: (updater: (prev: BrightLandSaveData) => BrightLandSaveData) => void,
): BrightLandWorldAdapter {
  return {
    getWorldSummary: () => {
      const save = getSave();
      const completedCaseIds = CASE_REGISTRY.filter(
        (c) => save.cases[c.id]?.fountainFixed,
      ).map((c) => c.id);

      const percent = Math.round(
        (completedCaseIds.length / TOTAL_PLANNED_WORLD_CASES) * 100,
      );

      return {
        worldNameFa: 'سرزمین روشن',
        totalCasesPlanned: TOTAL_PLANNED_WORLD_CASES,
        completedCaseIds,
        unlockedRewardIds: save.unlockedRewardIds,
        detectiveProgressPercent: percent,
      };
    },
    syncCaseCompletion: (caseId: string, rewardIds: string[]) => {
      const caseDef = CASE_REGISTRY.find((c) => c.id === caseId);
      if (!caseDef) return;
      updateSave((prev) => {
        if (getOrCreateCaseProgress(prev, caseDef).phase !== 'resolved') return prev;
        const allowed = caseDef.rewards.map((r) => r.id);
        return { ...prev, unlockedRewardIds: [...new Set([
          ...prev.unlockedRewardIds, ...validIds(rewardIds, allowed),
        ])] };
      });
    },
  };
}
