// ===== BANCO DE DADOS =====
const STORAGE_KEY = 'underUberRides';
const PARAMS_KEY = 'underUberParams';

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

// ===== FUNÇÕES DE CONVERSÃO (VÍRGULA PARA PONTO) =====
function converterVirgulaParaPonto(valor) {
  if (!valor) return '';
  return valor.replace(',', '.');
}

function converterPontoParaVirgula(valor) {
  if (!valor) return '';
  return valor.replace('.', ',');
}

function formatarValor(valor) {
  return valor.toFixed(2).replace('.', ',');
}

// ===== PARÂMETROS PADRÃO =====
function getDefaultParams() {
  const data = localStorage.getItem(PARAMS_KEY);
  return data ? JSON.parse(data) : {
    precoCombustivel: '',
    kmPorLitro: '',
    aluguelDiario: ''
  };
}

function saveDefaultParams(params) {
  localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
}

// ===== FUNÇÕES: EDITAR E EXCLUIR =====
function deleteRide(id) {
  if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;
  let rides = getRides();
  rides = rides.filter(function(r) { return r.id !== id; });
  saveRides(rides);
  updateHistorico();
  updateDashboard();
  alert('Viagem excluída com sucesso!');
}

function editRide(id) {
  const rides = getRides();
  const ride = rides.find(function(r) { return r.id === id; });
  if (!ride) return;
  
  document.getElementById('editId').value = ride.id;
  document.getElementById('editData').value = ride.date;
  document.getElementById('editKmRodados').value = converterPontoParaVirgula(ride.kmRodados.toFixed(2));
  document.getElementById('editValorBruto').value = converterPontoParaVirgula(ride.valorBruto.toFixed(2));
  document.getElementById('editPrecoCombustivel').value = converterPontoParaVirgula(ride.precoCombustivel.toFixed(2));
  document.getElementById('editKmPorLitro').value = converterPontoParaVirgula(ride.kmPorLitro.toFixed(1));
  document.getElementById('editAluguelDiario').value = converterPontoParaVirgula(ride.aluguelDiario.toFixed(2));
  
  document.getElementById('editModal').style.display = 'flex';
}

function saveEditRide() {
  const id = parseInt(document.getElementById('editId').value);
  const rides = getRides();
  const index = rides.findIndex(function(r) { return r.id === id; });
  
  if (index === -1) return;
  
  var kmRodados = converterVirgulaParaPonto(document.getElementById('editKmRodados').value);
  var valorBruto = converterVirgulaParaPonto(document.getElementById('editValorBruto').value);
  var precoCombustivel = converterVirgulaParaPonto(document.getElementById('editPrecoCombustivel').value);
  var kmPorLitro = converterVirgulaParaPonto(document.getElementById('editKmPorLitro').value);
  var aluguelDiario = converterVirgulaParaPonto(document.getElementById('editAluguelDiario').value);
  
  rides[index] = {
    ...rides[index],
    date: document.getElementById('editData').value,
    kmRodados: parseFloat(kmRodados),
    valorBruto: parseFloat(valorBruto),
    precoCombustivel: parseFloat(precoCombustivel),
    kmPorLitro: parseFloat(kmPorLitro),
    aluguelDiario: parseFloat(aluguelDiario) || 0
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
  var kmRodados = ride.kmRodados;
  var valorBruto = ride.valorBruto;
  var precoCombustivel = ride.precoCombustivel;
  var kmPorLitro = ride.kmPorLitro;
  
  var custoCombustivel = (kmRodados / kmPorLitro) * precoCombustivel;
  var lucroViagem = valorBruto - custoCombustivel;
  
  return {
    custoCombustivel: custoCombustivel,
    lucroViagem: lucroViagem,
    ganhoPorKm: kmRodados > 0 ? valorBruto / kmRodados : 0,
    margem: valorBruto > 0 ? (lucroViagem / valorBruto) * 100 : 0
  };
}

// ===== FUNÇÃO FORMATAR DATA =====
function formatDate(dateStr) {
  if (!dateStr) return 'Hoje';
  var parts = dateStr.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// ===== DASHBOARD =====
var selectedDate = getToday();

function updateDashboard() {
  var rides = getRides();
  var today = getToday();
  
  var displayEl = document.getElementById('displayDate');
  if (displayEl) {
    displayEl.textContent = formatDate(selectedDate);
  }
  
  var dayRides = rides.filter(function(r) { 
    return r.date === selectedDate; 
  });
  
  if (dayRides.length === 0) {
    document.getElementById('lucroLiquido').textContent = 'R$ 0,00';
    document.getElementById('ganhoPorKm').textContent = 'R$ 0,00';
    document.getElementById('totalCorridas').textContent = '0';
    document.getElementById('margemMedia').textContent = '0,0%';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('recentRides').style.display = 'none';
    
    var emptyEl = document.getElementById('emptyState');
    if (selectedDate === today) {
      emptyEl.innerHTML = '<p>Nenhuma corrida registrada hoje.</p><p>Vá para Nova Corrida para começar.</p>';
    } else {
      emptyEl.innerHTML = '<p>Nenhuma corrida registrada neste dia.</p><p>Selecione outra data.</p>';
    }
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('recentRides').style.display = 'block';
  
  var somaLucroViagens = 0;
  var somaBruto = 0;
  var somaKm = 0;
  var totalMargem = 0;
  
  dayRides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    somaLucroViagens += result.lucroViagem;
    somaBruto += ride.valorBruto;
    somaKm += ride.kmRodados;
    totalMargem += result.margem;
  });
  
  var aluguelDiario = dayRides[0].aluguelDiario || 0;
  var lucroDia = somaLucroViagens - aluguelDiario;
  var mediaMargem = dayRides.length > 0 ? totalMargem / dayRides.length : 0;
  var ganhoPorKm = somaKm > 0 ? somaBruto / somaKm : 0;
  
  document.getElementById('lucroLiquido').textContent = 'R$ ' + formatarValor(lucroDia);
  document.getElementById('ganhoPorKm').textContent = 'R$ ' + formatarValor(ganhoPorKm);
  document.getElementById('totalCorridas').textContent = dayRides.length;
  document.getElementById('margemMedia').textContent = mediaMargem.toFixed(1).replace('.', ',') + '%';
  
  var list = document.getElementById('ridesList');
  list.innerHTML = '';
  dayRides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    var div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML =
      '<div class="ride-info">' +
        '<span class="ride-km">' + ride.kmRodados.toFixed(2).replace('.', ',') + ' km</span>' +
        '<span style="font-size:12px;color:#999;">' + ride.date + '</span>' +
      '</div>' +
      '<div class="ride-value">R$ ' + ride.valorBruto.toFixed(2).replace('.', ',') + '</div>' +
      '<div class="ride-profit ' + (result.lucroViagem >= 0 ? 'positive' : 'negative') + '">' +
        (result.lucroViagem >= 0 ? '+' : '') + 'R$ ' + result.lucroViagem.toFixed(2).replace('.', ',') +
      '</div>';
    list.appendChild(div);
  });
}

function changeDate(delta) {
  var date = new Date(selectedDate + 'T00:00:00');
  date.setDate(date.getDate() + delta);
  selectedDate = date.toISOString().split('T')[0];
  updateDashboard();
}

function goToToday() {
  selectedDate = getToday();
  updateDashboard();
}

// ===== HISTÓRICO =====
var historicoSelectedDate = getToday();

function updateHistorico() {
  var rides = getRides();
  var container = document.getElementById('historicoList');
  var summary = document.getElementById('daySummary');
  var today = getToday();
  
  var dateDisplay = document.getElementById('historicoDate');
  if (dateDisplay) {
    dateDisplay.textContent = formatDate(historicoSelectedDate);
  }
  
  var dayRides = rides.filter(function(r) { 
    return r.date === historicoSelectedDate; 
  });
  
  if (!container) return;
  
  if (dayRides.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Nenhuma corrida registrada neste dia.</p>';
    if (summary) {
      summary.style.display = 'block';
      summary.querySelector('.day-date').textContent = formatDate(historicoSelectedDate);
      summary.querySelector('.day-rides').textContent = '0 corrida';
      var profitEl = summary.querySelector('.day-profit');
      profitEl.textContent = 'Lucro do dia R$ 0,00';
      profitEl.className = 'day-profit';
    }
    return;
  }
  
  if (summary) summary.style.display = 'block';
  
  var somaViagens = 0;
  var aluguelDia = 0;
  
  dayRides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    somaViagens += result.lucroViagem;
    aluguelDia = ride.aluguelDiario || 0;
  });
  
  var lucroDia = somaViagens - aluguelDia;
  
  if (summary) {
    summary.querySelector('.day-date').textContent = formatDate(historicoSelectedDate);
    summary.querySelector('.day-rides').textContent = dayRides.length + ' corrida' + (dayRides.length > 1 ? 's' : '');
    var profitEl2 = summary.querySelector('.day-profit');
    profitEl2.textContent = 'Lucro do dia R$ ' + formatarValor(lucroDia);
    profitEl2.className = 'day-profit ' + (lucroDia >= 0 ? 'positive' : 'negative');
  }
  
  container.innerHTML = '';
  dayRides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    var div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML =
      '<div style="flex:1;">' +
        '<div class="ride-km">' + ride.kmRodados.toFixed(2).replace('.', ',') + ' km</div>' +
        '<div style="font-size:12px;color:#999;">' + ride.date + '</div>' +
      '</div>' +
      '<div style="text-align:right; margin-right:10px;">' +
        '<div class="ride-value">R$ ' + ride.valorBruto.toFixed(2).replace('.', ',') + '</div>' +
        '<div class="ride-profit ' + (result.lucroViagem >= 0 ? 'positive' : 'negative') + '">' +
          (result.lucroViagem >= 0 ? '+' : '') + 'R$ ' + result.lucroViagem.toFixed(2).replace('.', ',') +
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
  var date = new Date(historicoSelectedDate + 'T00:00:00');
  date.setDate(date.getDate() + delta);
  historicoSelectedDate = date.toISOString().split('T')[0];
  updateHistorico();
}

function goToHistoricoToday() {
  historicoSelectedDate = getToday();
  updateHistorico();
}

// ===== VERIFICAR MUDANÇA DE DIA =====
var currentDay = getToday();

function checkDayChange() {
  var today = getToday();
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
  var form = document.getElementById('rideForm');
  if (!form) return;
  
  // Carregar data atual
  var dataField = document.getElementById('data');
  if (dataField) {
    dataField.value = getToday();
  }
  
  // Carregar parâmetros salvos
  var params = getDefaultParams();
  
  var precoField = document.getElementById('precoCombustivel');
  var kmLitroField = document.getElementById('kmPorLitro');
  var aluguelField = document.getElementById('aluguelDiario');
  
  if (precoField && params.precoCombustivel) {
    precoField.value = converterPontoParaVirgula(params.precoCombustivel);
  }
  if (kmLitroField && params.kmPorLitro) {
    kmLitroField.value = converterPontoParaVirgula(params.kmPorLitro);
  }
  if (aluguelField && params.aluguelDiario) {
    aluguelField.value = converterPontoParaVirgula(params.aluguelDiario);
  }
  
  // Remover event listener anterior
  form.removeEventListener('submit', handleFormSubmit);
  form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  // Pegar valores e converter vírgula para ponto
  var kmRodados = document.getElementById('kmRodados').value;
  var valorBruto = document.getElementById('valorBruto').value;
  var precoCombustivel = document.getElementById('precoCombustivel').value;
  var kmPorLitro = document.getElementById('kmPorLitro').value;
  var aluguelDiario = document.getElementById('aluguelDiario').value;
  
  // Converter vírgula para ponto
  kmRodados = converterVirgulaParaPonto(kmRodados);
  valorBruto = converterVirgulaParaPonto(valorBruto);
  precoCombustivel = converterVirgulaParaPonto(precoCombustivel);
  kmPorLitro = converterVirgulaParaPonto(kmPorLitro);
  aluguelDiario = converterVirgulaParaPonto(aluguelDiario);
  
  // Converter para números
  var kmRodadosNum = parseFloat(kmRodados);
  var valorBrutoNum = parseFloat(valorBruto);
  var precoCombustivelNum = parseFloat(precoCombustivel);
  var kmPorLitroNum = parseFloat(kmPorLitro);
  var aluguelDiarioNum = parseFloat(aluguelDiario) || 0;
  
  // Validar campos obrigatórios
  if (!kmRodadosNum || !valorBrutoNum || !precoCombustivelNum || !kmPorLitroNum) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }
  
  // Salvar parâmetros para próximas corridas
  var params = {
    precoCombustivel: precoCombustivel,
    kmPorLitro: kmPorLitro,
    aluguelDiario: aluguelDiario
  };
  saveDefaultParams(params);
  
  // Criar objeto da corrida
  var ride = {
    date: document.getElementById('data').value,
    kmRodados: kmRodadosNum,
    valorBruto: valorBrutoNum,
    precoCombustivel: precoCombustivelNum,
    kmPorLitro: kmPorLitroNum,
    aluguelDiario: aluguelDiarioNum
  };
  
  if (!ride.date) {
    ride.date = getToday();
  }
  
  addRide(ride);
  alert('Corrida salva com sucesso!');
  
  // Limpar campos de entrada (exceto parâmetros)
  document.getElementById('kmRodados').value = '';
  document.getElementById('valorBruto').value = '';
  document.getElementById('data').value = getToday();
  
  updateDashboard();
}

// ===== GERAR PDF =====
function generatePDF() {
  var rides = getRides();
  if (rides.length === 0) {
    alert('📭 Nenhuma corrida registrada!');
    return;
  }
  
  var btn = document.querySelector('.btn-pdf');
  if (btn) {
    btn.textContent = '⏳ Gerando...';
    btn.disabled = true;
  }
  
  var totalBruto = 0;
  var totalLucro = 0;
  var totalKm = 0;
  var totalCombustivel = 0;
  
  rides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    totalBruto += ride.valorBruto;
    totalLucro += result.lucroViagem;
    totalKm += ride.kmRodados;
    totalCombustivel += result.custoCombustivel;
  });
  
  var html = '<html><head><meta charset="UTF-8">';
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
  html += '.btn-voltar { display: block; width: 100%; padding: 14px; background: #e94560; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; text-align: center; }';
  html += '.btn-voltar:hover { background: #c23152; }';
  html += '.no-print { display: block; }';
  html += '@media print { .no-print { display: none !important; } .container { box-shadow: none !important; } body { background: white; padding: 10px; } }';
  html += '</style></head><body>';
  
  html += '<div class="container">';
  
  html += '<div class="header">';
  html += '<div class="icon">🚗</div>';
  html += '<h1>UnderUber</h1>';
  html += '<div class="subtitle">Relatório de Corridas</div>';
  html += '<small>Gerado em: ' + new Date().toLocaleString('pt-BR') + '</small>';
  html += '</div>';
  
  html += '<div class="resumo">';
  html += '<h3>📊 RESUMO DO PERÍODO</h3>';
  html += '<p>📍 Total de Corridas: <span class="value">' + rides.length + '</span></p>';
  html += '<p>📏 Total KM Rodados: <span class="value">' + totalKm.toFixed(2).replace('.', ',') + ' km</span></p>';
  html += '<p>💰 Valor Bruto Total: <span class="value">R$ ' + totalBruto.toFixed(2).replace('.', ',') + '</span></p>';
  html += '<p>⛽ Total Combustível: <span class="value">R$ ' + totalCombustivel.toFixed(2).replace('.', ',') + '</span></p>';
  html += '<p>💵 Lucro Total: <span class="value positive">R$ ' + totalLucro.toFixed(2).replace('.', ',') + '</span></p>';
  html += '</div>';
  
  html += '<h3 style="margin-top:25px;">📋 DETALHES DAS CORRIDAS</h3>';
  html += '<table>';
  html += '<tr><th>#</th><th>Data</th><th>KM</th><th>Valor (R$)</th><th>Combustível (R$)</th><th>Lucro (R$)</th></tr>';
  
  rides.forEach(function(ride, index) {
    var result = calculateRideProfit(ride);
    var profitClass = result.lucroViagem >= 0 ? 'positive' : 'negative';
    html += '<tr>';
    html += '<td>' + (index + 1) + '</td>';
    html += '<td>' + formatDate(ride.date) + '</td>';
    html += '<td>' + ride.kmRodados.toFixed(2).replace('.', ',') + '</td>';
    html += '<td>R$ ' + ride.valorBruto.toFixed(2).replace('.', ',') + '</td>';
    html += '<td>R$ ' + result.custoCombustivel.toFixed(2).replace('.', ',') + '</td>';
    html += '<td class="' + profitClass + '">R$ ' + result.lucroViagem.toFixed(2).replace('.', ',') + '</td>';
    html += '</tr>';
  });
  
  html += '</table>';
  
  html += '<div class="footer">';
  html += '🚗 UnderUber - App para motoristas<br>';
  html += 'Dados salvos em ' + new Date().toLocaleString('pt-BR');
  html += '</div>';
  
  html += '<button onclick="window.close()" class="btn-voltar no-print">🔙 Voltar para o Dashboard</button>';
  
  html += '</div>';
  html += '</body></html>';
  
  var win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('⚠️ Por favor, permita pop-ups para gerar o PDF.');
    if (btn) {
      btn.textContent = '📄 Gerar PDF';
      btn.disabled = false;
    }
    return;
  }
  
  win.document.write(html);
  win.document.close();
  
  if (btn) {
    btn.textContent = '📄 Gerar PDF';
    btn.disabled = false;
  }
  
  setTimeout(function() {
    win.print();
  }, 800);
}

// ===== RELÓGIO =====
function updateClock() {
  var agora = new Date();
  var horas = String(agora.getHours()).padStart(2, '0');
  var minutos = String(agora.getMinutes()).padStart(2, '0');
  var horaAtual = horas + ':' + minutos;
  
  var elementos = document.querySelectorAll('#horaAtual');
  for (var i = 0; i < elementos.length; i++) {
    elementos[i].textContent = horaAtual;
  }
}

// ===== FUNÇÃO PARA RECARREGAR DADOS =====
function recarregarDados() {
  var path = window.location.pathname;
  if (path.includes('index.html') || path === '/' || path === '') {
    updateDashboard();
  }
  if (path.includes('historico')) {
    updateHistorico();
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  updateClock();
  setInterval(updateClock, 30000);
  setInterval(checkDayChange, 60000);
  
  var path = window.location.pathname;
  
  if (path.includes('index.html') || path === '/' || path === '') {
    updateDashboard();
  }
  
  if (path.includes('nova-corrida')) {
    setupNewRideForm();
  }
  
  if (path.includes('historico')) {
    updateHistorico();
  }
  
  var modal = document.getElementById('editModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeEditModal();
    });
  }
});

// ===== RECARREGAR QUANDO VOLTAR AO APP =====
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    recarregarDados();
  }
});

window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    recarregarDados();
  }
});

window.addEventListener('focus', function() {
  recarregarDados();
});

setInterval(function() {
  recarregarDados();
}, 2000);
