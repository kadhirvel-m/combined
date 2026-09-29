import { modules, structures, flow, references, questions, cases } from './content.mjs';
import { BASELINE, calculateHemodynamics, pvLoop, ecgValue, cardiacCycle } from './simulation.mjs';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE_KEY = 'medix-heart-v1';
const allLessonIds = new Set(modules.flatMap(m => m.lessons.map(l => l.id)));
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { /* Study tools work even if storage is unavailable. */ }
const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => allLessonIds.has(id)) : []);
const notes = saved.notes && typeof saved.notes === 'object' && !Array.isArray(saved.notes) ? saved.notes : {};
let storageWarning = false, toastTimer, currentView = '', viewer = null, viewerLoading = false;
let flowIndex = -1, flowTimer = null, lab = {...BASELINE}, baselineVisible = true;
let cycleProgress = 0, cyclePlaying = false, ecgPlaying = false, ecgOffset = 0;
let ecg = {hr:75,pr:160,qrs:90,rhythm:'sinus'}, soundContext, soundTimer;
let query = '', category = 'All', quizCategory = 'All', quizMode = 'mcq', quizOrder = [], quizIndex = 0, quizAnswers = new Map(), revealed = false;
let activeCase = null, caseStep = 0, caseAnswers = [];
const names = {atlas:'Anatomy atlas',physiology:'Physiology lab',ecg:'ECG studio',cases:'Clinical cases',curriculum:'Complete curriculum',recall:'Active recall',references:'References'};
function toast(message) { const node=$('#toast');node.textContent=message;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,3400); }
function persist() { try {localStorage.setItem(STORAGE_KEY,JSON.stringify({completed:[...completed],notes}));} catch {if(!storageWarning){toast('Device storage is unavailable. Your progress will last for this session.');storageWarning=true;}} }
function updateProgress() { const total=allLessonIds.size,percent=Math.round(completed.size/total*100);$('#progress-percent').textContent=`${percent}%`;$('#course-progress').value=percent;$('#progress-caption').textContent=`${completed.size} of ${total} lessons completed`; }
function table(headers,rows) {return `<div class="table-scroll"><table class="study-table"><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
const intro=(title,description,id)=>`<div class="section-bar"><h2 id="${id}">${title}</h2></div><p class="view-intro">${description}</p>`;
function route() {
  const [requested,detail] = location.hash.slice(1).split('/');
  const next = Object.hasOwn(names,requested) ? requested : 'atlas';
  if(currentView!==next){stopSound();stopFlow();ecgPlaying=false;cyclePlaying=false;}
  currentView=next;
  $$('.view').forEach(section=>section.hidden=section.id!==`view-${next}`);
  $$('[data-view]').forEach(a=>{a.classList.toggle('active',a.dataset.view===next);if(a.dataset.view===next)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $('#mobile-view').value=next;$('#breadcrumb-current').textContent=names[next];
  document.title=`${names[next]} — Heart · MediX`;
  if(next==='atlas')initAtlas();
  if(next==='physiology')renderPhysiology();
  if(next==='ecg')renderECG();
  if(next==='curriculum')detail?renderReader(detail):renderCurriculum();
  if(next==='cases')detail?openCase(detail):renderCases();
  if(next==='recall')renderRecall();
  if(next==='references')renderReferences();
}
$('#mobile-view').addEventListener('change',e=>location.hash=e.target.value);
window.addEventListener('hashchange',route);
$('#search-toggle').addEventListener('click',()=>{location.hash='curriculum';setTimeout(()=>$('#curriculum-search')?.focus(),0);});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)){event.preventDefault();$('#search-toggle').click();}});

function selectStructure(value) { if(!Object.hasOwn(structures,value))return;$('#structure-select').value=value;const s=structures[value];$('#structure-note').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p>`;viewer?.select(value); }
async function initAtlas() {
  if(!$('#blood-flow').children.length){$('#blood-flow').innerHTML=flow.map((f,i)=>`${i?'<span class="flow-arrow" aria-hidden="true">→</span>':''}<button class="flow-step ${i>=4?'oxygenated':''}" data-flow="${i}" aria-pressed="false">${f[0]}</button>`).join('');selectStructure('all');}
  if(viewer||viewerLoading)return;
  viewerLoading=true;
  try {
    const {createHeartViewer}=await import('./model.mjs');
    viewer=await createHeartViewer($('#heart-viewer'),selectStructure);
    $('#model-status').hidden=true;
    viewer.select($('#structure-select').value);viewer.isolate($('#isolate-toggle').checked);viewer.colorize($('#color-toggle').checked);viewer.setOpacity(+$('#opacity').value/100);viewer.cutaway(+$('#cutaway').value);
  } catch(error) {
    $('#model-status').innerHTML='<strong>3D view could not start</strong><small>WebGL2 is required. Try a current browser with hardware acceleration. All lessons and other labs remain available.</small><button id="retry-model" class="viewer-button">Retry model</button>';
    $('#retry-model').addEventListener('click',()=>{viewerLoading=false;$('#heart-viewer canvas')?.remove();$('#model-status').innerHTML='<span class="loader"></span>Loading anatomical model…';initAtlas();});
    console.error('Heart model loading failed:',error);
  }
}
$('#structure-select').addEventListener('change',e=>selectStructure(e.target.value));
$('#isolate-toggle').addEventListener('change',e=>viewer?.isolate(e.target.checked));
$('#color-toggle').addEventListener('change',e=>viewer?.colorize(e.target.checked));
$('#opacity').addEventListener('input',e=>{$('#opacity-value').textContent=`${e.target.value}%`;viewer?.setOpacity(+e.target.value/100);});
$('#cutaway').addEventListener('input',e=>{$('#cutaway-value').textContent=+e.target.value?`${e.target.value}%`:'Off';viewer?.cutaway(+e.target.value);});
$('#model-views').addEventListener('click',e=>{const b=e.target.closest('[data-camera]');if(!b)return;viewer?.view(b.dataset.camera);$$('[data-camera]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#model-view-label').textContent=`${b.textContent} view`;$('#model-rotate').setAttribute('aria-pressed','false');});
$('#model-rotate').addEventListener('click',e=>{const b=e.currentTarget,on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));viewer?.rotate(on);if(on)$('#model-view-label').textContent='Orbiting view';});
$('#model-reset').addEventListener('click',()=>{viewer?.reset();selectStructure('all');$('#isolate-toggle').checked=false;$('#color-toggle').checked=true;$('#opacity').value=100;$('#opacity-value').textContent='100%';$('#cutaway').value=0;$('#cutaway-value').textContent='Off';$('#model-rotate').setAttribute('aria-pressed','false');$('[data-camera="anterior"]').click();stopFlow();});
$('#model-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('#model-panel').requestFullscreen)await $('#model-panel').requestFullscreen();else toast('Use landscape orientation to enlarge the model on this browser.');}catch{toast('Fullscreen is unavailable in this browser.');}});
function chooseFlow(index){flowIndex=index;$$('[data-flow]').forEach(b=>{const selected=+b.dataset.flow===index;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});$('#flow-description').textContent=flow[index][2];selectStructure(flow[index][1]);}
function stopFlow(){clearInterval(flowTimer);flowTimer=null;$('#flow-play').innerHTML='▶ Follow blood flow';$('#flow-play').setAttribute('aria-pressed','false');}
$('#blood-flow').addEventListener('click',e=>{const b=e.target.closest('[data-flow]');if(b){stopFlow();chooseFlow(+b.dataset.flow);}});
$('#flow-play').addEventListener('click',()=>{if(flowTimer){stopFlow();return;}$('#flow-play').innerHTML='Ⅱ Pause flow';$('#flow-play').setAttribute('aria-pressed','true');chooseFlow((flowIndex+1)%flow.length);flowTimer=setInterval(()=>chooseFlow((flowIndex+1)%flow.length),3300);});

function slider(id,label,min,max,step,value,unit,help){return `<label class="slider-label" for="${id}">${label}<output id="${id}-out">${value} ${unit}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><p class="help">${help}</p>`;}
function renderPhysiology(){
  $('#view-physiology').innerHTML=intro('Change the load. Understand the response.','Explore a transparent ventricular–arterial coupling model, then connect the cardiac cycle with pressure, volume and sound.','phys-title')+`
  <div class="metric-grid" id="lab-metrics"></div>
  <div class="lab-grid"><div class="panel"><div class="chart-title"><h3>Left ventricular pressure–volume loop</h3><span class="small-pill">NORMAL VALVES · SCHEMATIC</span></div><div class="legend"><span style="--color:#507757">Your parameters</span><span style="--color:#adb49f">Resting reference</span><span style="--color:#bd8b64">ESPVR</span></div><div class="chart-wrap" id="pv-chart"></div><div class="phase-detail" id="lab-interpretation" aria-live="polite"></div><div class="equation" id="lab-equation"></div><label class="switch-row"><span>Show resting reference loop</span><input type="checkbox" id="baseline-toggle" role="switch" ${baselineVisible?'checked':''}></label></div>
  <aside class="panel lab-controls"><h3>Set the physiology</h3><label class="field-label" for="lab-preset">Parameter experiment</label><select id="lab-preset"><option value="custom">Custom parameters</option><option value="rest">Resting reference</option><option value="afterload">Increased afterload</option><option value="contractility">Reduced contractility</option><option value="preload">Increased preload</option><option value="stiff">Reduced compliance</option></select>
  ${slider('hr','Heart rate',40,150,1,lab.hr,'bpm','Rate changes output mathematically; filling-time effects and reflexes are not modeled.')}
  ${slider('edv','Preload · end-diastolic volume',80,160,1,lab.edv,'mL','Volume is a surrogate for preload. Watch pressure change with compliance.')}
  ${slider('ea','Afterload · arterial elastance',.8,3,.1,lab.ea,'mmHg/mL','Higher Eₐ increases the effective load opposing ejection.')}
  ${slider('ees','Contractility · end-systolic elastance',.8,4.5,.1,lab.ees,'mmHg/mL','Higher Eₑₛ steepens the end-systolic pressure–volume relationship.')}
  ${slider('compliance','Relative diastolic compliance',.9,1.6,.05,lab.compliance,'×','Lower compliance raises filling pressure at the same volume.')}
  <button id="reset-lab" class="button">↻ Reset parameters</button></aside>
  <div class="notice full-width"><strong>Model assumptions:</strong> fixed EDV, normal one-way valves, V₀ = 10 mL, linear ESPVR and a chosen exponential filling-pressure curve. No vascular reflexes, venous return feedback, ischemia or regurgitation. Presets isolate mechanisms; they are not patient diagnoses. <a class="inline-link" href="#curriculum/hemodynamics">Read the derivation →</a></div>
  <div class="panel full-width"><div class="chart-title"><div><span class="eyebrow">PUT THE EVENTS TOGETHER</span><h3>A cycle, one phase at a time.</h3></div><button id="cycle-play" class="small-button" aria-pressed="false">▶ Play cycle</button></div><p class="subtle">Separate reference cycle · 75 bpm · EDV 120 mL · ESV 50 mL. Scrub to inspect valve states. Traces are schematic.</p><div class="legend"><span style="--color:#547b5c">LV pressure</span><span style="--color:#bd8066">Aortic pressure</span><span style="--color:#6c91a6">LV volume (right axis)</span></div><div class="chart-wrap" id="cycle-chart"></div><label class="slider-label" for="cycle-scrub">Cycle position<output id="cycle-time">0 ms</output></label><input type="range" id="cycle-scrub" min="0" max="999" value="0"><div class="phase-tabs" id="cycle-phases">${['Isovolumetric contraction','Ventricular ejection','Isovolumetric relaxation','Ventricular filling'].map((s,i)=>`<button data-phase="${i}">${s}</button>`).join('')}</div><div id="cycle-detail" class="phase-detail"></div></div>
  <div class="panel full-width"><span class="eyebrow">LISTEN FOR THE TIMING</span><h3 style="margin-top:8px">Auscultation timing lab</h3><p class="explanation">Hear synthesized S1/S2 and murmur timing. These sounds teach the position and envelope of a murmur, not the full acoustic signature of a clinical recording.</p><div class="sound-controls"><label for="sound-type">Pattern</label><select id="sound-type"><option value="normal">S1 / S2 reference</option><option value="as">Ejection systolic · AS pattern</option><option value="mr">Holosystolic · MR pattern</option><option value="ar">Early diastolic · AR pattern</option><option value="ms">Mid-diastolic · MS pattern</option></select><button id="sound-play" class="button" aria-pressed="false">▶ Play sound</button><span class="subtle">75 bpm · Start at low device volume</span></div><p id="sound-description" class="explanation" style="margin-top:16px">S1 marks AV closure; S2 marks semilunar closure. The shorter interval is systole at this reference rate.</p></div></div>`;
  for(const key of ['hr','edv','ea','ees','compliance'])$(`#${key}`).addEventListener('input',e=>{lab[key]=+e.target.value;$('#lab-preset').value='custom';updateLab();});
  $('#lab-preset').addEventListener('change',e=>{const presets={rest:{},afterload:{ea:2.6},contractility:{ees:1.1},preload:{edv:150},stiff:{compliance:.9}};if(e.target.value==='custom')return;lab={...BASELINE,...presets[e.target.value]};syncLab();});
  $('#reset-lab').addEventListener('click',()=>{lab={...BASELINE};$('#lab-preset').value='rest';syncLab();});
  $('#baseline-toggle').addEventListener('change',e=>{baselineVisible=e.target.checked;updateLab();});
  $('#cycle-play').addEventListener('click',()=>{cyclePlaying=!cyclePlaying;$('#cycle-play').textContent=cyclePlaying?'Ⅱ Pause cycle':'▶ Play cycle';$('#cycle-play').setAttribute('aria-pressed',String(cyclePlaying));});
  $('#cycle-scrub').addEventListener('input',e=>{cycleProgress=+e.target.value/1000;updateCycle();});
  $('#cycle-phases').addEventListener('click',e=>{const b=e.target.closest('[data-phase]');if(b){cycleProgress=[.04,.24,.47,.75][+b.dataset.phase];cyclePlaying=false;$('#cycle-play').textContent='▶ Play cycle';$('#cycle-play').setAttribute('aria-pressed','false');updateCycle();}});
  $('#sound-play').addEventListener('click',toggleSound);
  $('#sound-type').addEventListener('change',()=>{const descriptions={normal:'S1 marks AV closure; S2 marks semilunar closure. The shorter interval is systole at this reference rate.',as:'A crescendo–decrescendo sound lies between S1 and S2, illustrating ejection systolic timing.',mr:'A sustained systolic sound spans the interval from S1 toward S2, illustrating holosystolic timing.',ar:'A decrescendo begins just after S2, illustrating early diastolic regurgitant timing.',ms:'A low-frequency rumble lies in mid to late diastole. This simplified pattern omits the opening snap and variable presystolic accentuation.'};$('#sound-description').textContent=descriptions[$('#sound-type').value];if(soundTimer){stopSound();toggleSound();}});
  updateLab();drawCycle();updateCycle();
}
function syncLab(){for(const key of ['hr','edv','ea','ees','compliance'])$(`#${key}`).value=lab[key];updateLab();}
function updateLab(){
  const m=calculateHemodynamics(lab),b=calculateHemodynamics(BASELINE);
  const units={hr:'bpm',edv:'mL',ea:'mmHg/mL',ees:'mmHg/mL',compliance:'×'};
  for(const key of Object.keys(units))$(`#${key}-out`).textContent=`${Number(lab[key].toFixed(2))} ${units[key]}`;
  $('#lab-metrics').innerHTML=[['Cardiac output',m.co.toFixed(2),'L/min'],['Stroke volume',m.sv.toFixed(1),'mL'],['Ejection fraction',m.ef.toFixed(1),'%'],['LV filling pressure',m.edp.toFixed(1),'mmHg']].map(x=>`<div class="metric"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('');
  const W=640,H=340,left=57,bottom=290,top=24,right=607,x=v=>left+v/190*(right-left),y=p=>bottom-p/230*(bottom-top);
  const path=points=>points.map(([v,p],i)=>`${i?'L':'M'}${x(v).toFixed(1)},${y(p).toFixed(1)}`).join(' ')+' Z';
  let grid='';for(let v=0;v<=180;v+=30)grid+=`<line x1="${x(v)}" y1="${top}" x2="${x(v)}" y2="${bottom}" stroke="#eef0e8"/><text x="${x(v)}" y="${bottom+20}" text-anchor="middle">${v}</text>`;
  for(let p=0;p<=200;p+=40)grid+=`<line x1="${left}" y1="${y(p)}" x2="${right}" y2="${y(p)}" stroke="#eef0e8"/><text x="${left-12}" y="${y(p)+4}" text-anchor="end">${p}</text>`;
  $('#pv-chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pressure–volume loop: stroke volume ${m.sv.toFixed(1)} milliliters, end-systolic volume ${m.esv.toFixed(1)} milliliters" font-family="DM Sans, sans-serif" font-size="10" fill="#8a927f">${grid}<text x="15" y="145" transform="rotate(-90 15 145)" text-anchor="middle">LV pressure (mmHg)</text><text x="330" y="335" text-anchor="middle">LV volume (mL)</text><line x1="${x(10)}" y1="${y(0)}" x2="${x(Math.min(190,10+215/m.ees))}" y2="${y(Math.min(215,m.ees*180))}" stroke="#c79a74" stroke-dasharray="4 5"/>${baselineVisible?`<path d="${path(pvLoop(BASELINE))}" fill="none" stroke="#b5baa9" stroke-width="2" stroke-dasharray="5 5"/>`:''}<path d="${path(pvLoop(lab))}" fill="#6f8d6f18" stroke="#527657" stroke-width="2.8"/><circle cx="${x(m.esv)}" cy="${y(m.esp)}" r="4" fill="#527657"/><text x="${x(m.esv)+8}" y="${y(m.esp)-9}" fill="#56754a">End systole</text><circle cx="${x(m.edv)}" cy="${y(m.edp)}" r="4" fill="#527657"/><text x="${x(m.edv)-4}" y="${y(m.edp)-12}" text-anchor="end" fill="#56754a">End diastole</text></svg>`;
  const change=m.sv-b.sv;
  $('#lab-interpretation').innerHTML=`<strong>${Math.abs(change)<.1?'Stroke volume matches the reference.':`Stroke volume ${change>0?'increases':'decreases'} by ${Math.abs(change).toFixed(1)} mL.`}</strong> End-systolic volume is ${m.esv.toFixed(1)} mL; end-systolic pressure is ${m.esp.toFixed(1)} mmHg. ${lab.compliance<1?'Reduced compliance raises the filling pressure required for this volume. ':''}${lab.ea>BASELINE.ea?'Higher arterial elastance opposes ejection. ':''}${lab.ees<BASELINE.ees?'Reduced end-systolic elastance leaves more blood behind at the same load. ':''}${lab.hr!==BASELINE.hr?'Changing rate here scales CO only; the loop does not model rate-dependent filling.':''}`;
  $('#lab-equation').innerHTML=`SV = ${m.edv} − ${m.esv.toFixed(1)} = <strong>${m.sv.toFixed(1)} mL</strong><br>CO = ${m.hr} × ${m.sv.toFixed(1)} / 1000 = <strong>${m.co.toFixed(2)} L/min</strong><br><small>P<sub>ED</sub> = 0.75 × [exp(0.025 × (EDV − 20) / compliance) − 1]</small>`;
}
function drawCycle(){
  const x=t=>48+t*590,y=p=>218-p/160*180;
  const line=key=>Array.from({length:501},(_,i)=>{const t=i/500,v=cardiacCycle(t===1?.9999:t);return `${i?'L':'M'}${x(t).toFixed(1)},${y(v[key]).toFixed(1)}`;}).join(' ');
  let grid='';for(let n=0;n<=160;n+=40)grid+=`<line x1="48" x2="638" y1="${y(n)}" y2="${y(n)}" stroke="#eff0e9"/><text x="36" y="${y(n)+3}" text-anchor="end">${n}</text><text x="651" y="${y(n)+3}">${n}</text>`;
  for(let n=0;n<=4;n++)grid+=`<text x="${x(n/4)}" y="242" text-anchor="middle">${n*200}</text>`;
  $('#cycle-chart').innerHTML=`<svg viewBox="0 0 690 265" role="img" aria-label="Schematic reference cardiac cycle showing left ventricular pressure, aortic pressure and ventricular volume" font-size="10" fill="#8a927f" font-family="DM Sans, sans-serif">${grid}<text x="48" y="17">Pressure (mmHg)</text><text x="638" y="17" text-anchor="end">Volume (mL)</text><path d="${line('ao')}" fill="none" stroke="#bd8066" stroke-width="2"/><path d="${line('lv')}" fill="none" stroke="#547b5c" stroke-width="2.5"/><path d="${line('volume')}" fill="none" stroke="#6c91a6" stroke-width="2" stroke-dasharray="5 3"/><line id="cycle-cursor" x1="48" x2="48" y1="27" y2="218" stroke="#343e30" stroke-width="1.5"/><text x="345" y="260" text-anchor="middle">Time (ms)</text></svg>`;
}
function updateCycle(){
  const c=cardiacCycle(cycleProgress),phase=c.name;
  const detail={'Isovolumetric contraction':'Both valves are closed. LV pressure rises at constant EDV. S1 occurs near the onset of this phase.','Ventricular ejection':'The aortic valve is open and mitral valve closed. Blood leaves the LV and volume falls.','Isovolumetric relaxation':'Both valves are closed. LV pressure falls at constant ESV. Aortic closure contributes A2 near the onset.','Ventricular filling':'The mitral valve is open and aortic valve closed. LV volume rises as blood moves down the LA-to-LV pressure gradient.'};
  const x=48+cycleProgress*590;$('#cycle-cursor')?.setAttribute('x1',x);$('#cycle-cursor')?.setAttribute('x2',x);
  $('#cycle-scrub').value=Math.round(cycleProgress*1000);$('#cycle-time').textContent=`${Math.round(cycleProgress*800)} ms`;
  $('#cycle-detail').innerHTML=`<strong>${phase}</strong> · ${detail[phase]}<br><small>LV pressure ${c.lv.toFixed(0)} mmHg · Aortic pressure ${c.ao.toFixed(0)} mmHg · LV volume ${c.volume.toFixed(0)} mL</small>`;
  $$('#cycle-phases button').forEach(b=>{const on=b.textContent===phase;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
}
function stopSound(){clearInterval(soundTimer);soundTimer=null;if(soundContext){soundContext.close().catch(()=>{});soundContext=null;}const b=$('#sound-play');if(b){b.textContent='▶ Play sound';b.setAttribute('aria-pressed','false');}}
async function toggleSound(){
  if(soundTimer){stopSound();return;}
  const AudioClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioClass){toast('Audio synthesis is unavailable in this browser.');return;}
  try{
    soundContext=new AudioClass();await soundContext.resume();
    const pulse=(time,freq,duration,level)=>{const osc=soundContext.createOscillator(),gain=soundContext.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,time);osc.frequency.exponentialRampToValueAtTime(freq*.65,time+duration);gain.gain.setValueAtTime(.001,time);gain.gain.exponentialRampToValueAtTime(level,time+.008);gain.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(gain).connect(soundContext.destination);osc.start(time);osc.stop(time+duration);};
    const murmur=(time,duration,envelope)=>{const n=Math.floor(soundContext.sampleRate*duration),buffer=soundContext.createBuffer(1,n,soundContext.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++){const x=i/n,shape=envelope==='crescendo'?Math.sin(Math.PI*x):envelope==='decrescendo'?Math.pow(1-x,1.5):Math.sin(Math.PI*Math.min(1,x*8))*0.2+0.65;data[i]=(Math.random()*2-1)*shape*.12;}const source=soundContext.createBufferSource(),filter=soundContext.createBiquadFilter();filter.type='bandpass';filter.frequency.value=$('#sound-type').value==='ms'?110:340;filter.Q.value=.8;source.buffer=buffer;source.connect(filter).connect(soundContext.destination);source.start(time);};
    const beat=()=>{if(!soundContext)return;const t=soundContext.currentTime+.035,type=$('#sound-type').value;pulse(t,90,.1,.18);pulse(t+.3,125,.075,.13);if(type==='as')murmur(t+.08,.19,'crescendo');if(type==='mr')murmur(t+.03,.28,'flat');if(type==='ar')murmur(t+.36,.34,'decrescendo');if(type==='ms')murmur(t+.48,.23,'crescendo');};
    beat();soundTimer=setInterval(beat,800);$('#sound-play').textContent='■ Stop sound';$('#sound-play').setAttribute('aria-pressed','true');
  }catch{stopSound();toast('Audio could not start. Check this browser’s audio settings.');}
}

const rhythmDescriptions={sinus:['Sinus rhythm','A consistent P wave precedes each QRS with a stable PR. Adjust nominal intervals and rate to examine timing. A PR above 200 ms illustrates first-degree AV delay; QRS ≥120 ms illustrates broad conduction.'],af:['Atrial fibrillation','The ventricular response is irregular and consistent P waves are absent. The rate slider controls a target average rather than identical RR intervals. The fibrillatory baseline is deliberately schematic.'],mobitz1:['Mobitz I · Wenckebach','Successive conducted PR intervals lengthen, then a P wave is not followed by QRS. The next sequence restarts with a shorter PR. Rate refers to the atrial cycle in this example.'],vt:['Monomorphic ventricular tachycardia','A regular, broad-complex waveform illustrates a ventricular rhythm. The display is schematic; morphology alone cannot safely distinguish every VT from SVT with aberrancy. Assess pulse and clinical stability.']};
function renderECG(){
  $('#view-ecg').innerHTML=intro('Read the rhythm. Explain the mechanism.','Explore rhythm strips, adjust timing, and connect surface electrical activity to cellular physiology.','ecg-title')+`
  <div class="panel"><div class="chart-title"><div><span class="eyebrow">ECG STUDIO</span><h3 id="rhythm-title" style="margin-top:7px"></h3></div><button id="ecg-play" class="small-button" aria-pressed="false">▶ Animate strip</button></div><div class="ecg-surface" id="ecg-chart"></div><div class="ecg-controls"><div><label for="ecg-rhythm">Rhythm pattern</label><select id="ecg-rhythm"><option value="sinus">Sinus rhythm / interval study</option><option value="af">Atrial fibrillation</option><option value="mobitz1">Mobitz I AV block</option><option value="vt">Monomorphic VT · schematic</option></select></div><div>${slider('ecg-hr','Rate',40,180,1,ecg.hr,'bpm','For Wenckebach, this is the atrial rate.')}</div><div>${slider('ecg-pr','Nominal PR',120,240,10,ecg.pr,'ms','Adjustable in sinus rhythm only.')}${slider('ecg-qrs','Nominal QRS width',60,160,10,ecg.qrs,'ms','Adjustable in sinus rhythm only.')}</div></div><p id="rhythm-description" class="phase-detail"></p><div class="notice">Synthetic teaching traces · equivalent grid: 25 mm/s and 10 mm/mV · 6-second window. These curves are illustrative, not clinical recordings or validated diagnostic templates. Interval sliders specify nominal timing.</div></div>
  <div class="two-column"><div class="panel"><h3>Read every tracing in order</h3>${table(['Step','Ask'],[['1 · Quality','Correct person, calibration, lead placement, artifact?'],['2 · Rate & rhythm','Regular? P before every QRS? QRS after every P?'],['3 · Axis','Net QRS in I/aVF, then refine with II.'],['4 · Intervals','PR, QRS, QT and context-appropriate QTc.'],['5 · Morphology','P waves, QRS, R progression, ST and T changes.'],['6 · Synthesis','Compare prior ECG, symptoms, vitals and serial changes.']])}<a class="text-link" href="#curriculum/ecg-interpretation">Open the full 12-lead lesson →</a></div><div class="panel"><h3>One ECG ≠ one action potential</h3><p class="explanation">A surface ECG records the sum of changing electrical vectors across millions of cells. It is not a direct plot of ventricular pressure or a single myocyte’s membrane potential.</p>${table(['Working ventricular cell','Main current'],[['Phase 0','Fast inward Na⁺'],['Phase 1','Transient outward K⁺'],['Phase 2','Inward Ca²⁺ balanced by outward K⁺'],['Phase 3','Outward K⁺ dominates'],['Phase 4','Stable resting potential, mainly IK₁']])}<a class="text-link" href="#curriculum/electrophysiology">Compare nodal and ventricular cells →</a></div></div>`;
  $('#ecg-rhythm').value=ecg.rhythm;
  $('#ecg-rhythm').addEventListener('change',e=>{ecg.rhythm=e.target.value;if(ecg.rhythm==='vt')ecg.hr=150;else if(ecg.hr>140)ecg.hr=90;$('#ecg-hr').value=ecg.hr;ecgOffset=0;updateECGControls();});
  for(const key of ['hr','pr','qrs'])$(`#ecg-${key}`).addEventListener('input',e=>{ecg[key]=+e.target.value;updateECGControls();});
  $('#ecg-play').addEventListener('click',()=>{ecgPlaying=!ecgPlaying;$('#ecg-play').textContent=ecgPlaying?'Ⅱ Pause strip':'▶ Animate strip';$('#ecg-play').setAttribute('aria-pressed',String(ecgPlaying));});
  drawECG();updateECGControls();
}
function drawECG(){
  $('#ecg-chart').innerHTML=`<svg viewBox="0 0 700 220" role="img" aria-label="Schematic 6-second electrocardiogram rhythm strip" font-family="DM Sans, sans-serif" font-size="9" fill="#a67e7e"><defs><pattern id="small-grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M 4 0 L 0 0 0 4" fill="none" stroke="#f3e4e5" stroke-width=".5"/></pattern><pattern id="ecg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="url(#small-grid)"/><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e7c9cb" stroke-width=".7"/></pattern><clipPath id="strip-clip"><rect x="50" y="35" width="600" height="140"/></clipPath></defs><rect x="50" y="35" width="600" height="140" fill="url(#ecg-grid)"/><text x="50" y="20">ILLUSTRATIVE RHYTHM STRIP</text><text x="650" y="20" text-anchor="end">25 mm/s · 10 mm/mV equivalent</text><path d="M 12 120 L 18 120 L 18 80 L 38 80 L 38 120 L 44 120" stroke="#9e6869" stroke-width="1.5" fill="none"/><text x="12" y="145">1 mV</text><path id="ecg-trace" clip-path="url(#strip-clip)" fill="none" stroke="#534244" stroke-width="1.65" stroke-linejoin="round"/>${Array.from({length:7},(_,i)=>`<text x="${50+i*100}" y="197" text-anchor="middle">${i} s</text>`).join('')}</svg>`;
}
function updateECGControls(){
  $('#rhythm-title').textContent=rhythmDescriptions[ecg.rhythm][0];$('#rhythm-description').textContent=rhythmDescriptions[ecg.rhythm][1];
  for(const key of ['hr','pr','qrs']){$(`#ecg-${key}-out`).textContent=`${ecg[key]} ${key==='hr'?'bpm':'ms'}`;if(key!=='hr')$(`#ecg-${key}`).disabled=ecg.rhythm!=='sinus';}
  updateECGTrace();
}
function updateECGTrace(){
  const d=Array.from({length:1801},(_,i)=>{const t=i/300,value=ecgValue(t+ecgOffset,ecg);return `${i?'L':'M'}${(50+t*100).toFixed(2)},${(120-value*40).toFixed(2)}`;}).join(' ');$('#ecg-trace')?.setAttribute('d',d);
}

function renderCurriculum(){
  $('#view-curriculum').innerHTML=intro('The complete learning pathway.',`${modules.length} integrated modules · ${allLessonIds.size} detailed lessons. Study in sequence or follow a clinical question across anatomy, physiology and pathology.`,'curriculum-title')+`<label class="skip-link" for="curriculum-search">Search lessons</label><input id="curriculum-search" type="search" class="search-box" placeholder="Search a mechanism, lesion or drug… e.g. papillary, preload, digoxin" autocomplete="off"><div class="filter-row" id="curriculum-filters">${['All',...new Set(modules.map(m=>m.category)),'In progress','Completed'].map(c=>`<button data-category="${c}" class="${category===c?'active':''}" aria-pressed="${category===c}">${c}</button>`).join('')}</div><p class="subtle" id="search-count"></p><div class="module-grid" id="module-list"></div>`;
  $('#curriculum-search').value=query;
  $('#curriculum-search').addEventListener('input',e=>{query=e.target.value;renderModuleList();});
  $('#curriculum-filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$$('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderModuleList();});
  renderModuleList();
}
function renderModuleList(){
  const needle=query.trim().toLowerCase();
  const list=modules.filter(m=>{const count=m.lessons.filter(l=>completed.has(l.id)).length;const categoryMatch=category==='All'||m.category===category||(category==='In progress'&&count>0&&count<m.lessons.length)||(category==='Completed'&&count===m.lessons.length);return categoryMatch&&`${m.title} ${m.summary} ${m.lessons.map(l=>l.title+' '+l.body+' '+l.pearl).join(' ')}`.replace(/<[^>]*>/g,' ').toLowerCase().includes(needle);});
  $('#search-count').textContent=`${list.length} of ${modules.length} modules${needle?` matching “${query.trim()}”`:''}`;
  $('#module-list').innerHTML=list.length?list.map(m=>{const done=m.lessons.filter(l=>completed.has(l.id)).length;return `<a class="module-card" href="#curriculum/${m.id}"><span class="module-number">${m.number}</span><span class="eyebrow">${m.category}</span><h3>${m.title}</h3><p>${m.summary}</p><span class="module-meta"><span>${done===m.lessons.length?'✓ Complete':`${done} / ${m.lessons.length} lessons complete`}</span><span>Study module ↗</span></span></a>`;}).join(''):'<div class="empty-state full-width"><h3>No matching modules</h3><p>Try another term or choose All to search the whole curriculum.</p></div>';
}
function renderReader(id){
  const m=modules.find(x=>x.id===id);if(!m){$('#view-curriculum').innerHTML='<div class="empty-state"><h2>Module not found</h2><a class="button" href="#curriculum">Browse the curriculum</a></div>';return;}
  const index=modules.indexOf(m),next=modules[index+1];
  $('#view-curriculum').innerHTML=`<div class="reader"><div class="reader-toolbar"><a class="button" href="#curriculum">← All modules</a><button class="button" id="print-module">Print / save as PDF</button></div><div class="reader-head"><span class="eyebrow">MODULE ${m.number} · ${m.category.toUpperCase()}</span><h2 id="curriculum-title">${m.title}</h2><p>${m.summary}</p><span class="subtle">${m.lessons.length} lessons · Mechanisms, clinical connections & exam pitfalls</span></div><div class="objectives"><h3>By the end, you should be able to</h3><ul>${m.objectives.map(o=>`<li>${o}</li>`).join('')}</ul></div><div class="toc">${m.lessons.map((l,i)=>`<a href="#" data-scroll-lesson="${l.id}">${i+1}. ${l.title}</a>`).join('')}</div>${m.lessons.map((l,i)=>`<article class="lesson" id="${l.id}"><span class="eyebrow">LESSON ${i+1} OF ${m.lessons.length}</span><h3 style="margin-top:10px">${l.title}</h3>${l.body}<div class="clinical-pearl"><b>CLINICAL CONNECTION / EXAM PITFALL</b>${l.pearl}</div><button class="complete-lesson" data-complete="${l.id}" aria-pressed="${completed.has(l.id)}">${completed.has(l.id)?'✓ Completed · mark unread':'○ Mark lesson complete'}</button></article>`).join('')}<div class="lesson-sources">Reference reading: ${m.sources.map(id=>{const r=references.find(r=>r.id===id);return `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title} ↗</a>`;}).join(' · ')}<br>Original educational synthesis. Treatment principles require current guidelines and local clinical context.</div><label class="field-label" for="module-notes">Your notes & unanswered questions <span>SAVED ON THIS DEVICE</span></label><textarea class="module-notes" id="module-notes" placeholder="Explain the mechanism in your own words. What would you ask in a viva?"></textarea><p class="subtle" id="notes-status">Notes stay in this browser.</p><div class="reader-toolbar" style="margin-top:25px"><a class="button" href="#recall">Test your understanding ↗</a>${next?`<a class="button button-dark" href="#curriculum/${next.id}">Next: ${next.title} →</a>`:'<a class="button button-dark" href="#curriculum">Back to your learning pathway →</a>'}</div></div>`;
  $('#module-notes').value=typeof notes[m.id]==='string'?notes[m.id]:'';
  $('#module-notes').addEventListener('input',e=>{notes[m.id]=e.target.value;persist();$('#notes-status').textContent=storageWarning?'Saved for this session only.':'Saved on this device.';});
  $('#print-module').addEventListener('click',()=>window.print());
  $$('[data-complete]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.complete;if(completed.has(id))completed.delete(id);else completed.add(id);b.setAttribute('aria-pressed',String(completed.has(id)));b.textContent=completed.has(id)?'✓ Completed · mark unread':'○ Mark lesson complete';persist();updateProgress();}));
  $$('[data-scroll-lesson]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.scrollLesson).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
  $('#main').scrollIntoView({block:'start'});
}
function renderCases(){
  activeCase=null;
  $('#view-cases').innerHTML=intro('Think through the patient.','Six fictional clinical cases, each with three decisions. Commit to an answer, read the reasoning, then use the next finding.','cases-title')+`<div class="case-grid">${cases.map(c=>`<a class="case-card" href="#cases/${c.id}"><span class="case-tag">${c.tag}</span><h3>${c.title}</h3><p>${c.description}</p><div class="case-vitals"><span>${c.vitals[0]}</span><span>3 decisions</span></div><span class="text-link">Open case <span>→</span></span></a>`).join('')}</div>`;
}
function openCase(id){const c=cases.find(c=>c.id===id);if(!c){$('#view-cases').innerHTML='<div class="empty-state"><h2>Case not found</h2><a href="#cases" class="button">All cases</a></div>';return;}if(activeCase!==id){activeCase=id;caseStep=0;caseAnswers=[];}renderCaseStep(c);}
function renderCaseStep(c){
  const q=c.stages[caseStep],answer=caseAnswers[caseStep],hasAnswer=answer!==undefined;
  $('#view-cases').innerHTML=`<div class="quiz-panel"><div class="reader-toolbar"><a class="button" href="#cases">← All clinical cases</a><span class="case-tag">${c.tag}</span></div><div class="panel"><h2 id="cases-title">${c.title}</h2><p class="explanation">${c.story}</p><div class="case-vitals">${c.vitals.map(v=>`<span>${v}</span>`).join('')}</div><hr class="divider"><div class="quiz-topline"><span>DECISION ${caseStep+1} OF ${c.stages.length}</span><span>${caseAnswers.filter((a,i)=>a===c.stages[i].answer).length} correct so far</span></div><h3 class="question-stem">${q.prompt}</h3>${answerButtons(q,answer,'case-answer')}${hasAnswer?`<div class="feedback"><h3>${answer===q.answer?'Correct reasoning.':'Revisit the mechanism.'}</h3>${q.explanation}</div><div class="control-actions">${caseStep<c.stages.length-1?'<button class="button button-dark" id="case-next">Next decision →</button>':`<a class="button button-dark" href="#cases">Case complete · return to cases →</a><button class="button" id="case-restart">Try this case again</button>`}</div>`:''}</div></div>`;
  $$('[data-case-answer]').forEach(b=>b.addEventListener('click',()=>{caseAnswers[caseStep]=+b.dataset.caseAnswer;renderCaseStep(c);}));
  $('#case-next')?.addEventListener('click',()=>{caseStep++;renderCaseStep(c);});
  $('#case-restart')?.addEventListener('click',()=>{caseStep=0;caseAnswers=[];renderCaseStep(c);});
}
function answerButtons(q,answer,type){return `<div class="answer-options">${q.options.map((o,i)=>`<button class="answer-option ${answer!==undefined?(i===q.answer?'correct':i===answer?'incorrect':''):''}" data-${type}="${i}" ${answer!==undefined?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${o}${answer!==undefined&&i===q.answer?' <b aria-label="Correct answer">✓</b>':''}</button>`).join('')}</div>`;}
function resetQuiz(){quizOrder=questions.filter(q=>quizCategory==='All'||q.category===quizCategory).map(q=>q.id);for(let i=quizOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[quizOrder[i],quizOrder[j]]=[quizOrder[j],quizOrder[i]];}quizIndex=0;quizAnswers=new Map();revealed=false;}
function renderRecall(){
  if(!quizOrder.length)resetQuiz();
  $('#view-recall').innerHTML=intro('Retrieval is where learning sticks.',`${questions.length} explained single-best-answer questions. Practice by subject, review every rationale, or turn the same concepts into flashcards.`,'recall-title')+`<div class="quiz-panel"><div class="quiz-settings"><select id="quiz-category" aria-label="Question subject">${['All',...new Set(questions.map(q=>q.category))].map(c=>`<option value="${c}" ${c===quizCategory?'selected':''}>${c==='All'?'All subjects':c}</option>`).join('')}</select><div class="segmented" id="quiz-mode"><button data-mode="mcq" class="${quizMode==='mcq'?'active':''}" aria-pressed="${quizMode==='mcq'}">Practice MCQs</button><button data-mode="flash" class="${quizMode==='flash'?'active':''}" aria-pressed="${quizMode==='flash'}">Flashcards</button></div><button id="quiz-reset" class="small-button">↻ New shuffled session</button></div><div class="panel" id="quiz-content"></div><p class="subtle" style="margin-top:13px">Scores reflect first attempts in this session. Lesson progress is tracked separately.</p></div>`;
  $('#quiz-category').addEventListener('change',e=>{quizCategory=e.target.value;resetQuiz();renderRecall();});
  $('#quiz-mode').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b){quizMode=b.dataset.mode;revealed=false;renderRecall();}});
  $('#quiz-reset').addEventListener('click',()=>{resetQuiz();renderRecall();});
  renderQuestion();
}
function renderQuestion(){
  const q=questions.find(q=>q.id===quizOrder[quizIndex]),answer=quizAnswers.get(q.id),correct=[...quizAnswers].filter(([id,a])=>questions.find(q=>q.id===id).answer===a).length;
  if(quizMode==='flash'){
    $('#quiz-content').innerHTML=`<div class="quiz-topline"><span>${q.category.toUpperCase()}</span><span>Card ${quizIndex+1} / ${quizOrder.length}</span></div><button class="flashcard" id="flash-reveal" aria-pressed="${revealed}"><small>${revealed?'ANSWER & MECHANISM':'TRY TO ANSWER BEFORE REVEALING'}</small><span>${revealed?q.options[q.answer]:q.prompt}</span>${revealed?`<span class="explanation">${q.explanation}</span>`:'<small>Click to reveal ↻</small>'}</button><div class="flash-controls"><button class="button" id="flash-prev" ${quizIndex===0?'disabled':''}>← Previous</button><button class="button button-dark" id="flash-next">${quizIndex===quizOrder.length-1?'Return to first card ↻':'Next card →'}</button></div>`;
    $('#flash-reveal').addEventListener('click',()=>{revealed=!revealed;renderQuestion();});$('#flash-prev').addEventListener('click',()=>{quizIndex--;revealed=false;renderQuestion();});$('#flash-next').addEventListener('click',()=>{quizIndex=(quizIndex+1)%quizOrder.length;revealed=false;renderQuestion();});return;
  }
  $('#quiz-content').innerHTML=`<div class="quiz-topline"><span>QUESTION ${quizIndex+1} / ${quizOrder.length} · ${q.category.toUpperCase()}</span><span>${correct} / ${quizAnswers.size} correct</span></div><h3 class="question-stem">${q.prompt}</h3>${answerButtons(q,answer,'quiz-answer')}${answer!==undefined?`<div class="feedback"><h3>${answer===q.answer?'Correct. Connect the mechanism.':'A useful gap to close.'}</h3>${q.explanation}</div>`:''}<div class="control-actions"><button class="button" id="quiz-prev" ${quizIndex===0?'disabled':''}>← Previous</button><button class="button button-dark" id="quiz-next" ${answer===undefined?'disabled':''}>${quizIndex===quizOrder.length-1?'View session results':'Next question →'}</button></div>`;
  $$('[data-quiz-answer]').forEach(b=>b.addEventListener('click',()=>{if(quizAnswers.has(q.id))return;quizAnswers.set(q.id,+b.dataset.quizAnswer);renderQuestion();}));
  $('#quiz-prev').addEventListener('click',()=>{quizIndex--;renderQuestion();});
  $('#quiz-next').addEventListener('click',()=>{if(quizIndex<quizOrder.length-1){quizIndex++;renderQuestion();}else renderQuizResults();});
}
function renderQuizResults(){
  const correct=quizOrder.filter(id=>quizAnswers.get(id)===questions.find(q=>q.id===id).answer).length;
  const missed=quizOrder.map(id=>questions.find(q=>q.id===id)).filter(q=>quizAnswers.get(q.id)!==q.answer);
  $('#quiz-content').innerHTML=`<span class="eyebrow">SESSION COMPLETE</span><h2 style="font-family:var(--serif);font-size:46px;margin:12px 0">${correct} / ${quizOrder.length}</h2><p class="explanation">${Math.round(correct/quizOrder.length*100)}% correct on first attempt. ${missed.length?'Revisit the explanations below, then test the mechanisms again.':'Every answer was correct. Explain each mechanism aloud to strengthen recall.'}</p>${missed.map(q=>`<details class="feedback"><summary>${q.prompt}</summary><p style="margin:15px 0 6px"><strong>${q.options[q.answer]}</strong></p>${q.explanation}</details>`).join('')}<div class="control-actions"><button class="button button-dark" id="quiz-again">New shuffled session →</button><a class="button" href="#curriculum">Return to the lessons</a></div>`;
  $('#quiz-again').addEventListener('click',()=>{resetQuiz();renderRecall();});
}
function renderReferences(){
  $('#view-references').innerHTML=intro('Know where the learning comes from.','Reference reading, anatomical provenance and the limits of the teaching models.','references-title')+`<div class="reference-list">${references.map(r=>`<article class="reference-item"><span class="eyebrow" style="font-size:8px">${r.publisher}</span><h3 style="margin-top:11px">${r.title}</h3><p>${r.description}</p><a href="${r.url}" target="_blank" rel="noopener noreferrer">Open reference ↗</a></article>`).join('')}</div><div class="two-column"><div class="panel"><h3>The anatomical model</h3><p class="explanation">The original <strong>Heart, Female v1.2</strong> model is by <strong>Kristen Browne and Heidi Schlehlein</strong> for the Human Reference Atlas, using the National Library of Medicine Visible Human dataset. It is distributed under <a class="inline-link" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</p><p class="explanation">The original GLB is unmodified. This viewer changes colors, opacity, camera orientation and clipping at runtime. Four chamber surfaces, interventricular septum, five papillary muscle meshes and four valves can be explored. Coronary arteries, great vessel walls and conduction tissue are not separately segmented in this model; use the lessons for those relationships. Individual anatomy varies.</p><a class="text-link" href="assets/heart/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">Read the asset attribution →</a></div><div class="panel"><h3>How to use this resource</h3><p class="explanation">The ${allLessonIds.size} lessons are original educational summaries for an MBBS-level integrated review. They cover core mechanisms and clinical reasoning, and complement your prescribed anatomy, physiology, pathology, pharmacology and medicine textbooks. They are not a substitute for the complete university curriculum or supervised patient assessment.</p><p class="explanation">Reference links support further reading, not a claim of independent clinical review. The PV model is deliberately simplified, ECG strips and sounds are synthesized, and clinical cases are fictional. Clinical recommendations evolve; consult current guidelines and local protocols for diagnosis and treatment.</p><p class="subtle">Content prepared 8 September 2026. Lesson completion and notes are stored only in this browser; no account is required.</p></div></div>`;
}
let lastFrame=0;
function animate(timestamp){requestAnimationFrame(animate);if(timestamp-lastFrame<45)return;const dt=Math.min((timestamp-lastFrame)/1000,.1);lastFrame=timestamp;if(document.hidden)return;if(currentView==='physiology'&&cyclePlaying){cycleProgress=(cycleProgress+dt/2.4)%1;updateCycle();}if(currentView==='ecg'&&ecgPlaying){ecgOffset+=dt;updateECGTrace();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSound();stopFlow();}});
updateProgress();route();requestAnimationFrame(animate);
