{\rtf1\ansi\ansicpg1252\cocoartf2709
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // ===== Gerenciamento de Dados =====\
const STORAGE_KEY = 'uberRides';\
\
function getRides() \{\
  const data = localStorage.getItem(STORAGE_KEY);\
  return data ? JSON.parse(data) : [];\
\}\
\
function saveRides(rides) \{\
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));\
\}\
\
function addRide(ride) \{\
  const rides = getRides();\
  ride.id = Date.now();\
  ride.date = ride.date || new Date().toISOString().split('T')[0];\
  rides.unshift(ride);\
  saveRides(rides);\
  return ride;\
\}\
\
function deleteRide(id) \{\
  let rides = getRides();\
  rides = rides.filter(r => r.id !== id);\
  saveRides(rides);\
\}\
\
// ===== C\'e1lculos =====\
function calculateProfit(ride) \{\
  const \{ kmRodados, valorBruto, precoCombustivel, kmPorLitro, aluguelDiario \} = ride;\
  \
  const custoCombustivel = (kmRodados / kmPorLitro) * precoCombustivel;\
  const custoAluguel = aluguelDiario || 0;\
  const custoTotal = custoCombustivel + custoAluguel;\
  const lucro = valorBruto - custoTotal;\
  \
  return \{\
    custoCombustivel,\
    custoAluguel,\
    custoTotal,\
    lucro,\
    ganhoPorKm: kmRodados > 0 ? valorBruto / kmRodados : 0,\
    margem: valorBruto > 0 ? (lucro / valorBruto) * 100 : 0\
  \};\
\}\
\
// ===== Dashboard =====\
function updateDashboard() \{\
  const rides = getRides();\
  \
  if (rides.length === 0) \{\
    document.getElementById('lucroLiquido').textContent = 'R$ 0,00';\
    document.getElementById('ganhoPorKm').textContent = 'R$ 0,00';\
    document.getElementById('totalCorridas').textContent = '0';\
    document.getElementById('margemMedia').textContent = '0.0%';\
    document.getElementById('emptyState').style.display = 'block';\
    document.getElementById('recentRides').style.display = 'none';\
    return;\
  \}\
  \
  document.getElementById('emptyState').style.display = 'none';\
  document.getElementById('recentRides').style.display = 'block';\
  \
  let totalLucro = 0;\
  let totalKm = 0;\
  let totalBruto = 0;\
  let totalMargem = 0;\
  \
  rides.forEach(ride => \{\
    const result = calculateProfit(ride);\
    totalLucro += result.lucro;\
    totalKm += ride.kmRodados;\
    totalBruto += ride.valorBruto;\
    totalMargem += result.margem;\
  \});\
  \
  const mediaMargem = totalMargem / rides.length;\
  const ganhoPorKm = totalKm > 0 ? totalBruto / totalKm : 0;\
  \
  document.getElementById('lucroLiquido').textContent = `R$ $\{totalLucro.toFixed(2)\}`;\
  document.getElementById('ganhoPorKm').textContent = `R$ $\{ganhoPorKm.toFixed(2)\}`;\
  document.getElementById('totalCorridas').textContent = rides.length;\
  document.getElementById('margemMedia').textContent = `$\{mediaMargem.toFixed(1)\}%`;\
  \
  // Mostrar \'faltimas 5 corridas\
  const list = document.getElementById('ridesList');\
  list.innerHTML = '';\
  rides.slice(0, 5).forEach(ride => \{\
    const result = calculateProfit(ride);\
    const div = document.createElement('div');\
    div.className = 'ride-item';\
    div.innerHTML = `\
      <div class="ride-info">\
        <span class="ride-km">$\{ride.kmRodados\} km</span>\
        <span>$\{ride.date\}</span>\
      </div>\
      <div class="ride-value">R$ $\{ride.valorBruto.toFixed(2)\}</div>\
      <div class="ride-profit $\{result.lucro >= 0 ? 'positive' : 'negative'\}">\
        $\{result.lucro >= 0 ? '+' : ''\}R$ $\{result.lucro.toFixed(2)\}\
      </div>\
    `;\
    list.appendChild(div);\
  \});\
\}\
\
// ===== Nova Corrida =====\
function setupNewRideForm() \{\
  const form = document.getElementById('rideForm');\
  if (!form) return;\
  \
  form.addEventListener('submit', function(e) \{\
    e.preventDefault();\
    \
    const ride = \{\
      date: document.getElementById('data').value,\
      kmRodados: parseFloat(document.getElementById('kmRodados').value),\
      valorBruto: parseFloat(document.getElementById('valorBruto').value),\
      precoCombustivel: parseFloat(document.getElementById('precoCombustivel').value),\
      kmPorLitro: parseFloat(document.getElementById('kmPorLitro').value),\
      aluguelDiario: parseFloat(document.getElementById('aluguelDiario').value) || 0\
    \};\
    \
    // Valida\'e7\'e3o\
    if (!ride.kmRodados || !ride.valorBruto || !ride.precoCombustivel || !ride.kmPorLitro) \{\
      alert('Preencha todos os campos obrigat\'f3rios.');\
      return;\
    \}\
    \
    addRide(ride);\
    alert('Corrida salva com sucesso!');\
    form.reset();\
    \
    // Atualizar dashboard\
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') \{\
      updateDashboard();\
    \}\
  \});\
\}\
\
// ===== Hist\'f3rico =====\
function updateHistorico() \{\
  const rides = getRides();\
  const container = document.getElementById('historicoList');\
  const summary = document.getElementById('daySummary');\
  \
  if (!container) return;\
  \
  if (rides.length === 0) \{\
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Nenhuma corrida registrada.</p>';\
    if (summary) summary.style.display = 'none';\
    return;\
  \}\
  \
  if (summary) summary.style.display = 'block';\
  \
  // Agrupar por dia\
  const days = \{\};\
  rides.forEach(ride => \{\
    if (!days[ride.date]) days[ride.date] = [];\
    days[ride.date].push(ride);\
  \});\
  \
  // Mostrar resumo do dia mais recente\
  const today = Object.keys(days)[0];\
  const todayRides = days[today] || [];\
  let dayProfit = 0;\
  todayRides.forEach(ride => \{\
    dayProfit += calculateProfit(ride).lucro;\
  \});\
  \
  if (summary) \{\
    const dateObj = new Date(today + 'T00:00:00');\
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S\'e1b'];\
    const dayName = weekdays[dateObj.getDay()];\
    const formattedDate = `$\{dayName\}, $\{today.split('-').reverse().join('/')\}`;\
    \
    summary.querySelector('.day-date').textContent = formattedDate;\
    summary.querySelector('.day-rides').textContent = `$\{todayRides.length\} corrida$\{todayRides.length > 1 ? 's' : ''\}`;\
    const profitEl = summary.querySelector('.day-profit');\
    profitEl.textContent = `Lucro do dia R$ $\{dayProfit.toFixed(2)\}`;\
    profitEl.className = `day-profit $\{dayProfit >= 0 ? 'positive' : 'negative'\}`;\
  \}\
  \
  // Listar todas as corridas\
  container.innerHTML = '';\
  rides.forEach(ride => \{\
    const result = calculateProfit(ride);\
    const div = document.createElement('div');\
    div.className = 'ride-item';\
    div.innerHTML = `\
      <div>\
        <div class="ride-km">$\{ride.kmRodados\} km</div>\
        <div style="font-size:12px;color:#999;">$\{ride.date\}</div>\
      </div>\
      <div class="ride-value">R$ $\{ride.valorBruto.toFixed(2)\}</div>\
      <div class="ride-profit $\{result.lucro >= 0 ? 'positive' : 'negative'\}">\
        $\{result.lucro >= 0 ? '+' : ''\}R$ $\{result.lucro.toFixed(2)\}\
      </div>\
    `;\
    container.appendChild(div);\
  \});\
\}\
\
// ===== Inicializa\'e7\'e3o =====\
document.addEventListener('DOMContentLoaded', function() \{\
  const path = window.location.pathname;\
  \
  if (path.includes('index.html') || path === '/' || path === '') \{\
    updateDashboard();\
  \}\
  \
  if (path.includes('nova-corrida')) \{\
    setupNewRideForm();\
  \}\
  \
  if (path.includes('historico')) \{\
    updateHistorico();\
  \}\
\});}