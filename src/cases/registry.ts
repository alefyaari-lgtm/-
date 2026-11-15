import type { CaseDefinition } from '../core/types';
import { SILENT_FOUNTAIN_CASE } from './silentFountainCase';

export const CASE_REGISTRY: CaseDefinition[] = [SILENT_FOUNTAIN_CASE];

// Future episodes in سرزمین روشن (cases 2..12) can be appended here cleanly.
export const TOTAL_PLANNED_WORLD_CASES = 12;

export function getCaseById(caseId: string): CaseDefinition {
  return CASE_REGISTRY.find((c) => c.id === caseId) ?? SILENT_FOUNTAIN_CASE;
}
