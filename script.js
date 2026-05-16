let db = JSON.parse(localStorage.getItem('nm_final')) || { s: 0, m: {n:'---', v:0}, h: [], metas_list: [] };

function nav(id, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
    
    if(id === 'p-home') renderDashboard();
    if(id === 'p-metas') renderMetasPage();
    if(id === 'p-banca') renderBancaPage();
    if(id === 'p-gastos') renderGastosPage();
    if(id === 'p-notas') renderNotasPage();
    if(id === 'p-pasta') renderPastaPage();
}

function update() {
    localStorage.setItem('nm_final', JSON.stringify(db));
    document.getElementById('S-VAL').innerText = "R$ " + db.s.toFixed(2);
    document.getElementById('M-NOME').innerText = db.m.n;
    let p = db.m.v > 0 ? (db.s / db.m.v) * 100 : 0;
    document.getElementById('M-BAR').style.width = Math.min(100, Math.max(0, p)) + "%";
    
    renderDashboard();
    renderMetasPage();
    renderBancaPage();
    renderGastosPage();
    renderNotasPage();
    renderPastaPage();
}

function saveS() { 
    db.s = parseFloat(document.getElementById('in-s-v').value) || 0; 
    document.getElementById('in-s-v').value = ""; 
    update(); 
    alert("Saldo da banca updated!"); 
}

function saveM() { 
    let nome = document.getElementById('in-m-n').value.trim() || '---';
    let valor = parseFloat(document.getElementById('in-m-v').value) || 0;
    db.m.n = nome;
    db.m.v = valor;
    
    if(!db.metas_list) db.metas_list = [];
    db.metas_list.unshift({n: nome, v: valor});
    
    document.getElementById('in-m-n').value = "";
    document.getElementById('in-m-v').value = "";
    update(); 
    alert("Objetivo definido com sucesso!");
}

function addG() {
    let d = document.getElementById('g-d').value.trim();
    let v = parseFloat(document.getElementById('g-v').value);
    if(d && v) {
        db.s -= v;
        db.h.unshift({t: 'Gasto', n: d, v: `- R$ ${v.toFixed(2)}`, c: '#ff5252', txt: ''});
        document.getElementById('g-d').value = ""; 
        document.getElementById('g-v').value = "";
        update(); 
        alert("Gasto computado!");
    }
}

function saveN() {
    let t = document.getElementById('n-t').value.trim();
    let c = document.getElementById('n-c').value;
    if(t) {
        db.h.unshift({t: 'Nota', n: t, v: '📒 Ver', c: 'var(--main)', txt: c});
        document.getElementById('n-t').value = ""; 
        document.getElementById('n-c').value = "";
        update(); 
        alert("Nota arquivada com sucesso!");
    }
}

function deleteItem(index, event) {
    event.stopPropagation(); 
    if(confirm("Deseja deletar este registro permanentemente?")) {
        let item = db.h[index];
        
        if(item.t === 'Gasto') {
            let limpo = item.v.replace('- R$', '').trim();
            db.s += parseFloat(limpo) || 0;
        }
        
        db.h.splice(index, 1); 
        update();
    }
}

function renderDashboard() {
    const mContainer = document.getElementById('DASH-METAS');
    let mList = db.metas_list || [];
    if(mList.length === 0) {
        mContainer.innerHTML = `<div class="carousel-item"><span>Metas</span><b>Nenhuma</b></div>`;
    } else {
        mContainer.innerHTML = mList.map(item => `
            <div class="carousel-item">
                <span>Meta</span>
                <b>${item.n}</b>
                <span style="color:var(--main)">R$ ${item.v.toFixed(2)}</span>
            </div>
        `).join('');
    }

    const gContainer = document.getElementById('DASH-GASTOS');
    let gastos = db.h.filter(i => i.t === 'Gasto').slice(0, 3);
    if(gastos.length === 0) {
        gContainer.innerHTML = `<div class="dash-item" style="color:var(--text-sec)">Nenhum gasto registrado</div>`;
    } else {
        gContainer.innerHTML = gastos.map(g => `
            <div class="dash-item">
                <span style="font-weight:600;">💵 ${g.n}</span>
                <span style="color:#ff5252; font-weight:bold;">${g.v}</span>
            </div>
        `).join('');
    }

    const nContainer = document.getElementById('DASH-NOTA');
    let ultimaNota = db.h.find(i => i.t === 'Nota');
    if(!ultimaNota) {
        nContainer.innerHTML = `<small>Última Nota</small><div style="color:var(--text-sec); margin-top:5px;">Nenhuma nota criada ainda.</div>`;
        nContainer.onclick = null;
    } else {
        nContainer.innerHTML = `
            <small style="color:var(--main)">📒 ${ultimaNota.n}</small>
            <div style="font-size:14px; margin-top:5px; opacity:0.8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${ultimaNota.txt || "(Nota vazia)"}
            </div>
        `;
        nContainer.onclick = () => openModalWithContent(ultimaNota.n, ultimaNota.txt);
    }
}

function renderMetasPage() {
    document.getElementById('PAGE-M-NOME').innerText = db.m.n;
    let p = db.m.v > 0 ? (db.s / db.m.v) * 100 : 0;
    p = Math.min(100, Math.max(0, p));
    document.getElementById('PAGE-M-PERC').innerText = p.toFixed(0) + "%";
    document.getElementById('PAGE-M-BAR').style.width = p + "%";

    const pageListContainer = document.getElementById('PAGE-METAS-LIST');
    let mList = db.metas_list || [];
    if(mList.length === 0) {
        pageListContainer.innerHTML = `<div class="dash-item" style="color:var(--text-sec)">Nenhum objetivo registrado</div>`;
    } else {
        pageListContainer.innerHTML = mList.map(item => `
            <div class="dash-item">
                <span style="font-weight: 600;">🎯 ${item.n}</span>
                <span style="color: var(--main); font-weight: bold;">R$ ${item.v.toFixed(2)}</span>
            </div>
        `).join('');
    }
}

function renderBancaPage() {
    document.getElementById('PAGE-B-VAL').innerText = "R$ " + db.s.toFixed(2);
}

function renderGastosPage() {
    let totalGasto = 0;
    let soGastos = db.h.filter(i => i.t === 'Gasto');
    soGastos.forEach(g => {
        let limpo = g.v.replace('- R$', '').trim();
        totalGasto += parseFloat(limpo) || 0;
    });
    document.getElementById('PAGE-G-TOTAL').innerText = "R$ " + totalGasto.toFixed(2);

    const gPageList = document.getElementById('PAGE-GASTOS-LIST');
    if(soGastos.length === 0) {
        gPageList.innerHTML = `<div class="dash-item" style="color:var(--text-sec)">Nenhum débito na lista</div>`;
    } else {
        gPageList.innerHTML = soGastos.map(g => `
            <div class="dash-item" style="border-left: 3px solid var(--gasto);">
                <span style="font-weight:600;">💸 ${g.n}</span>
                <span style="color:var(--gasto); font-weight:700;">${g.v}</span>
            </div>
        `).join('');
    }
}

function renderNotasPage() {
    let soNotas = db.h.filter(i => i.t === 'Nota');
    document.getElementById('PAGE-N-COUNT').innerText = soNotas.length;

    const nPageList = document.getElementById('PAGE-NOTAS-LIST');
    if(soNotas.length === 0) {
        nPageList.innerHTML = `<div class="dash-item" style="color:var(--text-sec)">Nenhuma anotação criada</div>`;
    } else {
        nPageList.innerHTML = soNotas.map((n, idx) => {
            let realIdx = db.h.findIndex(item => item === n);
            return `
                <div class="dash-item" style="border-left: 3px solid var(--main); cursor:pointer;" onclick="openNote(${realIdx})">
                    <span style="font-weight:600;">📒 ${n.n}</span>
                    <span style="color:var(--main); font-size:12px;">Abrir 🔍</span>
                </div>
            `;
        }).join('');
    }
}

function renderPastaPage() {
    document.getElementById('PAGE-P-COUNT').innerText = db.h.length + " registros";
    
    const containerPasta = document.getElementById('LISTA');
    if(db.h.length === 0) {
        containerPasta.innerHTML = `<div class="dash-item" style="color:var(--text-sec); text-align:center;">Nenhum arquivo ou log em memória</div>`;
        return;
    }

    containerPasta.innerHTML = db.h.map((i, idx) => {
        let borderCor = i.t === 'Gasto' ? 'var(--gasto)' : 'var(--main)';
        return `
            <div class="log-item" style="border-left: 4px solid ${borderCor}; cursor: pointer;" onclick="openNote(${idx})">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: 11px; color: var(--text-sec); font-weight: bold; text-transform: uppercase;">[${i.t}]</span>
                    <span style="font-weight: 600; color: white;">${i.n}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="color:${i.c}; font-weight: bold; font-size: 14px;">${i.v}</span>
                    <button class="btn-del" onclick="deleteItem(${idx}, event)">Apagar ❌</button>
                </div>
            </div>
        `;
    }).join('');
}

function openNote(index) {
    let item = db.h[index];
    if(item && item.t === 'Nota') { openModalWithContent(item.n, item.txt); }
}

function openModalWithContent(title, body) {
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-body').innerText = body || "(Sem conteúdo)";
    document.getElementById('noteModal').classList.add('active');
}

function closeModal() { document.getElementById('noteModal').classList.remove('active'); }
function clearAll() { if(confirm("Aviso: Isso irá deletar todas as Notas e Gastos da memória de forma irreversível. Continuar?")) { db = {s:0, m:{n:'---', v:0}, h:[], metas_list:[]}; update(); } }

update();