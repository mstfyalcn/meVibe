import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleMotivationNotification } from '../../services/notifications';

const { width } = Dimensions.get('window');

const NotificationTimeScreen = ({ route, navigation }: any) => {
  const { userId, deviceId, isFromProfile } = route.params;
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(startTime.getHours() + 1)));
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFromProfile) {
      loadCurrentTimes();
    } else {
      setLoading(false);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isFromProfile]);

  const loadCurrentTimes = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const { data: user, error } = await supabase
        .from('anonymous_users')
        .select('notification_time_start, notification_time_end')
        .eq('device_id', deviceId)
        .single();

      if (error) throw error;

      if (user) {
        const [startHour, startMinute] = user.notification_time_start.split(':');
        const [endHour, endMinute] = user.notification_time_end.split(':');

        const newStartTime = new Date();
        newStartTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
        setStartTime(newStartTime);

        const newEndTime = new Date();
        newEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
        setEndTime(newEndTime);
      }
    } catch (error) {
      console.error('Mevcut bildirim zamanları yüklenirken hata:', error);
      Alert.alert('❌ Hata', 'Bildirim zamanları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartTime(selectedDate);
      
      // Bitiş saatini başlangıç saatinden en az 1 saat sonraya ayarla
      const minEndTime = new Date(selectedDate);
      minEndTime.setHours(selectedDate.getHours() + 1);
      if (endTime < minEndTime) {
        setEndTime(minEndTime);
      }
    }
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const deviceId = await AsyncStorage.getItem('deviceId');

      if (!deviceId) {
        throw new Error('Device ID bulunamadı');
      }

      const { data: user, error: userError } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      const startTimeString = startTime.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const endTimeString = endTime.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const { error: updateError } = await supabase
        .from('anonymous_users')
        .update({
          notification_time_start: startTimeString,
          notification_time_end: endTimeString
        })
        .eq('device_id', deviceId);

      if (updateError) throw updateError;

      if (isFromProfile) {
        const notificationSuccess = await scheduleMotivationNotification();
        
        if (notificationSuccess) {
          Alert.alert(
            '✅ Başarılı', 
            'Bildirim zamanları güncellendi ve bildirimler yeniden planlandı!', 
            [
              {
                text: 'Tamam',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          Alert.alert(
            '⚠️ Uyarı', 
            'Bildirim zamanları güncellendi ancak bildirimler planlanamadı. Profil sayfasından "Bildirimleri Yeniden Planla" butonunu kullanabilirsiniz.', 
            [
              {
                text: 'Tamam',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      } else {
        navigation.navigate('NotificationCount', {
          userId: userId,
          deviceId: deviceId
        });
      }
    } catch (error) {
      console.error('Bildirim zamanları kaydedilirken hata:', error);
      Alert.alert('❌ Hata', 'Bildirim zamanları kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeDifference = () => {
    const diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} saat ${minutes} dakika`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>⏰</Text>
            <Text style={styles.title}>Bildirim Zamanı</Text>
            <Text style={styles.subtitle}>
              Her gün motivasyon mesajlarınızı hangi saat aralığında almak istersiniz?
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Time Selection Cards */}
            <View style={styles.timeCardsContainer}>
              {/* Start Time Card */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardIcon}>🌅</Text>
                  <Text style={styles.timeCardLabel}>Başlangıç Saati</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={onChangeStart}
                    style={styles.timePicker}
                    textColor="#f093fb"
                  />
                </View>
              </View>

              {/* Duration Info */}
              <View style={styles.durationCard}>
                <Text style={styles.durationIcon}>⏱️</Text>
                <Text style={styles.durationText}>{getTimeDifference()}</Text>
              </View>

              {/* End Time Card */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardIcon}>🌙</Text>
                  <Text style={styles.timeCardLabel}>Bitiş Saati</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={onChangeEnd}
                    style={styles.timePicker}
                    textColor="#f093fb"
                  />
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Seçtiğiniz zaman aralığında akıllı algoritmamız size eşit aralıklarla bildirimler gönderecek
              </Text>
            </View>
          </ScrollView>

          {/* Continue Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>
                  {isFromProfile ? '✓ Kaydet' : 'Devam Et →'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f093fb',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.medium,
  },
  decorCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 200,
    left: -50,
  },
  decorCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -30,
    right: 40,
  },
  header: {
    paddingTop: SIZES.small,
    paddingHorizontal: SIZES.small,
    paddingBottom: SIZES.small,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: SIZES.base / 2,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SIZES.base,
  },
  timeCardsContainer: {
    paddingHorizontal: SIZES.large,
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.medium,
    padding: SIZES.base,
    marginBottom: SIZES.base / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  timeCardIcon: {
    fontSize: 20,
    marginRight: SIZES.base / 2,
  },
  timeCardLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  pickerContainer: {
    backgroundColor: 'rgba(240, 147, 251, 0.05)',
    borderRadius: SIZES.base,
    paddingVertical: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(240, 147, 251, 0.3)',
    overflow: 'hidden',
  },
  timePicker: {
    width: '100%',
    height: 60,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.base,
    paddingVertical: 4,
    paddingHorizontal: SIZES.medium,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  durationIcon: {
    fontSize: 16,
    marginRight: SIZES.base / 2,
  },
  durationText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.base,
    padding: SIZES.base,
    marginHorizontal: SIZES.extraLarge,
    marginTop: SIZES.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: SIZES.base,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#fff',
    lineHeight: 16,
  },
  buttonContainer: {
    paddingHorizontal: SIZES.extraLarge,
    paddingVertical: SIZES.large,
    paddingBottom: SIZES.extraLarge,
    backgroundColor: 'transparent',
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
  buttonInner: {
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.extraLarge,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: '#f093fb',
    textAlign: 'center',
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
});

export default NotificationTimeScreen;
