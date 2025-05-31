import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import api from '../api/api';

const screenWidth = Dimensions.get('window').width;

const moodScale: Record<string, number> = {
  Excellent: 6,
  Good: 5,
  Okay: 4,
  Stressed: 3,
  Tired: 2,
  Anxious: 1,
};

export default function MoodChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const fetchMoods = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
  
      const response = await api.get(`/moods/user/${userId}`);
      const moods = response.data;
  
      // Step 1: Group moods by day, keeping only the last entry per day
      const moodMap: Record<string, any> = {};
  
      moods.forEach((m: any) => {
        const dateKey = new Date(m.timestamp).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const existing = moodMap[dateKey];
  
        if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
          moodMap[dateKey] = m;
        }
      });
  
      // Step 2: Sort by date (ascending) so the latest ends up at the right
      const sortedMoods = Object.entries(moodMap)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([_, mood]) => mood);
  
      // Step 3: Map to values + labels
      const values: number[] = [];
      const shortLabels: string[] = [];
  
      sortedMoods.forEach((m) => {
        const moodValue = moodScale[m.mood];
        if (typeof moodValue === 'number') {
          values.push(moodValue);
          const d = new Date(m.timestamp);
          shortLabels.push(`${d.getDate()}/${d.getMonth() + 1}`);
        }
      });
  
      setChartData(values);
      setLabels(shortLabels);
    } catch (e) {
      console.error('Error fetching mood history:', e);
    }
  };
  
  

  useEffect(() => {
    fetchMoods();
    const interval = setInterval(fetchMoods, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup
  }, []);

  if (chartData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Trend</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisInterval={1}
        fromZero
        formatYLabel={(value) => {
          const moodNames: { [key: number]: string } = {
            6: 'Excellent',
            5: 'Good',
            4: 'Okay',
            3: 'Stressed',
            2: 'Tired',
            1: 'Anxious',
          };
          return moodNames[parseInt(value)] || '';
        }}
        chartConfig={{
          backgroundGradientFrom: colors.backgroundPrimary,
          backgroundGradientTo: colors.backgroundPrimary,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          labelColor: () => colors.textPrimary,
          propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 10 },
  chart: { borderRadius: 8 },
});
