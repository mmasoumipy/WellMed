type MicroAssessment = {
  fatigue: number;
  stress: number;
  satisfaction: number;
  sleep: number;
};

type MbiAssessment = {
  EE: number;  // Emotional Exhaustion
  DP: number;  // Depersonalization
  PA: number;  // Personal Accomplishment
};

type BurnoutRiskResult = {
  combinedScore: string;
  riskLevel: string;
  breakdown: {
    emotionalExhaustion: number;
    depersonalization: number;
    personalAccomplishment: number;
    mbiScore: number;
  };
  recommendations: string[];
};

type BurnoutTrend = 'improving' | 'worsening' | 'stable';

export const calculateBurnoutRisk = ({
  mbiAssessment,
}: {
  mbiAssessment: MbiAssessment;
}): BurnoutRiskResult => {
  // MBI score calculation - based purely on MBI dimensions
  // EE and DP: higher scores indicate more burnout
  // PA: lower scores indicate more burnout (so we invert it)
  
  // Normalize each dimension to 0-10 scale
  // These are based on established MBI cutoff scores for healthcare professionals
  const normalizedEE = Math.min(10, (mbiAssessment.EE / 54) * 10); // Max EE is typically 54 (9 items × 6 points)
  const normalizedDP = Math.min(10, (mbiAssessment.DP / 30) * 10); // Max DP is typically 30 (5 items × 6 points)
  const normalizedPA = Math.min(10, ((48 - mbiAssessment.PA) / 48) * 10); // Max PA is typically 48 (8 items × 6 points), inverted

  // Calculate overall MBI burnout score
  // Weight: EE (40%), DP (30%), PA (30%) - EE is most predictive of burnout
  const mbiScore = (normalizedEE * 0.4) + (normalizedDP * 0.3) + (normalizedPA * 0.3);

  // The combined score is now just the MBI score
  const combinedScore = mbiScore;

  // Determine risk level based on established MBI cutoffs
  let riskLevel = 'Low';
  if (combinedScore >= 7) {
    riskLevel = 'High';
  } else if (combinedScore >= 4) {
    riskLevel = 'Medium';
  }

  // Generate recommendations based on MBI dimensions
  const recommendations = generateMBIRecommendations({
    mbiAssessment,
    normalizedEE,
    normalizedDP,
    normalizedPA,
    combinedScore,
  });

  return { 
    combinedScore: combinedScore.toFixed(1), 
    riskLevel,
    breakdown: {
      emotionalExhaustion: parseFloat(normalizedEE.toFixed(1)),
      depersonalization: parseFloat(normalizedDP.toFixed(1)),
      personalAccomplishment: parseFloat(normalizedPA.toFixed(1)),
      mbiScore: parseFloat(mbiScore.toFixed(1)),
    },
    recommendations,
  };
};

export const calculateBurnoutTrend = (
  currentAssessment: MbiAssessment,
  previousAssessment: MbiAssessment
): BurnoutTrend => {
  const currentRisk = calculateBurnoutRisk({
    mbiAssessment: currentAssessment,
  });

  const previousRisk = calculateBurnoutRisk({
    mbiAssessment: previousAssessment,
  });

  const currentScore = parseFloat(currentRisk.combinedScore);
  const previousScore = parseFloat(previousRisk.combinedScore);
  
  if (currentScore < previousScore - 0.5) {
    return 'improving';
  } else if (currentScore > previousScore + 0.5) {
    return 'worsening';
  }
  return 'stable';
};

const generateMBIRecommendations = ({
  mbiAssessment,
  normalizedEE,
  normalizedDP,
  normalizedPA,
  combinedScore,
}: {
  mbiAssessment: MbiAssessment;
  normalizedEE: number;
  normalizedDP: number;
  normalizedPA: number;
  combinedScore: number;
}): string[] => {
  const recommendations: string[] = [];

  // High-priority recommendations for severe burnout
  if (combinedScore >= 7) {
    recommendations.push("Consider speaking with a mental health professional immediately");
    recommendations.push("Take steps to reduce workload and delegate responsibilities where possible");
  }

  // Emotional Exhaustion specific recommendations
  if (normalizedEE >= 6) {
    recommendations.push("Practice daily stress-reduction techniques like meditation or deep breathing");
    recommendations.push("Ensure adequate rest between demanding tasks and take regular breaks");
    recommendations.push("Consider using our box breathing exercises for immediate stress relief");
  } else if (normalizedEE >= 4) {
    recommendations.push("Monitor your stress levels and practice preventive self-care");
  }

  // Depersonalization specific recommendations
  if (normalizedDP >= 6) {
    recommendations.push("Reconnect with the meaningful aspects of your work and patient relationships");
    recommendations.push("Seek peer support and engage with your professional community");
    recommendations.push("Practice empathy exercises and reflect on positive patient interactions");
  } else if (normalizedDP >= 4) {
    recommendations.push("Make time for meaningful connections with colleagues and patients");
  }

  // Personal Accomplishment specific recommendations
  if (normalizedPA >= 6) {
    recommendations.push("Set small, achievable professional goals to rebuild confidence");
    recommendations.push("Keep a journal of your daily accomplishments and positive impacts");
    recommendations.push("Seek feedback from supervisors and colleagues about your contributions");
  } else if (normalizedPA >= 4) {
    recommendations.push("Celebrate your successes and acknowledge your professional growth");
  }

  // General wellness recommendations for all levels
  if (combinedScore >= 4) {
    recommendations.push("Maintain work-life boundaries and engage in activities outside of work");
    recommendations.push("Use our wellness tracking features to monitor your progress");
  }

  // If low risk, provide maintenance recommendations
  if (combinedScore < 4) {
    recommendations.push("Continue your current self-care practices");
    recommendations.push("Regular MBI assessments help maintain awareness of your wellbeing");
    recommendations.push("Use our daily mood tracking and wellness activities preventively");
  }

  return recommendations.slice(0, 4); // Limit to 4 most relevant recommendations
};

export const getBurnoutRiskColor = (riskLevel: string): string => {
  const colors = {
    low: '#7ED321',     // Green
    medium: '#F5A623',  // Orange
    high: '#D0021B',    // Red
  };
  
  return colors[riskLevel.toLowerCase() as keyof typeof colors] || '#9B9B9B';
};

export const getBurnoutRiskIcon = (riskLevel: string): string => {
  const icons = {
    low: 'checkmark-circle',
    medium: 'warning',
    high: 'alert-circle',
  };
  
  return icons[riskLevel.toLowerCase() as keyof typeof icons] || 'help-circle';
};

export const formatBurnoutInsight = (
  currentRisk: BurnoutRiskResult,
  trend?: BurnoutTrend
): string => {
  let insight = `Your MBI burnout risk is currently ${currentRisk.riskLevel.toLowerCase()} (${currentRisk.combinedScore}/10).`;
  
  if (trend) {
    switch (trend) {
      case 'improving':
        insight += " Great news - your burnout risk has decreased since your last MBI assessment!";
        break;
      case 'worsening':
        insight += " Your burnout risk has increased since your last MBI assessment. Consider taking preventive action.";
        break;
      case 'stable':
        insight += " Your burnout risk level has remained stable since your last MBI assessment.";
        break;
    }
  }

  return insight;
};

export const getMBIDimensionInterpretation = (dimension: 'EE' | 'DP' | 'PA', score: number): string => {
  switch (dimension) {
    case 'EE':
      if (score >= 27) return 'High emotional exhaustion';
      if (score >= 17) return 'Moderate emotional exhaustion';
      return 'Low emotional exhaustion';
    
    case 'DP':
      if (score >= 10) return 'High depersonalization';
      if (score >= 6) return 'Moderate depersonalization';
      return 'Low depersonalization';
    
    case 'PA':
      if (score <= 31) return 'Low personal accomplishment';
      if (score <= 38) return 'Moderate personal accomplishment';
      return 'High personal accomplishment';
    
    default:
      return 'Unknown';
  }
};

// Calculate streak for any type of activity (keeping existing functions)
export const calculateActivityStreak = (activities: Array<{
  date: string;
  hasActivity: boolean;
}>): number => {
  let streak = 0;
  const today = new Date();
  
  // Sort activities by date (most recent first)
  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.date);
    const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only count if it's today or consecutive days
    if (daysDiff === streak && activity.hasActivity) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Get motivational message based on streak
export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Start your wellness journey today!";
  if (streak === 1) return "Great start! Keep it up!";
  if (streak < 7) return `${streak} days strong! You're building a habit!`;
  if (streak < 30) return `Amazing! ${streak} days of consistent self-care!`;
  return `Incredible! ${streak} days of dedication to your wellbeing!`;
};

export const getWellnessGoal = (currentStreak: number, longestStreak: number): {
  target: number;
  message: string;
} => {
  let target: number;
  let message: string;

  if (currentStreak === 0) {
    target = 1;
    message = "Start with just one day of self-care!";
  } else if (currentStreak < 7) {
    target = 7;
    message = "Aim for a full week of wellness activities!";
  } else if (currentStreak < 30) {
    target = 30;
    message = "Challenge yourself to a 30-day streak!";
  } else {
    target = Math.max(longestStreak + 7, currentStreak + 7);
    message = "Keep pushing your personal best!";
  }

  return { target, message };
};