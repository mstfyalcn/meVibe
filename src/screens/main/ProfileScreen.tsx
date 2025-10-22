import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './ProfileScreen.styles';
import { 
  scheduleMotivationNotification, 
  cancelAllNotifications,
  sendTestNotification,
  getScheduledNotifications,
  getNotificationStats,
} from '../../services/notifications';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface UserInterest {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface InterestArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface SupabaseResponse {
  interest_areas: InterestArea;
}

const ProfileScreen = ({ navigation }: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [notificationTimes, setNotificationTimes] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [favoriteQuotes, setFavoriteQuotes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    favoriteCount: 0,
    streak: 0,
    daysActive: 0,
  });
  const [notificationStats, setNotificationStats] = useState({
    scheduled: 0,
    total: 0,
    nextNotification: null as any,
  });
  const [notificationCount, setNotificationCount] = useState<number>(3);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    checkAuthStatus();
    loadUserInterests();
    loadNotificationTimes();
    loadUserName();
    loadAchievements();
    loadFavorites();
    loadStats();
    loadNotificationStats();
    loadNotificationCount();
    
    // Fade in animasyonu
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Ekran her görünür olduğunda auth durumunu ve ismi kontrol et
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthStatus();
      loadUserName();
      loadFavorites();
      loadStats();
      loadNotificationStats();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserInterests = async () => {
    try {
      setLoadingInterests(true);
      const deviceId = await AsyncStorage.getItem('deviceId');

      // Önce anonymous user'ı bul
      const { data: anonymousUser, error: userError } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (userError) throw userError;

      // Kullanıcının ilgi alanlarını çek
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          interest_areas (
            id,
            name,
            icon,
            description
          )
        `)
        .eq('user_id', anonymousUser.id);

      if (error) throw error;

      console.log('Supabase response:', JSON.stringify(data, null, 2));

      if (data && Array.isArray(data)) {
        const interests: UserInterest[] = data.reduce((acc: UserInterest[], item: any) => {
          if (item.interest_areas) {
            acc.push({
              id: item.interest_areas.id,
              name: item.interest_areas.name,
              icon: item.interest_areas.icon,
              description: item.interest_areas.description
            });
          }
          return acc;
        }, []);
        setUserInterests(interests);
      }
    } catch (error) {
      console.error('İlgi alanları yüklenirken hata:', error);
    } finally {
      setLoadingInterests(false);
    }
  };

  const loadNotificationTimes = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: user, error } = await supabase
        .from('anonymous_users')
        .select('notification_time_start, notification_time_end')
        .eq('device_id', deviceId)
        .single();

      if (error) throw error;

      if (user) {
        setNotificationTimes({
          start: user.notification_time_start.slice(0, 5),
          end: user.notification_time_end.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Bildirim zamanları yüklenirken hata:', error);
    }
  };

  const loadUserName = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: user, error } = await supabase
        .from('anonymous_users')
        .select('name')
        .eq('device_id', deviceId)
        .single();

      if (error) throw error;

      if (user && user.name) {
        setUserName(user.name);
      } else {
        setUserName('Misafir Kullanıcı');
      }
    } catch (error) {
      console.error('Kullanıcı adı yüklenirken hata:', error);
      setUserName('Misafir Kullanıcı');
    }
  };

  const loadAchievements = async () => {
    try {
      const streak = parseInt((await AsyncStorage.getItem('streak')) || '0');
      const favorites = JSON.parse((await AsyncStorage.getItem('favorites')) || '[]');
      const firstVisit = await AsyncStorage.getItem('firstVisit');
      
      const daysActive = firstVisit 
        ? Math.floor((Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 1;

      const achievementsList: Achievement[] = [
        {
          id: 'first_day',
          title: 'İlk Adım',
          description: 'MeVibe\'a hoş geldin!',
          icon: '🎉',
          unlocked: true,
        },
        {
          id: 'streak_3',
          title: '3 Günlük Seri',
          description: '3 gün üst üste uygulamayı kullan',
          icon: '🔥',
          unlocked: streak >= 3,
          progress: Math.min(streak, 3),
          target: 3,
        },
        {
          id: 'streak_7',
          title: 'Bir Hafta',
          description: '7 gün üst üste uygulamayı kullan',
          icon: '⭐',
          unlocked: streak >= 7,
          progress: Math.min(streak, 7),
          target: 7,
        },
        {
          id: 'streak_30',
          title: 'Ay Yıldızı',
          description: '30 gün üst üste uygulamayı kullan',
          icon: '🌟',
          unlocked: streak >= 30,
          progress: Math.min(streak, 30),
          target: 30,
        },
        {
          id: 'favorite_10',
          title: 'Koleksiyoncu',
          description: '10 sözü favorilere ekle',
          icon: '❤️',
          unlocked: favorites.length >= 10,
          progress: Math.min(favorites.length, 10),
          target: 10,
        },
        {
          id: 'active_7',
          title: 'Aktif Kullanıcı',
          description: '7 gün boyunca aktif ol',
          icon: '💪',
          unlocked: daysActive >= 7,
          progress: Math.min(daysActive, 7),
          target: 7,
        },
      ];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Başarılar yüklenirken hata:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (!favorites) {
        setFavoriteQuotes([]);
        return;
      }

      const favoriteIds = JSON.parse(favorites);
      
      if (favoriteIds.length === 0) {
        setFavoriteQuotes([]);
        return;
      }

      const { data: quotes, error } = await supabase
        .from('motivation_quotes')
        .select(`
          id,
          content,
          author,
          interest_areas (
            name,
            icon
          )
        `)
        .in('id', favoriteIds);

      if (error) throw error;

      setFavoriteQuotes(quotes || []);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
      setFavoriteQuotes([]);
    }
  };

  const loadStats = async () => {
    try {
      const streak = parseInt((await AsyncStorage.getItem('streak')) || '0');
      const favorites = JSON.parse((await AsyncStorage.getItem('favorites')) || '[]');
      const firstVisit = await AsyncStorage.getItem('firstVisit');
      
      // İlk ziyaret kaydı yoksa kaydet
      if (!firstVisit) {
        await AsyncStorage.setItem('firstVisit', new Date().toISOString());
      }

      const daysActive = firstVisit 
        ? Math.floor((Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 1;

      // Toplam alınan söz sayısını hesapla
      const deviceId = await AsyncStorage.getItem('deviceId');
      const { data: user } = await supabase
        .from('anonymous_users')
        .select('notification_count')
        .eq('device_id', deviceId)
        .single();

      const dailyQuotes = user?.notification_count || 3;
      const totalQuotes = dailyQuotes * daysActive;

      setStats({
        totalQuotes,
        favoriteCount: favorites.length,
        streak,
        daysActive,
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const removeFavorite = async (quoteId: string) => {
    try {
      const favorites = JSON.parse((await AsyncStorage.getItem('favorites')) || '[]');
      const newFavorites = favorites.filter((id: string) => id !== quoteId);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      loadFavorites();
      loadStats();
      loadAchievements();
      Alert.alert('✅', 'Favorilerden çıkarıldı');
    } catch (error) {
      console.error('Favori çıkarılırken hata:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await getNotificationStats();
      setNotificationStats(stats);
    } catch (error) {
      console.error('Bildirim stats yüklenirken hata:', error);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      const { data: user } = await supabase
        .from('anonymous_users')
        .select('notification_count')
        .eq('device_id', deviceId)
        .single();
      
      setNotificationCount(user?.notification_count || 3);
    } catch (error) {
      console.error('Bildirim sayısı yüklenirken hata:', error);
    }
  };

  const handleNotificationCountChange = async (count: number) => {
    Alert.alert(
      'Bildirim Sayısını Değiştir',
      `Günlük ${count} bildirim almak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: async () => {
            try {
              const deviceId = await AsyncStorage.getItem('deviceId');
              
              // Veritabanını güncelle
              const { error } = await supabase
                .from('anonymous_users')
                .update({ notification_count: count })
                .eq('device_id', deviceId);
              
              if (error) throw error;
              
              setNotificationCount(count);
              
              // Bildirimleri yeniden planla
              const success = await scheduleMotivationNotification();
              if (success) {
                await loadNotificationStats();
                Alert.alert('✅ Başarılı', `Bildirim sayısı ${count} olarak güncellendi ve bildirimler yeniden planlandı!`);
              } else {
                Alert.alert('⚠️ Uyarı', 'Bildirim sayısı güncellendi ancak bildirimler planlanamadı.');
              }
            } catch (error) {
              console.error('Bildirim sayısı güncellenirken hata:', error);
              Alert.alert('❌ Hata', 'Bildirim sayısı güncellenirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      const success = await sendTestNotification();
      if (success) {
        Alert.alert('✅ Başarılı', 'Test bildirimi 2 saniye içinde gelecek!');
      } else {
        Alert.alert('❌ Hata', 'Test bildirimi gönderilemedi.');
      }
    } catch (error) {
      Alert.alert('❌ Hata', 'Bir hata oluştu.');
    }
  };

  const handleRescheduleNotifications = async () => {
    Alert.alert(
      'Bildirimleri Yeniden Planla',
      'Tüm bildirimler yeniden planlanacak. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Planla',
          onPress: async () => {
            try {
              const success = await scheduleMotivationNotification();
              if (success) {
                await loadNotificationStats();
                Alert.alert('✅ Başarılı', 'Bildirimler yeniden planlandı!');
              } else {
                Alert.alert('❌ Hata', 'Bildirimler planlanamadı.');
              }
            } catch (error) {
              Alert.alert('❌ Hata', 'Bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user?.email);
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              setIsAuthenticated(false);
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handlePremiumUpgrade = () => {
    Alert.alert(
      'Premium Üyelik',
      'Premium özellikler yakında eklenecek!',
      [{ text: 'Tamam' }]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Uygulamayı Sıfırla',
      'Tüm veriler silinecek ve onboarding ekranına yönlendirileceksiniz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              // AsyncStorage'daki tüm verileri sil
              await AsyncStorage.clear();
              
              // Auth çıkışı yap (eğer giriş yapılmışsa)
              await supabase.auth.signOut();
              
              // Onboarding ekranına yönlendir
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
              
              Alert.alert('Başarılı', 'Uygulama sıfırlandı.');
            } catch (error) {
              console.error('Sıfırlama hatası:', error);
              Alert.alert('Hata', 'Uygulama sıfırlanırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      if (value) {
        // Bildirimleri aç ve planla
        const success = await scheduleMotivationNotification();
        if (success) {
          await loadNotificationStats();
          Alert.alert('✅ Başarılı', 'Bildirimler açıldı ve planlandı!');
        } else {
          Alert.alert('⚠️ Uyarı', 'Bildirimler açıldı ancak planlanamadı.');
        }
      } else {
        // Bildirimleri kapat ve iptal et
        await cancelAllNotifications();
        await loadNotificationStats();
        Alert.alert('🔕 Bildirimler Kapatıldı', 'Tüm bildirimler iptal edildi.');
      }
    } catch (error) {
      console.error('Bildirim ayarları değiştirilirken hata:', error);
      Alert.alert('Hata', 'Bildirim ayarları değiştirilirken bir hata oluştu.');
    }
  };

  const renderAuthSection = () => {
    if (isAuthenticated) {
      return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <Text style={styles.sectionNote}>
          İsteğe bağlı: Hesap oluşturarak verilerinizi cihazlar arasında senkronize edebilirsiniz.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap / Kayıt Ol (Opsiyonel)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInterestsSection = () => {
    if (loadingInterests) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    return (
      <View>
        {userInterests.map((interest) => (
          <View key={interest.id} style={styles.interestItem}>
            <View style={styles.interestHeader}>
              <Text style={styles.interestIcon}>{interest.icon}</Text>
              <Text style={styles.interestName}>{interest.name}</Text>
            </View>
            <Text style={styles.interestDescription}>{interest.description}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditInterests', {
            isFromProfile: true,
            selectedInterests: userInterests.map(interest => interest.id)
          })}
        >
          <Text style={styles.editButtonText}>İlgi Alanlarını Düzenle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNotificationTimesSection = () => {
    if (!notificationTimes) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    return (
      <View>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditNotificationTime', {
            isFromProfile: true
          })}
        >
          <Text style={styles.editButtonText}>Bildirim Saatlerini Düzenle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettingsSection = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('EditInterests', {
            isFromProfile: true,
            selectedInterests: userInterests.map(interest => interest.id)
          })}
        >
          <View style={styles.settingsButtonContent}>
            <View style={styles.settingsButtonLeft}>
              <Text style={styles.settingsButtonIcon}>🎯</Text>
              <Text style={styles.settingsButtonText}>İlgi Alanları</Text>
            </View>
            <Text style={styles.settingsButtonArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('EditNotificationTime', {
            isFromProfile: true
          })}
        >
          <View style={styles.settingsButtonContent}>
            <View style={styles.settingsButtonLeft}>
              <Text style={styles.settingsButtonIcon}>⏰</Text>
              <Text style={styles.settingsButtonText}>Bildirim Saati</Text>
            </View>
            <Text style={styles.settingsButtonArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAchievements = () => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Başarılar</Text>
          <Text style={styles.sectionBadge}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked,
              ]}
              onPress={() => {
                if (achievement.progress !== undefined && achievement.target !== undefined) {
                  Alert.alert(
                    achievement.title,
                    `${achievement.description}\n\nİlerleme: ${achievement.progress}/${achievement.target}`
                  );
                } else {
                  Alert.alert(achievement.title, achievement.description);
                }
              }}
            >
              <Text style={[
                styles.achievementIcon,
                !achievement.unlocked && styles.achievementIconLocked
              ]}>
                {achievement.icon}
              </Text>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.achievementTextLocked
              ]}>
                {achievement.title}
              </Text>
              {achievement.progress !== undefined && achievement.target !== undefined && (
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(achievement.progress / achievement.target) * 100}%` }
                    ]} 
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFavorites = () => {
    if (favoriteQuotes.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ Favoriler</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💭</Text>
            <Text style={styles.emptyStateText}>
              Henüz favori sözün yok.{'\n'}
              Ana sayfadan beğendiğin sözleri favorilere ekle!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>❤️ Favoriler</Text>
          <Text style={styles.sectionBadge}>{favoriteQuotes.length}</Text>
        </View>
        {favoriteQuotes.slice(0, 3).map((quote) => (
          <View key={quote.id} style={styles.favoriteCard}>
            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteQuote} numberOfLines={2}>
                "{quote.content}"
              </Text>
              <Text style={styles.favoriteAuthor}>- {quote.author}</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteRemove}
              onPress={() => removeFavorite(quote.id)}
            >
              <Text style={styles.favoriteRemoveText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
        {favoriteQuotes.length > 3 && (
          <Text style={styles.favoritesMoreText}>
            +{favoriteQuotes.length - 3} söz daha
          </Text>
        )}
      </View>
    );
  };

  const renderStats = () => {
    return (
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalQuotes}</Text>
          <Text style={styles.statLabel}>Toplam Söz</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.favoriteCount}</Text>
          <Text style={styles.statLabel}>Favori</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.daysActive}</Text>
          <Text style={styles.statLabel}>Aktif Gün</Text>
        </View>
      </View>
    );
  };

  const getAvatarEmoji = () => {
    const emojis = ['😊', '🌟', '💪', '🚀', '🎯', '✨', '🔥', '💫'];
    const index = userName.length % emojis.length;
    return emojis[index];
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{getAvatarEmoji()}</Text>
            </View>
            <Text style={styles.headerTitle}>{userName || 'Profil'}</Text>
            <Text style={styles.headerSubtitle}>
              {isAuthenticated ? '✅ Kayıtlı Üye' : '👤 Ücretsiz Kullanıcı'}
            </Text>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        {renderStats()}

        {/* Achievements */}
        {renderAchievements()}

        {/* Favorites */}
        {renderFavorites()}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Ayarlar</Text>
          {renderSettingsSection()}
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingText}>Bildirimler</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          </View>

          {/* Notification Count Selector */}
          <View style={styles.notificationCountSection}>
            <Text style={styles.notificationCountTitle}>📊 Günlük Bildirim Sayısı</Text>
            <View style={styles.notificationCountButtons}>
              {[1, 2, 3, 5].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    notificationCount === count && styles.countButtonActive,
                  ]}
                  onPress={() => handleNotificationCountChange(count)}
                >
                  <Text
                    style={[
                      styles.countButtonText,
                      notificationCount === count && styles.countButtonTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.notificationCountHint}>
              Şu an günde {notificationCount} bildirim alıyorsunuz
            </Text>
          </View>
        </View>

        {/* Notification Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Bildirim Bilgileri</Text>
          
          <View style={styles.notificationInfoCard}>
            <View style={styles.notificationInfoRow}>
              <Text style={styles.notificationInfoLabel}>Planlanan Bildirim:</Text>
              <Text style={styles.notificationInfoValue}>{notificationStats.scheduled}</Text>
            </View>
            
            {notificationStats.scheduled > 0 && (
              <Text style={styles.notificationInfoNote}>
                ✅ Bugün için {notificationStats.scheduled} bildirim planlanmış
              </Text>
            )}
            
            {notificationStats.scheduled === 0 && (
              <Text style={styles.notificationInfoNote}>
                ⚠️ Henüz bildirim planlanmamış
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleRescheduleNotifications}
          >
            <Text style={styles.notificationButtonIcon}>🔄</Text>
            <Text style={styles.notificationButtonText}>Bildirimleri Yeniden Planla</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.notificationButton, styles.notificationButtonSecondary]}
            onPress={handleTestNotification}
          >
            <Text style={styles.notificationButtonIcon}>🧪</Text>
            <Text style={styles.notificationButtonText}>Test Bildirimi Gönder</Text>
          </TouchableOpacity>

          <Text style={styles.sectionNote}>
            💡 İpucu: Bildirimler her gün belirlediğiniz saat aralığında otomatik olarak gönderilir.
          </Text>
        </View>

        {/* Premium Card */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={handlePremiumUpgrade}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumTitle}>👑 Premium'a Yükselt</Text>
              <Text style={styles.premiumDescription}>
                ✨ Sınırsız ilgi alanı{'\n'}
                🚫 Reklamsız deneyim{'\n'}
                📱 10 motivasyon mesajı/gün{'\n'}
                💎 Özel içerikler{'\n'}
                ☁️ Bulut senkronizasyonu
              </Text>
              <View style={styles.premiumPriceTag}>
                <Text style={styles.premiumPrice}>₺29.99/ay</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Hesap</Text>
          {renderAuthSection()}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>📜 Gizlilik Politikası</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>📋 Kullanım Koşulları</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>📧 İletişim</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>⭐ Uygulamayı Değerlendir</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Developer Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Geliştirici Araçları</Text>
          <TouchableOpacity style={styles.button} onPress={handleResetApp}>
            <Text style={styles.buttonText}>🔄 Uygulamayı Sıfırla</Text>
          </TouchableOpacity>
          <Text style={styles.sectionNote}>
            Test için: Tüm veriler silinir ve onboarding ekranına dönersiniz.
          </Text>
        </View>

        <Text style={styles.versionText}>MeVibe v1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
};

export default ProfileScreen; 