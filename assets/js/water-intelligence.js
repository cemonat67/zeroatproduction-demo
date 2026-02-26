async function loadWaterIntelligence() {
  const { data, error } = await supabase
    .from('v_water_intelligence') .select('*') .order('year', { ascending: true });
  if (error) {
    console.error("Water fetch error:", error); return;
  } renderWaterCharts(data); } function renderWaterCharts(data) { const merkez = 
  data.filter(d => d.facility_code === 'MERKEZ'); const years = merkez.map(d => d.year); 
  const intensity = merkez.map(d => d.m3_per_ton); const recycle = merkez.map(d => 
  d.recycle_pct); const ctx = document.getElementById('waterTrendChart'); new Chart(ctx, {
    type: 'line', data: {
      labels: years, datasets: [
        {
          label: 'Water Intensity (m/ton)', data: intensity, borderColor: '#f9ba00', tension: 
          0.3
        }, {
          label: 'Recycle %', data: recycle, borderColor: '#00b894', tension: 0.3
        }
      ]
    }, options: {
      plugins: {
        legend: { labels: { color: '#fff' } }
      }, scales: {
        x: { ticks: { color: '#ccc' } }, y: { ticks: { color: '#ccc' } }
      }
    }
  }); // KPI update const latest = merkez[merkez.length - 1]; 
  document.getElementById('waterIntensityKPI').innerText =
    latest.m3_per_ton.toFixed(1) + " m/ton"; }
document.addEventListener("DOMContentLoaded", loadWaterIntelligence);
