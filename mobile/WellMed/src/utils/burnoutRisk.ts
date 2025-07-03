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
    moodScore: number;
    microScore: number;
    mbiScore: number;
  };
  recommendations: string[];
};

type BurnoutTrend = 'improving' | 'worsening' | 'stable';

export const calculateBurnoutRisk = ({
  moodAverage,
  microAssessment,
  mbiAssessment,
}: {
  moodAverage: number;
  microAssessment: MicroAssessment;
  mbiAssessment: MbiAssessment;
}): BurnoutRiskResult => {
  // Mood score (0-10, where higher is better mood, so we need to invert for risk)
  const moodScore = Math.max(0, 10 - ((moodAverage - 1) / 5 * 10));

  // Micro assessment score (0-10, where higher indicates more risk)
  const microAvg =
    (microAssessment.fatigue +
      microAssessment.stress +
      (6 - microAssessment.satisfaction) +  // Invert satisfaction
      (6 - microAssessment.sleep)) /        // Invert sleep quality
    4;
  const microScore = (microAvg / 5) * 10;

  // MBI score (0-10, where higher indicates more burnout risk)
  // EE and DP: higher is worse, PA: lower is worse
  const normalizedEE = Math.min(10, (mbiAssessment.EE / 54) * 10); // Max EE is typically 54
  const normalizedDP = Math.min(10, (mbiAssessment.DP / 30) * 10); // Max DP is typically 30
  const normalizedPA = Math.min(10, ((48 - mbiAssessment.PA) / 48) * 10); // Max PA is typically 48, inverted
  
  const mbiScore = (normalizedEE + normalizedDP + normalizedPA) / 3;

  // Combined score with weighted averages
  const combined = (moodScore * 0.2 + microScore * 0.3 + mbiScore * 0.5);

  // Determine risk level
  let riskLevel = 'Low';
  if (combined >= 7) riskLevel = 'High';
  else if (combined >= 4) riskLevel = 'Medium';

  // Generate recommendations based on scores
  const recommendations = generateRecommendations({
    moodScore,
    microScore,
    mbiScore,
    combined,
    microAssessment,
    mbiAssessment,
  });

  return { 
    combinedScore: combined.toFixed(1), 
    riskLevel,
    breakdown: {
      moodScore: parseFloat(moodScore.toFixed(1)),
      microScore: parseFloat(microScore.toFixed(1)),
      mbiScore: parseFloat(mbiScore.toFixed(1)),
    },
    recommendations,
  };
};

export const calculateBurnoutTrend = (
  currentAssessment: MbiAssessment,
  previousAssessment: MbiAssessment,
  moodAverage: number = 4
): BurnoutTrend => {
  const currentRisk = calculateBurnoutRisk({
    moodAverage,
    microAssessment: { fatigue: 3, stress: 3, satisfaction: 3, sleep: 3 },
    mbiAssessment: currentAssessment,
  });

  const previousRisk = calculateBurnoutRisk({
    moodAverage,
    microAssessment: { fatigue: 3, stress: 3, satisfaction: 3, sleep: 3 },
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

const generateRecommendations = ({
  moodScore,
  microScore,
  mbiScore,
  combined,
  microAssessment,
  mbiAssessment,
}: {
  moodScore: number;
  microScore: number;
  mbiScore: number;
  combined: number;
  microAssessment: MicroAssessment;
  mbiAssessment: MbiAssessment;
}): string[] => {
  const recommendations: string[] = [];

  // High-priority recommendations for severe burnout
  if (combined >= 7) {
    recommendations.push("Consider speaking with a mental health professional");
    recommendations.push("Take immediate steps to reduce workload if possible");
  }

  // MBI-specific recommendations
  if (mbiAssessment.EE > 27) { // High emotional exhaustion (>50% of max)
    recommendations.push("Practice stress-reduction techniques like meditation or deep breathing");
    recommendations.push("Ensure adequate rest between demanding tasks");
  }

  if (mbiAssessment.DP > 10) { // High depersonalization
    recommendations.push("Reconnect with the meaningful aspects of your work");
    recommendations.push("Seek peer support and professional community");
  }

  if (mbiAssessment.PA < 32) { // Low personal accomplishment
    recommendations.push("Set small, achievable goals to rebuild confidence");
    recommendations.push("Celebrate your successes, no matter how small");
  }

  // Micro assessment recommendations
  if (microAssessment.fatigue >= 4) {
    recommendations.push("Prioritize sleep hygiene and regular rest periods");
  }

  if (microAssessment.stress >= 4) {
    recommendations.push("Try our box breathing exercises for immediate stress relief");
  }

  if (microAssessment.satisfaction <= 2) {
    recommendations.push("Reflect on what aspects of work bring you joy");
  }

  if (microAssessment.sleep <= 2) {
    recommendations.push("Establish a consistent sleep schedule");
  }

  // Mood-based recommendations
  if (moodScore >= 6) {
    recommendations.push("Use our daily mood tracking to identify patterns");
    recommendations.push("Consider regular physical exercise or stretching");
  }

  // General wellness recommendations for all levels
  if (recommendations.length === 0) {
    recommendations.push("Continue your wellness journey with daily mood tracking");
    recommendations.push("Regular stretching and breathing exercises maintain good mental health");
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
  let insight = `Your burnout risk is currently ${currentRisk.riskLevel.toLowerCase()} (${currentRisk.combinedScore}/10).`;
  
  if (trend) {
    switch (trend) {
      case 'improving':
        insight += " Great news - your risk has decreased since your last assessment!";
        break;
      case 'worsening':
        insight += " Your risk has increased since your last assessment. Consider taking preventive action.";
        break;
      case 'stable':
        insight += " Your risk level has remained stable since your last assessment.";
        break;
    }
  }

  return insight;
};

// Calculate streak for any type of activity
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