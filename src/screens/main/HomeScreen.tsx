import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './HomeScreen.styles';

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
    <SafeAreaView style={styles.safeArea}>
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
 

       
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 