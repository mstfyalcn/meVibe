import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { InterestArea } from '../../types/onboarding';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleMotivationNotification } from '../../services/notifications';

const { width } = Dimensions.get('window');

const InterestSelectionScreen = ({ navigation, route }: any) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [loading, setLoading] = useState(true);
  const isFromProfile = route.params?.isFromProfile || false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    if (isFromProfile) {
      loadUserInterests();
    } else {
      checkExistingUser();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isFromProfile]);

  const loadUserInterests = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: anonymousUser, error: userError } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (userError) throw userError;

      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', anonymousUser.id);

      if (interestsError) throw interestsError;

      if (userInterests) {
        setSelectedInterests(userInterests.map(ui => ui.interest_id));
      }

      await fetchInterestAreas();
    } catch (error) {
      console.error('İlgi alanları yüklenirken hata:', error);
      Alert.alert('Hata', 'İlgi alanları yüklenirken bir hata oluştu.');
    }
  };

  const generateDeviceId = async () => {
    const existingDeviceId = await AsyncStorage.getItem('deviceId');
    if (existingDeviceId) return existingDeviceId;
    
    const newDeviceId = `device_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('deviceId', newDeviceId);
    return newDeviceId;
  };

  const checkExistingUser = async () => {
    try {
      const deviceId = await generateDeviceId();
      
      const { data: existingUser, error } = await supabase
        .from('anonymous_users')
        .select()
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Kullanıcı kontrolü sırasında hata:', error);
        throw error;
      }

      if (existingUser) {
        navigation.replace('Main', {
          screen: 'Home',
          params: {
            userId: existingUser.id,
            deviceId: deviceId
          }
        });
        return;
      }

      await fetchInterestAreas();
    } catch (error) {
      console.error('Kullanıcı kontrolü sırasında hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri kontrol edilirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const fetchInterestAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('interest_areas')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setInterestAreas(data);
        // Initialize scale animations for each interest
        data.forEach(interest => {
          scaleAnims[interest.id] = new Animated.Value(1);
        });
      } else {
        Alert.alert('Uyarı', 'İlgi alanları bulunamadı.');
      }
    } catch (error) {
      console.error('İlgi alanları yüklenirken hata:', error);
      Alert.alert('Hata', 'İlgi alanları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    // Animate button press
    const anim = scaleAnims[id] || new Animated.Value(1);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, id]);
    } else {
      Alert.alert('⚠️ Dikkat', 'En fazla 3 ilgi alanı seçebilirsiniz!', [{ text: 'Tamam' }]);
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('⚠️ Dikkat', 'Lütfen en az bir ilgi alanı seçin!', [{ text: 'Tamam' }]);
      return;
    }

    try {
      setLoading(true);
      const deviceId = await generateDeviceId();
      let userId;

      if (isFromProfile) {
        const { data: existingUser, error: userError } = await supabase
          .from('anonymous_users')
          .select('id')
          .eq('device_id', deviceId)
          .single();

        if (userError) {
          console.error('Kullanıcı bulunurken hata:', userError);
          throw userError;
        }

        if (!existingUser) {
          throw new Error('Kullanıcı bulunamadı');
        }

        userId = existingUser.id;

        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);

        console.log('Eski ilgi alanları silindi');
      } else {
        const { data: newUser, error: createError } = await supabase
          .from('anonymous_users')
          .insert({
            device_id: deviceId,
            notification_time_start: '09:00:00',
            notification_time_end: '10:00:00'
          })
          .select()
          .single();

        if (createError) {
          console.error('Yeni kullanıcı oluşturulurken hata:', createError);
          throw createError;
        }

        if (!newUser) {
          throw new Error('Anonim kullanıcı oluşturulamadı');
        }

        userId = newUser.id;
      }

      const newInterests = selectedInterests.map(interestId => ({
        user_id: userId,
        interest_id: interestId,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(newInterests);

      if (insertError) {
        console.error('Yeni ilgi alanları eklenirken hata:', insertError);
        throw insertError;
      }

      console.log('Yeni ilgi alanları eklendi');

      if (isFromProfile) {
        const notificationSuccess = await scheduleMotivationNotification();
        
        if (notificationSuccess) {
          Alert.alert(
            '✅ Başarılı', 
            'İlgi alanlarınız güncellendi ve bildirimler yeniden planlandı!', 
            [
              {
                text: 'Tamam',
                onPress: () => {
                  navigation.navigate('Main', {
                    screen: 'Profile',
                    params: { refresh: Date.now() }
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert(
            '⚠️ Uyarı', 
            'İlgi alanlarınız güncellendi ancak bildirimler planlanamadı. Profil sayfasından "Bildirimleri Yeniden Planla" butonunu kullanabilirsiniz.', 
            [
              {
                text: 'Tamam',
                onPress: () => {
                  navigation.navigate('Main', {
                    screen: 'Profile',
                    params: { refresh: Date.now() }
                  });
                }
              }
            ]
          );
        }
      } else {
        navigation.navigate('NotificationTime', {
          userId: userId,
          deviceId: deviceId
        });
      }

    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      Alert.alert('❌ Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const InterestCard = ({ interest }: { interest: InterestArea }) => {
    const isSelected = selectedInterests.includes(interest.id);
    const scale = scaleAnims[interest.id] || new Animated.Value(1);

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[
            styles.interestCard,
            isSelected && styles.selectedCard,
          ]}
          onPress={() => toggleInterest(interest.id)}
          activeOpacity={0.7}
        >
          {isSelected && (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.interestIcon}>{interest.icon}</Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.interestName, isSelected && styles.selectedText]}>
              {interest.name}
            </Text>
            <Text style={[styles.interestDescription, isSelected && styles.selectedDescText]}>
              {interest.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>İlgi Alanlarınızı Seçin</Text>
          <Text style={styles.subtitle}>
            Size özel içerikler sunabilmemiz için en fazla 3 ilgi alanı seçin
          </Text>
          
          {/* Selection Counter */}
          <View style={styles.counterContainer}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.counterDot,
                  index < selectedInterests.length && styles.counterDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.counterText}>
            {selectedInterests.length} / 3 seçildi
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.interestsGrid}>
              {interestAreas.map((interest) => (
                <InterestCard key={interest.id} interest={interest} />
              ))}
            </View>
          </ScrollView>
        )}

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedInterests.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedInterests.length === 0 || loading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>
                {isFromProfile ? '✓ Kaydet' : `Devam Et (${selectedInterests.length}/3) →`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    left: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    right: -40,
  },
  header: {
    paddingTop: SIZES.extraLarge * 2,
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.large,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge * 1.3,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: SIZES.base,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.large,
  },
  counterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SIZES.base,
  },
  counterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  counterDotActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  counterText: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.large,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SIZES.medium,
  },
  interestCard: {
    width: (width - SIZES.large * 2 - SIZES.medium) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.large,
    padding: SIZES.large,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#fff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SIZES.medium,
  },
  interestIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  interestName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  selectedText: {
    color: '#fff',
  },
  interestDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedDescText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontSize: SIZES.medium,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.extraLarge,
    paddingTop: SIZES.medium,
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: SIZES.base * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.extraLarge,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
  },
});

export default InterestSelectionScreen;
