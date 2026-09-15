import { Sprout } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import AppDialogs from './app/AppDialogs';
import Header from './app/Header';
import type { Page } from './app/navigation';
import Sidebar from './app/Sidebar';
import type { ActiveQuest, Overlay } from './app/types';
import { useGameSave } from './app/useGameSave';
import { playSound } from './audio';
import Clubhouse from './Clubhouse';
import { Modal } from './components';
import AdventureMap from './features/adventure/AdventureMap';
import WelcomeBanner from './features/adventure/WelcomeBanner';
import BackpackPage from './features/backpack/BackpackPage';
import Practice from './features/practice/PracticePage';
import ProgressPage from './features/progress/ProgressPage';
import { nextMission, worldForMission, type Skill } from './game';
import LandingWildlife, { SkySun } from './LandingWildlife';
import StorybookBackdrop from './StorybookBackdrop';

const Quest = lazy(() => import('./Quest'));
const ReadingAdventure = lazy(() => import('./features/reading/ReadingAdventure'));

export default function App() {
  const { save, saveError, actions } = useGameSave();
  const [page, setPage] = useState<Page>('adventure');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quest, setQuest] = useState<ActiveQuest | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const goTo = (page: Page) => {
    setPage(page);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const start = (index = nextMission(save), practiceSkill?: Skill) =>
    setQuest({ id: crypto.randomUUID(), index, practiceSkill });
  return (
    <>
      <StorybookBackdrop />
      {page === 'adventure' && <LandingWildlife />}
      <a className="skip-link" href="#main-content">
        Skip to adventure
      </a>
      <div
        className={`app-shell ${page === 'adventure' ? 'home-adventure' : page === 'reading' ? 'home-reading' : ''}`}
        onClick={(e) => {
          if (save.sound && (e.target as HTMLElement).closest('button')) playSound('tap');
        }}
      >
        <Sidebar
          save={save}
          page={page}
          mobileMenu={mobileMenu}
          onNavigate={goTo}
          onMenuClose={() => setMobileMenu(false)}
          onOpenDialog={setOverlay}
        />
        {mobileMenu && (
          <button
            className="menu-scrim"
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
          />
        )}
        <div className="main-shell">
          <Header
            save={save}
            page={page}
            onNavigate={goTo}
            onMenuOpen={() => setMobileMenu(true)}
            onOpenDialog={setOverlay}
            onToggleSound={actions.toggleSound}
          />
          <main id="main-content" className="main-content">
            {saveError && (
              <div className="storage-warning" role="alert">
                Your browser can’t save progress right now. Keep this tab open, or download your
                progress in the grown-up corner.
              </div>
            )}
            {page === 'adventure' && (
              <>
                <SkySun />
                <WelcomeBanner save={save} onStart={() => start()} />
                <AdventureMap
                  key={`${save.world}:${save.grade}:${nextMission(save)}`}
                  save={save}
                  onStart={(i) => start(i)}
                  onWorlds={() => setOverlay('worlds')}
                  onDaily={() => setOverlay('daily')}
                />
              </>
            )}
            {page === 'practice' && <Practice save={save} onStart={(skill) => start(0, skill)} />}
            {page === 'reading' && (
              <Suspense
                fallback={
                  <div className="loading-state" role="status">
                    <Sprout size={32} />
                    <h2>Opening a little world of words…</h2>
                  </div>
                }
              >
                <ReadingAdventure
                  key={save.grade}
                  save={save}
                  onSound={actions.toggleSound}
                  onComplete={actions.completeReading}
                  onBookmark={actions.bookmarkReading}
                  onBackpack={() => goTo('backpack')}
                />
              </Suspense>
            )}
            {page === 'clubhouse' && (
              <Clubhouse
                save={save}
                onChoose={actions.chooseDecoration}
                onName={actions.namePet}
                onAdventure={() => start()}
              />
            )}
            {page === 'backpack' && (
              <BackpackPage
                save={save}
                onCompanion={actions.setCompanion}
                onAdventure={() => goTo('adventure')}
                onReading={() => goTo('reading')}
              />
            )}
            {page === 'progress' && (
              <ProgressPage save={save} onAdventure={() => goTo('adventure')} />
            )}
          </main>
        </div>
      </div>
      {quest && (
        <Suspense
          fallback={
            <Modal title="Packing your adventure" onClose={() => setQuest(null)}>
              <div className="loading-state">
                <Sprout size={36} />
                <h2>Packing a little magic…</h2>
              </div>
            </Modal>
          }
        >
          <Quest
            key={quest.id}
            save={save}
            missionIndex={quest.index}
            practiceSkill={quest.practiceSkill}
            onClose={() => setQuest(null)}
            onComplete={actions.completeQuest}
            onLearn={actions.learn}
            onClubhouse={() => {
              setQuest(null);
              goTo('clubhouse');
            }}
            onSoundChange={actions.toggleSound}
            onContinue={() => {
              if (quest.practiceSkill) start(quest.index, quest.practiceSkill);
              else {
                const chapters = worldForMission(quest.index).chapters;
                const next = chapters[chapters.indexOf(quest.index) + 1];
                if (next !== undefined) start(next);
                else setQuest(null);
              }
            }}
          />
        </Suspense>
      )}
      <AppDialogs
        overlay={overlay}
        save={save}
        onClose={() => setOverlay(null)}
        onNavigate={goTo}
        onStartQuest={start}
        onGradeChange={actions.setGrade}
        onWorldChange={actions.setWorld}
        onNameChange={actions.renameExplorer}
        onClaimDaily={actions.claimDaily}
        onExport={actions.exportProgress}
      />
    </>
  );
}
