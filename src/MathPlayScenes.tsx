import type { ReactNode } from 'react';
import { ArrowDown, Check, Hand, Volume2 } from 'lucide-react';
import { Character } from './components';
import { bridgeLesson } from './bridgeLesson';
import { speak } from './audio';
import type { Problem } from './game';
import { bridgePieces, type Placements, type PlayModel, type PlayToken } from './handsOnModel';

type SceneProps = { problem: Problem; model: PlayModel; placements: Placements; settled: Placements; total: number; solved: boolean; moving: boolean; busy: boolean; selected: string | null; renderToken: (token: PlayToken) => ReactNode; drop: () => void };
export function PicnicScene({ problem, model, placements, total, solved, moving, busy, renderToken, drop }: SceneProps) {
  const gathered = model.tokens.filter(t=>placements[t.id]!==undefined);
  return <div className={`picnic-playground ${solved?'picnic-party':''}`}>
    <div className="picnic-companion"><Character/><span>{solved?'A picnic we made together!':total===0?'My basket is ready!':moving?'Here it comes…':'Look! Our picnic is growing.'}</span></div>
    <div className="picnic-basket play-target single-target" data-drop-target="0">
      <span className="basket-handle" aria-hidden="true"/>
      <div className="basket-inside">
        <button className="target-touch basket-drop" data-drop-target="0" disabled={solved||busy||moving} onClick={drop} aria-label="Place selected item in basket 1"><span className="target-name">Milo’s picnic basket</span>{gathered.length===0&&<span className="basket-empty-cue"><Hand size={24}/>Tap a berry above<br/>or drag it here</span>}</button>
        <div className="target-tokens basket-berries">{gathered.map(renderToken)}</div>
      </div>
      <div className="basket-weave" aria-hidden="true"><svg viewBox="0 0 500 70" preserveAspectRatio="none"><path d="M0 0H500L478 61Q250 79 22 61Z" fill="var(--color-fox)"/>{Array.from({length:17},(_,i)=><path key={i} d={`M${i*32} 0L${i*32+15} 70`} stroke="var(--color-fox-dark)" strokeWidth="8"/>)}<path d="M5 19Q250 40 495 19M10 44Q250 66 490 44" stroke="var(--color-cream)" strokeOpacity=".45" strokeWidth="5"/></svg></div>
      <div className="basket-count"><strong key={total}>{model.scale===10?(total/10).toFixed(1):total}</strong><span>{model.scale===10?'altogether':'berries in our basket'}</span>{moving&&<span className="count-wait">…</span>}</div>
    </div>
    {solved&&<div className="picnic-result"><Check size={18}/>{problem.equation} = {problem.answer}. Picnic time!</div>}
  </div>;
}

export function BridgeScene({ problem, model, placements, total, solved, moving, busy, selected, renderToken, drop }: SceneProps) {
  const pieces=bridgePieces(problem,model,placements);
  const lesson=bridgeLesson(problem,total,solved);
  const explanation=problem.answer===0?`All ${problem.a} planks were here. We added zero!`:`${problem.a} needed − ${problem.b} already here = ${problem.answer} missing. Extra planks can stay in the tray.`;
  // Overlapping, hidden copies reserve the longest coaching state at any font or
  // screen size. Updating the explanation never moves the bridge or its controls.
  const lessonStates=[0,1,Math.max(0,problem.answer-1),problem.answer,problem.answer+1].map(n=>bridgeLesson(problem,n));
  lessonStates.push(bridgeLesson(problem,problem.answer,true));
  return <div className={`bridge-playground ${solved?'bridge-crossed':''}`}>
    <div className={`bridge-learning-cue ${lesson.ready?'lesson-understood':''}`}><span className="bridge-learning-step">{lesson.step}</span><div className="bridge-lesson-copy">
      {lessonStates.map((state,i)=><div className="bridge-copy-reserve" aria-hidden="true" key={i}><h3>{state.title}</h3><p>{state.ready?explanation:state.message}</p></div>)}
      <div className="bridge-copy-current"><h3>{lesson.title}</h3><p className={lesson.ready?'bridge-answer-explanation':undefined}>{lesson.ready?explanation:lesson.message}</p></div>
    </div><button className="icon-button" aria-label="Hear Pip explain this step" onClick={()=>speak(lesson.speech)}><Volume2 size={19}/></button></div>
    <div className={`bridge-math-story ${lesson.ready?'bridge-equation-ready':''}`}><span><strong>{problem.a}</strong> planks needed</span><span><strong>{problem.b}</strong> already built</span><span className="bridge-added-count"><strong key={total}>{total}</strong> you added</span></div>
    <div className="river-playground play-target" data-drop-target="0">
      <svg className="bridge-landscape" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H800V300H0Z" fill="var(--color-blue)"/><path d="M0 0H156Q215 70 176 150T172 300H0Z M800 0H660Q600 70 652 150T635 300H800Z" fill="var(--color-hero)"/><path d="M0 251Q112 211 191 272V300H0Z M800 230Q710 220 634 273V300H800Z" fill="var(--color-mint)"/><g className="river-ripples" fill="none" stroke="var(--color-white)" strokeWidth="4" strokeLinecap="round"><path d="M256 45Q294 37 333 46M482 77Q521 68 558 77M259 232Q297 224 336 233M451 265Q489 256 529 264"/></g><g fill="var(--color-toy-green-shadow)"><path d="M46 263L40 234L53 247L65 225L61 263M737 274L720 249L736 258L748 233L751 274"/></g><g className="river-fish" fill="var(--color-fox)"><ellipse cx="435" cy="234" rx="13" ry="6"/><path d="M449 233L459 226V240Z"/><circle cx="430" cy="232" r="1.5" fill="var(--color-ink)"/></g></svg>
      <div className="pip-route" aria-hidden="true"><div className="pip-mover"><div className="pip-actor"><Character name="Pip"/><span className="pip-foot left"/><span className="pip-foot right"/></div></div></div>
      <span className="pip-crossing-note">{solved?`You added ${problem.answer}. Thank you!`:total===model.goal?'My bridge is ready. Let’s try it!':'Fill my empty spaces!'}</span>
      <div className={`bridge-timbers ${selected?'bridge-ready':''}`}>
        <button className="target-touch bridge-drop" disabled={solved||busy||moving} onClick={drop} aria-label="Place selected item in bridge 1" data-drop-target="0"><span className="sr-only">Drop your plank into the bridge</span></button>
        {pieces.map(piece=><div key={piece.id} className={`bridge-piece piece-${piece.kind} ${piece.kind==='gap'&&piece.first?'next-gap':''}`}>
          {piece.token?renderToken(piece.token):<span className="fixed-timber">{piece.kind==='existing'?<><i/><i/>{problem.a>20&&<b>{piece.value}</b>}</>:<><span>{piece.first?<ArrowDown size={20}/>:''}</span>{problem.a>20&&<b>{piece.value}</b>}</>}</span>}
        </div>)}
      </div>
      <div className="bridge-shore-labels"><span>START</span><span>PICNIC PARK <span>⚑</span></span></div>
    </div>
    <div className="bridge-color-key"><span><i className="key-built"/><Check size={13}/>Already here</span><span><i className="key-new"/>+ New planks you add</span><span><i className="key-gap"/>Empty space</span></div>
    {problem.a>20&&<p className="bridge-bundle-note">Each labeled section is a bundle of planks.</p>}
  </div>;
}
