import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItineraries } from '@/store/itinerarySlice';
import { formatDate } from 'date-fns';

export function DashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: itineraries, loading } = useAppSelector((state) => state.itineraries);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        dispatch(fetchItineraries());
      }
    }, [dispatch, user?.email])
  );

  const renderItinerary = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItineraryDetail', { id: item.id })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
      <Text style={styles.cardDate}>
        📅 {formatDate(new Date(item.startDate), 'MMM dd')} -{' '}
        {formatDate(new Date(item.endDate), 'MMM dd, yyyy')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Itineraries</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateItinerary')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : itineraries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No itineraries yet</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateItinerary')}
          >
            <Text style={styles.buttonText}>Create Your First Itinerary</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          renderItem={renderItinerary}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

