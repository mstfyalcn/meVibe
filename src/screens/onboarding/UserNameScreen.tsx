import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserNameScreen = ({ route, navigation }: any) => {
  const { userId, deviceId, notificationCount } = route.params;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!name.trim()) {
      Alert.alert('Uyarı', 'Lütfen adınızı girin.');
      return;
    }

    setLoading(true);
    try {
      // Kullanıcı bilgilerini güncelle
      const { error } = await supabase
        .from('anonymous_users')
        .update({
          name: name.trim(),
          notification_count: notificationCount,
        })
        .eq('device_id', deviceId);

      if (error) throw error;

      // Local storage'a kaydet
      await AsyncStorage.setItem('userName', name.trim());
      await AsyncStorage.setItem('notificationCount', notificationCount.toString());

      console.log('Kullanıcı bilgileri güncellendi');

      // Ana ekrana git
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          userId: userId,
          deviceId: deviceId,
        },
      });
    } catch (error) {
      console.error('Kullanıcı bilgileri kaydedilirken hata:', error);
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Size Nasıl Hitap Edelim?</Text>
        <Text style={styles.subtitle}>
          Motivasyon mesajlarında sizi nasıl çağırmamızı istersiniz?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Örn: Ahmet, Ayşe, Arkadaş..."
            placeholderTextColor={COLORS.gray}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={30}
            editable={!loading}
          />
          <Text style={styles.helperText}>
            Bu isim sadece sizin için kullanılacak ve kimseyle paylaşılmayacak.
          </Text>
        </View>

        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Örnek Mesaj:</Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "Günaydın {name.trim() || '[İsminiz]'}! 🌟{'\n'}
              Bugün harika şeyler yapacaksın!"
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleFinish}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Tamamla</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.extraLarge,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge * 1.2,
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
  inputContainer: {
    marginBottom: SIZES.extraLarge,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
    fontSize: SIZES.large,
    color: COLORS.darkGray,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  exampleContainer: {
    marginBottom: SIZES.extraLarge,
  },
  exampleTitle: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  exampleBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  exampleText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    lineHeight: 24,
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

export default UserNameScreen;
