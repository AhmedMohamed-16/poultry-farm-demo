// src/App.jsx - COMPLETE APPLICATION FILE
// Copy this entire file to your src/App.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockAPI } from './api/mockAPI';
import { getRelativeTime } from './utils/formatters';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const data = await mockAPI.getDashboard('farm_001');
    setDashboardData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐔</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading Your Farm...</h2>
          <p className="text-gray-500 mt-2">Al-Baraka Poultry Management System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'dashboard' && (
        <DashboardPage 
          data={dashboardData} 
          onNavigate={setCurrentPage}
          onRefresh={loadDashboard}
        />
      )}
      {currentPage === 'daily-log' && (
        <DailyLogPage 
          onBack={() => setCurrentPage('dashboard')}
          onSuccess={loadDashboard}
        />
      )}
      {currentPage === 'reports' && (
        <ReportsPage 
          flocks={dashboardData.flocks}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'alerts' && (
        <AlertsPage 
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

// ==========================================
// DASHBOARD PAGE
// ==========================================
function DashboardPage({ data, onNavigate, onRefresh }) {
  const mortalityData = [
    { day: 1, rate: 0.2 }, { day: 5, rate: 0.3 }, { day: 10, rate: 0.25 },
    { day: 15, rate: 0.28 }, { day: 20, rate: 0.3 }, { day: 25, rate: 0.32 },
    { day: 28, rate: 1.5 }, { day: 30, rate: 0.35 }, { day: 32, rate: 0.3 },
    { day: 35, rate: 0.42 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">🐔</span>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">{data.farm_name}</h1>
                <p className="text-xs md:text-sm text-gray-600">Ahmed Hassan</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => onNavigate('alerts')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <span className="text-xl md:text-2xl">🔔</span>
                {data.today_summary.alerts_count > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {data.today_summary.alerts_count}
                  </span>
                )}
              </button>
              <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-full transition" title="Refresh">
                <span className="text-xl md:text-2xl">🔄</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">📊 Dashboard Overview</h2>
          <p className="text-sm md:text-base text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <KPICard icon="🐔" label="BIRDS ALIVE" value={data.total_birds_alive.toLocaleString()} subtitle="Across all houses" status="good" />
          <KPICard icon="💀" label="MORTALITY RATE" value={`${data.avg_metrics.mortality}%`} subtitle="Target: <5%" status={parseFloat(data.avg_metrics.mortality) < 5 ? 'good' : 'warning'} />
          <KPICard icon="📈" label="AVERAGE FCR" value={data.avg_metrics.fcr} subtitle="Target: <1.8" status={parseFloat(data.avg_metrics.fcr) < 1.8 ? 'good' : 'warning'} />
          <KPICard icon="💰" label="PROJECTED PROFIT" value={`+${(data.financial_snapshot.projected_profit / 1000).toFixed(0)}K`} subtitle="All active flocks" status="good" />
        </div>

        {data.today_summary.alerts_count > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl md:text-3xl">⚠️</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 bg-yellow-600 text-white rounded font-bold">ALERT</span>
                  <h3 className="font-bold text-yellow-900 text-sm md:text-base">House A - High Temperature (34°C)</h3>
                </div>
                <p className="text-sm text-yellow-900 mb-2">Check ventilation fans immediately</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
              <button onClick={() => onNavigate('alerts')} className="text-blue-600 hover:text-blue-800 font-medium text-sm">VIEW</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">📋 Active Flocks</h3>
          
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-3">House</th>
                  <th className="p-3">Breed</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Birds Alive</th>
                  <th className="p-3">Mortality</th>
                  <th className="p-3">FCR</th>
                  <th className="p-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.flocks.map((flock, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 cursor-pointer transition">
                    <td className="p-3 font-bold">{flock.house}</td>
                    <td className="p-3">{flock.breed}</td>
                    <td className="p-3">{flock.age_days}d</td>
                    <td className="p-3">{flock.birds_alive.toLocaleString()}</td>
                    <td className="p-3">{flock.mortality_rate_percent}% <span className="ml-1">{flock.mortality_rate_percent < 5 ? '🟢' : '🟡'}</span></td>
                    <td className="p-3">{flock.fcr}</td>
                    <td className="p-3 font-bold text-green-600">{flock.projected_profit ? `+${(flock.projected_profit/1000).toFixed(0)}K` : 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {data.flocks.map((flock, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">House {flock.house}</span>
                  <span>{flock.mortality_rate_percent < 5 ? '🟢' : '🟡'}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">{flock.breed} • Day {flock.age_days}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Birds: <span className="font-bold">{flock.birds_alive.toLocaleString()}</span></div>
                  <div>FCR: <span className="font-bold">{flock.fcr}</span></div>
                  <div>Deaths: <span className="font-bold">{flock.mortality_rate_percent}%</span></div>
                  <div>Profit: <span className="font-bold text-green-600">{flock.projected_profit ? `+${(flock.projected_profit/1000).toFixed(0)}K` : 'TBD'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">📊 Mortality Trend (Last 35 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mortalityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Mortality %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-2 text-center">Spike on Day 28 was investigated and resolved</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => onNavigate('daily-log')} className="bg-green-600 text-white p-6 rounded-lg text-lg md:text-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
            <span>➕</span> Record Today's Farm Data
          </button>
          <button onClick={() => onNavigate('reports')} className="bg-blue-600 text-white p-6 rounded-lg text-lg md:text-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2">
            <span>📄</span> View Performance Reports
          </button>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// KPI CARD COMPONENT
// ==========================================
function KPICard({ icon, label, value, subtitle, status = 'good' }) {
  const statusColors = {
    good: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    danger: 'border-red-500 bg-red-50',
    neutral: 'border-gray-300 bg-white'
  };

  const statusIcons = {
    good: '🟢',
    warning: '🟡',
    danger: '🔴',
    neutral: ''
  };

  return (
    <div className={`border-2 rounded-lg p-4 md:p-6 ${statusColors[status]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl md:text-3xl">{icon}</span>
        {statusIcons[status] && <span className="text-lg md:text-xl">{statusIcons[status]}</span>}
      </div>
      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}

// ==========================================
// DAILY LOG PAGE
// ==========================================
function DailyLogPage({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    house: '',
    mortality: '',
    feedConsumed: '',
    temperature: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const houses = [
    { id: 'flock_001', name: 'House A', breed: 'Ross 308', age: 35, birds: 2847 },
    { id: 'flock_002', name: 'House B', breed: 'Cobb 500', age: 18, birds: 4573 }
  ];

  const handleSubmit = async () => {
    if (!formData.house || !formData.mortality || !formData.feedConsumed || !formData.temperature) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const result = await mockAPI.addDailyLog(formData.house, {
      mortality: parseInt(formData.mortality),
      feed_consumed_kg: parseInt(formData.feedConsumed),
      temperature_celsius: parseInt(formData.temperature),
      notes: formData.notes
    });

    setFeedbackData(result);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const resetAndGoBack = () => {
    onSuccess();
    onBack();
  };

  if (submitted && feedbackData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Data Saved Successfully!</h2>
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">📊 Updated Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Birds Alive</div>
                <div className="text-2xl font-bold">{feedbackData.flock_summary.current_count.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Mortality Rate</div>
                <div className="text-2xl font-bold">{feedbackData.flock_summary.mortality_rate_percent.toFixed(1)}% <span className="text-sm ml-2">{feedbackData.flock_summary.mortality_rate_percent < 5 ? '🟢' : '🟡'}</span></div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current FCR</div>
                <div className="text-2xl font-bold">{feedbackData.calculated_metrics.fcr} 🟢</div>
                <div className="text-xs text-gray-500">Target: &lt;1.8</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Feed Cost Today</div>
                <div className="text-2xl font-bold">{feedbackData.calculated_metrics.feed_cost_today.toLocaleString()} EGP</div>
              </div>
            </div>
          </div>

          {feedbackData.alerts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">⚠️ New Alerts Generated</h3>
              {feedbackData.alerts.map((alert, idx) => (
                <div key={idx} className={`${alert.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 rounded-r-lg p-4 mb-3`}>
                  <div className="font-bold mb-1">{alert.message}</div>
                  <div className="text-sm mt-2">
                    <div className="font-medium mb-1">Actions needed:</div>
                    <div className="text-sm">{alert.action_required}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => {
              setSubmitted(false);
              setFormData({ house: '', mortality: '', feedConsumed: '', temperature: '', notes: '' });
            }} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Record Another House</button>
            <button onClick={resetAndGoBack} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-4 font-medium">← Back to Dashboard</button>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">📝 Record Today's Farm Data</h1>
          <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-3">Which house are you logging?</label>
            <select value={formData.house} onChange={(e) => setFormData({...formData, house: e.target.value})} className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">🏠 Select House ▼</option>
              {houses.map(house => (
                <option key={house.id} value={house.id}>{house.name} ({house.breed}, Day {house.age}, {house.birds.toLocaleString()} birds)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold mb-3">Birds Found Dead Today</label>
            <input type="number" value={formData.mortality} onChange={(e) => setFormData({...formData, mortality: e.target.value})} className="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="0" min="0" />
            <div className="text-center text-gray-500 mt-2">birds</div>
          </div>

          <div>
            <label className="block text-lg font-bold mb-3">Feed Consumed</label>
            <input type="number" value={formData.feedConsumed} onChange={(e) => setFormData({...formData, feedConsumed: e.target.value})} className="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="0" min="0" />
            <div className="text-center text-gray-500 mt-2">kilograms</div>
          </div>

          <div>
            <label className="block text-lg font-bold mb-3">Temperature in Coop</label>
            <input type="number" value={formData.temperature} onChange={(e) => setFormData({...formData, temperature: e.target.value})} className="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="0" min="0" max="50" />
            <div className="text-center text-gray-500 mt-2">°C (Optimal: 24-28°C)</div>
          </div>

          <div>
            <label className="block text-lg font-bold mb-3">Notes (optional)</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none" rows="3" placeholder="E.g., Very hot day, added extra water" />
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isSubmitting ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Saving...</span> : <span>✅ Save Today's Record</span>}
          </button>
          
          <p className="text-center text-sm text-gray-500">Takes 2 seconds • Your data is automatically backed up</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// REPORTS PAGE
// ==========================================
function ReportsPage({ flocks, onBack }) {
  const [selectedFlock, setSelectedFlock] = useState(flocks[0]?.flock_id || '');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFlock) {
      loadReport();
    }
  }, [selectedFlock]);

  const loadReport = async () => {
    setLoading(true);
    const data = await mockAPI.getPerformanceReport(selectedFlock);
    setReportData(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-4 font-medium">← Back to Dashboard</button>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">📄 Batch Performance Report</h1>
          <select value={selectedFlock} onChange={(e) => setSelectedFlock(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none">
            {flocks.map(flock => (
              <option key={flock.flock_id} value={flock.flock_id}>House {flock.house} - {flock.breed} (Day {flock.age_days})</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl mb-4 animate-bounce">📊</div><p className="text-gray-600">Generating report...</p></div>
        ) : reportData && (
          <div className="border-t-4 border-blue-600 pt-6">
            <h2 className="text-xl font-bold mb-4">House {reportData.house} - {reportData.breed} - Day {reportData.age_days}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">🐔 Flock Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Started: <span className="font-bold">{new Date(reportData.placement_date).toLocaleDateString()}</span></div>
                  <div>Age: <span className="font-bold">{reportData.age_days} days</span></div>
                  <div>Initial Count: <span className="font-bold">{reportData.initial_count.toLocaleString()} birds</span></div>
                  <div>Current Count: <span className="font-bold text-green-600">{reportData.current_count.toLocaleString()} birds ✓</span></div>
                  <div>Total Deaths: <span className="font-bold">{reportData.mortality.total_dead} birds ({reportData.mortality.mortality_rate_percent}%) 🟢</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">📊 Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Feed Consumed: <span className="font-bold">{reportData.feed.total_consumed_kg.toLocaleString()} kg</span></div>
                  <div>FCR: <span className="font-bold text-green-600">{reportData.feed.fcr} 🟢</span></div>
                  <div>Avg Daily Mortality: <span className="font-bold">{reportData.mortality.avg_daily_percent}%</span></div>
                  <div>Health Status: <span className="font-bold text-green-600">Good</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">💰 Financial Breakdown</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span>Chick Purchase:</span><span className="font-bold">{reportData.costs.chick_cost.toLocaleString()} EGP</span></div>
                  <div className="flex justify-between"><span>Feed ({reportData.feed.total_consumed_kg} kg):</span><span className="font-bold">{reportData.costs.feed_cost.toLocaleString()} EGP</span></div>
                  <div className="flex justify-between"><span>Medicine:</span><span className="font-bold">{reportData.costs.medicine_cost.toLocaleString()} EGP</span></div>
                  <div className="flex justify-between"><span>Labor:</span><span className="font-bold">{reportData.costs.labor_cost.toLocaleString()} EGP</span></div>
                  <div className="flex justify-between"><span>Utilities:</span><span className="font-bold">{reportData.costs.utilities_cost.toLocaleString()} EGP</span></div>
                  <div className="border-t-2 pt-2 flex justify-between font-bold text-base"><span>TOTAL COST:</span><span>{reportData.costs.total_cost.toLocaleString()} EGP</span></div>
                </div>
                
                <div className="border-t-4 border-green-600 pt-4 mt-4">
                  <div className="space-y-2 text-sm mb-2">
                    <div className="flex justify-between"><span>Birds to Sell:</span><span className="font-bold">{reportData.current_count.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Avg Weight:</span><span className="font-bold">{reportData.projected_sale.avg_weight_kg} kg/bird</span></div>
                    <div className="flex justify-between"><span>Market Price:</span><span className="font-bold">{reportData.projected_sale.market_price_per_kg} EGP/kg</span></div>
                    <div className="flex justify-between font-bold text-base"><span>TOTAL REVENUE:</span><span>{parseFloat(reportData.projected_sale.projected_revenue).toLocaleString()} EGP</span></div>
                  </div>
                  <div className="border-t-4 border-green-600 pt-2 flex justify-between text-xl font-bold text-green-600">
                    <span>NET PROFIT:</span><span>+{parseFloat(reportData.projected_sale.projected_profit).toLocaleString()} EGP 🎯</span>
                  </div>
                  <div className="text-center text-sm mt-2 text-gray-600">ROI: {reportData.projected_sale.roi_percent}% 📈</div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">✅ Recommendations</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {reportData.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <button onClick={() => alert('PDF download feature coming soon!')} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">📥 Download PDF Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ALERTS PAGE
// ==========================================
function AlertsPage({ onBack }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await mockAPI.getAlerts('farm_001', false);
    setAlerts(data.alerts);
    setLoading(false);
  };

  const handleDismiss = async (alertId) => {
    await mockAPI.dismissAlert(alertId);
    loadAlerts();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-4 font-medium">← Back to Dashboard</button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🚨 Farm Alerts ({alerts.filter(a => !a.is_read).length})</h1>
          <button onClick={() => {
            alerts.forEach(a => handleDismiss(a.id));
          }} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Mark All as Read</button>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl mb-4 animate-bounce">🔔</div><p className="text-gray-600">Loading alerts...</p></div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <h2 className="text-xl font-bold text-gray-700 mb-2">All Clear!</h2>
            <p className="text-gray-500">No active alerts. Your farm is running smoothly.</p>
          </div>
        ) : (
          <div>
            {alerts.map(alert => (
              <div key={alert.id} className={`${alert.severity === 'high' ? 'bg-red-50 border-red-500' : alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'} border-l-4 rounded-r-lg p-4 mb-4 shadow-sm`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${alert.severity === 'high' ? 'bg-red-600 text-white' : alert.severity === 'medium' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}>{alert.severity} PRIORITY</span>
                      <h3 className="font-bold">House {alert.house} - {alert.type.replace('_', ' ').toUpperCase()}</h3>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    {alert.action_required && (
                      <div className="text-sm font-medium mb-2">⚠️ Action: {alert.action_required}</div>
                    )}
                    <p className="text-xs text-gray-500">{getRelativeTime(alert.created_at)}</p>
                  </div>
                  {!alert.is_read && (
                    <button onClick={() => handleDismiss(alert.id)} className="text-gray-400 hover:text-gray-600">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;