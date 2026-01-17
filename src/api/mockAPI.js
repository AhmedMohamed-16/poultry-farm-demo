import { demoData } from './demoData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockAPI {
  constructor() {
    this.data = JSON.parse(JSON.stringify(demoData));
  }

  async getDashboard(farmId) {
    await delay(300);
    
    const activeFlocks = this.data.flocks.filter(f => f.status === 'active');
    const totalBirds = activeFlocks.reduce((sum, f) => sum + f.current_count, 0);
    const avgMortality = (activeFlocks.reduce((sum, f) => sum + f.mortality_rate, 0) / activeFlocks.length).toFixed(1);
    const avgFCR = (activeFlocks.reduce((sum, f) => sum + f.fcr, 0) / activeFlocks.length).toFixed(2);
    const totalProfit = activeFlocks.reduce((sum, f) => sum + (f.projected_profit || 0), 0);

    return {
      farm_name: this.data.farm.name,
      active_flocks: activeFlocks.length,
      total_birds_alive: totalBirds,
      today_summary: {
        mortality: this.data.today_logs.reduce((sum, l) => sum + l.mortality, 0),
        feed_consumed_kg: this.data.today_logs.reduce((sum, l) => sum + l.feed_consumed, 0),
        alerts_count: this.data.alerts.filter(a => !a.is_read).length
      },
      flocks: activeFlocks.map(f => ({
        flock_id: f.id,
        house: f.house_name,
        breed: f.breed,
        age_days: f.age_days,
        birds_alive: f.current_count,
        mortality_rate_percent: f.mortality_rate,
        fcr: f.fcr,
        status_health: f.fcr < 1.7 && f.mortality_rate < 5 ? 'excellent' : 'good',
        projected_profit: f.projected_profit
      })),
      financial_snapshot: {
        total_investment: this.data.total_investment,
        total_expenses_to_date: this.data.total_expenses,
        projected_revenue: this.data.projected_revenue,
        projected_profit: totalProfit
      },
      avg_metrics: {
        mortality: avgMortality,
        fcr: avgFCR
      }
    };
  }

  async addDailyLog(flockId, logData) {
    await delay(800);

    const flock = this.data.flocks.find(f => f.id === flockId);
    if (!flock) throw new Error('Flock not found');

    flock.current_count -= logData.mortality;
    flock.total_feed_consumed += logData.feed_consumed_kg;
    
    const estimatedWeight = flock.current_count * (flock.age_days * 0.06);
    flock.fcr = (flock.total_feed_consumed / estimatedWeight).toFixed(2);
    
    const cumulativeDead = flock.initial_count - flock.current_count;
    flock.mortality_rate = ((cumulativeDead / flock.initial_count) * 100).toFixed(1);
    
    const dailyMortalityRate = ((logData.mortality / flock.current_count) * 100).toFixed(2);

    const alerts = [];
    
    if (logData.temperature_celsius > 32) {
      alerts.push({
        type: 'temperature',
        severity: 'medium',
        message: `Temperature ${logData.temperature_celsius}°C - above optimal range`,
        action_required: 'Check ventilation fans, provide extra water'
      });
    }

    if (parseFloat(dailyMortalityRate) > 1.0) {
      alerts.push({
        type: 'high_mortality',
        severity: 'high',
        message: `Mortality spike: ${logData.mortality} birds today (${dailyMortalityRate}%)`,
        action_required: 'Contact veterinarian immediately'
      });
    }

    alerts.forEach(alert => {
      this.data.alerts.push({
        ...alert,
        id: `alert_${Date.now()}_${Math.random()}`,
        flock_id: flockId,
        house: flock.house_name,
        created_at: new Date().toISOString(),
        is_read: false
      });
    });

    return {
      success: true,
      log_id: `log_${Date.now()}`,
      flock_summary: {
        current_count: flock.current_count,
        age_days: flock.age_days,
        cumulative_mortality: cumulativeDead,
        mortality_rate_percent: parseFloat(flock.mortality_rate),
        avg_daily_mortality_percent: 0.3
      },
      calculated_metrics: {
        fcr: parseFloat(flock.fcr),
        cost_per_bird_so_far: (flock.total_cost / flock.current_count).toFixed(2),
        feed_cost_today: logData.feed_consumed_kg * 7
      },
      alerts
    };
  }

  async getPerformanceReport(flockId) {
    await delay(400);

    const flock = this.data.flocks.find(f => f.id === flockId);
    if (!flock) throw new Error('Flock not found');

    const totalDead = flock.initial_count - flock.current_count;
    const mortalityRate = ((totalDead / flock.initial_count) * 100).toFixed(1);
    
    const avgWeight = flock.age_days * 0.06;
    const totalWeight = flock.current_count * avgWeight;
    const projectedRevenue = totalWeight * 45;
    const projectedProfit = projectedRevenue - flock.total_cost;
    const roi = ((projectedProfit / flock.total_cost) * 100).toFixed(1);

    return {
      flock_id: flockId,
      house: flock.house_name,
      breed: flock.breed,
      placement_date: flock.placement_date,
      age_days: flock.age_days,
      initial_count: flock.initial_count,
      current_count: flock.current_count,
      mortality: {
        total_dead: totalDead,
        mortality_rate_percent: parseFloat(mortalityRate),
        avg_daily_percent: 0.3,
        trend: 'stable'
      },
      feed: {
        total_consumed_kg: flock.total_feed_consumed,
        fcr: parseFloat(flock.fcr),
        cost_per_kg: 7,
        total_feed_cost: flock.total_feed_consumed * 7
      },
      costs: flock.costs,
      projected_sale: {
        avg_weight_kg: avgWeight.toFixed(1),
        total_weight_kg: totalWeight.toFixed(0),
        market_price_per_kg: 45,
        projected_revenue: projectedRevenue.toFixed(0),
        projected_profit: projectedProfit.toFixed(0),
        roi_percent: parseFloat(roi)
      },
      recommendations: [
        flock.fcr < 1.75 ? 'FCR is good (target < 1.75)' : 'Consider reviewing feed quality',
        mortalityRate < 6 ? 'Mortality within acceptable range (< 6%)' : 'High mortality - investigate',
        flock.age_days > 35 ? 'Ready for sale at day 38-40' : 'Continue monitoring growth'
      ]
    };
  }

  async getAlerts(farmId, unreadOnly = false) {
    await delay(200);

    let alerts = this.data.alerts;
    if (unreadOnly) {
      alerts = alerts.filter(a => !a.is_read);
    }

    return {
      alerts: alerts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
    };
  }

  async dismissAlert(alertId) {
    await delay(200);
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_read = true;
    }
    return { success: true };
  }
}

export const mockAPI = new MockAPI();