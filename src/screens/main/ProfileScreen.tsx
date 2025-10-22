import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './ProfileScreen.styles';
import { scheduleMotivationNotification, cancelAllNotifications } from '../../services/notifications';

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

  useEffect(() => {
    checkAuthStatus();
    loadUserInterests();
    loadNotificationTimes();
    loadUserName();
  }, []);

  // Ekran her görünür olduğunda auth durumunu ve ismi kontrol et
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthStatus();
      loadUserName();
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
        await scheduleMotivationNotification();
      } else {
        await cancelAllNotifications();
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>{userName || 'Profil'}</Text>
          {isAuthenticated ? (
            <Text style={styles.headerSubtitle}>Premium Üye</Text>
          ) : (
            <Text style={styles.headerSubtitle}>Ücretsiz Kullanıcı</Text>
          )}
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İlgi Alanlarınız</Text>
        {renderInterestsSection()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirim Zamanları</Text>
        {renderNotificationTimesSection()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        {renderSettingsSection()}
      </View>

      {!isPremium && (
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={handlePremiumUpgrade}
        >
          <LinearGradient
            colors={[COLORS.tertiary, COLORS.primary]}
            style={styles.premiumGradient}
          >
            <Text style={styles.premiumTitle}>Premium'a Yükselt</Text>
            <Text style={styles.premiumDescription}>
              • Sınırsız ilgi alanı seçimi{'\n'}
              • Reklamsız deneyim{'\n'}
              • Günde 10 motivasyon mesajı{'\n'}
              • Özel içerik ekleme
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        {renderAuthSection()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Kullanım Koşulları</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>İletişim</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geliştirici Araçları</Text>
        <TouchableOpacity style={styles.button} onPress={handleResetApp}>
          <Text style={styles.buttonText}>🔄 Uygulamayı Sıfırla</Text>
        </TouchableOpacity>
        <Text style={styles.sectionNote}>
          Test için: Tüm veriler silinir ve onboarding ekranına dönersiniz.
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen; 