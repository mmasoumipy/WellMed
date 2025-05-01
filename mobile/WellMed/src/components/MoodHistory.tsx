
import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

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



  useEffect(() => {
    const fetchMoods = async () => {
      const raw = await AsyncStorage.getItem('moodEntries');
      if (!raw) return;
      const moods = JSON.parse(raw);
      const values = moods.map((m: any) => moodScale[m.value]);
      const shortLabels = moods.map((m: any) => {
        const d = new Date(m.timestamp);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });
      setChartData(values.reverse());
      setLabels(shortLabels.reverse());
    };
  
    fetchMoods();
  
    const interval = setInterval(fetchMoods, 10000); // Then poll every 10 seconds
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

