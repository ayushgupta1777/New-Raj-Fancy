import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const CARD_W = (width - 45) / 2;

const MODULES = [
  { id: 'DevLiveMonitor',    icon: 'pulse',          label: 'LIVE\nNODES',      danger: false },
  { id: 'DevServerHealth',   icon: 'server',         label: 'SERVER\nHEALTH',   danger: false },
  { id: 'DevFinancials',     icon: 'cash',           label: 'FINANCIAL\nINTEL',  danger: false },
  { id: 'DevGeoPresence',    icon: 'earth',          label: 'GEO\nPRESENCE',    danger: false },
  { id: 'DevErrorLog',       icon: 'warning',        label: 'ERROR\nLOGS',      danger: true  },
  { id: 'DevDeviceIntel',    icon: 'phone-portrait', label: 'DEVICE\nINTEL',    danger: false },
  { id: 'DevSecurity',       icon: 'shield',         label: 'SECURITY\nALERTS', danger: true  },
  { id: 'DevControlPanel',   icon: 'settings',       label: 'CONTROL\nPANEL',   danger: true  },
  { id: 'DevOrderPulse',     icon: 'cart',           label: 'ORDER\nPULSE',     danger: false },
  { id: 'DevUserList',       icon: 'people',         label: 'USER\nDATABASE',   danger: false },
];

const DevHubScreen = ({ navigation }) => {
  const pulseAnims = useRef(MODULES.map(() => new Animated.Value(1))).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    MODULES.forEach((_, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnims[i], { toValue: 1.03, duration: 1200 + i * 100, useNativeDriver: true }),
        Animated.timing(pulseAnims[i], { toValue: 1,    duration: 1200 + i * 100, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DEVELOPER TERMINAL</Text>
        <Text style={styles.headerSub}>SYSTEM ACCESS — LEVEL OMEGA</Text>
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.grid}>
        {MODULES.map((mod, i) => (
          <Animated.View key={mod.id} style={{ transform: [{ scale: pulseAnims[i] }] }}>
            <TouchableOpacity
              style={[styles.card, mod.danger && styles.dangerCard]}
              onPress={() => navigation.navigate(mod.id)}
            >
              <Icon name={mod.icon} size={32} color={mod.danger ? '#FF3B30' : '#fff'} />
              <Text style={[styles.cardLabel, mod.danger && styles.dangerLabel]}>{mod.label}</Text>
              {mod.danger && <View style={styles.dangerBadge}><Text style={styles.dangerBadgeText}>⚠</Text></View>}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 24, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#fff' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 4 },
  headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, gap: 15, justifyContent: 'space-between' },
  card: {
    width: CARD_W, height: CARD_W * 0.9,
    borderWidth: 1, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    padding: 12, position: 'relative',
  },
  dangerCard: { borderColor: '#FF3B30' },
  cardLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center', marginTop: 10 },
  dangerLabel: { color: '#FF3B30' },
  dangerBadge: { position: 'absolute', top: 6, right: 8 },
  dangerBadgeText: { color: '#FF3B30', fontSize: 12 },
});

export default DevHubScreen;
