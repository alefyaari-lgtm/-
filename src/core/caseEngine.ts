import type {
  CaseDefinition,
  CaseProgressState,
  ClueDefinition,
  HintLevel,
  NonKeyPropDefinition,
} from './types';

export interface ClueInspectionResult {
  progress: CaseProgressState;
  clue: ClueDefinition;
  isNewDiscovery: boolean;
  allCluesFound: boolean;
}

export interface PropInspectionResult {
  progress: CaseProgressState;
  prop: NonKeyPropDefinition;
  isFirstTime: boolean;
}

export interface ReasoningEvaluationResult {
  isValid: boolean;
  isHypothesisCorrect: boolean;
  isEvidenceSufficient: boolean;
  feedbackFa: string;
  progress: CaseProgressState;
}

export interface ActiveHintResult {
  level: HintLevel;
  targetType: 'clue' | 'hypothesis' | 'fix' | 'resolved';
  targetId: string | null;
  sceneObjectId: string | null;
  messageFa: string;
}

export function createInitialCaseProgress(caseDef: CaseDefinition): CaseProgressState {
  return {
    caseId: caseDef.id,
    phase: 'intro',
    introStepIndex: 0,
    discoveredClueIds: [],
    inspectedPropIds: [],
    selectedHypothesisId: null,
    selectedEvidenceIds: [],
    reasoningAttempts: 0,
    hintsUsedCount: 0,
    maxHintLevelUsed: 0,
    fountainFixed: false,
    completedAtIso: null,
  };
}

export function advanceIntroDialogue(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
): CaseProgressState {
  if (progress.phase !== 'intro') {
    return progress;
  }

  const nextIndex = progress.introStepIndex + 1;
  if (nextIndex >= caseDef.introDialogue.length) {
    return {
      ...progress,
      phase: 'explore',
      introStepIndex: caseDef.introDialogue.length,
    };
  }

  return {
    ...progress,
    introStepIndex: nextIndex,
  };
}

export function areAllCluesDiscovered(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
): boolean {
  return caseDef.clues.every((clue) => progress.discoveredClueIds.includes(clue.id));
}

export function inspectClue(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
  clueId: string,
): ClueInspectionResult {
  const clue = caseDef.clues.find((c) => c.id === clueId);
  if (!clue) {
    throw new Error(`Unknown clue id: ${clueId}`);
  }

  const alreadyFound = progress.discoveredClueIds.includes(clueId);
  if (alreadyFound) {
    return {
      progress,
      clue,
      isNewDiscovery: false,
      allCluesFound: areAllCluesDiscovered(progress, caseDef),
    };
  }

  const nextClues = [...progress.discoveredClueIds, clueId];
  const nextProgress: CaseProgressState = {
    ...progress,
    discoveredClueIds: nextClues,
  };

  return {
    progress: nextProgress,
    clue,
    isNewDiscovery: true,
    allCluesFound: areAllCluesDiscovered(nextProgress, caseDef),
  };
}

export function inspectNonKeyProp(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
  propId: string,
): PropInspectionResult {
  const prop = caseDef.nonKeyProps.find((p) => p.id === propId);
  if (!prop) {
    throw new Error(`Unknown prop id: ${propId}`);
  }

  const alreadyInspected = progress.inspectedPropIds.includes(propId);
  if (alreadyInspected) {
    return {
      progress,
      prop,
      isFirstTime: false,
    };
  }

  return {
    progress: {
      ...progress,
      inspectedPropIds: [...progress.inspectedPropIds, propId],
    },
    prop,
    isFirstTime: true,
  };
}

export function enterHypothesisPhase(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
): CaseProgressState {
  if (!areAllCluesDiscovered(progress, caseDef)) {
    return progress;
  }
  if (progress.phase === 'fix' || progress.phase === 'resolved') {
    return progress;
  }
  return {
    ...progress,
    phase: 'hypothesis',
  };
}

export function evaluateReasoning(
  progress: CaseProgressState,
  caseDef: CaseDefinition,
  hypothesisId: string,
  selectedEvidenceIds: string[],
): ReasoningEvaluationResult {
  const hypothesis = caseDef.hypotheses.find((h) => h.id === hypothesisId);
  if (!hypothesis) {
    return {
      isValid: false,
      isHypothesisCorrect: false,
      isEvidenceSufficient: false,
      feedbackFa: 'لطفاً ابتدا یکی از گزینه‌ها را انتخاب کن.',
      progress,
    };
  }

  const uniqueEvidence = Array.from(new Set(selectedEvidenceIds)).filter((id) =>
    progress.discoveredClueIds.includes(id),
  );

  const isHypothesisCorrect =
    hypothesis.id === caseDef.correctHypothesisId && hypothesis.isCorrect;

  if (!isHypothesisCorrect) {
    return {
      isValid: false,
      isHypothesisCorrect: false,
      isEvidenceSufficient: false,
      feedbackFa: hypothesis.wrongFeedbackFa,
      progress: {
        ...progress,
        selectedHypothesisId: hypothesisId,
        selectedEvidenceIds: uniqueEvidence,
        reasoningAttempts: progress.reasoningAttempts + 1,
      },
    };
  }

  const hasRequiredEvidence = caseDef.requiredEvidenceIds.every((reqId) =>
    uniqueEvidence.includes(reqId),
  );

  if (!hasRequiredEvidence) {
    return {
      isValid: false,
      isHypothesisCorrect: true,
      isEvidenceSufficient: false,
      feedbackFa: caseDef.missingPrimaryEvidenceHintFa,
      progress: {
        ...progress,
        selectedHypothesisId: hypothesisId,
        selectedEvidenceIds: uniqueEvidence,
        reasoningAttempts: progress.reasoningAttempts + 1,
      },
    };
  }

  return {
    isValid: true,
    isHypothesisCorrect: true,
    isEvidenceSufficient: true,
    feedbackFa: caseDef.correctReasoningFeedbackFa,
    progress: {
      ...progress,
      phase: 'fix',
      selectedHypothesisId: hypothesisId,
      selectedEvidenceIds: uniqueEvidence,
      reasoningAttempts: progress.reasoningAttempts + 1,
    },
  };
}

export function completeFixAction(
  progress: CaseProgressState,
  completedAtIso: string = new Date().toISOString(),
): CaseProgressState {
  if (progress.phase !== 'fix' && progress.phase !== 'resolved') {
    return progress;
  }
  return {
    ...progress,
    phase: 'resolved',
    fountainFixed: true,
    completedAtIso: progress.completedAtIso ?? completedAtIso,
  };
}

export function recordHintUsage(
  progress: CaseProgressState,
  level: HintLevel,
): CaseProgressState {
  return {
    ...progress,
    hintsUsedCount: progress.hintsUsedCount + 1,
    maxHintLevelUsed: Math.max(progress.maxHintLevelUsed, level),
  };
}

export function getActiveHint(
  caseDef: CaseDefinition,
  progress: CaseProgressState,
  level: HintLevel,
): ActiveHintResult {
  const nextUndiscoveredClue = caseDef.clues.find(
    (clue) => !progress.discoveredClueIds.includes(clue.id),
  );

  if (progress.phase === 'intro') {
    return {
      level,
      targetType: 'clue',
      targetId: null,
      sceneObjectId: null,
      messageFa: 'ابتدا به گفت‌وگوی ننه‌بهار و نورک گوش بده و دکمه «ادامه» را بزن.',
    };
  }

  if (nextUndiscoveredClue) {
    const messageFa =
      level === 1
        ? nextUndiscoveredClue.hints.level1AreaFa
        : level === 2
          ? nextUndiscoveredClue.hints.level2ObjectFa
          : nextUndiscoveredClue.hints.level3SpotlightFa;

    return {
      level,
      targetType: 'clue',
      targetId: nextUndiscoveredClue.id,
      sceneObjectId: level === 3 ? nextUndiscoveredClue.sceneObjectId : null,
      messageFa,
    };
  }

  if (progress.phase === 'explore' || progress.phase === 'hypothesis') {
    if (level === 1) {
      return {
        level,
        targetType: 'hypothesis',
        targetId: null,
        sceneObjectId: null,
        messageFa: 'همه سرنخ‌ها را پیدا کرده‌ای! به دفترچه و مسیر جریان آب فکر کن.',
      };
    }
    if (level === 2) {
      return {
        level,
        targetType: 'hypothesis',
        targetId: null,
        sceneObjectId: null,
        messageFa: 'لوله آب سالم بود، اما چیزی کنار باغچه راه آب را بسته است.',
      };
    }
    return {
      level,
      targetType: 'hypothesis',
      targetId: caseDef.correctHypothesisId,
      sceneObjectId: null,
      messageFa: 'گزینه «شیر مسیر آب بسته است» و شاهد «شیر آب بسته» را انتخاب کن.',
    };
  }

  if (progress.phase === 'fix') {
    const messageFa =
      level === 1
        ? 'به سمت باغچه نگاه کن تا بتوانیم مشکل را برطرف کنیم.'
        : level === 2
          ? 'شیر آب قرمز کنار باغچه را پیدا کن و آن را لمس کن.'
          : 'شیر آب درخشان کنار باغچه را لمس کن و دسته‌اش را بچرخان!';

    return {
      level,
      targetType: 'fix',
      targetId: caseDef.fixTargetSceneObjectId,
      sceneObjectId: level === 3 ? caseDef.fixTargetSceneObjectId : null,
      messageFa,
    };
  }

  return {
    level,
    targetType: 'resolved',
    targetId: null,
    sceneObjectId: null,
    messageFa: 'پرونده با موفقیت حل شد! می‌توانی جایزه‌ات را ببینی یا دوباره بازی کنی.',
  };
}
