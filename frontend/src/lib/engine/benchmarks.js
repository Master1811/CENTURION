// Benchmark data and comparison functions
// Based on anonymized data from Indian SaaS founders

const STAGES = {
  PRE_SEED: 'pre-seed',
  SEED: 'seed',
  SERIES_A: 'series-a',
};

/**
 * Indian SaaS benchmark data by funding stage
 * Growth rates are monthly percentages (decimal)
 */
export const INDIA_SAAS_BENCHMARKS = {
  [STAGES.PRE_SEED]: {
    median: 0.08,  // 8% monthly growth
    p75: 0.14,     // Top 25% grow at 14%+
    p90: 0.20,     // Top 10% grow at 20%+
    sampleSize: 150,
    description: 'Pre-seed startups (< ₹1 Crore raised)',
  },
  [STAGES.SEED]: {
    median: 0.06,  // 6% monthly growth
    p75: 0.10,     // Top 25% grow at 10%+
    p90: 0.15,     // Top 10% grow at 15%+
    sampleSize: 200,
    description: 'Seed stage startups (₹1-5 Crore raised)',
  },
  [STAGES.SERIES_A]: {
    median: 0.04,  // 4% monthly growth
    p75: 0.07,     // Top 25% grow at 7%+
    p90: 0.10,     // Top 10% grow at 10%+
    sampleSize: 100,
    description: 'Series A startups (₹5-20 Crore raised)',
  },
};

/**
 * Get benchmark data for a specific stage
 */
export const getBenchmarkData = (stage) => {
  const data = INDIA_SAAS_BENCHMARKS[stage];
  
  if (!data) {
    return {
      median: 0.06,
      p75: 0.10,
      sampleSize: 0,
      source: 'static',
      description: 'Unknown stage',
    };
  }
  
  return {
    ...data,
    source: 'static', // Will be 'live' when connected to real data
  };
};

/**
 * Compare a growth rate to benchmarks for a stage
 * Returns percentile and status
 */
export const compareToBenchmark = (growthRate, stage) => {
  const benchmark = getBenchmarkData(stage);
  
  // Calculate approximate percentile
  let percentile;
  let status;
  
  if (growthRate >= benchmark.p90) {
    percentile = 90 + (10 * (growthRate - benchmark.p90) / (benchmark.p90 * 0.5));
    percentile = Math.min(99, percentile);
    status = 'exceptional';
  } else if (growthRate >= benchmark.p75) {
    percentile = 75 + (15 * (growthRate - benchmark.p75) / (benchmark.p90 - benchmark.p75));
    status = 'above-average';
  } else if (growthRate >= benchmark.median) {
    percentile = 50 + (25 * (growthRate - benchmark.median) / (benchmark.p75 - benchmark.median));
    status = 'average';
  } else if (growthRate >= benchmark.median * 0.5) {
    percentile = 25 + (25 * (growthRate - benchmark.median * 0.5) / (benchmark.median * 0.5));
    status = 'below-average';
  } else {
    percentile = Math.max(1, 25 * (growthRate / (benchmark.median * 0.5)));
    status = 'needs-improvement';
  }
  
  return {
    growthRate,
    stage,
    percentile: Math.round(percentile),
    status,
    benchmark,
    comparedToMedian: growthRate - benchmark.median,
    comparedToP75: growthRate - benchmark.p75,
  };
};

/**
 * Get the appropriate stage based on current ARR
 */
export const inferStage = (arr) => {
  const CRORE = 10_000_000;
  
  if (arr < 1 * CRORE) {
    return STAGES.PRE_SEED;
  } else if (arr < 5 * CRORE) {
    return STAGES.SEED;
  } else {
    return STAGES.SERIES_A;
  }
};

/**
 * Get human-readable stage name
 */
export const getStageName = (stage) => {
  const names = {
    [STAGES.PRE_SEED]: 'Pre-Seed',
    [STAGES.SEED]: 'Seed',
    [STAGES.SERIES_A]: 'Series A',
  };
  return names[stage] || 'Unknown';
};
