import * as THREE from 'three';
import { createCat, createChild } from './ParkCharacters';
import { slideJourney } from './slideJourney';

const colors = {
  grass: 0x95bc7e, lawn: 0xa5c986, path: 0xe8d9aa, water: 0x65bfc0, ripple: 0xbae8dd,
  wood: 0x9a704c, woodLight: 0xc39a65, cream: 0xffefcf, ink: 0x35413c,
  green: 0x487d57, sage: 0x74a264, teal: 0x5ba6a0, coral: 0xdc907a,
  yellow: 0xf0ce68, lilac: 0xa094c7, pink: 0xe4adc0, white: 0xfff9ea,
};

/** A continuous park: all models share the scene's cached materials and disposal. */
export function createPark(scene: THREE.Scene, material: (color: number) => THREE.MeshStandardMaterial) {
  const mesh = (geometry: THREE.BufferGeometry, color: number, position: [number, number, number], parent: THREE.Object3D = scene) => {
    const m = new THREE.Mesh(geometry, material(color)); m.position.set(...position); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const ball = (radius: number, color: number, position: [number, number, number], parent: THREE.Object3D = scene) => mesh(new THREE.SphereGeometry(radius, 20, 14), color, position, parent);
  const box = (size: [number, number, number], color: number, position: [number, number, number], parent: THREE.Object3D = scene) => mesh(new THREE.BoxGeometry(...size), color, position, parent);
  const bar = (a: [number, number, number], b: [number, number, number], radius: number, color: number, parent: THREE.Object3D = scene) => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), direction = to.clone().sub(from);
    const m = mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 7), color, [0, 0, 0], parent);
    m.position.copy(from.add(to).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); return m;
  };
  const groupAt = (x: number, z: number, rotation = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotation; scene.add(g); return g; };
  const ground = mesh(new THREE.PlaneGeometry(120, 120), colors.grass, [0, -.12, 0]); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const clearing = mesh(new THREE.CircleGeometry(5.15, 64), colors.path, [-.7, -.105, 0]); clearing.rotation.x = -Math.PI / 2; clearing.scale.set(1.08, .96, 1); clearing.castShadow = false;
  const pathLoop = mesh(new THREE.RingGeometry(7.2, 8.1, 72), colors.path, [-.5, -.10, .5]); pathLoop.rotation.x = -Math.PI / 2; pathLoop.scale.x = 1.18; pathLoop.castShadow = false;
  const path = box([2, .025, 50], colors.path, [-9, -.08, 0]); path.rotation.y = -.12; path.castShadow = false;
  const crossPath = box([45, .025, 1.6], colors.path, [0, -.07, 6.9]); crossPath.rotation.y = -.08; crossPath.castShadow = false;
  const riverCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(8, 0, -40), new THREE.Vector3(6.7, 0, -15), new THREE.Vector3(5, 0, -5), new THREE.Vector3(5.8, 0, 6), new THREE.Vector3(9, 0, 17), new THREE.Vector3(7, 0, 40)]);
  const points = riverCurve.getPoints(100); const shape = new THREE.Shape();
  points.forEach((p, i) => i ? shape.lineTo(p.x - 1.23, -p.z) : shape.moveTo(p.x - 1.23, -p.z));
  [...points].reverse().forEach(p => shape.lineTo(p.x + 1.23, -p.z)); shape.closePath();
  const river = mesh(new THREE.ShapeGeometry(shape), colors.water, [0, -.025, 0]); river.rotation.x = -Math.PI / 2; river.castShadow = false;
  const ripples = Array.from({ length: 24 }, (_, i) => box([.25 + i % 3 * .18, .014, .035], colors.ripple, [5, .006, 0]));
  const bridge = groupAt(5.8, 6.2, -.05);
  for (let i = 0; i < 11; i++) box([.3, .16, 1.9], i % 2 ? colors.woodLight : colors.wood, [-1.7 + i * .34, .16 + Math.sin(i / 10 * Math.PI) * .17, 0], bridge);
  for (const z of [-.92, .92]) { for (const x of [-1.7, 0, 1.7]) bar([x, .15, z], [x, 1, z], .065, colors.cream, bridge); bar([-1.7, .83, z], [1.7, .83, z], .055, colors.cream, bridge); }

  // Back fence and trees continue past the camera, so the lawn never feels like an island.
  for (let i = 0; i < 26; i++) {
    const x = -20 + i * 1.65;
    box([.15, 1, .16], colors.cream, [x, .4, -12]);
    if (i < 25) { box([1.65, .12, .1], colors.cream, [x + .825, .67, -12]); box([1.65, .1, .1], colors.cream, [x + .825, .2, -12]); }
  }
  const tree = (x: number, z: number, scale: number, color: number) => {
    const g = groupAt(x, z); g.scale.setScalar(scale);
    bar([0, 0, 0], [0, 2, 0], .18, colors.wood, g);
    const crown = ball(1.15, color, [0, 2.4, 0], g); crown.scale.y = 1.2;
    ball(.8, colors.sage, [-.6, 1.9, .12], g); ball(.72, color, [.6, 2.05, .08], g);
    if (x < -10) for (let j = 0; j < 3; j++) ball(.13, colors.coral, [Math.sin(j * 2.4) * .75, 2.1 + j * .25, .7], g);
  };
  [[-13,-8,1.2],[-9,-10,1],[-5,-11,1.25],[-.5,-11,1.1],[3,-12,1.3],[10,-10,1.2],[13,-5,1.3],[-14,-2,1.1],[-13,5,.95],[12,5,1.05],[-8,11,.9],[1,12,.9],[11,12,1.15],[-18,10,1.4],[19,-8,1.4],[17,10,1.4]].forEach(([x,z,s],i) => tree(x,z,s,i % 2 ? colors.sage : colors.green));
  for (let i = 0; i < 74; i++) {
    const angle = i * 2.399, radius = 8.9 + i % 6 * 1.1; const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
    if ((x > 3.4 && x < 9.7) || Math.abs(z - 6.9) < 1 || Math.abs(x + 9) < 1.1) continue;
    const color = [colors.yellow, colors.pink, colors.white, colors.lilac][i % 4];
    bar([x, 0, z], [x, .3, z], .023, colors.green);
    const flower = ball(.13, color, [x, .34, z]); flower.scale.y = .5; ball(.052, colors.yellow, [x, .39, z]);
    if (i % 4 === 0) { const bush = ball(.4, colors.sage, [x + .3, .17, z + .3]); bush.scale.y = .65; }
  }
  let childIndex = 0;
  const children: ReturnType<typeof createChild>[] = [];
  const child = (shirt: number, skin: number, hair: number, parent: THREE.Object3D) => {
    const friend = createChild(material, shirt, skin, hair, childIndex++); parent.add(friend.group); children.push(friend); return friend;
  };
  // A real pendulum carries the child and seat together.
  const swing = groupAt(-7.7,-4.4,.1);
  for (const x of [-1.45,1.45]) { bar([x,0,-.85],[x,2.9,0],.095,colors.teal,swing); bar([x,0,.85],[x,2.9,0],.095,colors.teal,swing); }
  bar([-1.6,2.9,0],[1.6,2.9,0],.13,colors.coral,swing);
  const swingPivot = new THREE.Group(); swingPivot.position.y=2.75; swing.add(swingPivot);
  for (const x of [-.4,.4]) bar([x,0,0],[x,-2.05,0],.026,colors.cream,swingPivot);
  box([1,.12,.55],colors.yellow,[0,-2.05,0],swingPivot);
  const swinger = child(colors.lilac,0xb77d59,0x443a35,swingPivot); swinger.group.position.y=-2.54;
  swinger.sit(); swinger.forearms.forEach(a => { a.rotation.x=-.4; }); swinger.arms[0].rotation.z=-2.45; swinger.arms[1].rotation.z=2.45;
  // A seesaw with two friends and a soft sandy play surface.
  const seesaw = groupAt(-5.4,5.2,-.28);
  const sand = mesh(new THREE.CircleGeometry(2,36),colors.path,[0,-.04,0],seesaw); sand.rotation.x=-Math.PI/2;
  mesh(new THREE.ConeGeometry(.4,.75,4),colors.teal,[0,.3,0],seesaw);
  const seesawBeam = new THREE.Group(); seesawBeam.position.y=.7; seesaw.add(seesawBeam);
  box([3.5,.14,.48],colors.coral,[0,0,0],seesawBeam);
  for (const x of [-1.4,1.4]) { box([.6,.08,.7],colors.yellow,[x,.12,0],seesawBeam); bar([x*.8,.1,0],[x*.8,.5,0],.045,colors.cream,seesawBeam); bar([x*.8,.5,-.23],[x*.8,.5,.23],.045,colors.cream,seesawBeam); }
  const seeA=child(colors.teal,0xeac19a,0x8c5939,seesawBeam); seeA.group.position.set(-1.4,-.45,0); seeA.group.rotation.y=Math.PI/2;
  const seeB=child(colors.pink,0x9a6347,0x3c3430,seesawBeam); seeB.group.position.set(1.4,-.45,0); seeB.group.rotation.y=-Math.PI/2;
  [seeA,seeB].forEach(c => { c.sit(); c.arms.forEach(a => { a.rotation.x=-.9; }); c.forearms.forEach(a => { a.rotation.x=-.45; }); });
  // A cheerful slide across the stream, with a child who slides, walks and climbs again.
  const slide = groupAt(8,-.4,-.15);
  for (const x of [-.6,.6]) for (const z of [-.5,.5]) bar([x,0,z],[x,2,z],.085,colors.teal,slide);
  box([1.4,.15,1.3],colors.cream,[0,1.95,0],slide);
  const chute = box([1.1,.12,3.35],colors.yellow,[0,1.03,1.99],slide); chute.rotation.x=.54;
  for (const x of [-.59,.59]) { const edge=box([.13,.27,3.4],colors.coral,[x,1.14,1.99],slide); edge.rotation.x=.54; bar([x,2,-.5],[x,2.65,-.5],.045,colors.teal,slide); bar([x,2,.5],[x,2.65,.5],.045,colors.teal,slide); bar([x,2.65,-.5],[x,2.65,.5],.045,colors.teal,slide); }
  for (let i=0;i<7;i++) box([.85,.07,.13],colors.cream,[0,.25+i*.26,-1.55+i*.16],slide);
  for (const x of [-.48,.48]) bar([x,0,-1.8],[x,2.1,-.55],.05,colors.teal,slide);
  const slider=child(colors.coral,0xd99e76,0x543f32,slide);
  // Picnic table, bunting, and a reader resting with an open book.
  const picnic=groupAt(-2.2,-7.4,.12);
  box([2.5,.15,1.15],colors.woodLight,[0,.94,0],picnic);
  for (const z of [-.9,.9]) { box([2.7,.12,.42],colors.cream,[0,.5,z],picnic); for (const x of [-.8,.8]) bar([x,0,z],[x,.5,z],.08,colors.wood,picnic); }
  for (const x of [-.8,.8]) bar([x,0,-.4],[x,.9,.4],.08,colors.wood,picnic);
  const reader=child(colors.yellow,0x9f6c4b,0x34332d,picnic); reader.group.position.set(.25,.03,.8); reader.group.rotation.y=Math.PI;
  reader.arms.forEach(a=>{a.rotation.x=-.8;});reader.forearms.forEach(a=>{a.rotation.x=-.8;});reader.sit();
  const book=box([.7,.06,.45],colors.lilac,[.25,1.06,.35],picnic); book.rotation.x=-.12;
  box([.02,.02,.43],colors.cream,[.25,1.1,.35],picnic); ball(.14,colors.coral,[-.65,1.13,-.1],picnic);
  for (const x of [-4.8,1.4]) bar([x,0,-8.5],[x,3,-8.5],.055,colors.wood);
  for (let i=0;i<12;i++) { const x=-4.65+i*.52,y=2.95-Math.sin(i/11*Math.PI)*.4; if(i<11)bar([x,y,-8.5],[x+.52,2.95-Math.sin((i+1)/11*Math.PI)*.4,-8.5],.018,colors.cream); const flag=mesh(new THREE.ConeGeometry(.17,.37,3),[colors.coral,colors.yellow,colors.teal,colors.lilac][i%4],[x,y-.16,-8.5]);flag.rotation.z=Math.PI;flag.scale.z=.15; }
  // Two children chase a striped ball beside the clearing.
  const game=groupAt(-10.6,1.4);
  const runnerA=child(colors.yellow,0xbf865c,0x574333,game), runnerB=child(colors.teal,0xe5b18d,0x544438,game);
  const football=ball(.27,colors.cream,[0,.26,0],game);
  const stripe=mesh(new THREE.TorusGeometry(.265,.038,5,14),colors.coral,[0,0,0],football);stripe.rotation.x=.7;
  const kitten = createCat(material); const cat = kitten.group; scene.add(cat);
  // Butterfly pairs flap as they weave around the flower beds.
  const butterflies=Array.from({length:5},(_,i)=>{const g=groupAt(-4+i*3,6+i%2);const wings=[-1,1].map(sign=>{const wing=ball(.16,i%2?colors.lilac:colors.yellow,[sign*.13,0,0],g);wing.scale.set(1,.16,1.5);return wing;});bar([0,0,-.13],[0,0,.13],.02,colors.ink,g);return {group:g,wings};});

  const update = (time: number, animate = true) => {
    const t=animate?time:1;
    swingPivot.rotation.x=Math.sin(t*1.7)*.48;
    seesawBeam.rotation.z=Math.sin(t*1.3)*.22;
    const trip=slideJourney(t);
    slider.group.position.set(trip.x,trip.y,trip.z);slider.group.rotation.y=trip.facing;
    slider.arms.forEach((arm,i)=>{arm.rotation.z=i?.09:-.09;});
    if(trip.pose==='walk') slider.walk(t,6);
    else if(trip.pose==='climb') {
      slider.legs.forEach((leg,i)=>{const phase=t*4.3+i*Math.PI;leg.rotation.x=-.15-Math.max(0,Math.sin(phase))*.24;slider.knees[i].rotation.x=Math.max(0,Math.sin(phase))*.58;});
      slider.arms.forEach((arm,i)=>{const reach=Math.sin(t*4.3+i*Math.PI);arm.rotation.x=-1.65+reach*.22;arm.rotation.z=i?.19:-.19;slider.forearms[i].rotation.x=-.45-reach*.15;});
    } else {
      const seated=trip.pose==='stand'?1-trip.progress:trip.pose==='sit'?trip.progress:1;
      slider.sit(-1.4*seated);slider.knees.forEach(k=>{k.rotation.x=.3*seated;});
      slider.arms.forEach(arm=>{arm.rotation.x=-.85*seated;});slider.forearms.forEach(arm=>{arm.rotation.x=-.35;});
    }
    [runnerA,runnerB].forEach((c,i)=>{const a=t*.65+i*Math.PI;c.group.position.set(Math.sin(a)*1.3,Math.abs(Math.sin(t*7))* .045,Math.cos(a)*.9);c.group.rotation.y=Math.atan2(Math.cos(a)*1.3,-Math.sin(a)*.9);c.walk(t);});
    football.position.set(Math.sin(t*.9)*.7,.29+Math.abs(Math.sin(t*2))*.17,Math.cos(t*.9)*.5);football.rotation.x=t;
    const catCycle=t%24; const catTravel=Math.floor(t/24)*19+Math.min(catCycle,19);const catPhase=catTravel*.23;
    cat.position.set(-1.2+Math.sin(catPhase)*2.4,0,4.1+Math.cos(catPhase)*1.05);cat.rotation.y=Math.atan2(Math.cos(catPhase)*2.4,-Math.sin(catPhase)*1.05);kitten.update(t,catCycle<19);
    children.forEach(c=>c.expression(t));
    ripples.forEach((r,i)=>{const p=riverCurve.getPoint(((i/24+t*.009)%1));r.position.set(p.x+Math.sin(i*2.4)*.68,.006,p.z);});
    butterflies.forEach((b,i)=>{b.group.position.set(-6+i*3.7+Math.sin(t*.5+i)*.7,1.1+Math.sin(t*1.3+i)*.2,6+Math.cos(t*.7+i)*.9);b.group.rotation.y=t*.3+i;b.wings.forEach((w,j)=>{w.rotation.z=Math.sin(t*13)*.65*(j?1:-1);});});
  };
  update(1,false);
  return { ground, update };
}
