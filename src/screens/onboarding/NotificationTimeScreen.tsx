import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';

const NotificationTimeScreen = ({ route, navigation }: any) => {
  const { userId, deviceId } = route.params;
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(Platform.OS === 'ios');

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showTimePicker = () => {
    setShow(true);
  };

  const handleSave = async () => {
    try {
      const { userId, deviceId } = route.params;
      
      // Bildirim zamanını güncelle
      const { error: updateError } = await supabase
        .from('anonymous_users')
        .update({ 
          notification_time: date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Ana sayfaya yönlendir
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Hata', 'Bildirim zamanı kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirim Zamanı</Text>
      <Text style={styles.subtitle}>
        Her gün motivasyon mesajınızı hangi saatte almak istersiniz?
      </Text>

      <View style={styles.timeContainer}>
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={styles.timeButton}
            onPress={showTimePicker}
          >
            <Text style={styles.timeText}>
              {date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        )}

        {show && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={onChange}
            style={styles.timePicker}
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
            <Text style={styles.buttonText}>Kaydet ve Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  timeButton: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.large,
    borderRadius: SIZES.base,
    minWidth: 150,
    alignItems: 'center',
  },
  timeText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timePicker: {
    width: 300,
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
});

export default NotificationTimeScreen; 