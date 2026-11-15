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
  if (typeof window === 'undefined' || !window.localStorage) {
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

    // Version migration hook for future BrightLand releases
    if (parsed.schemaVersion !== CURRENT_SAVE_SCHEMA_VERSION) {
      return {
        ...createDefaultSaveData(),
        unlockedRewardIds: Array.isArray(parsed.unlockedRewardIds)
          ? parsed.unlockedRewardIds
          : [],
        cases: parsed.cases && typeof parsed.cases === 'object' ? parsed.cases : {},
      };
    }

    return {
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      updatedAtIso: parsed.updatedAtIso ?? new Date().toISOString(),
      audio: {
        muted: Boolean(parsed.audio?.muted),
        volume:
          typeof parsed.audio?.volume === 'number' &&
          parsed.audio.volume >= 0 &&
          parsed.audio.volume <= 1
            ? parsed.audio.volume
            : 0.7,
      },
      unlockedRewardIds: Array.isArray(parsed.unlockedRewardIds)
        ? parsed.unlockedRewardIds
        : [],
      cases: parsed.cases && typeof parsed.cases === 'object' ? parsed.cases : {},
    };
  } catch {
    return createDefaultSaveData();
  }
}

export function persistSaveData(data: BrightLandSaveData): void {
  if (typeof window === 'undefined' || !window.localStorage) {
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
  const existing = saveData.cases[caseDef.id];
  if (!existing) {
    return createInitialCaseProgress(caseDef);
  }

  return {
    ...createInitialCaseProgress(caseDef),
    ...existing,
    discoveredClueIds: Array.isArray(existing.discoveredClueIds)
      ? existing.discoveredClueIds
      : [],
    inspectedPropIds: Array.isArray(existing.inspectedPropIds)
      ? existing.inspectedPropIds
      : [],
    selectedEvidenceIds: Array.isArray(existing.selectedEvidenceIds)
      ? existing.selectedEvidenceIds
      : [],
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
    syncCaseCompletion: (_caseId: string, rewardIds: string[]) => {
      updateSave((prev) => ({
        ...prev,
        unlockedRewardIds: Array.from(
          new Set([...prev.unlockedRewardIds, ...rewardIds]),
        ),
      }));
    },
  };
}
