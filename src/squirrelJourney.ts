/** A brisk trip, a moment to collect a nut, then five quiet seconds at home. */
export const SQUIRREL_RUN_SPEED = 140;
export const SQUIRREL_LOOP_PAUSE = 5;
export function squirrelJourney(time: number, distance: number, climbHeight: number) {
  const travel = Math.max(1, distance / SQUIRREL_RUN_SPEED);
  const pickup = 3.8 + travel, turnBack = pickup + 3, returnTrip = turnBack + .8;
  const tree = returnTrip + travel, climb = tree + .8, home = climb + 3.8;
  const t = time % (home + SQUIRREL_LOOP_PAUSE);
  let x=0,y=0,turn=1,rotation=0,visible=1,carrying=false,gait:'run'|'climb'|'still'='still',action='hidden';
  if(t<3) {const p=t/3;y=-climbHeight*(1-p);rotation=90;gait='climb';action='climbing down';visible=p<.08?0:1;}
  else if(t<3.8) {rotation=90*(1-(t-3)/.8);action='landing';}
  else if(t<pickup) {x=distance*(t-3.8)/travel;gait='run';action='going to nuts';}
  else if(t<turnBack) {x=distance;carrying=t>pickup+1.5;action='picking up';}
  else if(t<returnTrip) {x=distance;turn=t<turnBack+.4?1:-1;carrying=true;action='turning';}
  else if(t<tree) {x=distance*(1-(t-returnTrip)/travel);turn=-1;carrying=true;gait='run';action='returning';}
  else if(t<climb) {turn=-1;carrying=true;rotation=90*(t-tree)/.8;action='gripping tree';}
  else if(t<home) {const p=(t-climb)/3.8;y=-climbHeight*p;rotation=90;turn=-1;carrying=true;gait='climb';action='climbing home';visible=p>.9?0:1;}
  else {y=-climbHeight;rotation=90;turn=-1;visible=0;}
  return {x,y,turn,rotation,visible,carrying,gait,action};
}
