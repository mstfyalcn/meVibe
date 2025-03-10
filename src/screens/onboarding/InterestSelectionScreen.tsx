import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { InterestArea } from '../../types/onboarding';
import { createAnonymousUser, supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InterestSelectionScreen = ({ navigation }: any) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const deviceId = await generateDeviceId();
      console.log('Device ID kontrolü:', deviceId);
      
      // Mevcut device_id ile kullanıcı kontrolü
      const { data: existingUser, error } = await supabase
        .from('anonymous_users')
        .select()
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası
        console.error('Kullanıcı kontrolü sırasında hata:', error);
        throw error;
      }

      if (existingUser) {
        console.log('Mevcut kullanıcı bulundu, ana sayfaya yönlendiriliyor:', existingUser);
        navigation.replace('Home', {
          userId: existingUser.id,
          deviceId: deviceId
        });
        return;
      }

      console.log('Yeni kullanıcı, ilgi alanları yükleniyor...');
      await fetchInterestAreas();
    } catch (error) {
      console.error('Kullanıcı kontrolü sırasında hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const fetchInterestAreas = async () => {
    try {
      console.log('İlgi alanları yükleniyor...');
      const { data, error } = await supabase
        .from('interest_areas')
        .select('*')
        .order('name');

      if (error) {
        console.error('İlgi alanları yüklenirken hata:', error);
        throw error;
      }

      if (data) {
        console.log('İlgi alanları başarıyla yüklendi:', data.length, 'adet');
        setInterestAreas(data);
      } else {
        console.log('İlgi alanları bulunamadı');
        Alert.alert('Uyarı', 'İlgi alanları bulunamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('İlgi alanları yüklenirken hata:', error);
      Alert.alert('Hata', 'İlgi alanları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, id]);
    } else {
      Alert.alert('Uyarı', 'En fazla 3 ilgi alanı seçebilirsiniz!');
    }
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir ilgi alanı seçin!');
      return;
    }

    try {
      const deviceId = await generateDeviceId();
      console.log('Device ID:', deviceId);

      // Önce mevcut device_id'ye sahip kullanıcıyı kontrol et
      const { data: existingUser, error: fetchError } = await supabase
        .from('anonymous_users')
        .select()
        .eq('device_id', deviceId)
        .single();

      let anonymousUser;

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası
        console.error('Kullanıcı sorgulama hatası:', fetchError);
        throw fetchError;
      }

      if (existingUser) {
        console.log('Mevcut kullanıcı bulundu:', existingUser);
        // Mevcut kullanıcı varsa direkt ana ekrana yönlendir
        navigation.navigate('Home', {
          userId: existingUser.id,
          deviceId: deviceId
        });
        return;
      }

      // Yeni anonim kullanıcı oluştur
      const { data: newUser, error: anonError } = await supabase
        .from('anonymous_users')
        .insert({
          device_id: deviceId,
          notification_time: '09:00:00'
        })
        .select()
        .single();

      if (anonError) {
        console.error('Anonim kullanıcı oluşturma hatası:', anonError);
        throw anonError;
      }

      if (!newUser) {
        throw new Error('Anonim kullanıcı oluşturulamadı');
      }

      console.log('Yeni anonim kullanıcı oluşturuldu:', newUser);
      anonymousUser = newUser;

      // Seçilen ilgi alanlarını kaydet
      const userInterests = selectedInterests.map(interestId => ({
        user_id: anonymousUser.id,
        interest_id: interestId,
        is_anonymous: true
      }));

      console.log('Kaydedilecek ilgi alanları:', userInterests);

      const { error: interestsError } = await supabase
        .from('user_interests')
        .insert(userInterests);

      if (interestsError) {
        console.error('İlgi alanları kaydetme hatası:', interestsError);
        throw interestsError;
      }

      console.log('İlgi alanları başarıyla kaydedildi');

      // Bildirim zamanı seçimine yönlendir
      navigation.navigate('NotificationTime', {
        userId: anonymousUser.id,
        deviceId: deviceId
      });
    } catch (error) {
      console.error('Hata detayı:', error);
      Alert.alert(
        'Hata',
        'Tercihleriniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  // Device ID oluşturma fonksiyonu
  const generateDeviceId = async () => {
    // Expo SecureStore veya AsyncStorage kullanarak device ID oluştur ve sakla
    const existingDeviceId = await AsyncStorage.getItem('deviceId');
    if (existingDeviceId) return existingDeviceId;
    
    const newDeviceId = `device_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('deviceId', newDeviceId);
    return newDeviceId;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İlgi Alanlarınızı Seçin</Text>
      <Text style={styles.subtitle}>
        Size en uygun motivasyon içeriklerini sunabilmemiz için en fazla 3 ilgi alanı seçin
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.interestsContainer}>
            {interestAreas.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestItem,
                  selectedInterests.includes(interest.id) && styles.selectedInterest,
                ]}
                onPress={() => toggleInterest(interest.id)}
              >
                <Text style={styles.interestIcon}>{interest.icon}</Text>
                <Text style={styles.interestName}>{interest.name}</Text>
                <Text style={styles.interestDescription}>{interest.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Devam Et</Text>
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
    marginBottom: SIZES.extraLarge,
  },
  scrollView: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: SIZES.extraLarge,
  },
  interestItem: {
    width: '48%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    alignItems: 'center',
  },
  selectedInterest: {
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  interestIcon: {
    fontSize: SIZES.extraLarge * 1.5,
    marginBottom: SIZES.base,
  },
  interestName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  interestDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: SIZES.large,
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

export default InterestSelectionScreen; 