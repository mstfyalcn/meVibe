import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyQuote {
  id: string;
  content: string;
  author: string;
  category: string;
}

const HomeScreen = () => {
  const [dailyQuote, setDailyQuote] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailyQuote = async () => {
    try {
      // Kullanıcının ilgi alanlarını al
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: anonymousUser } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      const { data: userInterests } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', anonymousUser?.id);

      const interestIds = userInterests?.map(ui => ui.interest_id) || [];

      // İlgi alanlarına göre rastgele bir motivasyon sözü al
      const { data: quote } = await supabase
        .from('motivation_quotes')
        .select(`
          content,
          author,
          interest_areas (
            name,
            icon
          )
        `)
        .in('interest_area_id', interestIds)
        .limit(1)
        .single();

      setDailyQuote(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyQuote();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Günaydın!</Text>
        <Text style={styles.subGreeting}>İşte bugünün motivasyon sözü</Text>
      </View>

      {dailyQuote ? (
        <View style={styles.quoteContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.quoteGradient}
          >
            <Text style={styles.quoteText}>"{dailyQuote.content}"</Text>
            <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Gün Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>21</Text>
          <Text style={styles.statLabel}>Toplam Alıntı</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.premiumButton}>
        <LinearGradient
          colors={[COLORS.tertiary, COLORS.primary]}
          style={styles.premiumGradient}
        >
          <Text style={styles.premiumText}>Premium'a Yükselt</Text>
          <Text style={styles.premiumDescription}>
            Daha fazla özellik ve özel içerik için premium üye olun
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.large,
  },
  greeting: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subGreeting: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  quoteContainer: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SIZES.extraLarge,
  },
  quoteText: {
    fontSize: SIZES.large,
    color: COLORS.white,
    lineHeight: SIZES.large * 1.5,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginTop: SIZES.large,
    textAlign: 'right',
  },
  loadingContainer: {
    margin: SIZES.large,
    padding: SIZES.extraLarge,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SIZES.large,
  },
  statCard: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.large,
    borderRadius: SIZES.base,
    alignItems: 'center',
    width: '40%',
  },
  statNumber: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  premiumButton: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: SIZES.large,
  },
  premiumText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.base,
    opacity: 0.8,
  },
});

export default HomeScreen; 