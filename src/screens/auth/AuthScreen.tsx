import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const linkAnonymousUserToAuth = async (authUserId: string) => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) return;

      // Anonim kullanıcıyı auth kullanıcısı ile güncelle
      const { error } = await supabase
        .from('anonymous_users')
        .update({ auth_user_id: authUserId })
        .eq('device_id', deviceId);

      if (error) {
        console.error('Anonim kullanıcı bağlama hatası:', error);
      } else {
        console.log('Anonim kullanıcı başarıyla auth kullanıcısına bağlandı');
      }
    } catch (error) {
      console.error('Kullanıcı bağlama işleminde hata:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Giriş yap
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Anonim kullanıcıyı auth kullanıcısına bağla
        if (data.user) {
          await linkAnonymousUserToAuth(data.user.id);
        }

        // Başarılı giriş - direkt geri dön
        navigation.goBack();
      } else {
        // Kayıt ol
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Anonim kullanıcıyı yeni auth kullanıcısına bağla
        if (data.user) {
          await linkAnonymousUserToAuth(data.user.id);
        }

        // Kayıt başarılı - kullanıcıyı bilgilendir ve giriş ekranına geç
        Alert.alert(
          'Başarılı',
          'Kayıt başarılı! E-posta adresinize gelen doğrulama linkine tıklayın.',
          [
            {
              text: 'Tamam',
              onPress: () => setIsLogin(true),
            },
          ]
        );
      }
    } catch (error: any) {
      // Supabase hata mesajlarını Türkçeleştir
      let errorMessage = 'Bir hata oluştu.';
      
      if (error.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes('invalid login credentials') || 
            message.includes('invalid email or password')) {
          errorMessage = 'E-posta veya şifre hatalı.';
        } else if (message.includes('email not confirmed')) {
          errorMessage = 'E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.';
        } else if (message.includes('user already registered') ||
                   message.includes('already registered') ||
                   message.includes('already been registered') ||
                   message.includes('duplicate') ||
                   message.includes('already exists')) {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
        } else if (message.includes('password should be at least')) {
          errorMessage = 'Şifre en az 6 karakter olmalıdır.';
        } else if (message.includes('invalid email')) {
          errorMessage = 'Geçersiz e-posta adresi.';
        } else if (message.includes('network') || message.includes('fetch failed')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (message.includes('rate limit')) {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.';
        } else {
          // Hata mesajını konsola yazdır (debug için)
          console.error('Auth Error:', error.message);
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Hesabınıza giriş yapın'
              : 'Yeni bir hesap oluşturun'}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.gradient}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Hesabınız yok mu? Kayıt olun"
                : 'Zaten hesabınız var mı? Giriş yapın'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SIZES.extraLarge,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge * 1.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.extraLarge * 2,
  },
  inputContainer: {
    marginBottom: SIZES.extraLarge,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.medium,
    marginBottom: SIZES.medium,
    color: COLORS.darkGray,
  },
  button: {
    overflow: 'hidden',
    borderRadius: SIZES.base * 2,
    marginBottom: SIZES.large,
  },
  gradient: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.extraLarge,
    borderRadius: SIZES.base * 2,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  switchText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginBottom: SIZES.large,
  },
  backButton: {
    alignItems: 'center',
    padding: SIZES.base,
  },
  backButtonText: {
    color: COLORS.gray,
    fontSize: SIZES.medium,
  },
});

export default AuthScreen;
