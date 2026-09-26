import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PointsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, records: [] });
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const DAILY_GOAL = 300; // 5 minutes

  useEffect(() => {
    fetchStreakData();
    // Re-fetch when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStreakData();
      loadTodayUnsynced();
    });
    return unsubscribe;
  }, [navigation, currentMonth]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const res = await api.get(`/streak?month=${monthStr}`);
      if (res.data.success) {
        setStreakData(res.data.data);
        
        // Find today's record
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = res.data.data.records.find(r => r.dateString === todayStr);
        if (todayRecord) {
          setTodaySeconds(todayRecord.activeSeconds);
        }
      }
    } catch (e) {
      console.log('Error fetching streak data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayUnsynced = async () => {
    try {
      const unsynced = await AsyncStorage.getItem('@unsynced_streak_seconds');
      if (unsynced) {
        // Just visual addition if it hasn't synced yet
        // In a real scenario we could add it to todaySeconds
      }
    } catch (e) {}
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        date: d,
        dateString: d.toISOString().split('T')[0]
      };
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const completedSet = new Set(streakData.records.filter(r => r.isCompleted).map(r => r.dateString));

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isCompletedToday = todaySeconds >= DAILY_GOAL;
  const progressPercent = Math.min((todaySeconds / DAILY_GOAL) * 100, 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Streak</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !streakData.records.length ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.content}>
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakFire}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>{streakData.currentStreak} Day Streak</Text>
                <Text style={styles.streakSubtitle}>Longest: {streakData.longestStreak} Days</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Today's Goal</Text>
              <Text style={styles.progressText}>
                {formatTime(todaySeconds)} / {formatTime(DAILY_GOAL)}
              </Text>
              
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              
              {isCompletedToday ? (
                <Text style={styles.progressStatusCompleted}>✓ Daily goal completed</Text>
              ) : (
                <Text style={styles.progressStatusRemaining}>
                  {formatTime(DAILY_GOAL - todaySeconds)} remaining
                </Text>
              )}
            </View>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Icon name="chevron-back" size={24} color="#4F46E5" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Icon name="chevron-forward" size={24} color={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? '#ccc' : '#4F46E5'} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
              ))}
              
              {/* Padding for first day of month */}
              {Array.from({ length: (days[0].date.getDay() + 6) % 7 }).map((_, i) => (
                <View key={`pad-${i}`} style={styles.calendarDayCell} />
              ))}

              {days.map(dayObj => {
                const isCompleted = completedSet.has(dayObj.dateString);
                const isToday = dayObj.dateString === todayStr;
                const isFuture = dayObj.date > new Date();

                return (
                  <View key={dayObj.dateString} style={[styles.calendarDayCell, isToday && styles.todayCell]}>
                    <Text style={[styles.dayText, isFuture && styles.futureText]}>{dayObj.date.getDate()}</Text>
                    {!isFuture && (
                      <View style={[styles.indicator, isCompleted ? styles.indicatorCompleted : styles.indicatorIncomplete]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { padding: 16 },
  streakCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  streakHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  streakFire: { fontSize: 40, marginRight: 12 },
  streakTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  streakSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  progressSection: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  progressText: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  progressStatusCompleted: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  progressStatusRemaining: { color: '#F59E0B', fontSize: 14 },
  calendarCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calendarMonthTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#6B7280', marginBottom: 12 },
  calendarDayCell: { width: '14.28%', alignItems: 'center', marginBottom: 16, paddingVertical: 4 },
  todayCell: { backgroundColor: '#F3F4F6', borderRadius: 8 },
  dayText: { fontSize: 14, color: '#374151', marginBottom: 4 },
  futureText: { color: '#D1D5DB' },
  indicator: { width: 8, height: 8, borderRadius: 4 },
  indicatorCompleted: { backgroundColor: '#10B981' },
  indicatorIncomplete: { backgroundColor: '#E5E7EB' }
});

export default PointsScreen;
