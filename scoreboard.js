const teams={
  A:{name:'Equipo A',sub:'Constructora',input:'scoreA'},
  B:{name:'Equipo B',sub:'Instaladores',input:'scoreB'},
  C:{name:'Equipo C',sub:'Industria',input:'scoreC'},
  D:{name:'Equipo D',sub:'Ingeniería',input:'scoreD'}
};
let lastLeader=null, previousScores={A:0,B:0,C:0,D:0};

function getScores(){
  return Object.entries(teams).map(([id,t])=>({
    id,name:t.name,sub:t.sub,score:Number(document.getElementById(t.input).value||0)
  }));
}
function saveAndRender(){
  const data={phase:phase.value,round:round.value,A:scoreA.value,B:scoreB.value,C:scoreC.value,D:scoreD.value};
  localStorage.setItem('dielca-final-scoreboard',JSON.stringify(data));
  render();
}
function load(){
  const raw=localStorage.getItem('dielca-final-scoreboard');
  if(!raw)return;
  try{
    const d=JSON.parse(raw);
    phase.value=d.phase||phase.value; round.value=d.round||round.value;
    scoreA.value=d.A||0; scoreB.value=d.B||0; scoreC.value=d.C||0; scoreD.value=d.D||0;
    previousScores={A:+scoreA.value||0,B:+scoreB.value||0,C:+scoreC.value||0,D:+scoreD.value||0};
  }catch(e){}
}
function render(){
  mainTitle.textContent=phase.value.toUpperCase();
  roundLabel.textContent=round.value;
  const arr=getScores().sort((a,b)=>b.score-a.score);
  const max=Math.max(...arr.map(x=>x.score),1);
  const medals=['🥇','🥈','🥉','#4'];
  ranking.innerHTML=arr.map((s,i)=>{
    const width=Math.min(100,Math.round((s.score/max)*100));
    return `<div class="rank-row ${i===0?'first':''}" style="--w:${width}%">
      <div class="medal">${medals[i]}</div>
      <div><div class="team-name">${s.name}</div><div class="team-sub">${s.sub}</div></div>
      <div class="points">${s.score}</div>
      <div class="bar"><div style="width:${width}%"></div></div>
    </div>`;
  }).join('');
  const leader=arr[0];
  leaderBadge.textContent=leader.score>0?'Líder: '+leader.name:'Líder actual';
  mvpTeam.textContent=leader.score>0?leader.name:'—';
  mvpScore.textContent=leader.score+' pts';
  const jumps=getScores().map(s=>({id:s.id,name:s.name,diff:s.score-(previousScores[s.id]||0)})).sort((a,b)=>b.diff-a.diff);
  jumpTeam.textContent=jumps[0].diff>0?jumps[0].name:'—';
  jumpScore.textContent='+'+Math.max(0,jumps[0].diff);
  if(lastLeader && lastLeader!==leader.id && leader.score>0) showToast('🚀 '+leader.name+' sube al #1');
  lastLeader=leader.id;
}
function showToast(text){
  toast.textContent=text; toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2200);
}
function addPoints(t,pts){
  const el=document.getElementById(teams[t].input);
  previousScores[t]=Number(el.value||0);
  el.value=Number(el.value||0)+pts;
  lastMove.textContent=teams[t].name+' suma +'+pts+' puntos';
  saveAndRender();
}
function resetAll(){
  if(confirm('¿Reiniciar marcador?')){
    ['scoreA','scoreB','scoreC','scoreD'].forEach(id=>document.getElementById(id).value=0);
    previousScores={A:0,B:0,C:0,D:0};
    localStorage.removeItem('dielca-final-scoreboard');
    lastMove.textContent='Marcador reiniciado';
    render();
  }
}
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}
load(); render();
