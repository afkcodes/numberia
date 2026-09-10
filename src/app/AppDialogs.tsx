import { Heart } from 'lucide-react';
import { playSound } from '../audio';
import { Character, Modal } from '../components';
import DailyQuests from '../features/adventure/DailyQuests';
import { completedMissions, nextMission, type Grade, type Save, type Skill } from '../game';
import GradePicker from '../GradePicker';
import WorldPicker from '../WorldPicker';
import HelpDialog from './dialogs/HelpDialog';
import ParentsDialog from './dialogs/ParentsDialog';
import ProfileDialog from './dialogs/ProfileDialog';
import type { Page } from './navigation';
import type { Overlay } from './types';

type AppDialogsProps = {
  overlay: Overlay;
  save: Save;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onStartQuest: (index: number, skill?: Skill) => void;
  onGradeChange: (grade: Grade) => void;
  onNameChange: (name: string) => void;
  onClaimDaily: (key: string) => void;
  onExport: () => void;
};

export default function AppDialogs({
  overlay,
  save,
  onClose,
  onNavigate,
  onStartQuest,
  onGradeChange,
  onNameChange,
  onClaimDaily,
  onExport,
}: AppDialogsProps) {
  switch (overlay) {
    case 'daily':
      return (
        <Modal title="Today’s little quests" onClose={onClose} className="daily-quests-modal">
          <DailyQuests
            save={save}
            onStart={(skill) => {
              onClose();
              onStartQuest(nextMission(save), skill);
            }}
            onClaim={onClaimDaily}
          />
        </Modal>
      );
    case 'grades':
      return (
        <Modal title="Choose your learning grade" onClose={onClose} className="grades-modal">
          <div className="grade-picker-welcome">
            <Character />
            <span className="skill-tag">YOUR NEXT BIG LITTLE ADVENTURE</span>
            <h1>Ready, set… grow!</h1>
            <p>Pick your grade. Milo will meet you there.</p>
          </div>
          <GradePicker
            grade={save.grade}
            onSelect={(grade) => {
              onGradeChange(grade);
              if (save.sound) playSound('open');
              onClose();
            }}
          />
          <p className="grade-picker-footnote">
            <Heart size={15} />
            Change your grade anytime. Your treasures stay with you.
          </p>
        </Modal>
      );
    case 'profile':
      return (
        <ProfileDialog
          save={save}
          onClose={onClose}
          onNameChange={onNameChange}
          onGradeChange={onGradeChange}
        />
      );
    case 'worlds':
      return (
        <Modal title="The world of Numberia" onClose={onClose} className="worlds-modal">
          <WorldPicker
            completed={completedMissions(save).length}
            onExplore={() => {
              onClose();
              onNavigate('adventure');
            }}
          />
        </Modal>
      );
    case 'help':
      return <HelpDialog onClose={onClose} />;
    case 'parents':
      return (
        <ParentsDialog
          save={save}
          onClose={onClose}
          onProgress={() => onNavigate('progress')}
          onExport={onExport}
        />
      );
    case null:
      return null;
  }
}
