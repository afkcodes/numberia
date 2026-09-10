type SlidePose = 'slide' | 'stand' | 'walk' | 'climb' | 'sit';
export function slideJourney(elapsed: number): { x: number; y: number; z: number; facing: number; pose: SlidePose; progress: number } {
  const t = elapsed % 16.2;
  if (t < 2.8) { const p=t/2.8; return { x:0,y:1.43-1.79*p,z:.57+2.83*p,facing:0,pose:'slide',progress:p }; }
  if (t < 3.6) { const p=(t-2.8)/.8; return { x:0,y:-.36+.33*p,z:3.4+.32*p,facing:0,pose:'stand',progress:p }; }
  if (t < 10.8) {
    const points = [[0,3.72],[1.8,4.15],[2.15,3.6],[2.15,-2.3],[0,-2.3],[0,-1.82]];
    const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    let distance=(t-3.6)/7.2*lengths.reduce((a,b)=>a+b,0);
    for(let i=0;i<lengths.length;i++) {
      if(distance<=lengths[i] || i===lengths.length-1) { const p=Math.min(1,distance/lengths[i]),a=points[i],b=points[i+1];return {x:a[0]+(b[0]-a[0])*p,y:-.03,z:a[1]+(b[1]-a[1])*p,facing:Math.atan2(b[0]-a[0],b[1]-a[1]),pose:'walk',progress:p}; }
      distance-=lengths[i];
    }
  }
  if(t<14) { const p=(t-10.8)/3.2;return {x:0,y:-.03+2.01*p,z:-1.82+.95*p,facing:0,pose:'climb',progress:p}; }
  if(t<15.1) { const p=(t-14)/1.1;return {x:0,y:1.98,z:-.87+1.37*p,facing:0,pose:'walk',progress:p}; }
  const p=(t-15.1)/1.1;return {x:0,y:1.98-.55*p,z:.5+.07*p,facing:0,pose:'sit',progress:p};
}
