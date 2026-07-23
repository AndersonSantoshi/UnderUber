// ===== HISTÓRICO =====

function updateHistorico() {
  var rides = getRides();
  var container = document.getElementById('historicoList');
  var summary = document.getElementById('daySummary');
  
  if (!container) return;
  
  if (rides.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Nenhuma corrida registrada.</p>';
    if (summary) summary.style.display = 'none';
    return;
  }
  
  if (summary) summary.style.display = 'block';
  
  var days = {};
  rides.forEach(function(ride) {
    if (!days[ride.date]) days[ride.date] = [];
    days[ride.date].push(ride);
  });
  
  var today = Object.keys(days)[0];
  var todayRides = days[today] || [];
  var somaViagens = 0;
  var aluguelDia = 0;
  
  todayRides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    somaViagens += result.lucroViagem;
    aluguelDia = ride.aluguelDiario || 0;
  });
  
  var lucroDia = somaViagens - aluguelDia;
  
  if (summary) {
    var dateObj = new Date(today + 'T00:00:00');
    var weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    var dayName = weekdays[dateObj.getDay()];
    var formattedDate = dayName + ', ' + today.split('-').reverse().join('/');
    
    summary.querySelector('.day-date').textContent = formattedDate;
    summary.querySelector('.day-rides').textContent = todayRides.length + ' corrida' + (todayRides.length > 1 ? 's' : '');
    var profitEl = summary.querySelector('.day-profit');
    profitEl.textContent = 'Lucro do dia R$ ' + lucroDia.toFixed(2);
    profitEl.className = 'day-profit ' + (lucroDia >= 0 ? 'positive' : 'negative');
  }
  
  container.innerHTML = '';
  rides.forEach(function(ride) {
    var result = calculateRideProfit(ride);
    var div = document.createElement('div');
    div.className = 'ride-item';
    div.innerHTML = 
      '<div style="flex:1;">' +
        '<div class="ride-km">' + ride.kmRodados + ' km</div>' +
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
