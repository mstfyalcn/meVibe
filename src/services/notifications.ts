import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Android için bildirim kanalı oluştur
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('motivation', {
    name: 'Motivasyon Bildirimleri',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6C63FF',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
}

// Bildirim kategorileri ve emojiler
const NOTIFICATION_EMOJIS = {
  morning: ['🌅', '☀️', '🌞', '✨', '🌟'],
  afternoon: ['💪', '🚀', '⚡', '🔥', '💫'],
  evening: ['🌙', '⭐', '🌠', '💭', '🎯'],
};

const MOTIVATIONAL_TITLES = {
  morning: [
    'Günaydın! ☀️',
    'Yeni bir gün, yeni bir başlangıç! 🌅',
    'Bugün harika olacak! ✨',
    'Güne enerjik başla! 💪',
  ],
  afternoon: [
    'Öğleden sonra motivasyonu! ⚡',
    'Devam et, harikasın! 🚀',
    'Bugünün ikinci yarısı! 💫',
    'Enerjini tazele! 🔥',
  ],
  evening: [
    'Akşam ilhamı! 🌙',
    'Günü güzel bitir! ⭐',
    'Son bir motivasyon! 💭',
    'Yarına hazırlan! 🎯',
  ],
};

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('📬 Bildirim alındı:', notification.request.content.title);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Günün hangi bölümünde olduğumuzu belirle
const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' => {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// Rastgele emoji seç
const getRandomEmoji = (timeOfDay: 'morning' | 'afternoon' | 'evening'): string => {
  const emojis = NOTIFICATION_EMOJIS[timeOfDay];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

// Rastgele başlık seç
const getRandomTitle = (timeOfDay: 'morning' | 'afternoon' | 'evening'): string => {
  const titles = MOTIVATIONAL_TITLES[timeOfDay];
  return titles[Math.floor(Math.random() * titles.length)];
};

// Zaman aralığını eşit parçalara böl
const divideTimeRange = (
  startTime: Date,
  endTime: Date,
  count: number
): Date[] => {
  const times: Date[] = [];
  const totalMilliseconds = endTime.getTime() - startTime.getTime();
  const totalMinutes = totalMilliseconds / (1000 * 60);
  const intervalMs = totalMilliseconds / count;
  const intervalMinutes = totalMinutes / count;

  // Akıllı gecikme hesapla: 
  // - Zaman aralığı çok kısaysa (< 30 dk) → 2 dakika
  // - Zaman aralığı kısaysa (30-60 dk) → 3 dakika  
  // - Zaman aralığı normalse (> 60 dk) → 5 dakika
  let initialDelay = 5; // Varsayılan 5 dakika
  if (totalMinutes < 30) {
    initialDelay = 2; // Çok kısa aralık
  } else if (totalMinutes < 60) {
    initialDelay = 3; // Kısa aralık
  }

  // Varyasyon miktarını zaman aralığına göre ayarla
  // Kısa aralıklarda daha az varyasyon
  let maxVariance = 15; // Varsayılan ±15 dakika
  if (intervalMinutes < 30) {
    maxVariance = 5; // Aralık çok kısaysa ±5 dakika
  } else if (intervalMinutes < 60) {
    maxVariance = 10; // Aralık kısaysa ±10 dakika
  }

  console.log(`⏱️  Zaman aralığı: ${Math.round(totalMinutes)} dakika`);
  console.log(`⏱️  Bildirim başına ortalama: ${Math.round(intervalMinutes)} dakika`);
  console.log(`⏱️  İlk bildirim gecikmesi: ${initialDelay} dakika`);
  console.log(`⏱️  Varyasyon aralığı: ±${maxVariance} dakika`);

  for (let i = 0; i < count; i++) {
    // Her bildirim için zaman hesapla
    const baseTime = startTime.getTime() + (intervalMs * i);
    const time = new Date(baseTime);
    
    // İlk bildirime akıllı gecikme ekle
    if (i === 0) {
      time.setMinutes(time.getMinutes() + initialDelay);
      console.log(`📅 Bildirim ${i + 1} zamanı: ${time.toLocaleTimeString('tr-TR')} (+${initialDelay} dk gecikme)`);
    } else {
      // Diğer bildirimlere varyasyon ekle (ama zaman aralığını aşmasın)
      const variance = Math.floor(Math.random() * (maxVariance * 2 + 1)) - maxVariance;
      time.setMinutes(time.getMinutes() + variance);
      console.log(`📅 Bildirim ${i + 1} zamanı: ${time.toLocaleTimeString('tr-TR')} (${variance >= 0 ? '+' : ''}${variance} dk varyasyon)`);
    }
    
    times.push(time);
  }

  return times;
};

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
    // Önce eski bildirimleri temizle
    await cancelAllNotifications();

    const deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      console.log('Kullanıcı henüz onboarding sürecini tamamlamamış');
      return false;
    }

    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('anonymous_users')
      .select('id, notification_time_start, notification_time_end, notification_count, name')
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

    // İlgi alanlarına göre tüm motivasyon sözlerini al
    const interestIds = userInterests.map(ui => ui.interest_id);
    const { data: quotes, error: quoteError } = await supabase
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
      .in('interest_area_id', interestIds);

    if (quoteError || !quotes || quotes.length === 0) {
      console.error('Motivasyon sözü alınamadı:', quoteError);
      return false;
    }

    // Bildirim sayısını al (varsayılan 3)
    const notificationCount = user.notification_count || 3;

    // Zaman aralığını hesapla
    const [startHour, startMinute] = user.notification_time_start.split(':');
    const [endHour, endMinute] = user.notification_time_end.split(':');

    const now = new Date();
    let startTime = new Date(now);
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    let endTime = new Date(now);
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    console.log('⏰ Şu an:', now.toLocaleString('tr-TR'));
    console.log('⏰ Başlangıç saati ayarlandı:', startTime.toLocaleString('tr-TR'));
    console.log('⏰ Bitiş saati ayarlandı:', endTime.toLocaleString('tr-TR'));

    // Eğer zaman aralığı geçmişte kaldıysa, yarına ertele
    if (endTime < now) {
      console.log('⚠️ Zaman aralığı geçmişte, yarına erteleniyor...');
      startTime.setDate(startTime.getDate() + 1);
      endTime.setDate(endTime.getDate() + 1);
      console.log('✅ Yeni başlangıç:', startTime.toLocaleString('tr-TR'));
      console.log('✅ Yeni bitiş:', endTime.toLocaleString('tr-TR'));
    } else if (startTime < now) {
      console.log('⚠️ Başlangıç saati geçmiş, şu andan itibaren planlanacak...');
      startTime = new Date(now); // Şu andan başla (ilk bildirime +5dk eklenecek)
      console.log('✅ Yeni başlangıç:', startTime.toLocaleString('tr-TR'));
    }

    // Zamanları eşit aralıklarla böl
    console.log(`🔢 Toplam ${notificationCount} bildirim planlanacak`);
    console.log(`📊 Zaman aralığı: ${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} dakika`);
    const notificationTimes = divideTimeRange(startTime, endTime, notificationCount);

    // Rastgele sözleri seç (tekrar etmesin)
    const shuffledQuotes = quotes.sort(() => 0.5 - Math.random());
    const selectedQuotes = shuffledQuotes.slice(0, notificationCount);

    // Her bir bildirim için zamanlama yap
    const scheduledIds: string[] = [];
    
    for (let i = 0; i < notificationCount; i++) {
      const time = notificationTimes[i];
      const quote = selectedQuotes[i];
      const timeOfDay = getTimeOfDay(time.getHours());
      const title = getRandomTitle(timeOfDay);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: `"${quote.content}"\n\n- ${quote.author}`,
          data: { 
            quote,
            timeOfDay,
            userName: user.name || 'Arkadaş',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: Platform.OS === 'android' 
          ? {
              channelId: 'motivation',
              date: time,
            }
          : {
              date: time,
            },
      });

      scheduledIds.push(notificationId);
      console.log(`✅ Bildirim ${i + 1} planlandı: ${time.toLocaleTimeString('tr-TR')} - ${time.toLocaleDateString('tr-TR')}`);
    }

    // Planlanan bildirimleri kaydet
    await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(scheduledIds));
    
    // Özet bilgi
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Toplam ${notificationCount} bildirim başarıyla planlandı!`);
    console.log('📅 Bildirim zamanları:');
    notificationTimes.forEach((time, index) => {
      const diffMinutes = Math.round((time.getTime() - new Date().getTime()) / (1000 * 60));
      console.log(`   ${index + 1}. ${time.toLocaleTimeString('tr-TR')} (${diffMinutes} dakika sonra)`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem('scheduledNotifications');
};

// Planlanan bildirimleri getir
export const getScheduledNotifications = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Bildirim istatistiklerini al
export const getNotificationStats = async () => {
  try {
    const scheduled = await getScheduledNotifications();
    const scheduledIds = await AsyncStorage.getItem('scheduledNotifications');
    const ids = scheduledIds ? JSON.parse(scheduledIds) : [];
    
    return {
      scheduled: scheduled.length,
      total: ids.length,
      nextNotification: scheduled.length > 0 ? scheduled[0].trigger : null,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {
      scheduled: 0,
      total: 0,
      nextNotification: null,
    };
  }
};

// Test bildirimi gönder
export const sendTestNotification = async () => {
  try {
    const deviceId = await AsyncStorage.getItem('deviceId');
    const { data: user } = await supabase
      .from('anonymous_users')
      .select('name')
      .eq('device_id', deviceId)
      .single();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Test Bildirimi',
        body: `Merhaba ${user?.name || 'Arkadaş'}! Bildirimler çalışıyor! ✨`,
        data: { test: true },
        sound: 'default',
      },
      trigger: Platform.OS === 'android'
        ? {
            channelId: 'motivation',
            seconds: 2,
          }
        : {
            seconds: 2,
          },
    });

    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}; 