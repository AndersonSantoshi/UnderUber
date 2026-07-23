const STORAGE_KEY = 'underUberRides';

function getRides() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRides(rides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

function addRide(ride) {
  const rides = getRides();
  ride.id = Date.now();
  ride.date = ride.date || new Date().toISOString().split('T')[0];
  rides.unshift(ride);
  saveRides(rides);
  return ride;
}

// ===== NOVAS FUNÇÕES: EDITAR E EXCLUIR =====

function deleteRide(id) {
  if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;
  let rides = getRides();
  rides = rides.filter(r => r.id !== id);
  saveRides(rides);
  updateHistorico();
  updateDashboard();
  alert('Viagem excluída com sucesso!');
}

function editRide(id) {
  const rides = getRides();
  const ride = rides.find(r => r.id === id);
  if (!ride) return;
  
  // Preencher o formulário com os dados da viagem
  document.getElementById('editId').value = ride.id;
  document.getElementById('editData').value = ride.date;
  document.getElementById('editKmRodados').value = ride.kmRodados;
  document.getElementById('editValorBruto').value = ride.valorBruto;
  document.getElementById('editPrecoCombustivel').value = ride.precoCombustivel;
  document.getElementById('editKmPorLitro').value = ride.kmPorLitro;
  document.getElementById('editAluguelDiario').value = ride.aluguelDiario || 0;
  
  // Mostrar o modal de edição
  document.getElementById('editModal').style.display = 'flex';
}

function saveEditRide() {
  const id = parseInt(document.getElementById('editId').value);
  const rides = getRides();
  const index = rides.findIndex(r => r.id === id);
  
  if (index === -1) return;
  
  rides[index] = {
    ...rides[index],
    date: document.getElementById('editData').value,
    kmRodados: parseFloat(document.getElementById('editKmRodados').value),
    valorBruto: parseFloat(document.getElementById('editValorBruto').value),
    precoCombustivel: parseFloat(document.getElementById('editPrecoCombustivel').value),
    kmPorLitro: parseFloat(document.getElementById('editKmPorLitro').value),
    aluguelDiario: parseFloat(document.getElementById('editAluguelDiario').value) || 0
  };
  
  saveRides(rides);
  closeEditModal();
  updateHistorico();
  updateDashboard();
  alert('Viagem atualizada com sucesso!');
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// ===== CALCULO POR VIAGEM (SÓ COMBUSTÍVEL) =====
function calculateRideProfit(ride) {
  const { kmRodados, valorBruto, precoCombustivel, kmPorLitro } = ride;
  
  const custoCombustivel = (kmRodados / kmPorLitro) * precoCombustivel;
  const lucroViagem = valorBruto - custoCombustivel;
  
  return {
    custoCombustivel,
    lucroViagem,
    ganhoPorKm: kmRodados > 0 ? valorBruto / kmRodados : 0,
    margem: valorBruto > 0 ? (lucroViagem / valorBruto) * 100 : 0
  };
}

// ===== DASHBOARD (COM ALUGUEL DIÁRIO) =====
function updateDashboard() {
  const rides = getRides();
  
  if (rides.length === 0) {
    document.getElementById('lucroLiquido').textContent = 'R$ 0,00';
    document.getElementById('ganhoPorKm').textContent = 'R$ 0,00';
    document.getElementById('totalCorridas').textContent = '0';
    document.getElementById('margemMedia').textContent = '0.0%';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('recentRides').style.display = 'none';
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('recentRides').style.display = 'block';
  
  // Agrupar viagens por dia
  const ridesByDay = {};
  rides.forEach(ride => {
    if (!ridesByDay[ride.date]) {
      ridesByDay[ride.date] = [];
    }
    ridesByDay[ride.date].push(ride);
  });
  
  let totalLucroLiquido = 0;
  let totalKm = 0;
  let totalBruto = 0;
  let totalMargem = 0;
  let totalViagens = rides.length;
  
  // Calcular lucro de cada dia (soma viagens - aluguel diário)
  Object.keys(ridesByDay).forEach(date => {
    const dayRides = ridesByDay[date];
    let somaLucroViagens = 0;
    let somaBruto = 0;
    let somaKm = 0;
    
    dayRides.forEach(ride => {
      const result = calculateRideProfit(ride);
      somaLucroViagens += result.lucroViagem;
      somaBruto += ride.valorBruto;
      somaKm += ride.kmRodados;
      totalMargem += result.margem;
    });
    
    // Pega o aluguel diário da PRIMEIRA viagem do dia
    const aluguelDiario = dayRides[0].aluguelDiario || 0;
    
    // Lucro líquido do dia = soma lucros - aluguel
    const lucroDia = somaLucroViagens - aluguelDiario;
    totalLucroLiquido += lucroDia;
    totalKm += somaKm;
    totalBruto += somaBruto;
  });
  
  const mediaMargem = totalViagens > 0 ? totalMargem / totalViagens : 0;
  const ganhoPorKm = totalKm > 0 ? totalBruto / totalKm : 0;
  
  document.getElementById('lucroLiquido').textContent = `R$ ${totalLucroLiquido.toFixed(2)}`;
  document.getElementById('ganhoPorKm').textContent = `R$ ${ganhoPorKm.toFixed(2)}`;
  document.getElementById('totalCorridas').textContent = totalViagens;
  document.getElementById('margemMedia').textContent = `${mediaMargem.toFixed(1)}%`;
  
  // Mostrar últimas 5 viagens (com lucro sem aluguel)
  const list = document.getElementById('ridesList');
  list.innerHTML = '';
  rides.slice(0, 5).forEach(ride => {
    const result = calculateRideProfit(ride);
    const div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML = `
      <div class="ride-info">
        <span class="ride-km">${ride.kmRodados} km</span>
        <span>${ride.date}</span>
      </div>
      <div class="ride-value">R$ ${ride.valorBruto.toFixed(2)}</div>
      <div class="ride-profit ${result.lucroViagem >= 0 ? 'positive' : 'negative'}">
        ${result.lucroViagem >= 0 ? '+' : ''}R$ ${result.lucroViagem.toFixed(2)}
      </div>
    `;
    list.appendChild(div);
  });
}

// ===== HISTÓRICO COM BOTÕES EDITAR/EXCLUIR =====
function updateHistorico() {
  const rides = getRides();
  const container = document.getElementById('historicoList');
  const summary = document.getElementById('daySummary');
  
  if (!container) return;
  
  if (rides.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Nenhuma corrida registrada.</p>';
    if (summary) summary.style.display = 'none';
    return;
  }
  
  if (summary) summary.style.display = 'block';
  
  // Agrupar por dia
  const days = {};
  rides.forEach(ride => {
    if (!days[ride.date]) days[ride.date] = [];
    days[ride.date].push(ride);
  });
  
  // Mostrar resumo do dia mais recente com aluguel
  const today = Object.keys(days)[0];
  const todayRides = days[today] || [];
  let somaViagens = 0;
  let aluguelDia = 0;
  
  todayRides.forEach(ride => {
    const result = calculateRideProfit(ride);
    somaViagens += result.lucroViagem;
    aluguelDia = ride.aluguelDiario || 0;
  });
  
  const lucroDia = somaViagens - aluguelDia;
  
  if (summary) {
    const dateObj = new Date(today + 'T00:00:00');
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayName = weekdays[dateObj.getDay()];
    const formattedDate = `${dayName}, ${today.split('-').reverse().join('/')}`;
    
    summary.querySelector('.day-date').textContent = formattedDate;
    summary.querySelector('.day-rides').textContent = `${todayRides.length} corrida${todayRides.length > 1 ? 's' : ''}`;
    const profitEl = summary.querySelector('.day-profit');
    profitEl.textContent = `Lucro do dia R$ ${lucroDia.toFixed(2)}`;
    profitEl.className = `day-profit ${lucroDia >= 0 ? 'positive' : 'negative'}`;
  }
  
  // Listar todas as viagens com botões
  container.innerHTML = '';
  rides.forEach(ride => {
    const result = calculateRideProfit(ride);
    const div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML = `
      <div style="flex:1;">
        <div class="ride-km">${ride.kmRodados} km</div>
        <div style="font-size:12px;color:#999;">${ride.date}</div>
      </div>
      <div style="text-align:right; margin-right:10px;">
        <div class="ride-value">R$ ${ride.valorBruto.toFixed(2)}</div>
        <div class="ride-profit ${result.lucroViagem >= 0 ? 'positive' : 'negative'}">
          ${result.lucroViagem >= 0 ? '+' : ''}R$ ${result.lucroViagem.toFixed(2)}
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button onclick="editRide(${ride.id})" class="btn-edit">✏️</button>
        <button onclick="deleteRide(${ride.id})" class="btn-delete">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ===== NOVA CORRIDA =====
function setupNewRideForm() {
  const form = document.getElementById('rideForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const ride = {
      date: document.getElementById('data').value,
      kmRodados: parseFloat(document.getElementById('kmRodados').value),
      valorBruto: parseFloat(document.getElementById('valorBruto').value),
      precoCombustivel: parseFloat(document.getElementById('precoCombustivel').value),
      kmPorLitro: parseFloat(document.getElementById('kmPorLitro').value),
      aluguelDiario: parseFloat(document.getElementById('aluguelDiario').value) || 0
    };
    
    if (!ride.kmRodados || !ride.valorBruto || !ride.precoCombustivel || !ride.kmPorLitro) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    
    addRide(ride);
    alert('Corrida salva com sucesso!');
    form.reset();
    updateDashboard();
  });
}

// ===== RELÓGIO =====
function updateClock() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const horaAtual = `${horas}:${minutos}`;
  
  document.querySelectorAll('#horaAtual').forEach(el => {
    el.textContent = horaAtual;
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  updateClock();
  setInterval(updateClock, 30000);
  
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path === '/' || path === '') {
    updateDashboard();
  }
  
  if (path.includes('nova-corrida')) {
    setupNewRideForm();
  }
  
  if (path.includes('historico')) {
    updateHistorico();
  }
  
  // Fechar modal ao clicar fora
  document.getElementById('editModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
  });
});
