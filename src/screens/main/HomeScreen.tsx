import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  Clipboard,
  Share,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './HomeScreen.styles';

interface Quote {
  id: string;
  content: string;
  author: string;
  interest_areas?: {
    id: string;
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// Günlük temalar
const DAILY_THEMES = [
  { day: 0, theme: 'Yeni Başlangıçlar', emoji: '🌅', color: ['#667eea', '#764ba2'] },
  { day: 1, theme: 'Motivasyon', emoji: '💪', color: ['#f093fb', '#f5576c'] },
  { day: 2, theme: 'İlham', emoji: '✨', color: ['#4facfe', '#00f2fe'] },
  { day: 3, theme: 'Başarı', emoji: '🏆', color: ['#43e97b', '#38f9d7'] },
  { day: 4, theme: 'Mutluluk', emoji: '😊', color: ['#fa709a', '#fee140'] },
  { day: 5, theme: 'Güç', emoji: '🔥', color: ['#ff6b6b', '#ffd93d'] },
  { day: 6, theme: 'Huzur', emoji: '🌙', color: ['#a8edea', '#fed6e3'] },
];

const HomeScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyTheme, setDailyTheme] = useState(DAILY_THEMES[new Date().getDay()]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        loadUserData(),
        fetchQuotes(),
        loadCategories(),
        loadFavorites(),
        calculateStreak(),
      ]);
      setLoading(false);
      
      // Fade in animasyonu
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    };
    
    loadAllData();
  }, []);

  useEffect(() => {
    filterQuotesByCategory();
  }, [selectedCategory, allQuotes]);

  const loadUserData = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      const { data: user } = await supabase
        .from('anonymous_users')
        .select('name')
        .eq('device_id', deviceId)
        .single();
      
      setUserName(user?.name || 'Arkadaş');
    } catch (error) {
      console.error('Kullanıcı adı yüklenirken hata:', error);
      setUserName('Arkadaş');
    }
  };

  const fetchQuotes = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: anonymousUser } = await supabase
        .from('anonymous_users')
        .select('id, notification_count')
        .eq('device_id', deviceId)
        .single();

      const { data: userInterests } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', anonymousUser?.id);

      const interestIds = userInterests?.map(ui => ui.interest_id) || [];
      const quoteCount = (anonymousUser?.notification_count || 3) * 2; // 2x daha fazla yükle (filtreleme için)

      // İlgi alanlarına göre motivasyon sözleri al
      const { data: fetchedQuotes } = await supabase
        .from('motivation_quotes')
        .select(`
          id,
          content,
          author,
          interest_areas (
            id,
            name,
            icon
          )
        `)
        .in('interest_area_id', interestIds);

      if (fetchedQuotes && fetchedQuotes.length > 0) {
        // Rastgele karıştır
        const shuffled = fetchedQuotes.sort(() => 0.5 - Math.random());
        setAllQuotes(shuffled);
        setQuotes(shuffled.slice(0, quoteCount));
      }
    } catch (error) {
      console.error('Sözler yüklenirken hata:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: anonymousUser } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      const { data: userInterests } = await supabase
        .from('user_interests')
        .select(`
          interest_areas (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', anonymousUser?.id);

      if (userInterests) {
        const cats = userInterests
          .map((ui: any) => ui.interest_areas)
          .filter((ia: any) => ia !== null);
        setCategories(cats);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const filterQuotesByCategory = () => {
    if (!selectedCategory) {
      // Tüm sözleri göster
      const userCount = allQuotes.length > 0 ? Math.min(6, allQuotes.length) : 0;
      setQuotes(allQuotes.slice(0, userCount));
    } else {
      // Seçili kategoriye göre filtrele
      const filtered = allQuotes.filter(
        q => q.interest_areas?.id === selectedCategory
      );
      setQuotes(filtered.slice(0, 6));
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        setFavoriteIds(JSON.parse(favorites));
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  };

  const calculateStreak = async () => {
    try {
      const lastVisit = await AsyncStorage.getItem('lastVisit');
      const currentStreak = await AsyncStorage.getItem('streak');
      const today = new Date().toDateString();

      if (lastVisit === today) {
        // Bugün zaten ziyaret edilmiş
        setStreak(parseInt(currentStreak || '0'));
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
          // Dün ziyaret edilmişse streak devam ediyor
          const newStreak = parseInt(currentStreak || '0') + 1;
          await AsyncStorage.setItem('streak', newStreak.toString());
          setStreak(newStreak);
        } else {
          // Streak kırıldı
          await AsyncStorage.setItem('streak', '1');
          setStreak(1);
        }
        
        await AsyncStorage.setItem('lastVisit', today);
      }
    } catch (error) {
      console.error('Streak hesaplanırken hata:', error);
    }
  };

  const toggleFavorite = async (quoteId: string) => {
    try {
      let newFavorites = [...favoriteIds];
      
      if (favoriteIds.includes(quoteId)) {
        newFavorites = newFavorites.filter(id => id !== quoteId);
        Alert.alert('✅', 'Favorilerden çıkarıldı');
      } else {
        newFavorites.push(quoteId);
        Alert.alert('❤️', 'Favorilere eklendi');
      }
      
      setFavoriteIds(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Favori eklenirken hata:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('📋', 'Panoya kopyalandı');
  };

  const shareQuote = async (quote: Quote) => {
    try {
      await Share.share({
        message: `"${quote.content}"\n\n- ${quote.author}\n\n📱 MeVibe uygulamasından paylaşıldı`,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Günaydın';
    if (hour < 18) return '☀️ İyi Günler';
    return '🌙 İyi Akşamlar';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {getGreeting()} {userName}!
            </Text>
            <Text style={styles.subGreeting}>
              Sana özel {quotes.length} motivasyon mesajı hazır
            </Text>
          </View>

          {/* Streak Card */}
          {streak > 0 && (
            <View style={styles.streakCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FFE66D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.streakGradient}
              >
                <Text style={styles.streakEmoji}>🔥</Text>
                <View>
                  <Text style={styles.streakNumber}>{streak} Günlük Seri!</Text>
                  <Text style={styles.streakText}>
                    Harikasın! Devam et
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Daily Theme Card */}
          <View style={styles.themeCard}>
            <LinearGradient
              colors={dailyTheme.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.themeGradient}
            >
              <Text style={styles.themeEmoji}>{dailyTheme.emoji}</Text>
              <Text style={styles.themeTitle}>Bugünün Teması</Text>
              <Text style={styles.themeSubtitle}>{dailyTheme.theme}</Text>
            </LinearGradient>
          </View>

          {/* Category Filter */}
          {categories.length > 0 && (
            <View style={styles.categoryFilter}>
              <Text style={styles.categoryFilterTitle}>📚 Kategoriler</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      !selectedCategory && styles.categoryChipTextActive,
                    ]}
                  >
                    🌟 Tümü
                  </Text>
                </TouchableOpacity>
                
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.icon} {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quote Cards */}
          {quotes.length > 0 ? (
            quotes.map((quote, index) => (
              <View key={quote.id} style={styles.quoteContainer}>
                <LinearGradient
                  colors={
                    index === 0
                      ? [COLORS.primary, COLORS.secondary]
                      : index === 1
                      ? ['#667eea', '#764ba2']
                      : ['#f093fb', '#f5576c']
                  }
                  style={[
                    styles.quoteGradient,
                    index === 0 && styles.mainQuoteGradient,
                  ]}
                >
                  {/* Category Badge */}
                  {quote.interest_areas && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryIcon}>
                        {quote.interest_areas.icon}
                      </Text>
                      <Text style={styles.categoryName}>
                        {quote.interest_areas.name}
                      </Text>
                    </View>
                  )}

                  <Text
                    style={[
                      styles.quoteText,
                      index === 0 && styles.mainQuoteText,
                    ]}
                  >
                    "{quote.content}"
                  </Text>
                  <Text style={styles.quoteAuthor}>- {quote.author}</Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleFavorite(quote.id)}
                    >
                      <Text style={styles.actionButtonText}>
                        {favoriteIds.includes(quote.id) ? '❤️' : '🤍'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        copyToClipboard(
                          `"${quote.content}"\n\n- ${quote.author}`
                        )
                      }
                    >
                      <Text style={styles.actionButtonText}>📋</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => shareQuote(quote)}
                    >
                      <Text style={styles.actionButtonText}>📤</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>📚 Motivasyon sözleri yükleniyor...</Text>
            </View>
          )}

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 İstatistikleriniz</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{quotes.length}</Text>
                <Text style={styles.statLabel}>Bugün</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favoriteIds.length}</Text>
                <Text style={styles.statLabel}>Favori</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{streak}</Text>
                <Text style={styles.statLabel}>Seri</Text>
              </View>
            </View>
          </View>

          {/* Refresh Hint */}
          <Text style={styles.refreshHint}>
            ⬇️ Yeni sözler için aşağı çekin
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 