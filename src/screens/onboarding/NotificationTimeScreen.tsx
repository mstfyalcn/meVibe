import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationTimeScreen = ({ route, navigation }: any) => {
  const { userId, deviceId, isFromProfile } = route.params;
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(startTime.getHours() + 1)));
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFromProfile) {
      loadCurrentTimes();
    } else {
      setLoading(false);
    }
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
      Alert.alert('Hata', 'Bildirim zamanları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowStart(false);
      return;
    }
    
    const currentDate = selectedDate || startTime;
    setShowStart(false);
    setStartTime(currentDate);

    // Bitiş saatini başlangıç saatinden en az 1 saat sonraya ayarla
    const minEndTime = new Date(currentDate);
    minEndTime.setHours(currentDate.getHours() + 1);
    if (endTime < minEndTime) {
      setEndTime(minEndTime);
    }
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowEnd(false);
      return;
    }
    
    const currentDate = selectedDate || endTime;
    setShowEnd(false);
    setEndTime(currentDate);
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

      // Kullanıcıyı bul veya oluştur
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

      // Bildirim zamanlarını güncelle
      const { error: updateError } = await supabase
        .from('anonymous_users')
        .update({
          notification_time_start: startTimeString,
          notification_time_end: endTimeString
        })
        .eq('device_id', deviceId);

      if (updateError) throw updateError;

      if (isFromProfile) {
        Alert.alert('Başarılı', 'Bildirim zamanları güncellendi.', [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        // Onboarding akışı - NotificationCount ekranına git
        navigation.navigate('NotificationCount', {
          userId: userId,
          deviceId: deviceId
        });
      }
    } catch (error) {
      console.error('Bildirim zamanları kaydedilirken hata:', error);
      Alert.alert('Hata', 'Bildirim zamanları kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <Text style={styles.title}>Bildirim Zamanı</Text>
          <Text style={styles.subtitle}>
            Her gün motivasyon mesajınızı hangi saat aralığında almak istersiniz?
          </Text>

          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Başlangıç saati:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStart(true)}
              >
                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.timeRow, { marginTop: SIZES.large }]}>
              <Text style={styles.timeLabel}>Bitiş saati:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEnd(true)}
              >
                <Text style={styles.timeText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>

            {showStart && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeStart}
                style={Platform.OS === 'ios' ? styles.timePicker : undefined}
              />
            )}

            {showEnd && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeEnd}
                style={Platform.OS === 'ios' ? styles.timePicker : undefined}
              />
            )}
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>
                  {isFromProfile ? 'Kaydet' : 'Devam Et'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.large,
  },
  title: {
    fontSize: SIZES.extraLarge,
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
  timeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.large,
  },
  timeLabel: {
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    minWidth: 120,
    alignItems: 'center',
  },
  timeText: {
    fontSize: SIZES.large,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timePicker: {
    width: 300,
    height: 200,
  },
  bottomContainer: {
    marginTop: SIZES.extraLarge,
  },
  button: {
    overflow: 'hidden',
    borderRadius: SIZES.base * 2,
  },
  gradient: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.extraLarge,
    borderRadius: SIZES.base * 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationTimeScreen; 