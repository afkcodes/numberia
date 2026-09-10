import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, Check, Hand, Plus, RotateCcw, Sparkles, Undo2, Volume2 } from 'lucide-react';
import type { Problem } from './game';
import { completedPlay, demonstrationPlacements, playModel, targetTotal, type Placements, type PlayToken } from './handsOnModel';
import { playSound, speak, stopSpeaking } from './audio';
import { answerNarration } from './mathNarration';
import { captureProp } from './propFlight';
import { BridgeScene, PicnicScene } from './MathPlayScenes';
import './tactile-play.css';
import { bridgeLesson } from './bridgeLesson';

export function Berry({ group=0, plank=false }: {group?:number;plank?:boolean}) {
  return <svg preserveAspectRatio={plank?"none":"xMidYMid meet"} viewBox={plank?"0 0 32 84":"0 0 48 48"} aria-hidden="true">{plank?<><rect x="2" y="2" width="28" height="80" rx="5" fill="var(--color-toy-yellow)" stroke="var(--color-gold-ink)" strokeWidth="2"/><path d="M10 12Q16 32 10 54T13 76M23 8Q18 22 23 42T21 75" stroke="var(--color-gold)" strokeWidth="2" fill="none"/><circle cx="8" cy="9" r="2" fill="var(--color-orange-ink)"/><circle cx="24" cy="75" r="2" fill="var(--color-orange-ink)"/></>:<><path d="M23 14Q20 3 32 4Q38 4 36 9Q30 15 23 14" fill="var(--color-accent)"/><path d="M24 12C7 6 3 26 11 38C17 47 31 46 38 35C46 22 39 9 24 12" fill={`var(--color-${group?'coral':'berry'})`}/><ellipse cx="16" cy="19" rx="4" ry="6" fill="var(--color-white)" opacity=".28" transform="rotate(30 16 19)"/><circle cx="19" cy="29" r="2" fill="var(--color-ink)"/><circle cx="31" cy="29" r="2" fill="var(--color-ink)"/><path d="M21 35Q25 39 29 35" stroke="var(--color-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round"/></>}</svg>;
}
const titles={gather:'Two groups. One happy picnic!',bridge:'Build Pip’s bridge',groups:'Pack a picnic for everyone',share:'Everybody gets a fair share',pieces:'Make a moonberry treat'};
type Step = [string,number][];
type PendingMove = { next: Placements; props: {id:string;flight:ReturnType<typeof captureProp>}[]; after:()=>void };

export default function HandsOn({ problem, sound, solved, demonstrate, coaching=false, onAnswer }: {problem:Problem;sound:boolean;solved:boolean;demonstrate:number;coaching?:boolean;onAnswer:(n:number)=>void}) {
  const model=useMemo(()=>playModel(problem),[problem]);
  const [placements,setPlacements]=useState<Placements>({}),[settled,setSettled]=useState<Placements>({});
  const [selected,setSelected]=useState<string|null>(null),[notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false),[moving,setMoving]=useState(false);
  const [ghost,setGhost]=useState<{token:PlayToken;x:number;y:number}|null>(null);
  const board=useRef<HTMLDivElement>(null),positions=useRef<Placements>({});
  const drag=useRef<{token:PlayToken;x:number;y:number;moved:boolean}|null>(null),ignoreClick=useRef(false);
  const soundRef=useRef(sound),solvedRef=useRef(solved),busyRef=useRef(false),movingRef=useRef(false);
  const pending=useRef<PendingMove|null>(null),flights=useRef<(()=>void)[]>([]),timer=useRef(0);
  const welcomeTimer=useRef(0);
  const sequence=useRef<{steps:Step[];done:()=>void}|null>(null),demonstrated=useRef(0);
  soundRef.current=sound;solvedRef.current=solved;
  const totals=Array.from({length:model.targets},(_,i)=>targetTotal(model,settled,i));
  const remaining=model.tokens.filter(t=>placements[t.id]===undefined);
  const placed=model.tokens.filter(t=>placements[t.id]!==undefined);
  const formatted=(n:number)=>problem.denominator?`${n}/${problem.denominator}`:model.scale===10?(n/10).toFixed(1):String(n);
  const finalNarration=()=>model.kind==='bridge'?bridgeLesson(problem,problem.answer).speech:answerNarration(problem);
  const instruction=model.kind==='bridge'?bridgeLesson(problem,0).setup:model.kind==='share'?`Share ${problem.a} berries between ${problem.b} plates. Give everyone the same amount.`:model.kind==='groups'?`Make ${problem.a} baskets with ${problem.b} berries in each.`:model.kind==='pieces'?`Bring ${problem.a} pieces and ${problem.b} pieces onto the treat. Each piece is 1/${problem.denominator}.`:`Tap the berries to bring ${problem.a} and ${problem.b} together. Watch, listen, and count with Milo.`;
  const describeToken=(token:PlayToken)=>model.kind==='bridge'?`${token.value} ${token.value===1?'plank':'planks'}`:problem.denominator?`1/${problem.denominator} piece`:model.scale===10?`${(token.value/10).toFixed(1)} of a whole`:`${token.value} ${token.value===1?'berry':'berries'}`;
  const tokenElement=(id:string)=>board.current?.querySelector(`[data-token-id="${id}"]`)||null;

  function stopActivity() {
    clearTimeout(welcomeTimer.current);clearTimeout(timer.current); sequence.current=null; pending.current=null;
    flights.current.forEach(cancel=>cancel());flights.current=[];
    busyRef.current=false;movingRef.current=false;stopSpeaking();
  }
  useEffect(()=>{welcomeTimer.current=window.setTimeout(()=>{if(soundRef.current)speak(model.kind==='bridge'?bridgeLesson(problem,0).speech:instruction);},650);return()=>stopActivity();},[]);
  useEffect(()=>{if(coaching)clearTimeout(welcomeTimer.current);},[coaching]);

  function commit(next:Placements,ids:string[],after:()=>void,point?:{x:number;y:number}) {
    clearTimeout(welcomeTimer.current);
    if(movingRef.current||solvedRef.current||!board.current)return;
    pending.current={next,after,props:ids.map(id=>({id,flight:captureProp(tokenElement(id),board.current!,point)}))};
    movingRef.current=true;setMoving(true);positions.current=next;setPlacements(next);setSelected(null);
  }
  useLayoutEffect(()=>{
    const movement=pending.current;if(!movement)return;
    pending.current=null;let waiting=movement.props.length;
    const land=()=>{if(--waiting>0)return;setSettled(movement.next);movingRef.current=false;setMoving(false);flights.current=[];movement.after();};
    if(!waiting){waiting=1;land();return;}
    movement.props.forEach(({id,flight})=>{if(flight)flights.current.push(flight(tokenElement(id),land));else land();});
  },[placements]);

  function announce(next:Placements,target=0,returned=false) {
    const n=targetTotal(model,next,target);
    if(soundRef.current){playSound(model.kind==='bridge'?'plank':'berry',Math.max(0,n-1));
      const count=model.targets>1?`${n} in this ${model.kind==='share'?'plate':'basket'}.`:problem.denominator?`${n} pieces.`:`${formatted(n)}.`;
      speak(returned?`${count} A little room for another idea.`:`${count}${completedPlay(model,next)?` ${finalNarration()}`:''}`);
    }
    setNotice(model.kind==='bridge'?bridgeLesson(problem,n).message:returned?'Back in the pile. Try another idea!':completedPlay(model,next)?'Both groups are together. Check your discovery!':model.kind==='gather'?`${formatted(n)} in the basket. Keep the berries coming!`:'A little more for this friend!');
  }
  function move(id:string,target:number,point?:{x:number;y:number}) {
    if(solvedRef.current||busyRef.current||movingRef.current||!model.tokens.some(t=>t.id===id))return;
    const next={...positions.current,[id]:target};commit(next,[id],()=>announce(next,target),point);
  }
  function takeBack(id:string) {
    if(solvedRef.current||busyRef.current||movingRef.current)return;
    const target=positions.current[id],next={...positions.current};delete next[id];
    commit(next,[id],()=>announce(next,target,true));
  }
  const drop=(target:number)=>{if(selected)move(selected,target);else setNotice(model.kind==='bridge'?'Tap a plank in the pile. It will fly into the next gap!':model.targets===1?'Tap a berry above. It will hop into the basket!':'Tap a berry first, then tap a plate or basket.');};
  const pick=(token:PlayToken)=>{
    if(ignoreClick.current){ignoreClick.current=false;return;}
    if(positions.current[token.id]!==undefined)takeBack(token.id);
    else if(model.targets===1)move(token.id,0);
    else {setSelected(token.id===selected?null:token.id);setNotice(`Now tap ${model.kind==='share'?'a plate':'a basket'} to place it.`);}
  };
  const pointerDown=(e:PointerEvent<HTMLButtonElement>,token:PlayToken)=>{if(e.button!==0||movingRef.current||busyRef.current)return;ignoreClick.current=false;drag.current={token,x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);};
  const pointerMove=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>6)d.moved=true;if(d.moved)setGhost({token:d.token,x:e.clientX,y:e.clientY});};
  const pointerUp=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;drag.current=null;setGhost(null);if(!d?.moved)return;ignoreClick.current=true;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-drop-target]');if(target&&board.current?.contains(target))move(d.token.id,Number(target.dataset.dropTarget),{x:e.clientX,y:e.clientY});else setNotice('Almost there! Drop it into the basket or bridge. You can also just tap it.');};

  function runNext() {
    const queue=sequence.current;if(!queue||solvedRef.current)return;
    const step=queue.steps.shift();
    if(!step){sequence.current=null;busyRef.current=false;setBusy(false);queue.done();return;}
    const next={...positions.current};step.forEach(([id,target])=>{next[id]=target;});
    commit(next,step.map(([id])=>id),()=>{
      const count=targetTotal(model,next,0);
      let narration=Promise.resolve();
      if(soundRef.current){playSound(model.kind==='bridge'?'plank':'berry',count-1);narration=speak(completedPlay(model,next)?`${formatted(count)}. ${finalNarration()}`:model.kind==='share'?`${count} in each group.`:model.kind==='groups'?`${Object.keys(next).reduce((sum,id)=>sum+(model.tokens.find(t=>t.id===id)?.value||0),0)} packed altogether.`:formatted(count));}
      setNotice(model.kind==='bridge'?`${count} planks added. Watch the gap turn into a path!`:model.kind==='gather'?`${formatted(count)} in the basket. See the groups come together!`:'One little step at a time.');
      const nextGroup=queue.steps[0]?.[0]?.[0]?.split('-')[0],thisGroup=step[0][0].split('-')[0];
      const pause=new Promise<void>(resolve=>setTimeout(resolve,!queue.steps.length?800:nextGroup!==thisGroup?950:matchMedia('(prefers-reduced-motion: reduce)').matches?500:230));
      void Promise.all([narration,pause]).then(()=>{if(sequence.current===queue&&!solvedRef.current)runNext();});
    });
  }
  function startSequence(steps:Step[],done:()=>void) {
    clearTimeout(welcomeTimer.current);
    if(busyRef.current||movingRef.current||solvedRef.current)return;
    busyRef.current=true;setBusy(true);setSelected(null);sequence.current={steps,done};runNext();
  }
  useEffect(()=>{
    if(!demonstrate||demonstrate===demonstrated.current||solved)return;
    demonstrated.current=demonstrate;stopActivity();setMoving(false);setBusy(false);setSettled({});setPlacements({});positions.current={};
    setNotice('Watch the pieces travel. We’ll count each one as it lands!');
    const solution=Object.entries(demonstrationPlacements(model)),steps:Step[]=[];
    if(model.kind==='share')for(let i=0;i<model.goal;i++)steps.push(solution.filter(([id])=>Number(id.split('-')[1])%model.goal===i));
    else for(let i=0;i<solution.length;i+=Math.max(1,Math.ceil(solution.length/24)))steps.push(solution.slice(i,i+Math.max(1,Math.ceil(solution.length/24))));
    timer.current=window.setTimeout(()=>startSequence(steps,()=>{setNotice(`We built it! ${problem.equation} = ${formatted(Math.round(problem.answer*model.scale))}. Now check your discovery.`);if(!solution.length&&soundRef.current)speak(finalNarration());}),100);
    // The model is fixed for this discovery; sound changes must not restart a demonstration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[demonstrate,model]);

  const tokenButton=(token:PlayToken)=><button key={token.id} data-token-id={token.id} type="button" className={`play-token token-group-${token.group} ${model.kind==='bridge'?'plank-token':''} ${selected===token.id?'token-selected':''} ${placements[token.id]!==undefined?'token-placed':''}`} disabled={solved||busy||moving} aria-label={`${placements[token.id]!==undefined?'Return':'Pick up'} ${describeToken(token)}`} aria-pressed={selected===token.id} onClick={()=>pick(token)} onPointerDown={e=>pointerDown(e,token)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setGhost(null);}}><Berry group={token.group} plank={model.kind==='bridge'}/>{(token.value>1||model.scale===10||problem.denominator)&&<span>{problem.denominator?`1/${problem.denominator}`:formatted(token.value)}</span>}</button>;
  const check=()=>{
    if(movingRef.current||busyRef.current)return;
    if(completedPlay(model,positions.current)){setNotice(model.kind==='bridge'?'You made a path for Pip. Here he comes!':'You brought the groups together. Picnic time!');onAnswer(problem.answer);if(soundRef.current&&problem.answer===0)speak(finalNarration());}
    else {setNotice(model.kind==='bridge'?`You added ${totals[0]} planks. Look for the gaps, or return a spare plank. We’ll get Pip across together.`:model.kind==='share'||model.kind==='groups'?'Let’s check each group. They need the same amount. Tap a berry to return it, then try sharing again.':'Some berries are still waiting. Bring them over and try again!');onAnswer(-1);}
  };
  const sceneProps={problem,model,placements,settled,total:totals[0],solved,moving,busy,selected,renderToken:tokenButton,drop:()=>drop(0)};
  return <div ref={board} className={`hands-on-board kind-${model.kind} ${solved?'play-built':''} ${moving?'prop-is-moving':''}`}>
    <div className="hands-on-heading"><span><Hand size={16}/>MAKE IT WITH YOUR HANDS</span><h2>{titles[model.kind]}</h2><p>{instruction}</p><button className="icon-button" aria-label="Hear the hands-on mission" disabled={!sound} onClick={()=>{clearTimeout(welcomeTimer.current);speak(model.kind==='bridge'?bridgeLesson(problem,totals[0],solved).speech:instruction);}}><Volume2 size={18}/></button></div>
    <div className="play-table">
      {model.kind==='gather'?<div className="play-bank gather-sources">{[0,1].map(group=><div className={`gather-group gather-group-${group}`} key={group}><div className="gather-group-heading"><span>{group===0?'First group':'Add this group'}</span><strong>{formatted(Math.round((group===0?problem.a:problem.b)*model.scale))}</strong></div><div className="play-bank-tokens">{model.tokens.filter(t=>t.group===group).map(t=>placements[t.id]===undefined?tokenButton(t):<span className="gathered-placeholder" key={t.id} aria-hidden="true"><Berry group={group}/></span>)}</div><button className="group-gather" disabled={solved||busy||moving||!remaining.some(t=>t.group===group)} onClick={()=>startSequence(remaining.filter(t=>t.group===group).map(t=>[[t.id,0]]),()=>setNotice('That whole group is in! What happens when we add the other group?'))}>{remaining.some(t=>t.group===group)?<><ArrowDown size={14}/>Gather this group</>:<><Check size={14}/>In the basket!</>}</button></div>)}<span className="gather-plus" aria-hidden="true"><Plus size={24}/></span></div>:<div className="play-bank"><div className="play-bank-label"><strong>{model.kind==='bridge'?'Tap a golden plank':model.kind==='pieces'?'Your pieces':'Ready to gather'}</strong>{model.kind==='bridge'?<button className="bridge-undo" aria-label="Return last plank" disabled={!placed.length||busy||moving||solved} onClick={()=>{const last=Object.keys(positions.current).at(-1);if(last)takeBack(last);}}><Undo2 size={16}/><span>Undo plank</span></button>:<span>{remaining.reduce((n,t)=>n+t.value,0)/model.scale} waiting</span>}</div><div className="play-bank-tokens">{model.kind==='bridge'?<>{remaining.slice(0,4).map(tokenButton)}{Array.from({length:Math.max(0,Math.min(4,model.tokens.length)-remaining.length)},(_,i)=><span key={`empty-${i}`} className="plank-placeholder" aria-hidden="true"><Berry plank/></span>)}</>:remaining.slice(0,36).map(tokenButton)}{remaining.length>36&&<span className="berry-refill">+{remaining.length-36} more<br/>in the basket</span>}{remaining.length===0&&model.kind!=='bridge'&&<span className="bank-empty"><Check size={22}/>All gathered!</span>}</div>{model.tokens.some(t=>t.value>1)&&<p className="packet-explanation">Labeled bundles hold that many {model.kind==='bridge'?'planks':'berries'}. Every little one counts.</p>}</div>}
      {model.kind==='gather'?<PicnicScene {...sceneProps}/>:model.kind==='bridge'?<BridgeScene {...sceneProps}/>:<div className="play-drop-area"><div className="play-targets" style={{gridTemplateColumns:`repeat(${Math.min(model.targets,model.targets>6?4:3)},minmax(0,1fr))`}}>{totals.map((total,i)=><div key={i} className={`play-target ${model.targets===1?'single-target':''} ${selected?'ready-for-drop':''}`} data-drop-target={i}><button className="target-touch" data-drop-target={i} disabled={solved||busy||moving} onClick={()=>drop(i)} aria-label={`Place selected item in ${model.kind==='pieces'?'treat':model.kind==='share'?'plate':'basket'} ${i+1}`}><span className="target-name">{model.kind==='pieces'?'Moonberry treat':`${model.kind==='share'?'Plate':'Basket'} ${i+1}`}</span><strong key={total}>{formatted(total)}</strong><span>{model.kind==='pieces'?'of the whole treat':'berries'}</span>{selected&&<Hand className="drop-hand" size={22}/>}</button><div className="target-tokens">{placed.filter(t=>placements[t.id]===i).slice(-16).map(tokenButton)}{placed.filter(t=>placements[t.id]===i).length>16&&<span className="target-overflow">+ {placed.filter(t=>placements[t.id]===i).length-16} tucked inside</span>}</div></div>)}</div>{model.kind==='pieces'&&<div className="whole-pieces" aria-label={`${totals[0]} of ${problem.denominator} pieces filled`}>{Array.from({length:problem.denominator!},(_,i)=><span className={i<totals[0]?'filled':''} key={i}/>)}</div>}</div>}
    </div>
    <div className="hands-on-status" role="status">{notice||(model.targets===1?'Tap a piece and watch it travel. You can drag it, too!':'Tap a berry, then its basket. Everyone gets a fair share!')}</div>
    <div className="hands-on-actions"><button className="button secondary" disabled={solved} onClick={()=>{stopActivity();setBusy(false);setMoving(false);setPlacements({});setSettled({});positions.current={};setSelected(null);setNotice('A fresh space for your next idea.');}}><RotateCcw size={16}/><span>Start again</span></button>{model.kind==='share'&&<button className="button secondary" disabled={solved||busy||moving||!remaining.length} onClick={()=>startSequence([remaining.slice(0,model.targets).map((t,i)=>[t.id,i])],()=>setNotice('One berry for each friend. Keep sharing until the basket is empty.'))}><Hand size={16}/>One each</button>}<button className="button primary" disabled={solved||busy||moving} onClick={check}>{busy?'Counting together…':solved?<><Check size={18}/>You built it!</>:<><Sparkles size={18}/>{model.kind==='bridge'?(totals[0]===model.goal?'Let Pip cross!':'Check my bridge'):model.kind==='gather'?'Check my picnic':'Check my discovery'}</>}</button></div>
    {ghost&&<div className={`drag-berry ${model.kind==='bridge'?'drag-plank':''}`} style={{left:ghost.x,top:ghost.y}}><Berry group={ghost.token.group} plank={model.kind==='bridge'}/>{ghost.token.value>1&&<span>{formatted(ghost.token.value)}</span>}</div>}
  </div>;
}
