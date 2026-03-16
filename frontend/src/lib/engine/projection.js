// Revenue projection engine
// Pure TypeScript functions - no API calls, no side effects

import {
  CRORE,
  MILESTONE_VALUES,
  MILESTONE_LABELS,
  DEFAULT_MONTHS_TO_PROJECT,
  DEFAULT_TARGET,
  MIN_GROWTH_RATE,
  MAX_GROWTH_RATE,
  MIN_REVENUE,
  MAX_REVENUE,
  monthlyToYearly,
} from './constants';

/**
 * Sanitize and clamp input values to valid ranges
 */
export const sanitizeInput = (inputs) => {
  const { currentMRR, growthRate } = inputs;
  
  return {
    currentMRR: Math.max(MIN_REVENUE, Math.min(MAX_REVENUE, Number(currentMRR) || 0)),
    growthRate: Math.max(MIN_GROWTH_RATE, Math.min(MAX_GROWTH_RATE, Number(growthRate) || 0)),
  };
};

/**
 * Core projection formula: R_t = R_0 × (1 + g)^t
 * Where:
 * - R_t = Revenue at time t
 * - R_0 = Initial revenue (currentMRR)
 * - g = Monthly growth rate (decimal, e.g., 0.08 for 8%)
 * - t = Number of months
 */
export const calculateRevenueAtMonth = (currentMRR, growthRate, months) => {
  if (currentMRR <= 0 || growthRate < 0) return currentMRR;
  return currentMRR * Math.pow(1 + growthRate, months);
};

/**
 * Find the month when a target revenue (annual) is reached
 * Returns null if never reached within the projection window
 */
export const findMilestoneMonth = (currentMRR, growthRate, targetAnnual, maxMonths = DEFAULT_MONTHS_TO_PROJECT) => {
  if (currentMRR <= 0 || growthRate <= 0) return null;
  
  const targetMonthly = targetAnnual / 12;
  
  // If already past the target
  if (currentMRR >= targetMonthly) return 0;
  
  // Solve for t: targetMonthly = currentMRR × (1 + g)^t
  // t = ln(targetMonthly / currentMRR) / ln(1 + g)
  const months = Math.log(targetMonthly / currentMRR) / Math.log(1 + growthRate);
  
  if (months > maxMonths || !isFinite(months)) return null;
  
  return Math.ceil(months);
};

/**
 * Main projection function
 * Returns milestones with dates and the trajectory data
 */
export const predictTrajectory = (inputs) => {
  const { currentMRR, growthRate } = sanitizeInput(inputs);
  const monthsToProject = inputs.monthsToProject || DEFAULT_MONTHS_TO_PROJECT;
  const targetRevenue = inputs.targetRevenue || DEFAULT_TARGET;
  
  const now = new Date();
  const currentARR = monthlyToYearly(currentMRR);
  
  // Generate trajectory data points (monthly)
  const trajectory = [];
  for (let month = 0; month <= monthsToProject; month++) {
    const mrr = calculateRevenueAtMonth(currentMRR, growthRate, month);
    const arr = monthlyToYearly(mrr);
    const date = new Date(now.getFullYear(), now.getMonth() + month, 1);
    
    trajectory.push({
      month,
      date: date.toISOString(),
      mrr,
      arr,
    });
    
    // Stop if we've reached the target
    if (arr >= targetRevenue) break;
  }
  
  // Calculate milestones
  const milestones = MILESTONE_VALUES.map((value) => {
    const monthsToReach = findMilestoneMonth(currentMRR, growthRate, value, monthsToProject);
    
    if (monthsToReach === null) {
      return {
        value,
        label: MILESTONE_LABELS[value],
        reached: currentARR >= value,
        monthsToReach: null,
        date: null,
      };
    }
    
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsToReach, 1);
    
    return {
      value,
      label: MILESTONE_LABELS[value],
      reached: monthsToReach === 0,
      monthsToReach,
      date: targetDate.toISOString(),
    };
  });
  
  // Find the main target milestone (₹100 Crore)
  const targetMilestone = milestones.find((m) => m.value === targetRevenue);
  
  // Calculate sensitivity: what if growth was 1% higher?
  const sensitivityGrowth = growthRate + 0.01;
  const monthsAtCurrentGrowth = findMilestoneMonth(currentMRR, growthRate, targetRevenue, monthsToProject);
  const monthsAtHigherGrowth = findMilestoneMonth(currentMRR, sensitivityGrowth, targetRevenue, monthsToProject);
  
  let monthsGained = null;
  if (monthsAtCurrentGrowth !== null && monthsAtHigherGrowth !== null) {
    monthsGained = monthsAtCurrentGrowth - monthsAtHigherGrowth;
  }
  
  return {
    inputs: { currentMRR, growthRate },
    currentARR,
    trajectory,
    milestones,
    targetMilestone,
    sensitivity: {
      growthIncrease: 0.01,
      monthsGained,
    },
  };
};

/**
 * Simulate a scenario with overrides
 */
export const simulateScenario = (base, overrides) => {
  return predictTrajectory({
    ...base,
    ...overrides,
  });
};

/**
 * Generate projection data for chart visualization
 * Returns data points suitable for Recharts
 */
export const generateChartData = (inputs, benchmarkGrowth = null) => {
  const result = predictTrajectory(inputs);
  const { currentMRR, growthRate } = sanitizeInput(inputs);
  
  // Limit chart data to reasonable number of points
  const maxPoints = Math.min(result.trajectory.length, 60); // 5 years max
  const step = Math.max(1, Math.floor(result.trajectory.length / maxPoints));
  
  const chartData = [];
  
  for (let i = 0; i < result.trajectory.length; i += step) {
    const point = result.trajectory[i];
    const dataPoint = {
      month: point.month,
      date: point.date,
      arr: point.arr,
      label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    };
    
    // Add benchmark line if provided
    if (benchmarkGrowth !== null) {
      const benchmarkMRR = calculateRevenueAtMonth(currentMRR, benchmarkGrowth, point.month);
      dataPoint.benchmarkARR = monthlyToYearly(benchmarkMRR);
    }
    
    chartData.push(dataPoint);
  }
  
  return chartData;
};
