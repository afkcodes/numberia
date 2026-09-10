import * as THREE from 'three';

type Material = (color: number) => THREE.MeshStandardMaterial;
function sculpt(parent: THREE.Object3D, material: Material) {
  const mesh = (geometry: THREE.BufferGeometry, color: number, pos: [number,number,number], target = parent) => {
    const m = new THREE.Mesh(geometry, material(color)); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; target.add(m); return m;
  };
  const oval = (size: [number,number,number], color: number, pos: [number,number,number], target = parent) => {
    const m=mesh(new THREE.SphereGeometry(1,24,16),color,pos,target);m.scale.set(...size);return m;
  };
  const capsule = (radius: number, length: number, color: number, pos: [number,number,number], target = parent) => mesh(new THREE.CapsuleGeometry(radius,length,6,14),color,pos,target);
  const curve = (points: [number,number,number][], radius: number, color: number, target = parent) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,6,false),color,[0,0,0],target);
  return { mesh, oval, capsule, curve };
}

/** Articulated, smooth storybook children. Knees and elbows keep seated poses believable. */
export function createChild(material: Material, shirt: number, skin: number, hair: number, variant: number) {
  const group=new THREE.Group(); const {mesh,oval,capsule,curve}=sculpt(group,material);
  const cream=0xfff6e8, denim=0x557b8b, ink=0x333b37;
  const torso=capsule(.235,.25,shirt,[0,.81,0]);torso.scale.set(1,1,.82);
  oval([.23,.14,.19],denim,[0,.56,0]);
  capsule(.095,.1,skin,[0,1.075,0]);
  const collar=mesh(new THREE.TorusGeometry(.11,.025,8,24),cream,[0,1.02,.015]);collar.rotation.x=Math.PI/2;
  oval([.039,.039,.009],cream,[.1,.83,.202]);
  const head=new THREE.Group();head.position.set(0,1.3,.018);group.add(head);
  oval([.3,.315,.285],skin,[0,0,0],head);
  for(const sign of [-1,1]) { oval([.066,.085,.055],skin,[sign*.286,-.016,0],head);oval([.032,.05,.024],0xc58e77,[sign*.307,-.017,.04],head); }
  for(const sign of [-1,1]) {
    oval([.065,.071,.012],cream,[sign*.109,.037,.271],head);
    oval([.034,.043,.008],0x614c36,[sign*.109,.037,.283],head);
    oval([.022,.031,.006],ink,[sign*.108,.037,.292],head);
    oval([.009,.011,.004],0xffffff,[sign*.108-.009,.05,.299],head);
    curve([[sign*.17,.14,.248],[sign*.12,.156,.266],[sign*.066,.147,.262]],.012,hair,head);
    oval([.055,.029,.008],0xd99584,[sign*.175,-.065,.234],head);
  }
  oval([.043,.048,.047],skin,[0,-.035,.293],head);
  curve([[-.062,-.114,.251],[0,-.132,.267],[.065,-.11,.25]],.011,0x985d4e,head);
  const hairCap=mesh(new THREE.SphereGeometry(.314,24,16,0,Math.PI*2,0,Math.PI*.52),hair,[0,.07,-.035],head);hairCap.scale.z=1.02;
  if(variant%3===0) {
    for(let i=0;i<7;i++) {const a=i/6*Math.PI;oval([.084,.077,.078],hair,[Math.cos(a)*.25,.16+Math.sin(a)*.09,.17],head);}
    for(const sign of [-1,1]) oval([.11,.13,.11],hair,[sign*.25,.16,-.15],head);
  } else if(variant%3===1) {
    const fringe=oval([.21,.105,.105],hair,[-.07,.186,.205],head);fringe.rotation.z=-.3;
    oval([.09,.09,.085],hair,[.17,.15,.17],head);
  } else {
    oval([.16,.1,.12],hair,[.04,.2,.19],head);
    for(const sign of [-1,1]) {oval([.13,.14,.13],hair,[sign*.31,.07,-.15],head);oval([.053,.043,.053],shirt,[sign*.29,.09,-.11],head);}
  }
  const forearms: THREE.Group[]=[];
  const arms=[-1,1].map(sign=>{
    const limb=new THREE.Group();limb.position.set(sign*.25,.97,0);limb.rotation.z=sign*.09;group.add(limb);
    capsule(.076,.12,shirt,[0,-.09,0],limb);
    const elbow=new THREE.Group();elbow.position.y=-.2;limb.add(elbow);forearms.push(elbow);
    capsule(.055,.12,skin,[0,-.07,0],elbow);
    oval([.064,.078,.046],skin,[0,-.19,.005],elbow);
    oval([.028,.044,.027],skin,[-sign*.052,-.17,.016],elbow);
    return limb;
  });
  const knees: THREE.Group[]=[];
  const legs=[-1,1].map(sign=>{
    const limb=new THREE.Group();limb.position.set(sign*.126,.57,0);group.add(limb);
    capsule(.092,.13,denim,[0,-.106,0],limb);
    const knee=new THREE.Group();knee.position.y=-.23;limb.add(knee);knees.push(knee);
    capsule(.074,.145,denim,[0,-.097,0],knee);
    oval([.107,.045,.158],cream,[0,-.248,.045],knee);
    oval([.099,.075,.145],shirt,[0,-.205,.048],knee);
    for(let i=0;i<2;i++)curve([[-.051,-.151,.056+i*.04],[0,-.139,.058+i*.04],[.052,-.151,.056+i*.04]],.01,cream,knee);
    return limb;
  });
  const sit=(angle=-1.35) => {legs.forEach(l=>{l.rotation.x=angle;});knees.forEach(k=>{k.rotation.x=1.15;});};
  const walk=(time: number, speed=7) => {
    legs.forEach((l,i)=>{const phase=time*speed+i*Math.PI;l.rotation.x=Math.sin(phase)*.48;knees[i].rotation.x=Math.max(0,-Math.sin(phase))*.6;});
    arms.forEach((a,i)=>{a.rotation.x=-Math.sin(time*speed+i*Math.PI)*.35;forearms[i].rotation.x=-.25;});
  };
  const expression=(time:number) => { head.rotation.z=Math.sin(time*.6+variant)*.035; };
  return {group,head,arms,legs,knees,forearms,sit,walk,expression};
}

/** A soft grey tabby with a white bib, almond eyes, articulated paws, and a curved tail. */
export function createCat(material: Material) {
  const group=new THREE.Group();group.name='roaming-cat';
  const {mesh,oval,capsule,curve}=sculpt(group,material);
  const fur=0x929ba5, dark=0x63717e, white=0xfff5e7, pink=0xd99b9b, ink=0x293638;
  const pattern=0x939ca6;
  const body=oval([.235,.245,.48],pattern,[0,.47,0]);
  oval([.21,.25,.25],fur,[0,.5,.27]);oval([.17,.22,.06],white,[0,.45,.468]);
  const head=new THREE.Group();head.position.set(0,.75,.41);group.add(head);
  oval([.264,.228,.229],fur,[0,0,0],head);
  const earShape=new THREE.Shape();earShape.moveTo(-.105,0);earShape.quadraticCurveTo(-.07,.19,0,.23);earShape.quadraticCurveTo(.07,.19,.105,0);earShape.closePath();
  for(const sign of [-1,1]) {
    const ear=mesh(new THREE.ExtrudeGeometry(earShape,{depth:.038,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018}),fur,[sign*.16,.144,-.035],head);ear.rotation.z=-sign*.18;
    const inside=mesh(new THREE.ShapeGeometry(earShape),pink,[sign*.161,.162,.025],head);inside.scale.set(.61,.65,1);inside.rotation.z=-sign*.18;
    oval([.07,.055,.009],white,[sign*.108,.021,.211],head);
    oval([.04,.044,.008],0x84aa6c,[sign*.108,.022,.222],head);
    oval([.014,.036,.006],ink,[sign*.108,.022,.232],head);
    oval([.009,.009,.005],0xffffff,[sign*.108-.009,.041,.24],head);
    oval([.089,.063,.067],white,[sign*.066,-.076,.2],head);
    for(const y of [-.074,-.102])curve([[sign*.08,y,.244],[sign*.2,y-.005,.254],[sign*.32,y+.016,.246]],.0045,white,head);
    curve([[sign*.17,.088,.18],[sign*.12,.099,.207],[sign*.065,.09,.215]],.012,dark,head);
  }
  oval([.032,.021,.02],pink,[0,-.064,.269],head);oval([.073,.037,.045],white,[0,-.136,.173],head);
  curve([[0,-.084,.264],[0,-.109,.256],[-.028,-.117,.246]],.006,ink,head);
  curve([[0,-.109,.256],[.028,-.117,.246]],.006,ink,head);
  for(const x of [-.068,0,.068])curve([[x,.192,.098],[x*.8,.156,.167],[x*.5,.124,.19]],.006,dark,head);
  const furCanvas=document.createElement('canvas');furCanvas.width=512;furCanvas.height=256;
  const brush=furCanvas.getContext('2d');
  if(brush) {
    brush.fillStyle='#ffffff';brush.fillRect(0,0,512,256);brush.strokeStyle='#b1b8bd';brush.lineCap='round';brush.lineWidth=13;
    for(let i=0;i<11;i++){const x=12+i*49;brush.beginPath();brush.moveTo(x,23);brush.bezierCurveTo(x-22,67,x+21,101,x-6,159);brush.stroke();}
    const texture=new THREE.CanvasTexture(furCanvas);texture.colorSpace=THREE.SRGBColorSpace;material(pattern).map=texture;material(pattern).needsUpdate=true;
  }
  const tail=new THREE.Group();tail.position.set(0,.44,-.42);group.add(tail);
  const tailPath=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.18,-.22),new THREE.Vector3(.04,.57,-.36),new THREE.Vector3(.19,.71,-.27),new THREE.Vector3(.23,.58,-.18)]);
  mesh(new THREE.TubeGeometry(tailPath,28,.063,12,false),pattern,[0,0,0],tail);
  const tailTip=tailPath.getPoint(1);oval([.063,.063,.063],fur,[tailTip.x,tailTip.y,tailTip.z],tail);
  const paws=[[-.15,.28],[.15,.28],[-.155,-.27],[.155,-.27]].map(([x,z],i)=>{
    const limb=new THREE.Group();limb.position.set(x,.47,z);group.add(limb);
    oval([.086,.17,.105],fur,[0,-.09,0],limb);
    capsule(.052,.13,fur,[0,-.272,.005],limb);
    oval([.078,.055,.109],white,[0,-.402,.04],limb);
    for(const dx of [-.025,.025])curve([[dx,-.39,.133],[dx,-.419,.14]],.004,0xc9c0b4,limb);
    limb.userData.phase=i===0||i===3?0:Math.PI;return limb;
  });
  const update=(time:number,moving:boolean) => {
    body.position.y=.47+(moving?Math.sin(time*7)*.012:Math.sin(time*2)*.006);
    paws.forEach(p=>{p.rotation.x=moving?Math.sin(time*7+p.userData.phase)*.31:0;});
    tail.rotation.z=Math.sin(time*1.8)*.14;head.rotation.y=moving?Math.sin(time*.7)*.06:Math.sin(time*.9)*.28;
    head.rotation.x=moving?0:Math.sin(time*1.2)*.08;
  };
  return {group,update};
}
