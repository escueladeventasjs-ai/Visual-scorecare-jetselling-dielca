const TEAMS = {
  A: ["Equipo A", "Constructora"],
  B: ["Equipo B", "Instaladores"],
  C: ["Equipo C", "Industria"],
  D: ["Equipo D", "Ingeniería"]
};

function get(id){
  return Number(document.getElementById(id).value || 0);
}

function getData(){
  return Object.keys(TEAMS).map(id => {
    const p = get("p" + id);
    const n = get("n" + id);
    return {
      id,
      name: TEAMS[id][0],
      sub: TEAMS[id][1],
      p,
      n,
      total: p + n
    };
  });
}

function saveAndRender(){
  const saved = {};
  Object.keys(TEAMS).forEach(id => {
    saved["p" + id] = document.getElementById("p" + id).value;
    saved["n" + id] = document.getElementById("n" + id).value;
  });
  localStorage.setItem("dielca-scoreboard-final-v2", JSON.stringify(saved));
  render();
}

function load(){
  const raw = localStorage.getItem("dielca-scoreboard-final-v2");
  if(!raw) return;
  try{
    const saved = JSON.parse(raw);
    Object.entries(saved).forEach(([id,value]) => {
      const el = document.getElementById(id);
      if(el) el.value = value;
    });
  }catch(e){}
}

function render(){
  const data = getData().sort((a,b) => b.total - a.total);
  const max = Math.max(...data.map(x => x.total), 1);
  const medals = ["🥇","🥈","🥉","#4"];

  const leader = data[0];
  document.getElementById("leaderName").textContent = leader.total > 0 ? leader.name : "Líder actual";
  document.getElementById("leaderScore").textContent = leader.total + " puntos";

  document.getElementById("ranking").innerHTML = data.map((x,i) => {
    const width = Math.round((x.total / max) * 100);
    return `
      <div class="rank ${i === 0 ? "first" : ""}">
        <div class="medal">${medals[i]}</div>
        <div>
          <div class="name">${x.name}</div>
          <div class="sub">${x.sub} · Prospección ${x.p} + Negociación ${x.n}</div>
        </div>
        <div class="pts">${x.total}</div>
        <div class="bar"><div style="width:${width}%"></div></div>
      </div>
    `;
  }).join("");
}

function resetAll(){
  if(confirm("¿Reiniciar todas las puntuaciones?")){
    Object.keys(TEAMS).forEach(id => {
      document.getElementById("p" + id).value = 0;
      document.getElementById("n" + id).value = 0;
    });
    localStorage.removeItem("dielca-scoreboard-final-v2");
    render();
  }
}

function toggleFullscreen(){
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen();
  }else{
    document.exitFullscreen();
  }
}

load();
render();
