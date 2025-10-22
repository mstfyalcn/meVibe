import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { OnboardingItem } from '../../types/onboarding';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Günlük Motivasyon',
    description: 'Her gün size özel seçilmiş motivasyon sözleriyle güne enerjik başlayın',
    image: require('../../assets/onboarding1.png'),
    emoji: '🌟',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    title: 'Kişiselleştirilmiş İçerik',
    description: 'İlgi alanlarınıza göre özelleştirilmiş motivasyon sözleri alın',
    image: require('../../assets/onboarding2.png'),
    emoji: '🎯',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    title: 'Hedeflerinize Ulaşın',
    description: 'Günlük motivasyon ve hatırlatmalarla hedeflerinize adım adım ilerleyin',
    image: require('../../assets/onboarding3.png'),
    emoji: '🚀',
    gradient: ['#4facfe', '#00f2fe'],
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('InterestSelection');
    }
  };

  const currentGradient = onboardingData[currentIndex]?.gradient || [COLORS.primary, COLORS.secondary];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={currentGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Circles */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FlatList
          data={onboardingData}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1, 0.8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={[
                  styles.slide,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              >
                {/* Emoji Icon with Glow Effect */}
                <View style={styles.emojiContainer}>
                  <View style={styles.emojiGlow} />
                  <Text style={styles.emojiIcon}>{item.emoji}</Text>
                </View>

                {/* Glass Card */}
                <Animated.View style={[styles.glassCard, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.glassInner}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </Animated.View>

                {/* Feature Highlights */}
                <View style={styles.featuresContainer}>
                  {index === 0 && (
                    <>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✨</Text>
                        <Text style={styles.featureText}>Günlük ilham</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📱</Text>
                        <Text style={styles.featureText}>Kolay kullanım</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🎨</Text>
                        <Text style={styles.featureText}>Özel tasarım</Text>
                      </View>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🎯</Text>
                        <Text style={styles.featureText}>İlgi alanlarına göre</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🔔</Text>
                        <Text style={styles.featureText}>Akıllı bildirimler</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>💝</Text>
                        <Text style={styles.featureText}>Favori sözler</Text>
                      </View>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={styles.featureText}>İlerleme takibi</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🏆</Text>
                        <Text style={styles.featureText}>Başarım rozetleri</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🌈</Text>
                        <Text style={styles.featureText}>Günlük temalar</Text>
                      </View>
                    </>
                  )}
                </View>
              </Animated.View>
            );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={16}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 32, 8],
                extrapolate: 'clamp',
              });

              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity: dotOpacity,
                    },
                  ]}
                  key={index.toString()}
                />
              );
            })}
          </View>

          {/* Action Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={scrollTo}
              activeOpacity={0.8}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>
                  {currentIndex === onboardingData.length - 1 ? '🚀 Başlayalım' : 'İleri →'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button */}
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('InterestSelection')}
            >
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  circleTop: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -100,
  },
  circleBottom: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -80,
    left: -80,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.extraLarge,
    paddingTop: height * 0.15,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.extraLarge * 2,
    position: 'relative',
  },
  emojiGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  emojiIcon: {
    fontSize: 120,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  glassCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: SIZES.extraLarge,
    padding: SIZES.extraLarge,
    marginBottom: SIZES.extraLarge * 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glassInner: {
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge * 1.3,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: SIZES.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: SIZES.medium * 1.1,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SIZES.base,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.base * 2,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: SIZES.base / 2,
  },
  featureText: {
    fontSize: SIZES.small,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.extraLarge * 2,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.extraLarge,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 4,
  },
  button: {
    width: width * 0.85,
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
    fontSize: SIZES.large * 1.1,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: SIZES.medium,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.large,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 