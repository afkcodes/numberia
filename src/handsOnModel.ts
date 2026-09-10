import type { Problem } from './game';
export type PlayToken = { id: string; value: number; group: number; extra?: boolean };
export type PlayModel = { kind: 'gather' | 'bridge' | 'groups' | 'share' | 'pieces'; tokens: PlayToken[]; targets: number; scale: number; goal: number };
export type Placements = Record<string, number>;
function packets(amount: number, group: number, unit = false): PlayToken[] {
  let remaining = amount;
  const values: number[] = [];
  for (const size of unit ? [1] : [1000,100,10,1]) while(remaining >= size) { values.push(size); remaining -= size; }
  return values.map((value,i)=>({id:`${group}-${i}`,value,group}));
}
export function playModel(p: Problem): PlayModel {
  const scale=p.skill==='decimals'?10:1;
  if(p.skill==='division') return {kind:'share',tokens:packets(p.a,0,true),targets:p.b,scale,goal:p.answer};
  if(p.skill==='multiplication') return {kind:'groups',tokens:p.a*p.b>30?Array.from({length:p.a},(_,i)=>({id:`0-${i}`,value:p.b,group:0})):packets(p.a*p.b,0,true),targets:p.a,scale,goal:p.b};
  if(p.skill==='subtraction') return {kind:'bridge',tokens:[...packets(p.answer,0,p.a<=20),...Array.from({length:3},(_,i)=>({id:`extra-${i}`,value:1,group:0,extra:true}))],targets:1,scale,goal:p.answer};
  return {kind:p.denominator?'pieces':'gather',tokens:[...packets(Math.round(p.a*scale),0,!!p.denominator||(p.skill!=='decimals'&&p.answer<=20)),...packets(Math.round(p.b*scale),1,!!p.denominator||(p.skill!=='decimals'&&p.answer<=20))],targets:1,scale,goal:Math.round(p.answer*scale)};
}
export const targetTotal = (model:PlayModel, placements:Placements, target:number) => model.tokens.reduce((n,t)=>n+(placements[t.id]===target?t.value:0),0);
export function completedPlay(model:PlayModel, placements:Placements) {
  if(Object.entries(placements).some(([id,target])=>!model.tokens.some(t=>t.id===id)||!Number.isInteger(target)||target<0||target>=model.targets))return false;
  if(model.kind==='bridge')return targetTotal(model,placements,0)===model.goal;
  return model.tokens.every(t=>placements[t.id]!==undefined) && Array.from({length:model.targets},(_,i)=>targetTotal(model,placements,i)).every(n=>n===model.goal);
}
export function demonstrationPlacements(model:PlayModel): Placements {
  const result:Placements={};
  let target=0,total=0;
  for(const token of model.tokens) {
    if(token.extra)continue;
    result[token.id]=target;
    total+=token.value;
    if(model.targets>1&&total===model.goal){target++;total=0;}
  }
  return result;
}


export type BridgePiece = { id: string; value: number; kind: 'existing' | 'added' | 'gap' | 'surplus'; token?: PlayToken; first?: boolean };
/** The bridge itself is the quantity model: existing boards + added boards + gaps. */
export function bridgePieces(p: Problem, model: PlayModel, placements: Placements): BridgePiece[] {
  const unit=p.a<=20;
  const existing: BridgePiece[]=packets(p.b,2,unit).map(t=>({id:`built-${t.id}`,value:t.value,kind:'existing'}));
  let added=0;
  const placed: BridgePiece[]=Object.keys(placements).flatMap(id=>{
    const token=model.tokens.find(t=>t.id===id);
    if(!token||placements[id]!==0)return [];
    added+=token.value;
    return [{id:token.id,value:token.value,kind:added<=model.goal?'added':'surplus',token}];
  });
  const gaps:BridgePiece[]=packets(Math.max(0,model.goal-added),3,unit).map((t,i)=>({id:`gap-${t.id}`,value:t.value,kind:'gap',first:i===0}));
  return [...existing,...placed,...gaps];
}
