type MicroAssessment = {
    fatigue: number;
    stress: number;
    satisfaction: number;
    sleep: number;
  };
  
  type MbiAssessment = {
    EE: number;
    DP: number;
    PA: number;
  };
  
  export const calculateBurnoutRisk = ({
    moodAverage,
    microAssessment,
    mbiAssessment,
  }: {
    moodAverage: number;
    microAssessment: MicroAssessment;
    mbiAssessment: MbiAssessment;
  }) => {
    const moodScore = (moodAverage - 1) / 5 * 10;
  
    const microAvg =
      (microAssessment.fatigue +
        microAssessment.stress +
        (6 - microAssessment.satisfaction) +
        (6 - microAssessment.sleep)) /
      4;
    const microScore = (microAvg - 1) / 4 * 10;
  
    const mbiScore = (mbiAssessment.EE + mbiAssessment.DP) / 2;
  
    const combined = (moodScore + microScore + mbiScore) / 3;
  
    let riskLevel = 'Low';
    if (combined >= 7) riskLevel = 'High';
    else if (combined >= 4) riskLevel = 'Medium';
  
    return { combinedScore: combined.toFixed(1), riskLevel };
  };
  