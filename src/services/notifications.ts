import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted!');
    }

    // projectId'yi Constants'tan al
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Project ID is not configured');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId
    });
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

export const scheduleMotivationNotification = async () => {
  try {
    const deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      console.log('Kullanıcı henüz onboarding sürecini tamamlamamış');
      return false;
    }

    // Önce kullanıcının onboarding sürecini tamamlayıp tamamlamadığını kontrol et
    const { data: user, error: userError } = await supabase
      .from('anonymous_users')
      .select('id, notification_time_start, notification_time_end')
      .eq('device_id', deviceId)
      .single();

    if (userError || !user?.notification_time_start || !user?.notification_time_end) {
      console.log('Kullanıcı henüz bildirim zamanlarını seçmemiş');
      return false;
    }

    // Kullanıcının ilgi alanlarını kontrol et
    const { data: userInterests, error: interestsError } = await supabase
      .from('user_interests')
      .select('interest_id')
      .eq('user_id', user.id);

    if (interestsError || !userInterests || userInterests.length === 0) {
      console.log('Kullanıcı henüz ilgi alanlarını seçmemiş');
      return false;
    }

    // İlgi alanlarına göre motivasyon sözü seç
    const interestIds = userInterests.map(ui => ui.interest_id);
    const { data: quote, error: quoteError } = await supabase
      .from('motivation_quotes')
      .select('content, author')
      .in('interest_area_id', interestIds)
      .order('RANDOM()')
      .limit(1)
      .single();

    if (quoteError || !quote) {
      console.error('Motivasyon sözü alınamadı:', quoteError);
      return false;
    }

    // Bildirim zamanını hesapla
    const [startHour, startMinute] = user.notification_time_start.split(':');
    const [endHour, endMinute] = user.notification_time_end.split(':');

    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

    const endTime = new Date(now);
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

    // Rastgele bir zaman seç
    const randomTime = new Date(
      startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime())
    );

    // Eğer seçilen zaman geçmişte kaldıysa, yarına ertele
    if (randomTime < now) {
      randomTime.setDate(randomTime.getDate() + 1);
    }

    // Bildirimi planla
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Günlük Motivasyon 🌟',
        body: `"${quote.content}" - ${quote.author}`,
        data: { quote },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
}; 