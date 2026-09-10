import { ChevronDown, Flame, Gem, GraduationCap, Menu, Volume2, VolumeX } from 'lucide-react';
import { Character } from '../components';
import { gradeLabel, streak, type Save } from '../game';
import { navigation, type Page } from './navigation';
import type { Overlay } from './types';
type HeaderProps = {
  save: Save;
  page: Page;
  onNavigate: (page: Page) => void;
  onMenuOpen: () => void;
  onOpenDialog: (overlay: NonNullable<Overlay>) => void;
  onToggleSound: () => void;
};
export default function Header({
  save,
  page,
  onNavigate,
  onMenuOpen,
  onOpenDialog,
  onToggleSound,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          className="icon-button mobile-menu-button"
          aria-label="Open navigation"
          onClick={() => onMenuOpen()}
        >
          <Menu size={22} />
        </button>
        <span>{navigation.find((n) => n.id === page)?.label}</span>
        <span className="topbar-divider" />
        <button
          className="grade-select grade-picker-trigger"
          aria-label="Learning grade"
          aria-haspopup="dialog"
          onClick={() => onOpenDialog('grades')}
        >
          <GraduationCap size={19} />
          <span>{gradeLabel(save.grade)}</span>
          <ChevronDown size={15} />
        </button>
      </div>
      <div className="topbar-actions">
        <span className="top-stat streak-stat" title="Days on your learning streak">
          <Flame size={20} />
          <strong>{streak(save.runs)}</strong>
          <span>day streak</span>
        </span>
        <button
          className="top-stat gems-stat"
          aria-label={`Decorate my clubhouse with ${save.gems} gems`}
          onClick={() => onNavigate('clubhouse')}
        >
          <Gem size={20} />
          <strong>{save.gems}</strong>
        </button>
        <button
          className="icon-button sound-button"
          aria-label={save.sound ? 'Turn sound off' : 'Turn sound on'}
          aria-pressed={save.sound}
          onClick={onToggleSound}
        >
          {save.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          className="profile-button"
          aria-label="Edit explorer profile"
          onClick={() => {
            onOpenDialog('profile');
          }}
        >
          <span className="profile-avatar">
            <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
