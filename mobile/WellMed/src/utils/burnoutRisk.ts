export interface WeightedBurnoutRisk {
  combinedScore: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'No Data';
  breakdown: {
    mbiContribution: number;
    microContribution: number;
    moodContribution: number;
    totalScore: number;
  };
  components: {
    mbi: {
      score: number;
      weight: number;
      emotionalExhaustion: number;
      depersonalization: number;
      personalAccomplishment: number;
    };
    microAssessments: {
      score: number;
      weight: number;
      averageStress: number;
      averageFatigue: number;
      averageSatisfaction: number;
    };
    moodEntries: {
      score: number;
      weight: number;
      averageMood: number;
      recentTrend: 'improving' | 'worsening' | 'stable';
    };
  };
  recommendations: string[];
  lastAssessmentDates: {
    mbi?: string;
    lastMicro?: string;
    lastMood?: string;
  };
}

const moodScale: Record<string, number> = {
  Excellent: 6,
  Good: 5,
  Okay: 4,
  Stressed: 3,
  Tired: 2,
  Anxious: 1,
};

export function calculateWeightedBurnoutRisk(data: {
  mbiAssessment?: {
    EE: number;
    DP: number;
    PA: number;
    submitted_at?: string;
  };
  microAssessments?: Array<{
    fatigue_level: number;
    stress_level: number;
    work_satisfaction: number;
    submitted_at: string;
  }>;
  moodEntries?: Array<{
    mood: string;
    timestamp: string;
  }>;
}): WeightedBurnoutRisk {
  const weights = {
    mbi: 0.5,      // 50%
    micro: 0.3,    // 30%
    mood: 0.2,     // 20%
  };

  let result: WeightedBurnoutRisk = {
    combinedScore: '0.0',
    riskLevel: 'No Data',
    breakdown: {
      mbiContribution: 0,
      microContribution: 0,
      moodContribution: 0,
      totalScore: 0,
    },
    components: {
      mbi: {
        score: 0,
        weight: weights.mbi,
        emotionalExhaustion: 0,
        depersonalization: 0,
        personalAccomplishment: 0,
      },
      microAssessments: {
        score: 0,
        weight: weights.micro,
        averageStress: 0,
        averageFatigue: 0,
        averageSatisfaction: 0,
      },
      moodEntries: {
        score: 0,
        weight: weights.mood,
        averageMood: 0,
        recentTrend: 'stable',
      },
    },
    recommendations: [],
    lastAssessmentDates: {},
  };

  // Calculate MBI component (50%)
  let mbiScore = 0;
  if (data.mbiAssessment) {
    const { EE, DP, PA } = data.mbiAssessment;
    
    // Normalize MBI scores to 0-10 scale
    const normalizedEE = Math.min(EE / 54 * 10, 10); // Max EE is 54
    const normalizedDP = Math.min(DP / 30 * 10, 10); // Max DP is 30
    const normalizedPA = Math.min((42 - PA) / 42 * 10, 10); // PA is reverse scored, max is 42
    
    mbiScore = (normalizedEE + normalizedDP + normalizedPA) / 3;
    
    result.components.mbi = {
      score: mbiScore,
      weight: weights.mbi,
      emotionalExhaustion: normalizedEE,
      depersonalization: normalizedDP,
      personalAccomplishment: normalizedPA,
    };
    
    result.lastAssessmentDates.mbi = data.mbiAssessment.submitted_at;
  }

  // Calculate Micro Assessments component (30%)
  let microScore = 0;
  if (data.microAssessments && data.microAssessments.length > 0) {
    // Take last 5 assessments
    const recentMicro = data.microAssessments.slice(-5);
    
    const avgStress = recentMicro.reduce((sum, m) => sum + m.stress_level, 0) / recentMicro.length;
    const avgFatigue = recentMicro.reduce((sum, m) => sum + m.fatigue_level, 0) / recentMicro.length;
    const avgSatisfaction = recentMicro.reduce((sum, m) => sum + m.work_satisfaction, 0) / recentMicro.length;
    
    // Convert to 0-10 scale (stress and fatigue are risk factors, satisfaction is protective)
    const stressScore = (avgStress / 5) * 10; // Higher stress = higher risk
    const fatigueScore = (avgFatigue / 5) * 10; // Higher fatigue = higher risk
    const satisfactionScore = ((5 - avgSatisfaction) / 5) * 10; // Lower satisfaction = higher risk
    
    microScore = (stressScore + fatigueScore + satisfactionScore) / 3;
    
    result.components.microAssessments = {
      score: microScore,
      weight: weights.micro,
      averageStress: avgStress,
      averageFatigue: avgFatigue,
      averageSatisfaction: avgSatisfaction,
    };
    
    result.lastAssessmentDates.lastMicro = recentMicro[recentMicro.length - 1].submitted_at;
  }

  // Calculate Mood component (20%)
  let moodScore = 0;
  if (data.moodEntries && data.moodEntries.length > 0) {
    // Take last 5 mood entries
    const recentMoods = data.moodEntries.slice(-5);
    
    const moodValues = recentMoods.map(m => moodScale[m.mood] || 3);
    const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
    
    // Convert to risk score (lower mood = higher risk)
    moodScore = ((6 - avgMood) / 6) * 10;
    
    // Determine trend
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (moodValues.length >= 3) {
      const firstHalf = moodValues.slice(0, Math.floor(moodValues.length / 2));
      const secondHalf = moodValues.slice(Math.ceil(moodValues.length / 2));
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) {
        trend = 'improving';
      } else if (secondAvg < firstAvg - 0.5) {
        trend = 'worsening';
      }
    }
    
    result.components.moodEntries = {
      score: moodScore,
      weight: weights.mood,
      averageMood: avgMood,
      recentTrend: trend,
    };
    
    result.lastAssessmentDates.lastMood = recentMoods[recentMoods.length - 1].timestamp;
  }

  // Calculate weighted total
  const totalContributions = 
    (mbiScore * weights.mbi) +
    (microScore * weights.micro) +
    (moodScore * weights.mood);

  // Calculate the denominator based on available data
  let totalWeights = 0;
  if (data.mbiAssessment) totalWeights += weights.mbi;
  if (data.microAssessments && data.microAssessments.length > 0) totalWeights += weights.micro;
  if (data.moodEntries && data.moodEntries.length > 0) totalWeights += weights.mood;

  // Fix: The scores are already on 0-10 scale, so don't multiply by 10 again
  const finalScore = totalWeights > 0 ? totalContributions / totalWeights : 0;

  result.breakdown = {
    mbiContribution: mbiScore * weights.mbi,
    microContribution: microScore * weights.micro,
    moodContribution: moodScore * weights.mood,
    totalScore: finalScore,
  };

  result.combinedScore = finalScore.toFixed(1);

  // Determine risk level
  if (totalWeights === 0) {
    result.riskLevel = 'No Data';
  } else if (finalScore <= 3.5) {
    result.riskLevel = 'Low';
  } else if (finalScore <= 6.5) {
    result.riskLevel = 'Medium';
  } else {
    result.riskLevel = 'High';
  }

  // Generate recommendations based on components
  result.recommendations = generateRecommendations(result);

  return result;
}

function generateRecommendations(risk: WeightedBurnoutRisk): string[] {
  const recommendations: string[] = [];
  
  if (risk.components.mbi.emotionalExhaustion > 6) {
    recommendations.push('Consider stress reduction techniques and emotional self-care');
  }
  
  if (risk.components.microAssessments.averageStress > 3) {
    recommendations.push('Focus on stress management strategies during work hours');
  }
  
  if (risk.components.microAssessments.averageFatigue > 3) {
    recommendations.push('Prioritize sleep hygiene and energy management');
  }
  
  if (risk.components.microAssessments.averageSatisfaction < 3) {
    recommendations.push('Explore ways to increase job satisfaction and meaning');
  }
  
  if (risk.components.moodEntries.averageMood < 4) {
    recommendations.push('Consider mood-boosting activities and social support');
  }
  
  if (risk.components.moodEntries.recentTrend === 'worsening') {
    recommendations.push('Monitor mood trends and seek support if needed');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining healthy work-life balance');
  }

  return recommendations;
}