import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';

const ProfileScreen = ({ navigation }: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    loadUserPreferences();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user?.email);
  };

  const loadUserPreferences = async () => {
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error) throw error;

      setIsPremium(preferences.is_premium);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  const handlePremiumUpgrade = () => {
    navigation.navigate('Premium');
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap / Kayıt Ol</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Profil</Text>
          {isAuthenticated ? (
            <Text style={styles.headerSubtitle}>Premium Üye</Text>
          ) : (
            <Text style={styles.headerSubtitle}>Misafir Kullanıcı</Text>
          )}
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        {renderAuthSection()}
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
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Bildirimler</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Karanlık Mod</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
          />
        </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.extraLarge,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    padding: SIZES.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.large,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  premiumCard: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: SIZES.large,
  },
  premiumTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.medium,
  },
  premiumDescription: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
  },
  settingLabel: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  linkButton: {
    paddingVertical: SIZES.medium,
  },
  linkText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
});

export default ProfileScreen; 