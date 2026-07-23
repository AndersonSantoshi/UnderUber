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

function getToday() {
  return new Date().toISOString().split('T')[0];
}

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

function formatDate(dateStr) {
  if (!dateStr) return 'Hoje';
  var parts = dateStr.split('-');
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

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
  var lucroDia = som
