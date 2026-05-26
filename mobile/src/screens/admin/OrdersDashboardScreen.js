// ============================================
// COMPLETE ADMIN DASHBOARD
// Orders Management + Shiprocket Integration
// ============================================

// ============================================
// 1. ADMIN: Orders Dashboard Screen
// admin/screens/OrdersDashboardScreen.js
// ============================================
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput, FlatList, Alert, Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const OrdersDashboardScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // FAB animation values
  const fabTranslationY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);

  // Settings Icon animation values
  const settingsRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(settingsRotation, {
        toValue: 1,
        duration: 4000, // 4 seconds per rotation
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    fetchOrders(1, true);
    fetchStats();
  }, [filter, timeframe]);

  const fetchOrders = async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setIsFetchingNextPage(true);
      }

      const response = await api.get('/admin/orders', {
        params: { 
          status: filter !== 'all' ? filter : undefined,
          timeframe: timeframe !== 'all' ? timeframe : undefined,
          page: pageNum,
          limit: 20
        }
      });

      const newOrders = response.data.data.orders;
      
      if (isInitial) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }

      if (newOrders.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  const fetchNextPage = () => {
    if (!isFetchingNextPage && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage, false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(1, true);
    fetchStats();
  };

  const handleScroll = (event) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const diff = currentOffsetY - lastOffsetY.current;

    if (currentOffsetY <= 10) {
      Animated.spring(fabTranslationY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else if (diff > 15) {
      Animated.spring(fabTranslationY, {
        toValue: 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else if (diff < -15) {
      Animated.spring(fabTranslationY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }

    lastOffsetY.current = currentOffsetY;
  };

  const handleHideOrder = (orderId) => {
    Alert.alert(
      'Hide Order',
      'Are you sure you want to hide this order from the dashboard? It will not be deleted from the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Hide', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await api.put(`/admin/orders/${orderId}/hide`);
              setOrders(prev => prev.filter(o => o._id !== orderId));
              fetchStats();
            } catch (error) {
              console.error('Failed to hide order:', error);
              Alert.alert('Error', 'Failed to hide the order. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/orders/stats', {
        params: { timeframe: timeframe !== 'all' ? timeframe : undefined }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      processing: '#8B5CF6',
      packed: '#10B981',
      shipped: '#0EA5E9',
      delivered: '#059669',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Icon name={icon} size={28} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const FilterChip = ({ label, value, count }) => (
    <TouchableOpacity
      style={[styles.filterChip, filter === value && styles.filterChipActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterChipText,
        filter === value && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={styles.filterChipBadge}>
          <Text style={styles.filterChipBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const TimeframeFilter = () => (
    <View style={styles.timeframeContainer}>
      {['all', 'today', 'week', 'month'].map((t) => (
        <TouchableOpacity
          key={t}
          style={[styles.timeframeBtn, timeframe === t && styles.timeframeBtnActive]}
          onPress={() => setTimeframe(t)}
        >
          <Text style={[styles.timeframeBtnText, timeframe === t && styles.timeframeBtnTextActive]}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredOrders = orders.filter(order =>
    order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View>
      {/* Timeframe Filter */}
      <TimeframeFilter />

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <StatCard
            icon="receipt-outline"
            label="Total Orders"
            value={stats.totalOrders}
            color="#4F46E5"
          />
          <StatCard
            icon="cube-outline"
            label="Packed"
            value={stats.packedOrders}
            color="#10B981"
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="Delivered"
            value={stats.deliveredOrders}
            color="#059669"
          />
          <StatCard
            icon="cash-outline"
            label="Revenue"
            value={`₹${stats.totalRevenue}`}
            color="#059669"
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order number or customer name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <FilterChip label="All" value="all" count={stats?.totalOrders} />
        <FilterChip label="Pending" value="pending" count={stats?.pendingOrders} />
        <FilterChip label="Confirmed" value="confirmed" count={stats?.confirmedOrders} />
        <FilterChip label="Processing" value="processing" count={stats?.processingOrders} />
        <FilterChip label="Packed" value="packed" count={stats?.packedOrders} />
        <FilterChip label="Shipped" value="shipped" count={stats?.shippedOrders} />
        <FilterChip label="Delivered" value="delivered" count={stats?.deliveredOrders} />
      </ScrollView>
    </View>
  );

  const renderItem = ({ item: order }) => (
    <TouchableOpacity
      key={order._id}
      style={styles.orderCard}
      onPress={() => navigation.navigate('AdminOrderDetails', { orderId: order._id })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNo}</Text>
          <Text style={styles.orderCustomer}>{order.user?.name}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(order.orderStatus) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(order.orderStatus) }
          ]}>
            {order.orderStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDivider} />

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <Icon name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.orderDetailText}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Icon name="cube-outline" size={16} color="#6B7280" />
          <Text style={styles.orderDetailText}>
            {order.items.length} items
          </Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Icon name="cash-outline" size={16} color="#6B7280" />
          <Text style={styles.orderAmount}>₹{order.total}</Text>
        </View>
      </View>

      {order.trackingNumber && (
        <View style={styles.trackingInfo}>
          <Icon name="navigate-outline" size={16} color="#4F46E5" />
          <Text style={styles.trackingText}>
            Tracking: {order.trackingNumber}
          </Text>
        </View>
      )}

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AdminOrderDetails', { orderId: order._id })}
        >
          <Icon name="eye-outline" size={18} color="#4F46E5" />
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>

        {!order.shiprocket?.shipmentId && ['confirmed', 'processing'].includes(order.orderStatus) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => navigation.navigate('CreateShipment', { orderId: order._id })}
          >
            <Icon name="airplane-outline" size={18} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>
              Ship
            </Text>
          </TouchableOpacity>
        )}

        {['cancelled', 'delivered', 'completed', 'returned', 'refunded'].includes(order.orderStatus) && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleHideOrder(order._id)}
          >
            <Icon name="eye-off-outline" size={18} color="#6B7280" />
            <Text style={[styles.actionBtnText, { color: '#6B7280' }]}>
              Hide
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const spin = settingsRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders Management</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('ShiprocketSettings')}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="settings-outline" size={24} color="#4F46E5" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isLoading && orders.length === 0 ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={() => (
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 16 }} />
            ) : null
          )}
          ListEmptyComponent={() => (
            !isLoading ? (
              <View style={styles.emptyState}>
                <Icon name="receipt-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            ) : null
          )}
          contentContainerStyle={styles.ordersContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.2}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      {/* Support FAB */}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabTranslationY }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Support')}
        >
          <Icon name="chatbubbles" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  settingsBtn: { padding: 8 },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  timeframeBtnActive: {
    backgroundColor: '#4F46E5'
  },
  timeframeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  timeframeBtnTextActive: {
    color: '#fff'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    gap: 6
  },
  filterChipActive: {
    backgroundColor: '#4F46E5'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterChipTextActive: { color: '#fff' },
  filterChipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  filterChipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff'
  },
  ordersContainer: { paddingHorizontal: 16, paddingBottom: 80 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderCustomer: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12
  },
  orderDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  orderDetailText: { fontSize: 13, color: '#6B7280' },
  orderAmount: { fontSize: 13, fontWeight: '700', color: '#111827' },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  trackingText: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  orderActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  actionBtnPrimary: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  fab: {
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default OrdersDashboardScreen;