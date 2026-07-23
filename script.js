// ===== BANCO DE DADOS =====
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

// ===== DATA ATUAL =====
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ===== FUNÇÕES: EDITAR E EXCLUIR =====
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
  
  document.getElementById('editId').value = ride.id;
  document.getElementById('editData').value = ride.date;
  document.getElementById('editKmRodados').value = ride.kmRodados.toFixed(2);
  document.getElementById('editValorBruto').value = ride.valorBruto.toFixed(2);
  document.getElementById('editPrecoCombustivel').value = ride.precoCombustivel.toFixed(2);
  document.getElementById('editKmPorLitro').value = ride.kmPorLitro.toFixed(1);
  document.getElementById('editAluguelDiario').value = ride.aluguelDiario.toFixed(2);
  
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

// ===== CÁLCULO POR VIAGEM =====
function calculateRideProfit(ride) {
  const { kmRodados, valorBruto, precoCombustivel, kmPorLitro } = ride;
  
  const custoCombustivel = (kmRodados / kmPorLitro) * precoCombustivel;
  const lucroViagem = valorBruto - custoCombustivel;
  
  return {
    custoCombustivel: custoCombustivel,
    lucroViagem: lucroViagem,
    ganhoPorKm: kmRodados > 0 ? valorBruto / kmRodados : 0,
    margem: valorBruto > 0 ? (lucroViagem / valorBruto) * 100 : 0
  };
}

// ===== DASHBOARD COM SELETOR DE DATA =====
let selectedDate = getToday();

function updateDashboard() {
  const rides = getRides();
  const today = getToday();
  
  // Atualizar display da data
  document.getElementById('displayDate').textContent = formatDate(selectedDate);
  
  // Filtrar corridas pela data selecionada
  const dayRides = rides.filter(r => r.date === selectedDate);
  
  if (dayRides.length === 0) {
    document.getElementById('lucroLiquido').textContent = 'R$ 0,00';
    document.getElementById('ganhoPorKm').textContent = 'R$ 0,00';
    document.getElementById('totalCorridas').textContent = '0';
    document.getElementById('margemMedia').textContent = '0.0%';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('recentRides').style.display = 'none';
    
    // Verificar se é o dia atual
    if (selectedDate === today) {
      document.getElementById('emptyState').innerHTML = 
        '<p>Nenhuma corrida registrada hoje.</p>' +
        '<p>Vá para Nova Corrida para começar.</p>';
    } else {
      document.getElementById('emptyState').innerHTML = 
        '<p>Nenhuma corrida registrada neste dia.</p>' +
        '<p>Selecione outra data.</p>';
    }
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('recentRides').style.display = 'block';
  
  let somaLucroViagens = 0;
  let somaBruto = 0;
  let somaKm = 0;
  let totalMargem = 0;
  
  dayRides.forEach(function(ride) {
    const result = calculateRideProfit(ride);
    somaLucroViagens += result.lucroViagem;
    somaBruto += ride.valorBruto;
    somaKm += ride.kmRodados;
    totalMargem += result.margem;
  });
  
  const aluguelDiario = dayRides[0].aluguelDiario || 0;
  const lucroDia = somaLucroViagens - aluguelDiario;
  const mediaMargem = dayRides.length > 0 ? totalMargem / dayRides.length : 0;
  const ganhoPorKm = somaKm > 0 ? somaBruto / somaKm : 0;
  
  document.getElementById('lucroLiquido').textContent = 'R$ ' + lucroDia.toFixed(2);
  document.getElementById('ganhoPorKm').textContent = 'R$ ' + ganhoPorKm.toFixed(2);
  document.getElementById('totalCorridas').textContent = dayRides.length;
  document.getElementById('margemMedia').textContent = mediaMargem.toFixed(1) + '%';
  
  // Listar corridas do dia
  const list = document.getElementById('ridesList');
  list.innerHTML = '';
  dayRides.forEach(function(ride) {
    const result = calculateRideProfit(ride);
    const div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML =
      '<div class="ride-info">' +
        '<span class="ride-km">' + ride.kmRodados.toFixed(2) + ' km</span>' +
        '<span style="font-size:12px;color:#999;">' + ride.date + '</span>' +
      '</div>' +
      '<div class="ride-value">R$ ' + ride.valorBruto.toFixed(2) + '</div>' +
      '<div class="ride-profit ' + (result.lucroViagem >= 0 ? 'positive' : 'negative') + '">' +
        (result.lucroViagem >= 0 ? '+' : '') + 'R$ ' + result.lucroViagem.toFixed(2) +
      '</div>';
    list.appendChild(div);
  });
}

function changeDate(delta) {
  const date = new Date(selectedDate + 'T00:00:00');
  date.setDate(date.getDate() + delta);
  selectedDate = date.toISOString().split('T')[0];
  updateDashboard();
}

function goToToday() {
  selectedDate = getToday();
  updateDashboard();
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayName = weekdays[date.getDay()];
  const parts = dateStr.split('-');
  return dayName + ', ' + parts[2] + '/' + parts[1] + '/' + parts[0];
}

// ===== HISTÓRICO COM NAVEGAÇÃO POR DIA =====
let historicoSelectedDate = getToday();

function updateHistorico() {
  const rides = getRides();
  const container = document.getElementById('historicoList');
  const summary = document.getElementById('daySummary');
  const today = getToday();
  
  // Atualizar display da data no histórico
  document.getElementById('historicoDate').textContent = formatDate(historicoSelectedDate);
  
  // Filtrar corridas pela data selecionada
  const dayRides = rides.filter(r => r.date === historicoSelectedDate);
  
  if (!container) return;
  
  if (dayRides.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Nenhuma corrida registrada neste dia.</p>';
    if (summary) {
      summary.style.display = 'block';
      summary.querySelector('.day-date').textContent = formatDate(historicoSelectedDate);
      summary.querySelector('.day-rides').textContent = '0 corrida';
      const profitEl = summary.querySelector('.day-profit');
      profitEl.textContent = 'Lucro do dia R$ 0,00';
      profitEl.className = 'day-profit';
    }
    return;
  }
  
  if (summary) summary.style.display = 'block';
  
  let somaViagens = 0;
  let aluguelDia = 0;
  
  dayRides.forEach(function(ride) {
    const result = calculateRideProfit(ride);
    somaViagens += result.lucroViagem;
    aluguelDia = ride.aluguelDiario || 0;
  });
  
  const lucroDia = somaViagens - aluguelDia;
  
  if (summary) {
    summary.querySelector('.day-date').textContent = formatDate(historicoSelectedDate);
    summary.querySelector('.day-rides').textContent = dayRides.length + ' corrida' + (dayRides.length > 1 ? 's' : '');
    const profitEl = summary.querySelector('.day-profit');
    profitEl.textContent = 'Lucro do dia R$ ' + lucroDia.toFixed(2);
    profitEl.className = 'day-profit ' + (lucroDia >= 0 ? 'positive' : 'negative');
  }
  
  // Listar todas as viagens do dia
  container.innerHTML = '';
  dayRides.forEach(function(ride) {
    const result = calculateRideProfit(ride);
    const div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML =
      '<div style="flex:1;">' +
        '<div class="ride-km">' + ride.kmRodados.toFixed(2) + ' km</div>' +
        '<div style="font-size:12px;color:#999;">' + ride.date + '</div>' +
      '</div>' +
      '<div style="text-align:right; margin-right:10px;">' +
        '<div class="ride-value">R$ ' + ride.valorBruto.toFixed(2) + '</div>' +
        '<div class="ride-profit ' + (result.lucroViagem >= 0 ? 'positive' : 'negative') + '">' +
          (result.lucroViagem >= 0 ? '+' : '') + 'R$ ' + result.lucroViagem.toFixed(2) +
        '</div>' +
      '</div>' +
      '<div style="display:flex; flex-direction:column; gap:4px;">' +
        '<button onclick="editRide(' + ride.id + ')" class="btn-edit">✏️</button>' +
        '<button onclick="deleteRide(' + ride.id + ')" class="btn-delete">🗑️</button>' +
      '</div>';
    container.appendChild(div);
  });
}

function changeHistoricoDate(delta) {
  const date = new Date(historicoSelectedDate + 'T00:00:00');
  date.setDate(date.getDate() + delta);
  historicoSelectedDate = date.toISOString().split('T')[0];
  updateHistorico();
}

function goToHistoricoToday() {
  historicoSelectedDate = getToday();
  updateHistorico();
}

// ===== VERIFICAR MUDANÇA DE DIA =====
let currentDay = getToday();

function checkDayChange() {
  const today = getToday();
  if (today !== currentDay) {
    currentDay = today;
    // Atualizar datas selecionadas para o dia atual
    selectedDate = today;
    historicoSelectedDate = today;
    updateDashboard();
    updateHistorico();
  }
}

// ===== NOVA CORRIDA =====
function setupNewRideForm() {
  const form = document.getElementById('rideForm');
  if (!form) return;
  
  // Setar data atual
  document.getElementById('data').value = getToday();
  
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
    document.getElementById('data').value = getToday();
    updateDashboard();
  });
}

// ===== RELÓGIO =====
function updateClock() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const horaAtual = horas + ':' + minutos;
  
  document.querySelectorAll('#horaAtual').forEach(function(el) {
    el.textContent = horaAtual;
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  updateClock();
  setInterval(updateClock, 30000);
  
  // Verificar mudança de dia a cada 60 segundos
  setInterval(checkDayChange, 60000);
  
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
  
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeEditModal();
    });
  }
});
