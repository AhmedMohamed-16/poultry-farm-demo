export const demoData = {
  farm: {
    id: 'farm_001',
    name: 'Al-Baraka Poultry Farm',
    location: 'Giza, Egypt',
    owner: 'Ahmed Hassan',
    phone: '+20 12 345 6789'
  },

  flocks: [
    {
      id: 'flock_001',
      house_name: 'A',
      breed: 'Ross 308',
      placement_date: '2024-12-15',
      age_days: 35,
      initial_count: 3000,
      current_count: 2847,
      mortality_rate: 5.1,
      fcr: 1.65,
      total_feed_consumed: 8960,
      status: 'active',
      total_cost: 121720,
      projected_profit: 193930,
      costs: {
        chick_cost: 45000,
        feed_cost: 62720,
        medicine_cost: 8000,
        labor_cost: 4000,
        utilities_cost: 2000,
        total_cost: 121720,
        cost_per_bird: 42.75
      }
    },
    {
      id: 'flock_002',
      house_name: 'B',
      breed: 'Cobb 500',
      placement_date: '2024-12-30',
      age_days: 18,
      initial_count: 5000,
      current_count: 4862,
      mortality_rate: 2.76,
      fcr: 1.42,
      total_feed_consumed: 4520,
      status: 'active',
      total_cost: 113140,
      projected_profit: 243560,
      costs: {
        chick_cost: 75000,
        feed_cost: 31640,
        medicine_cost: 3000,
        labor_cost: 2000,
        utilities_cost: 1500,
        total_cost: 113140,
        cost_per_bird: 23.25
      }
    }
  ],

  today_logs: [
    {
      flock_id: 'flock_001',
      log_date: '2025-01-17',
      mortality: 12,
      feed_consumed: 210
    },
    {
      flock_id: 'flock_002',
      log_date: '2025-01-17',
      mortality: 7,
      feed_consumed: 355
    }
  ],

  alerts: [
    {
      id: 'alert_001',
      flock_id: 'flock_001',
      house: 'A',
      type: 'temperature',
      severity: 'medium',
      message: 'Temperature 34°C - above optimal range (24-28°C)',
      action_required: 'Check ventilation fans, provide extra water',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: false
    }
  ],

  total_investment: 215000,
  total_expenses: 387500,
  projected_revenue: 825000
};