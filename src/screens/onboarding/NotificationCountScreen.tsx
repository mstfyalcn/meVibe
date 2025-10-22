import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const NotificationCountScreen = ({ route, navigation }: any) => {
  const { userId, deviceId } = route.params;
  const [selectedCount, setSelectedCount] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnims = useRef<{ [key: number]: Animated.Value }>({
    1: new Animated.Value(1),
    2: new Animated.Value(1),
    3: new Animated.Value(1),
    5: new Animated.Value(1),
  }).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const notificationCounts = [
    { 
      value: 1, 
      label: 'Günde 1 kez', 
      description: 'Her gün bir motivasyon',
      emoji: '☀️',
      gradient: ['#FFD89B', '#19547B'],
    },
    { 
      value: 2, 
      label: 'Günde 2 kez', 
      description: 'Sabah ve akşam',
      emoji: '🌅',
      gradient: ['#667eea', '#764ba2'],
    },
    { 
      value: 3, 
      label: 'Günde 3 kez', 
      description: 'Dengeli hatırlatmalar',
      emoji: '⭐',
      gradient: ['#f093fb', '#f5576c'],
    },
    { 
      value: 5, 
      label: 'Günde 5 kez', 
      description: 'Sürekli motivasyon',
      emoji: '🔥',
      gradient: ['#FA8BFF', '#2BD2FF'],
    },
  ];

  const handleSelect = (value: number) => {
    // Animate selection
    const anim = cardAnims[value];
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedCount(value);
  };

  const handleContinue = () => {
    navigation.navigate('UserName', {
      userId,
      deviceId,
      notificationCount: selectedCount,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.title}>Günlük Bildirim Sayısı</Text>
          <Text style={styles.subtitle}>
            Size günde kaç kez motivasyon mesajı göndermemizi istersiniz?
          </Text>
        </View>

        {/* Options Grid */}
        <View style={styles.optionsContainer}>
          {notificationCounts.map((option) => {
            const isSelected = selectedCount === option.value;
            const scale = cardAnims[option.value];

            return (
              <Animated.View
                key={option.value}
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={option.gradient}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  
                  <View style={styles.optionContent}>
                    {/* Emoji Badge */}
                    <View style={styles.emojiContainer}>
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkIcon}>✓</Text>
                        </View>
                      )}
                    </View>

                    {/* Count Badge */}
                    <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                      <Text style={[styles.countNumber, isSelected && styles.countNumberSelected]}>
                        {option.value}
                      </Text>
                    </View>

                    {/* Text Content */}
                    <Text style={[styles.optionLabel, isSelected && styles.selectedText]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, isSelected && styles.selectedDescText]}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Akıllı Planlama</Text>
            <Text style={styles.infoText}>
              Seçtiğiniz sayı kadar bildirim, gün içinde eşit aralıklarla otomatik olarak planlanacak
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>
                Devam Et ({selectedCount} bildirim) →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4facfe',
  },
  content: {
    flex: 1,
    paddingTop: SIZES.extraLarge * 2,
  },
  decorCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    left: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 150,
    right: -40,
  },
  header: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.large,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge * 1.3,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: SIZES.base,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.base,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.large,
    marginBottom: SIZES.large,
    gap: SIZES.medium,
  },
  optionWrapper: {
    width: (width - SIZES.large * 2 - SIZES.medium) / 2,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.large,
    padding: SIZES.large,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    minHeight: 180,
  },
  selectedCard: {
    borderColor: '#fff',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  optionContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: SIZES.base,
  },
  optionEmoji: {
    fontSize: 42,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  countBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
    borderWidth: 2,
    borderColor: '#4facfe',
  },
  countBadgeSelected: {
    backgroundColor: '#fff',
  },
  countNumber: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  countNumberSelected: {
    color: '#4facfe',
  },
  optionLabel: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  selectedText: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedDescText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.large,
    padding: SIZES.large,
    marginHorizontal: SIZES.extraLarge,
    marginBottom: SIZES.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: SIZES.medium,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SIZES.base / 2,
  },
  infoText: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.extraLarge,
    marginTop: 'auto',
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
    color: '#4facfe',
    textAlign: 'center',
  },
});

export default NotificationCountScreen;
