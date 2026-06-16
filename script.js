const TEAMS={A:['Equipo A','Constructora'],B:['Equipo B','Instaladores'],C:['Equipo C','Industria'],D:['Equipo D','Ingeniería']};

const SCORECARDS={
  prospection:[
    ['Hipótesis habla del cliente',20],
    ['Identifica riesgo real',20],
    ['Conecta con impacto',20],
    ['Genera curiosidad',15],
    ['Evita producto/precio',15],
    ['Cierra siguiente paso',10]
  ],
  negotiation:[
    ['Reconoce sin defenderse',15],
    ['Profundiza antes de responder',20],
    ['Neutraliza otras barreras',15],
    ['Reencuadra hacia valor',25],
    ['Mantiene calma comercial',10],
    ['Cierra compromiso concreto',15]
  ]
};

let selectedTeam='A';

function init(){
  buildInputs();
  buildModeratorButtons();
  load();
  selectModeratorTeam('A');
  render();
}

function buildInputs(){
  const jp=document.getElementById('juryProspection'), jn=document.getElementById('juryNegotiation');
  jp.innerHTML=''; jn.innerHTML='';
  Object.entries(TEAMS).forEach(([id,t])=>{
    jp.innerHTML += `<div class="entry"><span>${t[0]} · ${t[1]}</span><input id="jp${id}" type="number" min="0" max="100" value="0" oninput="saveAndRender()"></div>`;
    jn.innerHTML += `<div class="entry"><span>${t[0]} · ${t[1]}</span><input id="jn${id}" type="number" min="0" max="100" value="0" oninput="saveAndRender()"></div>`;
  });
}

function buildModeratorButtons(){
  const box=document.getElementById('moderatorTeamButtons');
  box.innerHTML='';
  Object.entries(TEAMS).forEach(([id,t])=>{
    box.innerHTML += `<button id="btn${id}" onclick="selectModeratorTeam('${id}')">${id} · ${t[1]}</button>`;
  });
}

function key(team, phase, i){return `m_${phase}_${team}_${i}`}

function currentPhase(){return document.getElementById('modPhase').value}

function selectModeratorTeam(id){
  selectedTeam=id;
  Object.keys(TEAMS).forEach(k=>document.getElementById('btn'+k).classList.toggle('active',k===id));
  const phase=currentPhase();
  const labels=SCORECARDS[phase];
  const box=document.getElementById('moderatorScorecard');
  box.innerHTML = `<h3>${TEAMS[id][0]} · ${TEAMS[id][1]} · ${phase==='prospection'?'Prospección':'Negociación'}</h3><p class="hint">Mismos criterios que usa el jurado en esta fase.</p><div class="criteria">`+
    labels.map((c,i)=>`<div class="criterion">
      <label>${c[0]}</label>
      <small>Peso: ${c[1]}%</small>
      <input id="${key(id,phase,i)}" type="range" min="0" max="10" value="${getSaved(key(id,phase,i),5)}" data-weight="${c[1]}" oninput="saveAndRender(); updateModeratorTotal('${id}')">
      <b id="v_${key(id,phase,i)}">${getSaved(key(id,phase,i),5)}</b>
    </div>`).join('')+
    `</div><div class="mod-total" id="modTotal">Moderador: 50/100</div>`;
  updateModeratorTotal(id);
}

function getSaved(k, fallback){
  const raw=localStorage.getItem('dielca-score-mod60-secret');
  if(!raw) return fallback;
  try{return JSON.parse(raw)[k] ?? fallback;}catch(e){return fallback;}
}

function val(id){return Number(document.getElementById(id)?.value || 0)}

function moderatorPhaseScore(id, phase){
  const labels=SCORECARDS[phase];
  let total=0;
  labels.forEach((c,i)=>{
    const el=document.getElementById(key(id,phase,i));
    const v=el ? Number(el.value) : Number(getSaved(key(id,phase,i),5));
    total += v*c[1]/10;
  });
  return Math.round(total);
}

function moderatorScore(id){
  return Math.round((moderatorPhaseScore(id,'prospection') + moderatorPhaseScore(id,'negotiation'))/2);
}

function updateModeratorTotal(id){
  const phase=currentPhase();
  SCORECARDS[phase].forEach((c,i)=>{
    const el=document.getElementById(key(id,phase,i));
    const b=document.getElementById('v_'+key(id,phase,i));
    if(el && b) b.textContent=el.value;
  });
  const mt=document.getElementById('modTotal');
  if(mt) mt.textContent=`Moderador ${phase==='prospection'?'Prospección':'Negociación'}: ${moderatorPhaseScore(id,phase)}/100`;
  render();
}

function juryAverage(id){return Math.round((val('jp'+id)+val('jn'+id))/2)}

function finalScore(id){
  const jury=juryAverage(id);
  const mod=moderatorScore(id);
  return Math.round((jury*0.40 + mod*0.60)*10)/10;
}

function getRankingData(){
  return Object.entries(TEAMS).map(([id,t])=>({
    id,name:t[0],sub:t[1],
    pros:val('jp'+id),neg:val('jn'+id),
    jury:juryAverage(id),
    modPros:moderatorPhaseScore(id,'prospection'),
    modNeg:moderatorPhaseScore(id,'negotiation'),
    mod:moderatorScore(id),
    final:finalScore(id)
  }));
}

function render(){
  const data=getRankingData().sort((a,b)=>b.final-a.final);
  const max=Math.max(...data.map(x=>x.final),1);
  const medals=['🥇','🥈','🥉','#4'];
  const leader=data[0];
  document.getElementById('leaderName').textContent=leader.final>0?leader.name:'—';
  document.getElementById('leaderScore').textContent=leader.final+' pts';

  document.getElementById('ranking').innerHTML=data.map((x,i)=>{
    const width=Math.round((x.final/max)*100);
    return `<div class="rank ${i===0?'first':''}">
      <div class="medal">${medals[i]}</div>
      <div>
        <div class="name">${x.name}</div>
        <div class="sub">${x.sub} · Jurado ${x.jury}/100 · Moderador ${x.mod}/100</div>
      </div>
      <div class="pts">${x.final}</div>
      <div class="bar"><div style="width:${width}%"></div></div>
    </div>`;
  }).join('');

  const publicData=getRankingData().sort((a,b)=>b.jury-a.jury);
  const maxPub=Math.max(...publicData.map(x=>x.jury),1);
  document.getElementById('publicAward').innerHTML=publicData.map((x,i)=>{
    const width=Math.round((x.jury/maxPub)*100);
    return `<div class="rank ${i===0?'first':''}">
      <div class="medal">${medals[i]}</div>
      <div>
        <div class="name">${x.name}</div>
        <div class="sub">${x.sub} · Prospección ${x.pros} + Negociación ${x.neg}</div>
      </div>
      <div class="pts">${x.jury}</div>
      <div class="bar"><div style="width:${width}%"></div></div>
    </div>`;
  }).join('');
}

function saveAndRender(){
  const d={};
  Object.keys(TEAMS).forEach(id=>{
    d['jp'+id]=document.getElementById('jp'+id).value;
    d['jn'+id]=document.getElementById('jn'+id).value;
    Object.keys(SCORECARDS).forEach(phase=>{
      SCORECARDS[phase].forEach((c,i)=>{
        const el=document.getElementById(key(id,phase,i));
        d[key(id,phase,i)] = el ? el.value : getSaved(key(id,phase,i),5);
      });
    });
  });
  localStorage.setItem('dielca-score-mod60-secret', JSON.stringify(d));
  updateModeratorTotal(selectedTeam);
  render();
}

function load(){
  const raw=localStorage.getItem('dielca-score-mod60-secret');
  if(!raw) return;
  try{
    const d=JSON.parse(raw);
    Object.entries(d).forEach(([k,v])=>{
      const el=document.getElementById(k);
      if(el) el.value=v;
    });
  }catch(e){}
}

function showTab(id, btn){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if(id==='moderator'){
    document.getElementById('publicView').style.display='none';
    document.querySelector('footer').style.display='none';
  }else{
    document.getElementById('publicView').style.display='block';
    document.querySelector('footer').style.display='flex';
  }

  document.querySelectorAll('.public-actions button').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  render();
}

function resetAll(){
  if(confirm('¿Reiniciar todas las puntuaciones?')){
    localStorage.removeItem('dielca-score-mod60-secret');
    location.reload();
  }
}

function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

init();
