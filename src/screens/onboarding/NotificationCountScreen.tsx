import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';

const NotificationCountScreen = ({ route, navigation }: any) => {
  const { userId, deviceId } = route.params;
  const [selectedCount, setSelectedCount] = useState(3);

  const notificationCounts = [
    { value: 1, label: 'Günde 1 kez', description: 'Her gün bir motivasyon' },
    { value: 2, label: 'Günde 2 kez', description: 'Sabah ve akşam' },
    { value: 3, label: 'Günde 3 kez', description: 'Dengeli hatırlatmalar' },
    { value: 5, label: 'Günde 5 kez', description: 'Sık motivasyon' },
  ];

  const handleContinue = () => {
    navigation.navigate('UserName', {
      userId,
      deviceId,
      notificationCount: selectedCount,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günde Kaç Bildirim?</Text>
      <Text style={styles.subtitle}>
        Size günde kaç kez motivasyon bildirimi göndermemizi istersiniz?
      </Text>

      <View style={styles.optionsContainer}>
        {notificationCounts.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              selectedCount === option.value && styles.selectedCard,
            ]}
            onPress={() => setSelectedCount(option.value)}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <View
                style={[
                  styles.radio,
                  selectedCount === option.value && styles.radioSelected,
                ]}
              >
                {selectedCount === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.gradient}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.extraLarge,
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
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
    marginBottom: SIZES.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  optionLabel: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  optionDescription: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  button: {
    overflow: 'hidden',
    borderRadius: SIZES.base * 2,
    marginTop: SIZES.large,
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

export default NotificationCountScreen;
