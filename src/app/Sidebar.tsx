import { ChevronRight, CircleHelp, ShieldCheck, Sprout, X } from 'lucide-react';
import { Character, Logo } from '../components';
import { completedMissions, type Save } from '../game';
import { navigation, type Page } from './navigation';
import type { Overlay } from './types';
type SidebarProps = {
  save: Save;
  page: Page;
  mobileMenu: boolean;
  onNavigate: (page: Page) => void;
  onMenuClose: () => void;
  onOpenDialog: (overlay: NonNullable<Overlay>) => void;
};
export default function Sidebar({
  save,
  page,
  mobileMenu,
  onNavigate,
  onMenuClose,
  onOpenDialog,
}: SidebarProps) {
  const level = Math.floor(save.xp / 300) + 1;
  const nextLevelXP = save.xp % 300;
  return (
    <aside className={`sidebar ${mobileMenu ? 'menu-open' : ''}`}>
      <div className="sidebar-brand">
        <button
          className="brand-button"
          aria-label="Numberia home"
          onClick={() => onNavigate('adventure')}
        >
          <Logo />
        </button>
        <button
          className="icon-button close-menu"
          aria-label="Close menu"
          onClick={() => onMenuClose()}
        >
          <X size={20} />
        </button>
      </div>
      <p className="brand-tagline">Little minds. Big adventures.</p>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${page === item.id ? 'active' : ''}`}
            aria-current={page === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={21} strokeWidth={page === item.id ? 2.3 : 1.8} />
            <span>{item.label}</span>
            {item.id === 'backpack' && completedMissions(save).length > 0 && (
              <span className="nav-count">{completedMissions(save).length}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-journey">
        <div className="sidebar-label">YOUR EXPLORER JOURNEY</div>
        <div className="explorer-level">
          <span className="level-medallion">
            <Sprout size={24} />
          </span>
          <div>
            <strong>
              {level < 3
                ? 'Curious explorer'
                : level < 6
                  ? 'Brave trailblazer'
                  : 'Woodland guardian'}
            </strong>
            <span>Level {level}</span>
          </div>
        </div>
        <div className="xp-label">
          <span>{nextLevelXP} XP</span>
          <span>{300} XP</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${nextLevelXP / 3}%` }} />
        </div>
        <p>A little closer with every discovery.</p>
      </div>
      <div className="sidebar-bottom">
        <div className="buddy-card">
          <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
          <div className="buddy-bubble">
            “Big adventures start
            <br />
            with little steps.”
          </div>
          <p>{save.companion} believes in you.</p>
        </div>
        <button
          className="parent-link"
          onClick={() => {
            onOpenDialog('parents');
            onMenuClose();
          }}
        >
          <ShieldCheck size={19} />
          Grown-up corner
          <ChevronRight size={16} />
        </button>
        <button
          className="help-link"
          onClick={() => {
            onOpenDialog('help');
            onMenuClose();
          }}
        >
          <CircleHelp size={16} />A little help
        </button>
      </div>
    </aside>
  );
}
