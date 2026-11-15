import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CASE_REGISTRY, getCaseById } from './cases/registry';
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
} from './core/caseEngine';
import {
  createBrightLandWorldAdapter,
  getOrCreateCaseProgress,
  loadSaveData,
  persistSaveData,
} from './core/storage';
import type {
  BrightLandSaveData,
  CaseProgressState,
  ClueDefinition,
  GameShellState,
  HintLevel,
  SpeakerId,
} from './core/types';
import type { SceneObjectId } from './scenes/MeydanScene';
import { PhaserGameHost } from './scenes/PhaserGameHost';
import { soundSystem, voiceOverAdapter } from './systems/audioSystem';
import { ClueDiscoveryModal } from './components/ClueDiscoveryModal';
import { DialogueBox } from './components/DialogueBox';
import { HintDrawer } from './components/HintDrawer';
import { HudOverlay } from './components/HudOverlay';
import { HypothesisModal } from './components/HypothesisModal';
import { NotebookModal } from './components/NotebookModal';
import { PauseAudioModal } from './components/PauseAudioModal';
import { TitleScreen } from './components/TitleScreen';
import { ToastFeedback } from './components/ToastFeedback';
import { ValvePuzzleModal } from './components/ValvePuzzleModal';
import { VictoryModal } from './components/VictoryModal';

const ACTIVE_CASE_ID = CASE_REGISTRY[0].id;

export default function App() {
  const caseDef = useMemo(() => getCaseById(ACTIVE_CASE_ID), []);

  const [saveData, setSaveData] = useState<BrightLandSaveData>(() => {
    const loaded = loadSaveData();
    return loaded;
  });

  const [shellState, setShellState] = useState<GameShellState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const caseProgress = useMemo(
    () => getOrCreateCaseProgress(saveData, caseDef),
    [saveData, caseDef],
  );

  // Active sub-modals during 'playing'
  const [discoveryModal, setDiscoveryModal] = useState<{
    clue: ClueDefinition;
    isNewDiscovery: boolean;
  } | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const [valvePuzzleOpen, setValvePuzzleOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState<HintLevel | null>(null);
  const [toast, setToast] = useState<{
    speaker: SpeakerId;
    speakerNameFa: string;
    titleFa: string;
    messageFa: string;
  } | null>(null);
  const [celebrationStep, setCelebrationStep] = useState<number | null>(null);

  // Sync document.body.dataset.state with GameShellState
  useEffect(() => {
    document.body.dataset.state = shellState;
  }, [shellState]);

  // Persist saveData changes
  useEffect(() => {
    persistSaveData(saveData);
  }, [saveData]);

  // Persisted progress is the single source of truth.
  const updateCaseProgress = useCallback(
    (updater: (prev: CaseProgressState) => CaseProgressState) => {
      setSaveData((prevSave) => {
        const next = updater(getOrCreateCaseProgress(prevSave, caseDef));
        return { ...prevSave, cases: { ...prevSave.cases, [caseDef.id]: next } };
      });
    },
    [caseDef],
  );

  const worldAdapter = useMemo(
    () =>
      createBrightLandWorldAdapter(
        () => saveData,
        (updater) => setSaveData(updater),
      ),
    [saveData],
  );

  const worldSummary = worldAdapter.getWorldSummary();
  const allCluesFound = areAllCluesDiscovered(caseProgress, caseDef);
  const hasSavedProgress =
    caseProgress.phase !== 'intro' ||
    caseProgress.introStepIndex > 0 ||
    caseProgress.discoveredClueIds.length > 0;

  const activeHint = useMemo(() => {
    if (hintLevel === null) {
      return null;
    }
    return getActiveHint(caseDef, caseProgress, hintLevel);
  }, [caseDef, caseProgress, hintLevel]);

  // Audio handlers
  const handleToggleMute = useCallback(() => {
    soundSystem.playTap();
    setSaveData((prev) => {
      const nextMuted = !prev.audio.muted;
      return {
        ...prev,
        audio: {
          ...prev.audio,
          muted: nextMuted,
        },
      };
    });
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    soundSystem.setVolume(nextVolume);
    soundSystem.setMuted(nextVolume <= 0.01);
    setSaveData((prev) => ({
      ...prev,
      audio: {
        muted: nextVolume <= 0.01,
        volume: nextVolume,
      },
    }));
  }, []);

  useEffect(() => {
    soundSystem.setMuted(saveData.audio.muted);
    soundSystem.setVolume(saveData.audio.volume);
  }, [saveData.audio.muted, saveData.audio.volume]);

  useEffect(() => {
    if (shellState === 'playing' && caseProgress.fountainFixed && !saveData.audio.muted) {
      soundSystem.startWaterAmbient();
    } else soundSystem.stopWaterAmbient();
    return () => soundSystem.stopWaterAmbient();
  }, [shellState, caseProgress.fountainFixed, saveData.audio.muted]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setShellState((prev) => prev === 'playing' ? 'paused' : prev);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Start / Restart handlers
  const handleStartContinue = useCallback(() => {
    soundSystem.playTap();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setNotebookOpen(false);
    setHypothesisOpen(false);
    setValvePuzzleOpen(false);
    setDiscoveryModal(null);
    setHintLevel(null);
    setToast(null);
    setCelebrationStep(null);

    if (caseProgress.fountainFixed && caseProgress.phase === 'resolved') {
      soundSystem.startWaterAmbient();
    }
    setShellState('playing');
  }, [caseProgress.fountainFixed, caseProgress.phase]);

  const handleStartFresh = useCallback(() => {
    soundSystem.playTap();
    soundSystem.stopWaterAmbient();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const fresh = createInitialCaseProgress(caseDef);
    setSaveData((prev) => ({
      ...prev,
      cases: {
        ...prev.cases,
        [caseDef.id]: fresh,
      },
    }));
    setNotebookOpen(false);
    setHypothesisOpen(false);
    setValvePuzzleOpen(false);
    setDiscoveryModal(null);
    setHintLevel(null);
    setToast(null);
    setCelebrationStep(null);
    setShellState('playing');
  }, [caseDef]);

  const handleReturnTitle = useCallback(() => {
    soundSystem.playTap();
    soundSystem.stopWaterAmbient();
    setShellState('title');
  }, []);

  // Keyboard shortcuts (Enter/Space on title, P/Escape pause, M mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || (e.target instanceof HTMLElement &&
        e.target.closest('input, textarea, select, [contenteditable=true]'))) return;
      if (shellState === 'title') {
        if (e.target instanceof HTMLElement && e.target.closest('button')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartContinue();
        }
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (shellState === 'playing') {
          soundSystem.stopWaterAmbient();
          setShellState('paused');
        } else if (shellState === 'paused') {
          if (caseProgress.fountainFixed) {
            soundSystem.startWaterAmbient();
          }
          setShellState('playing');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shellState, handleStartContinue, handleToggleMute, caseProgress.fountainFixed]);

  // Intro Dialogue Progression
  const handleAdvanceIntro = useCallback(() => {
    soundSystem.playTap();
    updateCaseProgress((prev) => advanceIntroDialogue(prev, caseDef));
  }, [caseDef, updateCaseProgress]);

  const anyModalOpen = Boolean(
    discoveryModal || notebookOpen || hypothesisOpen || valvePuzzleOpen || hintLevel !== null || celebrationStep !== null,
  );

  useEffect(() => {
    const topDialog = () => Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'))
      .filter((el) => el.getClientRects().length > 0).at(-1);
    const previousFocus = document.activeElement;
    const focusable = (dialog: HTMLElement) => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    )).filter((el) => el.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      const dialog = topDialog();
      if (dialog) focusable(dialog)[0]?.focus();
    });
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const dialog = topDialog();
      if (!dialog) return;
      const controls = focusable(dialog);
      const index = controls.indexOf(document.activeElement as HTMLElement);
      if (index === -1 || (!event.shiftKey && index === controls.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault();
        controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
      }
    };
    window.addEventListener('keydown', onTab);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onTab);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [shellState, discoveryModal, notebookOpen, hypothesisOpen, valvePuzzleOpen, hintLevel]);

  // Scene Object Click Handler
  const handleSceneObjectClick = useCallback(
    (objectId: SceneObjectId) => {
      if (shellState !== 'playing' || anyModalOpen) {
        return;
      }

      // If still in intro dialogue, remind gently or advance
      if (caseProgress.phase === 'intro') {
        soundSystem.playTap();
        return;
      }

      // If in fix phase and child touches the valve, launch interactive valve turn!
      if (caseProgress.phase === 'fix' && objectId === caseDef.fixTargetSceneObjectId) {
        soundSystem.playTap();
        setToast(null);
        setHintLevel(null);
        setValvePuzzleOpen(true);
        return;
      }

      // If already resolved, touching objects gives joyful reactions
      if (caseProgress.phase === 'resolved') {
        soundSystem.playPropReaction();
        setToast({
          speaker: 'noorak',
          speakerNameFa: 'نورک',
          titleFa: 'میدان روشن',
          messageFa: 'فواره با قدرت کار می‌کند و آب زلال در حوض می‌ریزد!',
        });
        return;
      }

      // Check if object corresponds to a Key Clue
      const matchingClue = caseDef.clues.find((c) => c.sceneObjectId === objectId);
      if (matchingClue) {
        const result = inspectClue(caseProgress, caseDef, matchingClue.id);
        updateCaseProgress((prev) => inspectClue(prev, caseDef, matchingClue.id).progress);
        setToast(null);
        setHintLevel(null);

        if (result.isNewDiscovery) {
          soundSystem.playClueDiscovery();
          void voiceOverAdapter.playClip(matchingClue.voiceClipKey);
        } else {
          soundSystem.playTap();
        }

        setDiscoveryModal({
          clue: result.clue,
          isNewDiscovery: result.isNewDiscovery,
        });
        return;
      }

      // Check Non-Key Props (flowerpot, bench, butterfly, fountain)
      const matchingProp = caseDef.nonKeyProps.find((p) => p.sceneObjectId === objectId);
      if (matchingProp) {
        const result = inspectNonKeyProp(caseProgress, caseDef, matchingProp.id);
        updateCaseProgress((prev) => inspectNonKeyProp(prev, caseDef, matchingProp.id).progress);
        soundSystem.playPropReaction();
        void voiceOverAdapter.playClip(matchingProp.voiceClipKey);

        const speakerNameMap: Record<SpeakerId, string> = {
          noorak: 'نورک',
          raha: 'رها',
          nane_bahar: 'ننه‌بهار',
        };

        setToast({
          speaker: matchingProp.speaker,
          speakerNameFa: speakerNameMap[matchingProp.speaker],
          titleFa: matchingProp.titleFa,
          messageFa: matchingProp.reactionFa,
        });
      }
    },
    [anyModalOpen, caseDef, caseProgress, shellState, updateCaseProgress],
  );

  const handleCloseDiscoveryModal = useCallback(() => {
    soundSystem.playTap();
    const shouldPromptHypothesis =
      areAllCluesDiscovered(caseProgress, caseDef) &&
      caseProgress.phase === 'explore';
    setDiscoveryModal(null);

    if (shouldPromptHypothesis) {
      updateCaseProgress((prev) => enterHypothesisPhase(prev, caseDef));
      setHypothesisOpen(true);
    }
  }, [caseDef, caseProgress, updateCaseProgress]);

  const handleRequestHint = useCallback(() => {
    soundSystem.playTap();
    setToast(null);
    const next: HintLevel = hintLevel === null ? 1 : hintLevel === 1 ? 2 : 3;
    updateCaseProgress((cp) => recordHintUsage(cp, next));
    setHintLevel(next);
  }, [hintLevel, updateCaseProgress]);

  const handleSelectHintLevel = useCallback(
    (level: HintLevel) => {
      soundSystem.playTap();
      updateCaseProgress((cp) => recordHintUsage(cp, level));
      setHintLevel(level);
    },
    [updateCaseProgress],
  );

  const handleSubmitReasoning = useCallback(
    (hypothesisId: string, evidenceIds: string[]) => {
      const evalResult = evaluateReasoning(
        caseProgress,
        caseDef,
        hypothesisId,
        evidenceIds,
      );
      updateCaseProgress((prev) => evaluateReasoning(prev, caseDef, hypothesisId, evidenceIds).progress);

      if (evalResult.isValid) {
        soundSystem.playClueDiscovery();
      } else {
        soundSystem.playGentleNudge();
      }

      return {
        isValid: evalResult.isValid,
        feedbackFa: evalResult.feedbackFa,
      };
    },
    [caseDef, caseProgress, updateCaseProgress],
  );

  const handleSuccessProceedToFix = useCallback(() => {
    soundSystem.playTap();
    setHypothesisOpen(false);
    setToast({
      speaker: 'noorak',
      speakerNameFa: 'نورک',
      titleFa: 'مرحله پایانی',
      messageFa: caseDef.fixInstructionFa,
    });
  }, [caseDef.fixInstructionFa]);

  const handleValveOpened = useCallback(() => {
    if (caseProgress.phase !== 'fix' || shellState !== 'playing') return;
    setValvePuzzleOpen(false);
    setHintLevel(null);
    setToast(null);

    soundSystem.playWaterFlowStart();
    soundSystem.playVictoryFanfare();

    const completedAtIso = new Date().toISOString();
    setSaveData((prev) => {
      const progress = getOrCreateCaseProgress(prev, caseDef);
      if (progress.phase !== 'fix') return prev;
      return {
        ...prev,
        cases: { ...prev.cases, [caseDef.id]: completeFixAction(progress, completedAtIso) },
        unlockedRewardIds: Array.from(new Set([
          ...prev.unlockedRewardIds, ...caseDef.rewards.map((r) => r.id),
        ])),
      };
    });

    setCelebrationStep(0);
  }, [caseDef, caseProgress.phase, shellState]);

  const handleAdvanceCelebration = useCallback(() => {
    soundSystem.playTap();
    if (celebrationStep === null) {
      return;
    }
    if (celebrationStep + 1 < caseDef.celebrationDialogue.length) {
      setCelebrationStep(celebrationStep + 1);
    } else {
      setCelebrationStep(null);
      setShellState('gameover');
    }
  }, [caseDef.celebrationDialogue.length, celebrationStep]);

  const currentIntroLine =
    caseProgress.phase === 'intro'
      ? caseDef.introDialogue[caseProgress.introStepIndex]
      : null;

  const currentCelebrationLine =
    celebrationStep !== null
      ? caseDef.celebrationDialogue[celebrationStep]
      : null;

  const sceneVisualState = useMemo(
    () => ({
      discoveredClueIds: caseProgress.discoveredClueIds,
      fountainFixed: caseProgress.fountainFixed,
      highlightObjectId: (activeHint?.sceneObjectId as SceneObjectId | null) ?? null,
      isPaused: shellState !== 'playing' || anyModalOpen,
    }),
    [
      caseProgress.discoveredClueIds,
      caseProgress.fountainFixed,
      activeHint?.sceneObjectId,
      shellState,
      anyModalOpen,
    ],
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0f292e]">
      {shellState === 'title' && (
        <TitleScreen
          hasSavedProgress={hasSavedProgress}
          isCaseCompleted={caseProgress.fountainFixed}
          muted={saveData.audio.muted}
          onStartNewOrContinue={handleStartContinue}
          onStartFresh={handleStartFresh}
          onToggleMute={handleToggleMute}
        />
      )}

      {shellState !== 'title' && (
        <div className="relative w-full h-full">
          {/* Existing Phaser Canvas courtyard */}
          <PhaserGameHost
            visualState={sceneVisualState}
            pointerDisabled={shellState !== 'playing' || anyModalOpen}
            onObjectClick={handleSceneObjectClick}
          />

          {/* Accessible Screen-Reader / Keyboard Courtyard Object Controls */}
          {shellState === 'playing' && !anyModalOpen && caseProgress.phase !== 'intro' && (
            <div className="sr-only" aria-label="اشیای قابل بررسی در میدان روشن">
              <button type="button" onClick={() => handleSceneObjectClick('basin')}>
                بررسی حوض فواره
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('valve')}>
                بررسی شیر آب کنار باغچه
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('pipe')}>
                بررسی لوله آب
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('flowerpot')}>
                بررسی گلدان شمعدانی
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('bench')}>
                بررسی نیمکت چوبی
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('butterfly')}>
                بررسی پروانه تزئینی
              </button>
              <button type="button" onClick={() => handleSceneObjectClick('fountain')}>
                بررسی فواره کاشی‌کاری‌شده
              </button>
            </div>
          )}

          {/* World-matched Perimeter HUD */}
          {shellState === 'playing' && (
            <HudOverlay
              phase={caseProgress.phase}
              discoveredCount={caseProgress.discoveredClueIds.length}
              totalCluesCount={caseDef.clues.length}
              allCluesFound={allCluesFound}
              muted={saveData.audio.muted}
              onOpenNotebook={() => {
                soundSystem.playTap();
                setNotebookOpen(true);
              }}
              onRequestHint={handleRequestHint}
              onOpenHypothesis={() => {
                soundSystem.playTap();
                updateCaseProgress((prev) => enterHypothesisPhase(prev, caseDef));
                setHypothesisOpen(true);
              }}
              onToggleMute={handleToggleMute}
              onPause={() => {
                soundSystem.playTap();
                soundSystem.stopWaterAmbient();
                setShellState('paused');
              }}
            />
          )}

          {/* Intro Story Dialogue */}
          {shellState === 'playing' && currentIntroLine && (
            <DialogueBox
              line={currentIntroLine}
              stepNumber={caseProgress.introStepIndex + 1}
              totalSteps={caseDef.introDialogue.length}
              actionLabel={
                caseProgress.introStepIndex + 1 === caseDef.introDialogue.length
                  ? 'شروع جست‌وجو'
                  : 'ادامه'
              }
              onNext={handleAdvanceIntro}
            />
          )}

          {/* Celebration Dialogue while watching the live flowing fountain */}
          {shellState === 'playing' && currentCelebrationLine && (
            <DialogueBox
              line={currentCelebrationLine}
              stepNumber={(celebrationStep ?? 0) + 1}
              totalSteps={caseDef.celebrationDialogue.length}
              actionLabel={
                (celebrationStep ?? 0) + 1 === caseDef.celebrationDialogue.length
                  ? 'مشاهده پاداش پرونده'
                  : 'ادامه'
              }
              onNext={handleAdvanceCelebration}
            />
          )}

          {/* If case is resolved and user closed victory modal to look around, offer button to reopen rewards */}
          {shellState === 'playing' &&
            caseProgress.phase === 'resolved' &&
            !currentCelebrationLine &&
            !notebookOpen && (
              <div className="fixed bottom-4 left-4 z-30 safe-area-inset">
                <button
                  type="button"
                  onClick={() => setShellState('gameover')}
                  className="inline-flex items-center gap-2 min-h-12 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#134e4a] font-extrabold shadow-xl border-2 border-amber-200 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>نمایش پاداش پرونده</span>
                </button>
              </div>
            )}

          {/* Non-key prop / helper toast */}
          {shellState === 'playing' &&
            toast &&
            !discoveryModal &&
            !notebookOpen &&
            !hypothesisOpen &&
            !valvePuzzleOpen &&
            !activeHint && (
              <ToastFeedback
                speaker={toast.speaker}
                speakerNameFa={toast.speakerNameFa}
                titleFa={toast.titleFa}
                messageFa={toast.messageFa}
                onDismiss={() => setToast(null)}
              />
            )}

          {/* 3-Tier Noorak Hint Drawer */}
          {shellState === 'playing' &&
            activeHint &&
            !discoveryModal &&
            !notebookOpen &&
            !valvePuzzleOpen && (
              <HintDrawer
                hint={activeHint}
                onSelectLevel={handleSelectHintLevel}
                onClose={() => setHintLevel(null)}
              />
            )}

          {/* Clue Discovery Card Modal */}
          {shellState === 'playing' && discoveryModal && (
            <ClueDiscoveryModal
              clue={discoveryModal.clue}
              isNewDiscovery={discoveryModal.isNewDiscovery}
              discoveredCount={caseProgress.discoveredClueIds.length}
              totalCluesCount={caseDef.clues.length}
              onClose={handleCloseDiscoveryModal}
            />
          )}

          {/* Detective Notebook Modal */}
          {shellState === 'playing' && notebookOpen && (
            <NotebookModal
              clues={caseDef.clues}
              discoveredClueIds={caseProgress.discoveredClueIds}
              onClose={() => {
                soundSystem.playTap();
                setNotebookOpen(false);
              }}
            />
          )}

          {/* Hypothesis & Supporting Evidence Modal */}
          {shellState === 'playing' && hypothesisOpen && (
            <div hidden={notebookOpen || hintLevel !== null}>
            <HypothesisModal
              caseDef={caseDef}
              discoveredClueIds={caseProgress.discoveredClueIds}
              accepted={caseProgress.phase === 'fix'}
              onDraftChange={(hypothesisId, evidenceIds) => updateCaseProgress((prev) => ({
                ...prev, selectedHypothesisId: hypothesisId || null, selectedEvidenceIds: evidenceIds,
              }))}
              initialHypothesisId={caseProgress.selectedHypothesisId}
              initialEvidenceIds={caseProgress.selectedEvidenceIds}
              onSubmitReasoning={handleSubmitReasoning}
              onOpenNotebook={() => {
                soundSystem.playTap();
                setNotebookOpen(true);
              }}
              onRequestHint={() => {
                handleRequestHint();
              }}
              onSuccessProceed={handleSuccessProceedToFix}
              onClose={() => {
                soundSystem.playTap();
                setHypothesisOpen(false);
              }}
            />
            </div>
          )}

          {/* Valve Turning Mini-Interaction */}
          {shellState === 'playing' && valvePuzzleOpen && (
            <ValvePuzzleModal
              onTurnStep={(ratio) => soundSystem.playValveTurnTick(ratio)}
              onValveOpened={handleValveOpened}
              onClose={() => {
                soundSystem.playTap();
                setValvePuzzleOpen(false);
              }}
            />
          )}

          {/* Pause & Audio Settings Modal */}
          {shellState === 'paused' && (
            <PauseAudioModal
              muted={saveData.audio.muted}
              volume={saveData.audio.volume}
              onToggleMute={handleToggleMute}
              onVolumeChange={handleVolumeChange}
              onResume={() => {
                soundSystem.playTap();
                if (caseProgress.fountainFixed) {
                  soundSystem.startWaterAmbient();
                }
                setShellState('playing');
              }}
              onRestartCase={handleStartFresh}
              onReturnTitle={handleReturnTitle}
            />
          )}

          {/* Victory & Rewards Modal */}
          {shellState === 'gameover' && (
            <VictoryModal
              caseDef={caseDef}
              completedCasesCount={worldSummary.completedCaseIds.length}
              totalPlannedCases={worldSummary.totalCasesPlanned}
              detectiveProgressPercent={worldSummary.detectiveProgressPercent}
              onPlayAgain={handleStartFresh}
              onReturnHome={handleReturnTitle}
            />
          )}
        </div>
      )}
    </main>
  );
}
