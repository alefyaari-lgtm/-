import test from 'node:test';
import assert from 'node:assert/strict';
import { SILENT_FOUNTAIN_CASE as caseDef } from '../cases/silentFountainCase';
import { createInitialCaseProgress } from './caseEngine';
import { createDefaultSaveData, createBrightLandWorldAdapter, getOrCreateCaseProgress,
  loadSaveData, persistSaveData, normalizeCaseProgress } from './storage';

function storage(raw: string | null) {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: { getItem: () => raw, setItem: (_key: string, next: string) => { raw = next; } },
  } });
}

for (const phase of ['intro', 'explore', 'hypothesis', 'fix', 'resolved'] as const) {
  test(`save/load round trip in ${phase}`, () => {
    storage(null);
    const save = createDefaultSaveData();
    save.cases[caseDef.id] = { ...createInitialCaseProgress(caseDef), phase,
      introStepIndex: phase === 'intro' ? 1 : caseDef.introDialogue.length,
      discoveredClueIds: phase === 'intro' ? [] : caseDef.clues.map((c) => c.id),
      selectedHypothesisId: 'hyp_valve_closed', selectedEvidenceIds: ['valve_closed'],
      fountainFixed: phase === 'resolved',
      completedAtIso: phase === 'resolved' ? '2026-11-15T10:00:00.000Z' : null,
    };
    persistSaveData(save);
    const restored = getOrCreateCaseProgress(loadSaveData(), caseDef);
    assert.equal(restored.phase, phase);
    assert.equal(restored.introStepIndex, save.cases[caseDef.id].introStepIndex);
    assert.equal(restored.fountainFixed, phase === 'resolved');
    if (phase === 'resolved') assert.deepEqual(loadSaveData().unlockedRewardIds, caseDef.rewards.map((r) => r.id));
  });
}

test('corrupt JSON, null, primitives and unsupported schema reset safely', () => {
  for (const raw of ['{bad', 'null', '3', '[]', '{"schemaVersion":999,"cases":{}}']) {
    storage(raw);
    assert.deepEqual(loadSaveData().cases, {});
  }
});

test('malformed fields are filtered and impossible phases recover to playable state', () => {
  const raw = { phase: 'resolved', caseId: 'fake', introStepIndex: -4,
    discoveredClueIds: ['basin_low', 'basin_low', 'fake', 7],
    selectedEvidenceIds: ['valve_closed', null], selectedHypothesisId: 'bad',
    fountainFixed: true, completedAtIso: 'invalid', reasoningAttempts: -1,
    hintsUsedCount: 'oops', maxHintLevelUsed: 500 };
  const restored = normalizeCaseProgress(raw, caseDef);
  assert.equal(restored.caseId, caseDef.id);
  assert.equal(restored.phase, 'explore');
  assert.equal(restored.fountainFixed, false);
  assert.deepEqual(restored.discoveredClueIds, ['basin_low']);
  assert.deepEqual(restored.selectedEvidenceIds, []);
  assert.equal(restored.reasoningAttempts, 0);
  assert.equal(restored.completedAtIso, null);
  assert.equal(restored.maxHintLevelUsed, 3);
  const noReasoning = normalizeCaseProgress({ ...raw,
    discoveredClueIds: caseDef.clues.map((c) => c.id) }, caseDef);
  assert.equal(noReasoning.phase, 'hypothesis');
  assert.equal(normalizeCaseProgress({ phase: 'invalid' }, caseDef).phase, 'intro');
  assert.equal(normalizeCaseProgress({ introStepIndex: 100 }, caseDef).phase, 'explore');
});

test('blocked localStorage getter and quota errors do not crash loading or saving', () => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    get localStorage() { throw new Error('SecurityError'); },
  } });
  assert.doesNotThrow(() => loadSaveData());
  assert.doesNotThrow(() => persistSaveData(createDefaultSaveData()));
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } },
  } });
  assert.doesNotThrow(() => persistSaveData(createDefaultSaveData()));
});

test('audio, rewards and nested malformed cases are validated', () => {
  storage(JSON.stringify({ schemaVersion: 1, audio: { muted: 'false', volume: 999 },
    unlockedRewardIds: ['fake', null], cases: { [caseDef.id]: null } }));
  const save = loadSaveData();
  assert.equal(save.audio.muted, false);
  assert.equal(save.audio.volume, 1);
  assert.deepEqual(save.unlockedRewardIds, []);
  assert.equal(save.cases[caseDef.id].phase, 'intro');
});

test('reward sync requires valid completion and is idempotent', () => {
  let save = createDefaultSaveData();
  const adapter = createBrightLandWorldAdapter(() => save, (update) => { save = update(save); });
  const ids = caseDef.rewards.map((r) => r.id);
  adapter.syncCaseCompletion(caseDef.id, ids);
  assert.deepEqual(save.unlockedRewardIds, []);
  save.cases[caseDef.id] = { ...createInitialCaseProgress(caseDef), phase: 'resolved',
    discoveredClueIds: caseDef.clues.map((c) => c.id), selectedHypothesisId: caseDef.correctHypothesisId,
    selectedEvidenceIds: caseDef.requiredEvidenceIds, fountainFixed: true };
  adapter.syncCaseCompletion(caseDef.id, [...ids, 'fake']);
  adapter.syncCaseCompletion(caseDef.id, ids);
  assert.deepEqual(save.unlockedRewardIds, ids);
  assert.equal(adapter.getWorldSummary().completedCaseIds.length, 1);
});
