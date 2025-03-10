import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      if (!deviceId) {
        // Cihaz ID'si yoksa onboarding'e yönlendir
        navigation.replace('Onboarding');
        return;
      }

      // Mevcut device_id ile kullanıcı kontrolü
      const { data: existingUser, error } = await supabase
        .from('anonymous_users')
        .select()
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Kullanıcı kontrolü sırasında hata:', error);
        navigation.replace('Onboarding');
        return;
      }

      if (existingUser) {
        // Kullanıcı varsa ana ekrana yönlendir
        navigation.replace('Main', {
          screen: 'Home',
          params: {
            userId: existingUser.id,
            deviceId: deviceId
          }
        });
      } else {
        // Kullanıcı yoksa onboarding'e yönlendir
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('Başlangıç kontrolü sırasında hata:', error);
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default SplashScreen; 