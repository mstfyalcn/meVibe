import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.large,
  },
  greeting: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subGreeting: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  quoteContainer: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SIZES.extraLarge,
  },
  quoteText: {
    fontSize: SIZES.large,
    color: COLORS.white,
    lineHeight: SIZES.large * 1.5,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginTop: SIZES.large,
    textAlign: 'right',
  },
  loadingContainer: {
    margin: SIZES.large,
    padding: SIZES.extraLarge,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SIZES.large,
  },
  statCard: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.large,
    borderRadius: SIZES.base,
    alignItems: 'center',
    width: '40%',
  },
  statNumber: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  premiumButton: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: SIZES.large,
  },
  premiumText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.base,
    opacity: 0.8,
  },
}); 