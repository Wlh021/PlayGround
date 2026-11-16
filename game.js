import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const shell = document.querySelector('#game-shell');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9b5b2');
scene.fog = new THREE.FogExp2('#9ca9a8', 0.012);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 5, 15.5);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
scene.add(new THREE.HemisphereLight(0xd8e5e5, 0x343b3c, 2.0));
const sun = new THREE.DirectionalLight(0xffd5a5, 3.2); sun.position.set(-7, 12, 12); scene.add(sun);
const rim = new THREE.DirectionalLight(0x9bb8c0, 2.3); rim.position.set(8, 8, -9); scene.add(rim);
const fill = new THREE.PointLight(0xf1b878, 2.5, 22); fill.position.set(-5, 9, 6); scene.add(fill);

const rand = (a,b)=>a+Math.random()*(b-a);
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
const rockMats = ['#495052','#58605d','#626562','#3d4548','#74736b','#555b58'].map(color=>new THREE.MeshStandardMaterial({color, roughness:1, flatShading:true}));
const vertexColors = [];
// A broad, sculpted cliff face assembled from large irregular facets.
const rows=22, cols=16, height=28, cliffBottom=-7, cliffHeight=34;
const verts=[], indices=[], colors=[];
for(let r=0;r<=rows;r++){
  const t=r/rows, y=cliffBottom+t*cliffHeight;
  const shapeT=clamp((y+1)/height,0,1);
  const taper=1.0-0.42*shapeT;
  for(let c=0;c<=cols;c++){
    const u=c/cols*2-1;
    const x=u*7.3*taper + Math.sin(t*7+u*3)*0.12;
    const z=-0.55 - Math.pow(Math.abs(u),1.7)*1.3 + Math.sin(y*1.7+u*3)*0.24 + Math.cos(c*2.5-r*.5)*.11;
    verts.push(x,y,z);
  }
}
for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
  const a=r*(cols+1)+c,b=a+1,d=(r+1)*(cols+1)+c,e=d+1;
  if(Math.random()>.5) indices.push(a,d,b,b,d,e); else indices.push(a,d,e,a,e,b);
  for(let n=0;n<6;n++){
    const shade=rand(.72,1.22); colors.push(shade,shade*.99,shade*.94);
  }
}
const cliffGeo=new THREE.BufferGeometry(); cliffGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3)); cliffGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); cliffGeo.setIndex(indices); cliffGeo.computeVertexNormals();
const cliffMat=new THREE.MeshStandardMaterial({color:'#827a70',vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});
const cliff=new THREE.Mesh(cliffGeo,cliffMat); scene.add(cliff);
// Dark mountain shoulders and broken shelves give the wall a readable silhouette.
function rockShard(x,y,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rand(-.3,.3),rand(0,6),rand(-.25,.25));scene.add(m);return m;}
for(let side of [-1,1]) for(let i=0;i<19;i++){
  const y=rand(-1,28), edge=(7.1-.39*(y/28))*side;
  rockShard(edge+side*rand(.5,2.4),y,rand(-3.1,-.8),rand(.5,1.8),rand(.8,2.7),rand(.6,1.6),['#515855','#6b6c66','#454d4e'][i%3]);
}
// Distant alpine silhouettes.
const farMat=new THREE.MeshStandardMaterial({color:'#7a9090',roughness:1,flatShading:true});
for(let i=0;i<11;i++){
  const h=rand(7,15), w=rand(3,8), x=(i-5)*5.8;
  const peak=new THREE.Mesh(new THREE.ConeGeometry(w,h,5),farMat); peak.position.set(x,h*.36,-17-rand(0,8)); peak.rotation.y=rand(0,1); scene.add(peak);
  const snow=new THREE.Mesh(new THREE.ConeGeometry(w*.22,h*.3,5),new THREE.MeshStandardMaterial({color:'#d2d2c7',roughness:1,flatShading:true})); snow.position.set(x,h*.85,peak.position.z+.1); scene.add(snow);
}
// A hazy dawn disc and sparse cirrus strokes.
const sunDisc=new THREE.Mesh(new THREE.CircleGeometry(2.4,48),new THREE.MeshBasicMaterial({color:'#f4c38d',transparent:true,opacity:.6,depthWrite:false})); sunDisc.position.set(-12,18,-25); scene.add(sunDisc);
const cloudMat=new THREE.MeshBasicMaterial({color:'#f0d7bc',transparent:true,opacity:.14,depthWrite:false});
for(let i=0;i<15;i++){const cloud=new THREE.Mesh(new THREE.PlaneGeometry(rand(2,7),.12),cloudMat);cloud.position.set(rand(-18,18),rand(8,26),-13-rand(0,7));cloud.rotation.z=rand(-.2,.2);scene.add(cloud);}

// Route holds: warm mineral flecks make the playable face legible.
const holds=[];
for(let i=0;i<145;i++){
  const y=rand(.2,26), taper=1-.42*y/28, x=rand(-6.3,6.3)*taper;
  const rockZ=-.55-Math.pow(Math.abs(x)/(7.3*taper),1.7)*1.3 + Math.sin(y*2+x)*.24 + .12;
  const geo=new THREE.IcosahedronGeometry(rand(.045,.105),0);
  const mat=new THREE.MeshStandardMaterial({color:Math.random()>.72?'#d9b17c':'#a3a194',roughness:.8,emissive:Math.random()>.75?'#694522':'#000000',emissiveIntensity:.35,flatShading:true});
  const hold=new THREE.Mesh(geo,mat); hold.position.set(x,y,rockZ); hold.scale.set(1.35,.72,.56); scene.add(hold); holds.push(hold);
}
// Ledge shelves / checkpoint rest spots.
const ledges=[];
for(let i=1;i<=3;i++){
  const y=i*6.8, x=(i%2? -1:1)*rand(1.4,2.7);
  const shelf=new THREE.Mesh(new THREE.BoxGeometry(3.2,.28,1.7),new THREE.MeshStandardMaterial({color:'#827d70',roughness:1,flatShading:true}));
  shelf.position.set(x,y,-1.03); shelf.rotation.z=rand(-.08,.08); scene.add(shelf);
  const marker=new THREE.Mesh(new THREE.TorusGeometry(.23,.035,6,16),new THREE.MeshBasicMaterial({color:'#e4b46c'})); marker.position.set(x,y+.38,.12); scene.add(marker); ledges.push({x,y,mesh:shelf,done:false});
}

// Climber made from simple gear-colored forms, animated while moving.
const climber=new THREE.Group(); scene.add(climber);
const suit=new THREE.MeshStandardMaterial({color:'#c26d45',roughness:.83});
const darkSuit=new THREE.MeshStandardMaterial({color:'#25313a',roughness:.85});
const skin=new THREE.MeshStandardMaterial({color:'#c99573',roughness:.8});
const gear=new THREE.MeshStandardMaterial({color:'#ddb77d',roughness:.65,metalness:.12});
function capsule(group, a,b,r,material){const delta=new THREE.Vector3().subVectors(b,a), m=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,delta.length(),7),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());group.add(m);return m;}
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.29,.55,4,8),suit);torso.position.y=.2;climber.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.19,10,8),skin);head.position.set(0,.69,.01);climber.add(head);
const helmet=new THREE.Mesh(new THREE.SphereGeometry(.22,10,7,0,Math.PI*2,0,Math.PI*.55),gear);helmet.position.set(0,.77,.02);climber.add(helmet);
const pack=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,.2),darkSuit);pack.position.set(0,.25,-.28);climber.add(pack);
const limbs=[];
for(const side of [-1,1]){
  limbs.push(capsule(climber,new THREE.Vector3(side*.2,.36,.02),new THREE.Vector3(side*.28,-.35,.06),.105,darkSuit));
  limbs.push(capsule(climber,new THREE.Vector3(side*.24,.4,.03),new THREE.Vector3(side*.48,.18,.1),.085,suit));
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,8,7),skin); hand.position.set(side*.48,.18,.1);climber.add(hand);
  const boot=new THREE.Mesh(new THREE.BoxGeometry(.18,.13,.28),darkSuit);boot.position.set(side*.28,-.38,.13);climber.add(boot);
}
const rope=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,5,24),new THREE.MeshStandardMaterial({color:'#dcb47d',roughness:.8}));rope.rotation.x=Math.PI/2;rope.position.set(0,-.06,-.25);climber.add(rope);

const keys=new Set(); let playing=false, paused=false, stamina=100, progress=0, lateral=0, elapsed=0, last=performance.now(), lastCheckpoint=0, slipLock=0, soundOn=false;
const maxProgress=100; const startY=1.15;
const altitudeMeter=document.querySelector('#altitude-meter'), staminaMeter=document.querySelector('#stamina-meter');
const altitudeValue=document.querySelector('#altitude-value'), staminaValue=document.querySelector('#stamina-value');
const objectiveText=document.querySelector('#objective-text'), eventToast=document.querySelector('#event-toast');
const startScreen=document.querySelector('#start-screen'), pauseScreen=document.querySelector('#pause-screen'), endScreen=document.querySelector('#end-screen');
function showToast(message){eventToast.textContent=message;eventToast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>eventToast.classList.remove('show'),2100);}
function startGame(){progress=0;lateral=0;stamina=100;elapsed=0;lastCheckpoint=0;ledges.forEach(l=>l.done=false);playing=true;paused=false;startScreen.classList.remove('show');startScreen.classList.add('hidden');pauseScreen.classList.add('hidden');endScreen.classList.add('hidden');document.querySelector('#climb-tip').style.opacity='1';updateHUD();}
function pauseGame(){if(!playing)return;paused=!paused;pauseScreen.classList.toggle('hidden',!paused);}
function finish(){playing=false;document.querySelector('#final-height').textContent='2.860 m';document.querySelector('#final-time').textContent=formatTime(elapsed);endScreen.classList.remove('hidden');}
function formatTime(seconds){const m=Math.floor(seconds/60),s=Math.floor(seconds%60);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function updateHUD(){const pct=Math.round(progress);altitudeMeter.style.width=`${Math.max(0,pct)}%`;altitudeValue.textContent=`${(1240+Math.round(progress*16.2)).toLocaleString('pt-BR')} m`;staminaMeter.style.width=`${stamina}%`;staminaValue.textContent=`${Math.round(stamina)}%`;staminaMeter.style.background=stamina<25?'#d77b61':'#e4e6d4';if(progress<25)objectiveText.textContent='Alcance o primeiro platô';else if(progress<50)objectiveText.textContent='Continue pela aresta';else if(progress<75)objectiveText.textContent='Encontre a passagem alta';else objectiveText.textContent='O cume está próximo';}
function currentY(){return startY+progress*.24;}
function surfaceZ(x,y){const t=clamp((y+1)/height,0,1), taper=1-.42*t, u=clamp(x/(7.3*taper),-1,1);return -.55-Math.pow(Math.abs(u),1.7)*1.3+Math.sin(y*1.7+x*2)*.24+.12;}
function setKey(event,down){const key=event.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();if(down)keys.add(key);else keys.delete(key);if(key==='escape'&&down)pauseGame();}
window.addEventListener('keydown',e=>setKey(e,true));window.addEventListener('keyup',e=>setKey(e,false));
document.querySelector('#start-btn').addEventListener('click',startGame);
document.querySelector('#resume-btn').addEventListener('click',pauseGame);
document.querySelector('#restart-btn').addEventListener('click',startGame);
document.querySelector('#again-btn').addEventListener('click',startGame);
document.querySelector('#pause-btn').addEventListener('click',pauseGame);
document.querySelector('#sound-toggle').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♫':'♪';e.currentTarget.style.color=soundOn?'#e4b46c':'';});
document.querySelectorAll('.touch-controls button').forEach(button=>{const key=button.dataset.key;button.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(key);button.setPointerCapture(e.pointerId)});button.addEventListener('pointerup',()=>keys.delete(key));button.addEventListener('pointercancel',()=>keys.delete(key));});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
if(('ontouchstart'in window)||navigator.maxTouchPoints>0)shell.classList.add('mobile');

function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;
  if(playing&&!paused){elapsed+=dt;const y=currentY(); const climbing=keys.has('w')||keys.has('arrowup'), descending=keys.has('s')||keys.has('arrowdown'), resting=keys.has('shift');
    const left=keys.has('a')||keys.has('arrowleft'), right=keys.has('d')||keys.has('arrowright');
    const speed=keys.has(' ')?3.45:2.05;
    if(resting){stamina=Math.min(100,stamina+23*dt);}else{
      if(climbing){if(stamina>0){progress=Math.min(maxProgress,progress+speed*dt);stamina=Math.max(0,stamina-(keys.has(' ')?3.8:2.25)*dt);}else if(slipLock<=0){progress=Math.max(lastCheckpoint,progress-3.5*dt);slipLock=1.2;showToast('SEM RESISTÊNCIA — SEGURE SHIFT PARA DESCANSAR');}}
      if(descending){progress=Math.max(lastCheckpoint,progress-1.6*dt);stamina=Math.min(100,stamina+1.5*dt);}
      if(!climbing&&!descending)stamina=Math.min(100,stamina+4.4*dt);
    }
    if(left)lateral-=1.7*dt;if(right)lateral+=1.7*dt;
    const allowed=5.8-.35*(currentY()/height); lateral=clamp(lateral,-allowed,allowed);
    slipLock-=dt;
    for(let i=0;i<ledges.length;i++){const ledge=ledges[i];const target=(ledge.y-startY)/.24;if(!ledge.done&&progress>=target){ledge.done=true;lastCheckpoint=target;stamina=Math.min(100,stamina+38);showToast(i===2?'PLATÔ ALTO ALCANÇADO · CUME À VISTA':'PLATÔ ALCANÇADO · RESISTÊNCIA RESTAURADA');}}
    if(progress>=100)finish();updateHUD();
  }
  const y=currentY(), face=surfaceZ(lateral,y);
  climber.position.set(lateral,y,face+.34);climber.rotation.y=Math.sin(now*.001)*.035;
  const moving=playing&&!paused&&(keys.has('w')||keys.has('a')||keys.has('d')||keys.has('arrowup')||keys.has('arrowleft')||keys.has('arrowright'));
  const sway=moving?Math.sin(now*.012)*.045:Math.sin(now*.002)*.012;torso.rotation.z=sway;limbs.forEach((limb,i)=>limb.rotation.z=sway*(i%2?1:-1));
  const target=new THREE.Vector3(lateral*.24,y+3.1,7.8);camera.position.lerp(target,.065);camera.lookAt(lateral*.12,y+1.35,-1.7);
  fill.position.set(lateral-4,y+6,5);
  const t=now*.00016;scene.fog.color.setHSL(.52+Math.sin(t)*.018,.12,.62);scene.background.copy(scene.fog.color);
  renderer.render(scene,camera);
}
updateHUD();requestAnimationFrame(animate);
