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

// ===== DASHBOARD =====
let selectedDate = getToday();

function updateDashboard() {
  const rides = getRides();
  const today = getToday();
  
  document.getElementById('displayDate').textContent = formatDate(selectedDate);
  
  const dayRides = rides.filter(r => r.date === selectedDate);
  
  if (dayRides.length === 0) {
    document.getElementById('lucroLiquido').textContent = 'R$ 0,00';
    document.getElementById('ganhoPorKm').textContent = 'R$ 0,00';
    document.getElementById('totalCorridas').textContent = '0';
    document.getElementById('margemMedia').textContent = '0.0%';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('recentRides').style.display = 'none';
    
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

// ===== HISTÓRICO =====
let historicoSelectedDate = getToday();

function updateHistorico() {
  const rides = getRides();
  const container = document.getElementById('historicoList');
  const summary = document.getElementById('daySummary');
  const today = getToday();
  
  document.getElementById('historicoDate').textContent = formatDate(historicoSelectedDate);
  
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

// ===== FUNÇÕES DE EXPORT =====

function formatDate(dateStr) {
  const parts = dateStr.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// ===== GERAR PDF =====
function generatePDF() {
  const rides = getRides();
  if (rides.length === 0) {
    alert('📭 Nenhuma corrida registrada!');
    return;
  }
  
  let totalBruto = 0;
  let totalLucro = 0;
  let totalKm = 0;
  let totalCombustivel = 0;
  
  rides.forEach(function(ride) {
    const result = calculateRideProfit(ride);
    totalBruto += ride.valorBruto;
    totalLucro += result.lucroViagem;
    totalKm += ride.kmRodados;
    totalCombustivel += result.custoCombustivel;
  });
  
  let html = '<html><head><meta charset="UTF-8">';
  html += '<style>';
  html += 'body { font-family: "Helvetica", Arial, sans-serif; padding: 30px; background: #f5f5f5; }';
  html += '.container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }';
  html += 'h1 { color: #1a1a2e; text-align: center; font-size: 24px; margin-bottom: 5px; }';
  html += '.subtitle { text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }';
  html += '.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e94560; padding-bottom: 15px; }';
  html += '.header .icon { font-size: 40px; }';
  html += '.header small { color: #666; }';
  html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }';
  html += 'th { background: #1a1a2e; color: white; padding: 10px 8px; text-align: left; }';
  html += 'td { padding: 8px; border-bottom: 1px solid #eee; }';
  html += 'tr:nth-child(even) { background: #f9f9f9; }';
  html += '.resumo { background: #e8f5e9; padding: 15px 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2ecc71; }';
  html += '.resumo h3 { margin: 0 0 10px 0; color: #1a1a2e; }';
  html += '.resumo p { margin: 5px 0; font-size: 14px; }';
  html += '.resumo .value { font-weight: bold; }';
  html += '.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }';
  html += '.positive { color: #2ecc71; }';
  html += '.negative { color: #e74c3c; }';
  html += '.btn-voltar { display: block; width: 100%; padding: 14px; background: #e94560; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; text-align: center; text-decoration: none; }';
  html += '.btn-voltar:hover { background: #c23152; }';
  html += '.no-print { display: block; }';
  html += '@media print { .no-print { display: none !important; } .container { box-shadow: none !important; } }';
  html += '</style></head><body>';
  
  html += '<div class="container">';
  
  // Cabeçalho
  html += '<div class="header">';
  html += '<div class="icon">🚗</div>';
  html += '<h1>UnderUber</h1>';
  html += '<div class="subtitle">Relatório de Corridas</div>';
  html += '<small>Gerado em: ' + new Date().toLocaleString('pt-BR') + '</small>';
  html += '</div>';
  
  // Resumo
  html += '<div class="resumo">';
  html += '<h3>📊 RESUMO DO PERÍODO</h3>';
  html += '<p>📍 Total de Corridas: <span class="value">' + rides.length + '</span></p>';
  html += '<p>📏 Total KM Rodados: <span class="value">' + totalKm.toFixed(2) + ' km</span></p>';
  html += '<p>💰 Valor Bruto Total: <span class="value">R$ ' + totalBruto.toFixed(2) + '</span></p>';
  html += '<p>⛽ Total Combustível: <span class="value">R$ ' + totalCombustivel.toFixed(2) + '</span></p>';
  html += '<p>💵 Lucro Total: <span class="value positive">R$ ' + totalLucro.toFixed(2) + '</span></p>';
  html += '</div>';
  
  // Tabela
  html += '<h3 style="margin-top:25px;">📋 DETALHES DAS CORRIDAS</h3>';
  html += '<table>';
  html += '<tr><th>#</th><th>Data</th><th>KM</th><th>Valor (R$)</th><th>Combustível (R$)</th><th>Lucro (R$)</th></tr>';
  
  rides.forEach(function(ride, index) {
    const result = calculateRideProfit(ride);
    const profitClass = result.lucroViagem >= 0 ? 'positive' : 'negative';
    html += '<tr>';
    html += '<td>' + (index + 1) + '</td>';
    html += '<td>' + formatDate(ride.date) + '</td>';
    html += '<td>' + ride.kmRodados.toFixed(2) + '</td>';
    html += '<td>R$ ' + ride.valorBruto.toFixed(2) + '</td>';
    html += '<td>R$ ' + result.custoCombustivel.toFixed(2) + '</td>';
    html += '<td class="' + profitClass + '">R$ ' + result.lucroViagem.toFixed(2) + '</td>';
    html += '</tr>';
  });
  
  html += '</table>';
  
  html += '<div class="footer">';
  html += '🚗 UnderUber - App para motoristas<br>';
  html += 'Dados salvos em ' + new Date().toLocaleString('pt-BR');
  html += '</div>';
  
  // BOTÃO VOLTAR (só aparece na tela, não no PDF)
  html += '<button onclick="window.close()" class="btn-voltar no-print">🔙 Voltar para o Dashboard</button>';
  
  html += '</div>';
  html += '</body></html>';
  
  // Abrir em nova janela com botão voltar
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('⚠️ Por favor, permita pop-ups para gerar o PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ===== COPIAR RELATÓRIO =====
function copyRidesData() {
  const rides = getRides();
  if (rides.length === 0) {
    alert('📭 Nenhuma corrida registrada!');
    return;
  }
  
  let texto = '🚗 UNDERUBER - RELATÓRIO\n';
  texto += '📅 ' + new Date().toLocaleString('pt-BR') + '\n';
  texto += '═'.repeat(40) + '\n\n';
  
  rides.forEach(function(ride, index) {
    const result = calculateRideProfit(ride);
    texto += '📍 Corrida #' + (index + 1) + '\n';
    texto += '📆 Data: ' + formatDate(ride.date) + '\n';
    texto += '📏 KM: ' + ride.kmRodados.toFixed(2) + '\n';
    texto += '💰 Valor Bruto: R$ ' + ride.valorBruto.toFixed(2) + '\n';
    texto += '⛽ Combustível: R$ ' + result.custoCombustivel.toFixed(2) + '\n';
    texto += '💵 Lucro: R$ ' + result.lucroViagem.toFixed(2) + '\n';
    texto += '─'.repeat(30) + '\n';
  });
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(function() {
      alert('✅ Dados copiados! Cole onde quiser.');
    }).catch(function() {
      fallbackCopy(texto);
    });
  } else {
    fallbackCopy(texto);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('✅ Dados copiados! Cole onde quiser.');
  } catch (err) {
    alert('❌ Não foi possível copiar.');
  }
  document.body.removeChild(textarea);
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
