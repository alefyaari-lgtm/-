import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import {
  MeydanScene,
  type MeydanSceneVisualState,
  type SceneObjectId,
} from './MeydanScene';

interface PhaserGameHostProps {
  visualState: MeydanSceneVisualState;
  pointerDisabled?: boolean;
  onObjectClick: (objectId: SceneObjectId) => void;
}

export function PhaserGameHost({
  visualState,
  pointerDisabled = false,
  onObjectClick,
}: PhaserGameHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<MeydanScene | null>(null);
  const callbackRef = useRef(onObjectClick);
  const latestStateRef = useRef(visualState);

  callbackRef.current = onObjectClick;
  latestStateRef.current = visualState;

  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) {
      return undefined;
    }

    const scene = new MeydanScene({
      onReady: () => scene.syncVisualState(latestStateRef.current),
      onObjectClick: (objectId) => {
        callbackRef.current(objectId);
      },
    });
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountEl,
      width: 1280,
      height: 720,
      backgroundColor: '#7dd3fc',
      fps: {
        target: 30,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [scene],
      audio: {
        noAudio: true,
      },
    });

    const resizeObserver = new ResizeObserver(() => game.scale.refresh());
    resizeObserver.observe(mountEl);

    return () => {
      resizeObserver.disconnect();
      sceneRef.current = null;
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (scene?.scene && scene.scene.isActive()) {
      scene.syncVisualState(visualState);
    }
  }, [visualState]);

  return (
    <div
      ref={containerRef}
      data-testid="phaser-courtyard-canvas"
      className={`w-full h-full flex items-center justify-center bg-[#0f292e] ${
        pointerDisabled ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    />
  );
}
