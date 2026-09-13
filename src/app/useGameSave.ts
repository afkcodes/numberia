import { useEffect, useMemo, useReducer, useState } from 'react';
import { stopSpeaking } from '../audio';
import { dateKey, readSave, STORAGE_KEY, type Grade, type Run, type WorldId } from '../game';
import type { LearningObservation } from '../learning';
import { saveReducer } from '../saveReducer';

function loadProgress() {
  try {
    return readSave(localStorage.getItem(STORAGE_KEY));
  } catch {
    return readSave(null);
  }
}

export function useGameSave() {
  const [save, dispatch] = useReducer(saveReducer, undefined, loadProgress);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let failed = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      failed = true;
    }
    // Report the result of writing committed progress to the external browser storage.
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveError(failed);
  }, [save]);

  useEffect(() => {
    if (!save.sound) stopSpeaking();
  }, [save.sound]);

  const actions = useMemo(
    () => ({
      setGrade: (grade: Grade) => dispatch({ type: 'grade-changed', grade }),
      setWorld: (world: WorldId) => dispatch({ type: 'world-changed', world }),
      renameExplorer: (name: string) => dispatch({ type: 'explorer-renamed', name }),
      setCompanion: (companion: string) => dispatch({ type: 'companion-changed', companion }),
      toggleSound: () => dispatch({ type: 'sound-toggled' }),
      chooseDecoration: (id: string) => dispatch({ type: 'decoration-chosen', id }),
      namePet: (name: string) => dispatch({ type: 'pet-renamed', name }),
      claimDaily: (key: string) =>
        dispatch({ type: 'daily-reward-claimed', key, today: dateKey() }),
      completeQuest: (run: Run) => dispatch({ type: 'quest-completed', run }),
      learn: (observation: LearningObservation) =>
        dispatch({ type: 'discovery-learned', observation }),
    }),
    [dispatch],
  );

  const exportProgress = () => {
    const data = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'numberia-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };
  return { save, saveError, actions: { ...actions, exportProgress } };
}
