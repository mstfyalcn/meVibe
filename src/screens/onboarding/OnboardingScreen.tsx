import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { OnboardingItem } from '../../types/onboarding';

const { width, height } = Dimensions.get('window');

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Günlük Motivasyon',
    description: 'Her gün size özel seçilmiş motivasyon sözleriyle güne enerjik başlayın',
    image: require('../../assets/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Kişiselleştirilmiş İçerik',
    description: 'İlgi alanlarınıza göre özelleştirilmiş motivasyon sözleri alın',
    image: require('../../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Premium Özellikler',
    description: 'Daha fazla özelleştirme ve sınırsız içerik için premium üye olun',
    image: require('../../assets/onboarding3.png'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('InterestSelection');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flatlistContainer}>
        <FlatList
          data={onboardingData}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.imageContainer}>
                {/* Burada image component'i eklenecek */}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
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
        />
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
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
                  styles.dot,
                  { width: dotWidth, opacity },
                ]}
                key={index.toString()}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={scrollTo}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Başla' : 'İleri'}
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
  },
  flatlistContainer: {
    flex: 3,
  },
  slide: {
    width,
    height: height * 0.75,
    alignItems: 'center',
    padding: SIZES.large,
  },
  imageContainer: {
    flex: 0.7,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  description: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SIZES.base,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.extraLarge,
    paddingBottom: SIZES.extraLarge,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
  },
  button: {
    marginTop: SIZES.large,
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

export default OnboardingScreen; 