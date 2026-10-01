// Deliberately transparent, educational ventricular–arterial coupling model.
// Not a patient model. No autonomic reflexes, valve lesions or closed-loop circulation.
export const BASELINE = Object.freeze({hr:75,edv:120,ea:1.5,ees:2.5,compliance:1});
export function calculateHemodynamics(parameters) {
  const p = {...BASELINE,...parameters};
  const v0 = 10;
  const esv = (p.ea*p.edv + p.ees*v0) / (p.ees+p.ea);
  const sv = p.edv-esv;
  const esp = p.ea*sv;
  const edp = .75 * (Math.exp(.025*(p.edv-20)/p.compliance)-1);
  return {...p,v0,esv,sv,esp,edp,co:p.hr*sv/1000,ef:100*sv/p.edv,cycle:60000/p.hr};
}
export function pvLoop(p) {
  const m=calculateHemodynamics(p), points=[];
  const fillingPressure = v => .75*(Math.exp(.025*(v-20)/m.compliance)-1);
  // End systole -> relaxation -> filling -> contraction -> ejection (counterclockwise).
  for(let i=0;i<=20;i++) points.push([m.esv,m.esp+(fillingPressure(m.esv)-m.esp)*i/20]);
  for(let i=1;i<=35;i++){const v=m.esv+m.sv*i/35;points.push([v,fillingPressure(v)]);}
  for(let i=1;i<=20;i++)points.push([m.edv,m.edp+(m.esp*.78-m.edp)*i/20]);
  for(let i=1;i<=50;i++){const t=i/50;points.push([m.edv-m.sv*t,m.esp*(.78+.22*t+.26*Math.sin(Math.PI*t))]);}
  return points;
}
export function ecgValue(t,{hr=75,pr=160,qrs=90,rhythm='sinus'}={}) {
  const period=60/hr, g=(x,c,s,a)=>a*Math.exp(-.5*((x-c)/s)**2);
  if(rhythm==='af'){
    const durations=Array.from({length:32},(_,i)=>period*(.68+.65*(.5+.5*Math.sin(i*8.41))));
    const total=durations.reduce((sum,value)=>sum+value,0);
    t=((t%total)+total)%total;
    let start=0;
    for(const duration of durations){
      const x=t-start;
      if(x>=0&&x<duration)return .027*Math.sin(t*62)+.018*Math.sin(t*89)+g(x,.07,.009,1.05)-g(x,.093,.012,.23)+g(x,.28,.052,.25);
      start+=duration;
    }
    return 0;
  }
  const x=((t%period)+period)%period;
  if(rhythm==='vt')return g(x,.20*period,.085*period,.98)-g(x,.48*period,.12*period,.70)+g(x,.8*period,.1*period,.15);
  const r=.08+pr/1000,q=qrs/1000;
  const p=g(x,.08,.020,.13);
  const ventricular=-g(x,r-q*.23,q*.10,.13)+g(x,r,q*.12,1.05)-g(x,r+q*.25,q*.11,.27)+g(x,r+.23,.052,.29);
  if(rhythm==='mobitz1'){
    const beat=Math.floor(t/period), phase=((beat%4)+4)%4;
    if(phase===3)return p;
    const delayed=x-phase*.045;
    return p-g(delayed,r-q*.23,q*.1,.13)+g(delayed,r,q*.12,1.05)-g(delayed,r+q*.25,q*.11,.27)+g(delayed,r+.23,.052,.29);
  }
  return p+ventricular;
}
export function cardiacCycle(t) {
  const phase=((t%1)+1)%1;
  if(phase<.12)return {name:'Isovolumetric contraction',lv:10+70*phase/.12,ao:80,volume:120};
  if(phase<.42){const x=(phase-.12)/.3,lv=80+35*Math.sin(Math.PI*x)+20*x;return{name:'Ventricular ejection',lv,ao:lv-2*Math.sin(Math.PI*x),volume:120-70*x};}
  if(phase<.53){const x=(phase-.42)/.11;return{name:'Isovolumetric relaxation',lv:100-94*x,ao:100-6*x,volume:50};}
  const x=(phase-.53)/.47;return{name:'Ventricular filling',lv:6+4*x,ao:94-14*x,volume:50+70*(1-Math.pow(1-x,2))};
}
