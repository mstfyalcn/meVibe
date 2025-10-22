import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import { scheduleMotivationNotification } from '../../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const UserNameScreen = ({ route, navigation }: any) => {
  const { userId, deviceId, notificationCount } = route.params;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputFocusAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFocus = () => {
    Animated.spring(inputFocusAnim, {
      toValue: 1.02,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(inputFocusAnim, {
      toValue: 1,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      Alert.alert('⚠️ Dikkat', 'Lütfen adınızı girin.', [{ text: 'Tamam' }]);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('anonymous_users')
        .update({
          name: name.trim(),
          notification_count: notificationCount,
        })
        .eq('device_id', deviceId);

      if (error) throw error;

      await AsyncStorage.setItem('userName', name.trim());
      await AsyncStorage.setItem('notificationCount', notificationCount.toString());

      console.log('✅ Kullanıcı bilgileri güncellendi');

      console.log('📅 İlk bildirimler planlanıyor...');
      const notificationSuccess = await scheduleMotivationNotification();
      
      if (!notificationSuccess) {
        console.warn('⚠️ Bildirimler planlanamadı, ancak kullanıcı devam edebilir');
      }

      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          userId: userId,
          deviceId: deviceId,
        },
      });
    } catch (error) {
      console.error('Kullanıcı bilgileri kaydedilirken hata:', error);
      Alert.alert('❌ Hata', 'Bilgiler kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#a8edea', '#fed6e3']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Tanışalım!</Text>
          <Text style={styles.subtitle}>
            Size nasıl hitap etmemizi istersiniz?
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.formContainer}>
          {/* Input Card */}
          <Animated.View 
            style={[
              styles.inputCard,
              { transform: [{ scale: inputFocusAnim }] },
            ]}
          >
            <Text style={styles.inputLabel}>Adınız</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Ahmet, Ayşe, Arkadaş..."
              placeholderTextColor="rgba(102, 126, 234, 0.4)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={30}
              editable={!loading}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <View style={styles.charCount}>
              <Text style={styles.charCountText}>{name.length} / 30</Text>
            </View>
          </Animated.View>

          {/* Preview Card */}
          {name.trim().length > 0 && (
            <Animated.View 
              style={[
                styles.previewCard,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.previewLabel}>Önizleme</Text>
              <View style={styles.previewBubble}>
                <Text style={styles.previewText}>
                  "Günaydın {name.trim()}! 🌟{'\n'}
                  Bugün harika şeyler yapacaksın!"
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              Bu bilgi sadece sizin için kullanılacak ve kimseyle paylaşılmayacak
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Kişiselleştirilmiş mesajlar</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Size özel içerikler</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>İstediğiniz zaman değiştirebilirsiniz</Text>
            </View>
          </View>
        </View>

        {/* Complete Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              (name.trim().length === 0 || loading) && styles.buttonDisabled,
            ]}
            onPress={handleFinish}
            disabled={name.trim().length === 0 || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>🎉 Tamamla ve Başla</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8edea',
  },
  content: {
    flex: 1,
    paddingTop: SIZES.extraLarge * 2,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: -50,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    bottom: 200,
    left: -40,
  },
  decorCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: '50%',
    right: 20,
  },
  header: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.large,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge * 1.4,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: SIZES.base,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: SIZES.medium * 1.1,
    color: '#667eea',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SIZES.extraLarge,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: SIZES.large,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inputLabel: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: SIZES.base,
  },
  input: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
    fontSize: SIZES.large,
    color: '#667eea',
    borderWidth: 2,
    borderColor: '#667eea',
    fontWeight: '600',
  },
  charCount: {
    alignItems: 'flex-end',
    marginTop: SIZES.base / 2,
  },
  charCountText: {
    fontSize: SIZES.small,
    color: 'rgba(102, 126, 234, 0.6)',
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: SIZES.large,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  previewLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: SIZES.base,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewBubble: {
    backgroundColor: '#667eea',
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
  },
  previewText: {
    fontSize: SIZES.medium,
    color: '#fff',
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SIZES.base,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: '#667eea',
    lineHeight: 18,
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: SIZES.large,
    padding: SIZES.large,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  featureBullet: {
    fontSize: 18,
    color: '#667eea',
    marginRight: SIZES.base,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: SIZES.small,
    color: '#667eea',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.extraLarge,
    paddingTop: SIZES.medium,
  },
  completeButton: {
    borderRadius: SIZES.base * 3,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.extraLarge,
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large * 1.1,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default UserNameScreen;
