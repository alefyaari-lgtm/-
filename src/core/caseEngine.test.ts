import test from 'node:test';
import assert from 'node:assert/strict';
import { SILENT_FOUNTAIN_CASE } from '../cases/silentFountainCase';
import {
  advanceIntroDialogue,
  areAllCluesDiscovered,
  completeFixAction,
  createInitialCaseProgress,
  enterHypothesisPhase,
  evaluateReasoning,
  getActiveHint,
  inspectClue,
  inspectNonKeyProp,
  recordHintUsage,
} from './caseEngine';

test('initial progress starts in intro phase with zero clues', () => {
  const progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  assert.equal(progress.phase, 'intro');
  assert.equal(progress.introStepIndex, 0);
  assert.equal(progress.discoveredClueIds.length, 0);
  assert.equal(progress.fountainFixed, false);
});

test('advancing intro dialogue transitions smoothly to explore phase', () => {
  let progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  for (let i = 0; i < SILENT_FOUNTAIN_CASE.introDialogue.length; i += 1) {
    progress = advanceIntroDialogue(progress, SILENT_FOUNTAIN_CASE);
  }
  assert.equal(progress.phase, 'explore');
});

test('clue discovery records unique clues and prevents duplicate rewards on re-click', () => {
  let progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  progress = { ...progress, phase: 'explore' };

  const first = inspectClue(progress, SILENT_FOUNTAIN_CASE, 'basin_low');
  assert.equal(first.isNewDiscovery, true);
  assert.equal(first.allCluesFound, false);
  assert.deepEqual(first.progress.discoveredClueIds, ['basin_low']);

  const duplicate = inspectClue(first.progress, SILENT_FOUNTAIN_CASE, 'basin_low');
  assert.equal(duplicate.isNewDiscovery, false);
  assert.deepEqual(duplicate.progress.discoveredClueIds, ['basin_low']);

  const second = inspectClue(duplicate.progress, SILENT_FOUNTAIN_CASE, 'valve_closed');
  const third = inspectClue(second.progress, SILENT_FOUNTAIN_CASE, 'pipe_intact');
  assert.equal(third.isNewDiscovery, true);
  assert.equal(third.allCluesFound, true);
  assert.equal(areAllCluesDiscovered(third.progress, SILENT_FOUNTAIN_CASE), true);
});

test('non-key props can be inspected without unlocking clue count', () => {
  let progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  progress = { ...progress, phase: 'explore' };

  const prop1 = inspectNonKeyProp(progress, SILENT_FOUNTAIN_CASE, 'flowerpot');
  assert.equal(prop1.isFirstTime, true);
  assert.equal(prop1.progress.discoveredClueIds.length, 0);

  const prop1Again = inspectNonKeyProp(prop1.progress, SILENT_FOUNTAIN_CASE, 'flowerpot');
  assert.equal(prop1Again.isFirstTime, false);
  assert.deepEqual(prop1Again.progress.inspectedPropIds, ['flowerpot']);
});

test('hypothesis reasoning rejects wrong hypothesis gently without fail state and allows retry', () => {
  let progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  progress = {
    ...progress,
    phase: 'explore',
    discoveredClueIds: ['basin_low', 'valve_closed', 'pipe_intact'],
  };
  progress = enterHypothesisPhase(progress, SILENT_FOUNTAIN_CASE);
  assert.equal(progress.phase, 'hypothesis');

  const wrongAttempt = evaluateReasoning(
    progress,
    SILENT_FOUNTAIN_CASE,
    'hyp_pipe_broken',
    ['pipe_intact'],
  );
  assert.equal(wrongAttempt.isValid, false);
  assert.equal(wrongAttempt.isHypothesisCorrect, false);
  assert.equal(wrongAttempt.progress.phase, 'hypothesis');
  assert.ok(wrongAttempt.feedbackFa.length > 0);

  const missingPrimaryEvidence = evaluateReasoning(
    wrongAttempt.progress,
    SILENT_FOUNTAIN_CASE,
    'hyp_valve_closed',
    ['basin_low'],
  );
  assert.equal(missingPrimaryEvidence.isValid, false);
  assert.equal(missingPrimaryEvidence.isHypothesisCorrect, true);
  assert.equal(missingPrimaryEvidence.isEvidenceSufficient, false);
  assert.equal(missingPrimaryEvidence.progress.phase, 'hypothesis');

  const correctAttempt = evaluateReasoning(
    missingPrimaryEvidence.progress,
    SILENT_FOUNTAIN_CASE,
    'hyp_valve_closed',
    ['valve_closed', 'pipe_intact'],
  );
  assert.equal(correctAttempt.isValid, true);
  assert.equal(correctAttempt.progress.phase, 'fix');
});

test('fix action completes the case and 3-tier hint adapts to current state', () => {
  let progress = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  progress = { ...progress, phase: 'explore' };

  const hint1 = getActiveHint(SILENT_FOUNTAIN_CASE, progress, 1);
  assert.equal(hint1.targetId, 'basin_low');
  assert.equal(hint1.sceneObjectId, null);

  const hint3 = getActiveHint(SILENT_FOUNTAIN_CASE, progress, 3);
  assert.equal(hint3.targetId, 'basin_low');
  assert.equal(hint3.sceneObjectId, 'basin');

  progress = recordHintUsage(progress, 3);
  assert.equal(progress.hintsUsedCount, 1);
  assert.equal(progress.maxHintLevelUsed, 3);

  progress = {
    ...progress,
    discoveredClueIds: ['basin_low', 'valve_closed', 'pipe_intact'],
    phase: 'fix',
  };
  const fixHint = getActiveHint(SILENT_FOUNTAIN_CASE, progress, 3);
  assert.equal(fixHint.sceneObjectId, 'valve');

  const resolved = completeFixAction(progress, '2026-11-15T10:00:00.000Z');
  assert.equal(resolved.phase, 'resolved');
  assert.equal(resolved.fountainFixed, true);
  assert.equal(resolved.completedAtIso, '2026-11-15T10:00:00.000Z');
});

for (const phase of ['intro', 'explore', 'fix', 'resolved'] as const) {
  test(`reasoning cannot bypass or regress ${phase}`, () => {
    const progress = { ...createInitialCaseProgress(SILENT_FOUNTAIN_CASE), phase,
      discoveredClueIds: SILENT_FOUNTAIN_CASE.clues.map((c) => c.id) };
    const result = evaluateReasoning(progress, SILENT_FOUNTAIN_CASE, 'hyp_valve_closed', ['valve_closed']);
    assert.equal(result.isValid, false);
    assert.strictEqual(result.progress, progress);
  });
}

test('intro cannot jump directly to hypothesis even with injected clues', () => {
  const progress = { ...createInitialCaseProgress(SILENT_FOUNTAIN_CASE),
    discoveredClueIds: SILENT_FOUNTAIN_CASE.clues.map((c) => c.id) };
  assert.strictEqual(enterHypothesisPhase(progress, SILENT_FOUNTAIN_CASE), progress);
});

test('unknown hypothesis and undiscovered evidence do not advance case', () => {
  const progress = { ...createInitialCaseProgress(SILENT_FOUNTAIN_CASE), phase: 'hypothesis' as const,
    discoveredClueIds: ['basin_low'] };
  for (const hypothesis of ['unknown', 'hyp_valve_closed']) {
    const result = evaluateReasoning(progress, SILENT_FOUNTAIN_CASE, hypothesis, ['valve_closed']);
    assert.equal(result.isValid, false);
    assert.strictEqual(result.progress, progress);
  }
});

test('completion is idempotent and unavailable before fix', () => {
  const initial = createInitialCaseProgress(SILENT_FOUNTAIN_CASE);
  assert.strictEqual(completeFixAction(initial), initial);
  const done = completeFixAction({ ...initial, phase: 'fix' }, '2026-11-15T10:00:00.000Z');
  assert.strictEqual(completeFixAction(done, '2026-11-16T10:00:00.000Z'), done);
});

for (const phase of ['intro', 'explore', 'hypothesis', 'fix', 'resolved'] as const) {
  test(`all hint levels preserve ${phase} and reasoning draft`, () => {
    const progress = { ...createInitialCaseProgress(SILENT_FOUNTAIN_CASE), phase,
      discoveredClueIds: phase === 'intro' || phase === 'explore' ? [] : SILENT_FOUNTAIN_CASE.clues.map((c) => c.id),
      selectedHypothesisId: 'hyp_pipe_broken', selectedEvidenceIds: ['pipe_intact'] };
    for (const level of [1, 2, 3] as const) {
      const hint = getActiveHint(SILENT_FOUNTAIN_CASE, progress, level);
      assert.ok(hint.messageFa.length);
      assert.equal(hint.targetType, phase === 'intro' || phase === 'explore' ? 'clue' : phase);
      const next = recordHintUsage(progress, level);
      assert.equal(next.phase, phase);
      assert.equal(next.hintsUsedCount, 1);
      assert.equal(next.maxHintLevelUsed, level);
      assert.equal(next.selectedHypothesisId, progress.selectedHypothesisId);
      assert.deepEqual(next.selectedEvidenceIds, progress.selectedEvidenceIds);
    }
  });
}
