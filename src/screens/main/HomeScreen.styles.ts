import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

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
    paddingTop: SIZES.extraLarge,
  },
  greeting: {
    fontSize: SIZES.extraLarge * 1.3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subGreeting: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  
  // Streak Card
  streakCard: {
    marginHorizontal: SIZES.large,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  streakGradient: {
    padding: SIZES.large,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: SIZES.medium,
  },
  streakNumber: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  streakText: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  
  // Quote Cards
  quoteContainer: {
    marginHorizontal: SIZES.large,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  quoteGradient: {
    padding: SIZES.large,
  },
  mainQuoteGradient: {
    padding: SIZES.extraLarge,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base * 2,
    marginBottom: SIZES.medium,
  },
  categoryIcon: {
    fontSize: SIZES.medium,
    marginRight: SIZES.base / 2,
  },
  categoryName: {
    fontSize: SIZES.small,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  quoteText: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    lineHeight: SIZES.medium * 1.6,
    fontStyle: 'italic',
  },
  mainQuoteText: {
    fontSize: SIZES.large,
    lineHeight: SIZES.large * 1.6,
  },
  quoteAuthor: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginTop: SIZES.large,
    textAlign: 'right',
    opacity: 0.9,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.large,
    gap: SIZES.medium,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.base * 2,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 24,
  },
  
  // Stats Card
  statsCard: {
    marginHorizontal: SIZES.large,
    marginVertical: SIZES.medium,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
  },
  statsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.extraLarge * 1.5,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.base / 2,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: SIZES.medium,
  },
  refreshHint: {
    textAlign: 'center',
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginVertical: SIZES.extraLarge,
    opacity: 0.6,
  },
  
  // Daily Theme
  themeCard: {
    marginHorizontal: SIZES.large,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  themeGradient: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  themeEmoji: {
    fontSize: 48,
    marginBottom: SIZES.base,
  },
  themeTitle: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.base / 2,
  },
  themeSubtitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Category Filter
  categoryFilter: {
    marginHorizontal: SIZES.large,
    marginBottom: SIZES.medium,
  },
  categoryFilterTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.base * 3,
    marginRight: SIZES.base,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
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