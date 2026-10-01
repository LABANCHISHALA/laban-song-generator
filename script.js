const $=s=>document.querySelector(s),SR=44100,tick=()=>new Promise(r=>setTimeout(r,0));
const INS={djembe:'Djembe',conga:'Conga',kick:'Kick drum',shaker:'Shaker',claps:'Hand claps',bass:'Bass guitar',marimba:'Marimba',mbira:'Mbira (thumb piano)',guitar:'Highlife guitar',keys:'Organ keys',flute:'Bamboo flute',strings:'Strings',brass:'Horns'};
const STY={
gospel:{bpm:100,ins:['keys','bass','djembe','claps','shaker','strings'],p:{kick:'x.......x.......',dj:'..x...x...x...x.',cg:'..x...x...x...x.',sh:'x.x.x.x.x.x.x.x.',cl:'....x.......x...'}},
afrobeat:{bpm:108,ins:['bass','guitar','conga','djembe','shaker','kick','brass'],p:{kick:'x.....x...x.....',dj:'..x.x...x.x.x...',cg:'.x.x..x..x.x..x.',sh:'xxxxxxxxxxxxxxxx',cl:'....x.......x...'}},
rumba:{bpm:118,ins:['guitar','bass','conga','shaker','marimba','kick'],p:{kick:'x...x...x...x...',dj:'..x...x...x...x.',cg:'x..x..x.x..x..x.',sh:'x.x.x.x.x.x.x.x.',cl:'....x.......x...'}},
amapiano:{bpm:112,ins:['kick','bass','keys','shaker','marimba','claps'],p:{kick:'x...x...x...x...',dj:'..x...x...x...x.',cg:'.x..x..x.x..x..x',sh:'.x.x.x.x.x.x.x.x',cl:'....x.......x..x'}},
traditional:{bpm:92,ins:['mbira','djembe','shaker','flute','conga'],p:{kick:'x.......x.......',dj:'x.xx..x.x.xx..x.',cg:'..x...x...x...x.',sh:'x.x.x.x.x.x.x.x.',cl:'....x.......x...'}},
ballad:{bpm:74,ins:['guitar','strings','flute','bass','shaker'],p:{kick:'x.......x.......',dj:'..x...x...x...x.',cg:'..x...x...x...x.',sh:'..x...x...x...x.',cl:'....x.......x...'}}};
const VOW={a:[800,1200,2800],e:[480,1900,2600],i:[290,2250,3000],o:[500,900,2800],u:[320,700,2500],y:[290,2250,3000],N:[250,1100,2300]};
const CON={m:{v:.5,d:.07,f:[250,1100,2200]},n:{v:.5,d:.07,f:[250,1500,2500]},ny:{v:.5,d:.08,f:[260,2100,2700]},ng:{v:.5,d:.07,f:[250,1800,2500]},
l:{v:.8,d:.055,f:[380,1100,2500]},r:{v:.8,d:.05,f:[350,1300,1700]},w:{v:.9,d:.06,f:[320,700,2500]},y:{v:.9,d:.06,f:[280,2250,2900]},
b:{v:.1,d:.06,f:[200,900,2200],nf:700,ng:.3},d:{v:.1,d:.06,f:[250,1700,2600],nf:3800,ng:.3},g:{v:.1,d:.06,f:[250,1600,2000],nf:2000,ng:.3},
p:{v:0,d:.07,f:[200,900,2200],nf:700,ng:.45},t:{v:0,d:.07,f:[250,1700,2600],nf:4000,ng:.5},k:{v:0,d:.07,f:[250,1600,2000],nf:2000,ng:.45},
f:{v:0,d:.09,nf:6500,nd:.09,ng:.22},v:{v:.3,d:.08,nf:6000,nd:.08,ng:.12},s:{v:0,d:.1,nf:6800,nd:.1,ng:.3},z:{v:.3,d:.09,nf:6500,nd:.09,ng:.15},
sh:{v:0,d:.1,nf:3800,nd:.1,ng:.3},ch:{v:0,d:.1,nf:3800,nd:.07,ng:.4},j:{v:.15,d:.09,nf:3500,nd:.06,ng:.3},h:{v:.25,d:.07,nf:1500,nd:.07,ng:.15}};
const PRE={nch:['n','ch'],nsh:['n','sh'],mb:['m','b'],nd:['n','d'],"ng'":['ng'],ng:['ng','g'],nk:['n','k'],nj:['n','j'],ns:['n','s'],nt:['n','t'],nz:['n','z'],mp:['m','p'],mf:['m','f'],ts:['t','s'],th:['t'],ph:['p'],kh:['k'],ck:['k'],zh:['j'],q:['k'],x:['k','s']};
const PEN={sh:['sh'],ph:['f'],th:['t'],ck:['k'],ng:['ng'],wh:['w'],qu:['k','w'],q:['k'],x:['k','s']};
const EV={ee:['i'],ea:['i'],ie:['i'],oo:['u'],ou:['a','u'],ow:['a','u'],ai:['e','i'],ay:['e','i'],ei:['e','i'],oi:['o','i'],oy:['o','i'],igh:['a','i']};
let touched=false,out=null;
$('#ins').innerHTML=Object.entries(INS).map(([k,v])=>`<label><input type="checkbox" value="${k}"><span>${v}</span></label>`).join('');
const checks=()=>[...document.querySelectorAll('#ins input')];
const setIns=l=>checks().forEach(c=>c.checked=l.includes(c.value));
setIns(STY.gospel.ins);
$('#ins').addEventListener('change',()=>touched=true);
$('#sty').addEventListener('change',e=>{if(e.target.value!=='auto'){setIns(STY[e.target.value].ins);touched=false}});

function detect(d){if(/gospel|church|praise|worship|hallelu|jesus|lesa|god/.test(d))return'gospel';if(/amapiano|club|party/.test(d))return'amapiano';if(/rumba|soukous|congo|kalindula/.test(d))return'rumba';if(/afro/.test(d))return'afrobeat';if(/tradition|village|folk|ngoma|acoustic|harvest/.test(d))return'traditional';if(/ballad|love|romantic|slow|sad/.test(d))return'ballad';return'gospel'}
const rng=s=>{s>>>=0;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296};
const hash=t=>{let h=2166136261;for(const c of t){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const mf=m=>440*2**((m-69)/12);
function parseWord(w,en){
 w=w.replace(/ng'/g,'NGQ').replace(/'/g,'').replace(/NGQ/g,"ng'");
 if(/^[mn]+$/.test(w))return[{v:['N'],o:[],k:[]}];
 w=w.replace(/([aeiou])h$/,'$1');if(en&&w.length>3&&/[^aeiouy]e$/.test(w)&&/[aeiouy].*[^aeiouy]e$/.test(w))w=w.slice(0,-1);
 const isV=(c,k)=>'aeiou'.includes(c)||(en&&c=='y'&&k>0&&(k==w.length-1||!'aeiou'.includes(w[k+1])));
 const U=[];let k=0;
 while(k<w.length){const r=w.slice(k);let m;
  if(isV(w[k],k)){if(en&&(m=r.match(/^(igh|ee|ea|ie|oo|ou|ow|ai|ay|ei|oi|oy)/))){U.push({V:EV[m[1]]});k+=m[1].length}
   else{const c=w[k];U.push({V:[c=='y'?'i':c=='u'&&en&&k<w.length-1&&!'aeiou'.includes(w[k+1])?'a':c]});k++}}
  else{m=r.match(en?/^(sh|ch|th|ph|ck|ng|wh|qu|[a-z])/:/^(nch|nsh|ng'|mb|nd|ng|nk|nj|ns|nt|nz|mp|mf|ny|sh|ch|ts|th|ph|kh|zh|[a-z])/);let t=m?m[1]:w[k];k+=t.length;
   let a=(en?PEN:PRE)[t]||[t];if(en&&t=='c')a=[/^[eiy]/.test(w[k]||'')?'s':'k'];if(a.length==1&&CON[a[0]]==null)a=['h'];
   a.forEach(x=>{const L=U[U.length-1];if(!(L&&L.C&&L.C==x))U.push({C:x})})}}
 const syl=[];let pend=[];
 const flush=()=>pend.map(u=>u.C);
 U.forEach(u=>{if(u.C){pend.push(u);return}
  let on=flush();pend=[];
  if(en&&syl.length&&on.length>=2){syl[syl.length-1].k.push(on[0]);on=on.slice(1)}
  syl.push({v:u.V,o:on,k:[]})});
 const tr=flush();
 if(tr.length){if(en&&syl.length)syl[syl.length-1].k.push(...tr);else if(syl.length){const sib=/s|sh|ch|j|z|ny/.test(tr[tr.length-1]);syl.push({v:[sib?'i':'u'],o:tr,k:[],ep:1})}else syl.push({v:['N'],o:[],k:[]})}
 return syl}
function syl(line,en){const out=[];line.toLowerCase().replace(/[\u2019]/g,"'").replace(/[^a-z' ]/g,' ').split(/\s+/).filter(Boolean).forEach(w=>{parseWord(w,en).forEach((x,i)=>{x.acc=i==0?1.15:1;out.push(x)})});return out}
function melody(n,seed){const r=rng(seed);let i=2+(r()*3|0);const a=[];for(let k=0;k<n;k++){const pull=k/n>.75?-i*.3:(3-i)*.15;i+=[-2,-1,-1,0,1,1,2][r()*7|0]+Math.round(pull);i=Math.max(0,Math.min(7,i));a.push(i)}a[n-1]=[0,2,4][seed%3];return a}

function build(ctx,P){
 const {lines,beat,bars,S,minor,r0,voices,ins,revAmt}=P,len=ctx.length/SR;
 const noise=ctx.createBuffer(1,SR,SR),nd=noise.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=Math.random()*2-1;
 const ir=ctx.createBuffer(2,SR*2.4,SR);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**2.6}
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;comp.connect(ctx.destination);
 const conv=ctx.createConvolver();conv.buffer=ir;const rg=ctx.createGain();rg.gain.value=1;conv.connect(rg);rg.connect(comp);
 const mk=(g,send)=>{const b=ctx.createGain();b.gain.value=g;b.connect(comp);const s=ctx.createGain();s.gain.value=send;b.connect(s);s.connect(conv);return b};
 const vbus=mk(.9,revAmt),ibus=mk(.55,revAmt*.4);
 const N=(t,d,type,f,q,g,bus=ibus)=>{const s=ctx.createBufferSource();s.buffer=noise;s.loop=true;const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;const a=ctx.createGain();a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(b).connect(a).connect(bus);s.start(t,Math.random());s.stop(t+d+.02)};
 const T=(t,type,f,d,g,f2)=>{const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d*.5);const a=ctx.createGain();a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(g,t+.004);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a).connect(ibus);o.start(t);o.stop(t+d+.05)};
 const Sx=(t,type,f,d,g,att,rel,fc,det=0)=>{const o=ctx.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det;const a=ctx.createGain();a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(g,t+att);a.gain.setValueAtTime(g,t+d);a.gain.linearRampToValueAtTime(0,t+d+rel);let n=o;if(fc){const l=ctx.createBiquadFilter();l.frequency.value=fc;o.connect(l);n=l}n.connect(a).connect(ibus);o.start(t);o.stop(t+d+rel+.05)};
 const I={kick:t=>T(t,'sine',130,.28,1.1,42),
  djembe:(t,k)=>{if(k==0){T(t,'sine',150,.3,.9,80);N(t,.06,'lowpass',400,1,.3)}else if(k==1){T(t,'triangle',300,.18,.5,260);N(t,.05,'bandpass',900,2,.4)}else N(t,.07,'bandpass',2200,1.5,.7)},
  conga:(t,h)=>{T(t,'sine',h?420:310,.22,.6,h?380:270);N(t,.03,'bandpass',1500,1,.25)},
  shaker:(t,a)=>N(t,.05,'highpass',7000,.7,a?.3:.16),
  claps:t=>{for(let i=0;i<3;i++)N(t+i*.012,.09,'bandpass',1300,1.2,.5)},
  bass:(t,f,d)=>{T(t,'sine',f,d,.9);T(t,'sawtooth',f,d,.2)},
  marimba:(t,f)=>{T(t,'sine',f,.6,.5);T(t,'sine',f*4,.12,.15)},
  mbira:(t,f)=>{T(t,'triangle',f,1,.4);T(t,'sine',f*5.4,.15,.1);N(t,.03,'bandpass',4000,2,.05)},
  guitar:(t,f)=>{T(t,'triangle',f,.55,.35);T(t,'square',f*2,.2,.05)},
  organ:(t,f,d)=>[[1,.3],[2,.2],[3,.1],[4,.06]].forEach(([h,g])=>Sx(t,'sine',f*h,d,g*.6,.03,.12)),
  strings:(t,f,d)=>[-7,7].forEach(c=>Sx(t,'sawtooth',f,d,.07,.35,.4,1400,c)),
  flute:(t,f,d)=>{Sx(t,'sine',f,d,.28,.07,.12);N(t,d,'bandpass',f*2,2,.04)},
  brass:(t,f)=>Sx(t,'sawtooth',f,.18,.16,.025,.08,1800)};
 // instruments
 const prog=minor?[[0,'m'],[8,'M'],[3,'M'],[10,'M']]:[[0,'M'],[7,'M'],[9,'m'],[5,'M']];
 const has=k=>ins.includes(k),pt=(k,s)=>(S.p[k]||'')[s]==='x',st=beat/4,rr=rng(7);
 for(let b=0;b<bars;b++){const ch=prog[b%4],root=48+r0+ch[0],tri=[0,ch[1]=='M'?4:3,7].map(x=>root+x),bt=b*4*beat,intro=b<2,outro=b>=bars-2;
  for(let s=0;s<16;s++){const t=bt+s*st,q=s>>1;
   if(has('kick')&&pt('kick',s)&&b>0)I.kick(t);
   if(has('djembe')&&pt('dj',s))I.djembe(t,s%8==0?0:s%2?2:1);
   if(has('conga')&&pt('cg',s))I.conga(t,s%4!=0);
   if(has('shaker')&&pt('sh',s))I.shaker(t,s%4==0);
   if(has('claps')&&pt('cl',s)&&!intro)I.claps(t);
   if(has('bass')&&[0,6,10].includes(s))I.bass(t,mf(36+r0+ch[0]+(s==10?7:0)),st*3);
   if(has('marimba')&&s%2==0)I.marimba(t,mf(tri[q%3]+24));
   const mi=[0,3,6,8,11,14].indexOf(s);if(has('mbira')&&mi>=0)I.mbira(t,mf(tri[mi%3]+24));
   const gi=[0,3,6,8,10,13].indexOf(s);if(has('guitar')&&gi>=0)I.guitar(t,mf(tri[gi%3]+12));
   if(s==0){if(has('keys'))tri.forEach(m=>I.organ(t,mf(m+12),4*beat*.95));if(has('strings'))tri.forEach(m=>I.strings(t,mf(m+12),4*beat*.95))}
   if(has('brass')&&!intro&&b%2==1&&(s==3||s==10))tri.forEach(m=>I.brass(t,mf(m+24)));
   if(has('flute')&&(s==0||s==8)&&(intro||outro||b%4==3))I.flute(t,mf(tri[(s+b)%3]+36),beat*1.6)}}
 // voices
 const deg=minor?[0,3,5,7,10]:[0,2,4,7,9],note=(n,base)=>base+12*Math.floor(n/5)+deg[((n%5)+5)%5];
 const sing=(L,v,rand)=>{const n=L.sy.length,mel=L.mel,base=(v.g=='m'?45:55)+r0,t0=L.t[0]-.25;
  const osc=ctx.createOscillator();osc.type='sawtooth';const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=4.6+rand()*1.3;lg.gain.setValueAtTime(0,t0);lg.gain.linearRampToValueAtTime(v.vib,t0+.7);lfo.connect(lg).connect(osc.detune);osc.detune.value=(rand()-.5)*2*v.det;
  const amp=ctx.createGain();amp.gain.value=0;const pan=ctx.createStereoPanner();pan.pan.value=v.pan;amp.connect(pan).connect(vbus);
  const fs=[0,1,2,3].map(i=>{const b=ctx.createBiquadFilter();b.type='bandpass';b.Q.value=[8,10,12,6][i];const g=ctx.createGain();g.gain.value=[1,.8,.45,.25][i];osc.connect(b).connect(g).connect(amp);return b});
  fs[3].frequency.value=3300;const F=fs.slice(0,3);
  const ns=ctx.createBufferSource();ns.buffer=noise;ns.loop=true;const nb=ctx.createBiquadFilter();nb.type='bandpass';nb.frequency.value=2600;nb.Q.value=.8;const ng=ctx.createGain();ng.gain.value=.035;ns.connect(nb).connect(ng).connect(amp);
  const vf=(x,f0)=>{const b=VOW[x]||VOW.a,s=v.f;let F1=b[0]*s;F1=Math.max(F1,Math.min(f0*.95,F1*1.9));return[F1,b[1]*s,b[2]*s]};
  const at=(a,tt)=>{const K=CON[a]||CON.h;if(K.f)F.forEach((b,i)=>b.frequency.setTargetAtTime(K.f[i],tt,.01));amp.gain.setTargetAtTime(v.gain*K.v,tt,.008);if(K.nf&&v.nl)N(tt+(K.gap||.012),K.nd||.03,'bandpass',K.nf,1.4,K.ng*v.nl,vbus);return K.d};
  const end=L.end+rand()*.02;
  const on=L.sy.map(S=>{const d=S.o.map(a=>(CON[a]||CON.h).d),tot=d.reduce((x,y)=>x+y,0),sc=tot>.14?.14/tot:1;return{sc,tot:tot*sc}});
  for(let j=0;j<n;j++){const S=L.sy[j],t=L.t[j]+(rand()-.5)*v.jit,f=mf(note(mel[j]+v.off,base)),vw=vf(S.v[0],f),tOn=t-on[j].tot;
   if(j==0){osc.frequency.setValueAtTime(f,t0);F.forEach((b,i)=>b.frequency.setValueAtTime(vw[i],t0))}
   osc.frequency.setTargetAtTime(f,tOn-.03,.03);
   if(!S.o.length&&!S.m&&j>0)amp.gain.setTargetAtTime(v.gain*.3,t-.045,.01);
   let tt=tOn;S.o.forEach(a=>{tt+=at(a,tt)*on[j].sc});
   F.forEach((b,i)=>b.frequency.setTargetAtTime(vw[i],t-.006,.014));
   amp.gain.setTargetAtTime(v.gain*(S.acc||1)*(S.m?.92:1),t-.004,.014);
   const nxt=j<n-1?L.t[j+1]-on[j+1].tot:end;
   if(S.v[1]){const v2=vf(S.v[1],f);F.forEach((b,i)=>b.frequency.setTargetAtTime(v2[i],t+(nxt-t)*.45,.05))}
   if(S.k.length){const tot=Math.min(.12,S.k.reduce((x,a)=>x+(CON[a]||CON.h).d,0));let tk=nxt-tot-.015;S.k.forEach(a=>{tk+=at(a,tk)})}}
  amp.gain.setTargetAtTime(0,end,.07);osc.start(t0);lfo.start(t0);ns.start(t0);[osc,lfo,ns].forEach(x=>x.stop(end+.8))};
 lines.forEach((L,li)=>voices.forEach((v,vi)=>sing(L,v,rng(hash(L.txt)+vi*977+li))));
}

function plan(){
 const lyr=$('#lyr').value.split('\n').map(s=>s.trim()).filter(s=>s&&!/^\[.*\]$/.test(s)).slice(0,48);
 if(!lyr.length)throw new Error('Add some lyrics first.');
 const desc=$('#desc').value.toLowerCase();let sty=$('#sty').value;if(sty==='auto')sty=detect(desc);const S=STY[sty];
 const bpm=S.bpm+(/fast|upbeat|energetic|dance|lively|joy/.test(desc)?14:0)-(/slow|gentle|soft|calm|peace/.test(desc)?16:0),beat=60/bpm;
 const minor=/sad|sorrow|cry|mourn|funeral|pain|lonely|minor|grief/.test(desc);
 const r0=[0,2,3,5,7][hash(desc+lyr[0])%5];
 let ins=checks().filter(c=>c.checked).map(c=>c.value);if(!touched){ins=S.ins.slice();setIns(ins)}
 const mode=document.querySelector('input[name=v]:checked').value;const lg=$('#lang').value,en=lg=='english'||(lg=='auto'&&(lyr.join(' ').toLowerCase().match(/\\b(the|and|you|my|your|is|of|to|in|with|for|we|me|are|all|love|heart|lord|oh)\\b/g)||[]).length>=3);
 const V=(g,off,gain,pan,det=6,cons=.45)=>({g,off,gain,pan,det,vib:14,jit:.01,f:g=='m'?1:1.17,nl:det>=14?0:cons});
 const voices={male:[V('m',0,.9,0,5,1),V('m',0,.45,.15,14)],female:[V('f',0,.9,0,5,1),V('f',0,.45,-.15,14)],
  duet:[V('f',0,.85,-.2,6,1),V('m',0,.85,.2,6,1)],
  choir:[V('f',0,.6,-.5),V('f',-2,.55,-.2,9),V('m',2,.55,.2,9),V('m',-2,.65,.5,9),V('f',0,.4,.6,14),V('m',0,.4,-.6,14)],
  ens:[V('f',0,.85,-.1,5,1),V('m',0,.8,.1,5,1),V('f',-2,.38,-.6,10),V('m',2,.38,.6,10),V('m',-2,.45,.3,10),V('f',2,.3,-.3,12)]}[mode];
 let cur=8;const lines=[],times=[];
 lyr.forEach(txt=>{const sy=syl(txt,en);if(!sy.length)return;const m=sy.length,last=sy[m-1];
  sy.push({v:last.v,o:[],k:[],m:1},{v:last.v,o:[],k:[],m:1});const n=m+2,lb=Math.max(8,Math.ceil(n/4)*4),sp=Math.min(1.25,Math.max(.5,lb/(n+1.5))),seed=hash(txt.toLowerCase()),mel=melody(m+2,seed),x=[0,2,4][seed%3];
  mel[m-1]=x+2;mel[m]=x+1;mel[m+1]=x;
  const t=sy.map((_,j)=>(cur+.5+(j<m?j*sp:(m-1)*sp+sp*(j==m?1.2:2.3)))*beat);const end=Math.min((cur+lb)*beat-.1,t[n-1]+beat*1.6);
  lines.push({txt,sy,mel,t,end});times.push({t:cur*beat,txt});cur+=lb});
 const bars=(cur+8)/4;
 return {en,lines,times,beat,bars,S,minor,r0,voices,ins,revAmt:+$('#rev').value,len:bars*4*beat+3.5,sty,bpm:Math.round(bpm),mode};
}

function setP(p,label,t0){$('#fill').style.width=p+'%';$('#pc').textContent=Math.round(p)+'% done';$('#ph').textContent=label;
 const el=(performance.now()-t0)/1000,rem=p>4?Math.max(0,Math.round(el*(100-p)/p)):null;$('#sc').textContent=rem===null?'estimating…':rem+' s remaining'}

async function render(P,t0){
 const len=Math.ceil(P.len*SR),ctx=new OfflineAudioContext(2,len,SR);
 setP(4,'Writing the melody and harmony',t0);await tick();build(ctx,P);setP(14,'Singing and playing',t0);await tick();
 const step=2;for(let s=step;s<P.len-.5;s+=step){const at=Math.ceil(s*SR/128)*128/SR;ctx.suspend(at).then(async()=>{setP(14+58*at/P.len,'Singing and playing',t0);await tick();ctx.resume()})}
 const buf=await ctx.startRendering();
 setP(74,'Mixing',t0);await tick();
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0;for(let i=0;i<L.length;i++){const a=Math.max(Math.abs(L[i]),Math.abs(R[i]));if(a>pk)pk=a}const k=.89/(pk||1);
 const enc=new lamejs.Mp3Encoder(2,SR,128),chunks=[],B=1152;const i16=(x,o,n)=>{const a=new Int16Array(n);for(let i=0;i<n;i++)a[i]=Math.max(-1,Math.min(1,x[o+i]*k))*32767;return a};
 let blocks=0;for(let o=0;o<L.length;o+=B){const n=Math.min(B,L.length-o);const m=enc.encodeBuffer(i16(L,o,n),i16(R,o,n));if(m.length)chunks.push(m);if(++blocks%150==0){setP(76+23*o/L.length,'Encoding MP3',t0);await tick()}}
 const f=enc.flush();if(f.length)chunks.push(f);return new Blob(chunks,{type:'audio/mpeg'})}

$('#go').onclick=async()=>{
 $('#err').textContent='';$('#done').style.display='none';
 let P;try{P=plan()}catch(e){$('#err').textContent=e.message;return}
 $('#go').disabled=true;$('#prog').style.display='block';const t0=performance.now();
 try{const blob=await render(P,t0);setP(100,'Finished',t0);$('#sc').textContent='0 s remaining';
  out={blob,name:($('#title').value.trim()||P.lines[0].txt).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'laban-song',times:P.times};
  const au=$('#au');au.src=URL.createObjectURL(blob);
  const d=Math.round(P.len);$('#info').textContent=`${Math.floor(d/60)}:${String(d%60).padStart(2,'0')} · ${P.en?'English':'Bantu'} · ${P.sty} · ${P.bpm} BPM · ${P.ins.length} instruments · ${(blob.size/1048576).toFixed(1)} MB`;
  $('#prog').style.display='none';$('#done').style.display='block';$('#msg').textContent='';au.scrollIntoView({block:'center',behavior:'smooth'});
 }catch(e){$('#err').textContent='Something went wrong while composing: '+e.message+'. Try fewer lyric lines.';$('#prog').style.display='none'}
 $('#go').disabled=false};
$('#au').ontimeupdate=e=>{if(!out)return;let c='';for(const x of out.times)if(x.t<=e.target.currentTime+.3)c=x.txt;$('#now').textContent=c};
$('#again').onclick=()=>{$('#done').style.display='none';$('#au').pause();window.scrollTo({top:0,behavior:'smooth'})};
$('#dl').onclick=async()=>{if(!out)return;const m=$('#msg');
 try{const d=window.claude&&await claude.use('downloads');
  if(d){const z=new JSZip();z.file(out.name+'.mp3',out.blob);const zb=await z.generateAsync({type:'blob'});await d.save({filename:out.name+'.zip',data:zb});m.textContent='Saved. This viewer only allows certain file types, so your MP3 is inside the zip. Unzip it to get '+out.name+'.mp3.'}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(out.blob);a.download=out.name+'.mp3';a.click();m.textContent='Downloading '+out.name+'.mp3'}
 }catch(e){m.textContent=e&&e.code==='declined'?'Download cancelled.':'Download failed. Try again.'}};
