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
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InterestSelectionScreen = ({ navigation, route }: any) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [loading, setLoading] = useState(true);
  const isFromProfile = route.params?.isFromProfile || false;

  useEffect(() => {
    if (isFromProfile) {
      loadUserInterests();
    } else {
      checkExistingUser();
    }
  }, [isFromProfile]);

  const loadUserInterests = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      // Önce anonymous user'ı bul
      const { data: anonymousUser, error: userError } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (userError) throw userError;

      // Kullanıcının mevcut ilgi alanlarını çek
      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', anonymousUser.id);

      if (interestsError) throw interestsError;

      // Seçili ilgi alanlarını güncelle
      if (userInterests) {
        setSelectedInterests(userInterests.map(ui => ui.interest_id));
      }

      // Tüm ilgi alanlarını yükle
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
      
      // Mevcut device_id ile kullanıcı kontrolü
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
        navigation.replace('MainTabs');
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
      setLoading(true);
      const deviceId = await generateDeviceId();
      let userId;

      if (isFromProfile) {
        // 1. Adım: Mevcut kullanıcıyı bul
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

        // 2. Adım: Mevcut ilgi alanlarını sil
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);

        console.log('Eski ilgi alanları silindi');
      } else {
        // Yeni kullanıcı için anonim kullanıcı oluştur
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

      // 3. Adım: Yeni seçimleri ekle
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
        // 4. Adım: Başarılı mesajı göster ve profil sayfasına dön
        Alert.alert('Başarılı', 'İlgi alanlarınız güncellendi.', [
          {
            text: 'Tamam',
            onPress: () => {
              navigation.navigate('MainTabs', {
                screen: 'Profile',
                params: { refresh: Date.now() }
              });
            }
          }
        ]);
      } else {
        // Onboarding sürecinde NotificationTime ekranına geçiş
        navigation.navigate('NotificationTime', {
          userId: userId,
          deviceId: deviceId
        });
      }

    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.buttonText}>
              {isFromProfile ? 'Kaydet' : 'Devam Et'}
            </Text>
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
  scrollView: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.base,
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
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  interestIcon: {
    fontSize: SIZES.extraLarge,
    marginBottom: SIZES.base,
  },
  interestName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  interestDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default InterestSelectionScreen;