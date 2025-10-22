import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Header
  header: {
    height: 220,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.extraLarge,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatar: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge * 1.2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.base / 2,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    padding: SIZES.large,
    gap: SIZES.medium,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  statNumber: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base / 2,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  
  // Sections
  section: {
    padding: SIZES.large,
    paddingTop: SIZES.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  sectionBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: 'bold',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base * 2,
  },
  sectionNote: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.medium,
    lineHeight: 20,
  },
  
  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.medium,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: SIZES.base,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  achievementTextLocked: {
    color: COLORS.gray,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.white,
    borderRadius: 2,
    marginTop: SIZES.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  
  // Favorites
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  favoriteContent: {
    flex: 1,
    marginRight: SIZES.medium,
  },
  favoriteQuote: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    marginBottom: SIZES.base / 2,
  },
  favoriteAuthor: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  favoriteRemove: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  favoriteRemoveText: {
    fontSize: 24,
  },
  favoritesMoreText: {
    textAlign: 'center',
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  emptyState: {
    alignItems: 'center',
    padding: SIZES.extraLarge,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: SIZES.medium,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Settings
  settingsButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.light,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonIcon: {
    fontSize: SIZES.large,
    marginRight: SIZES.medium,
  },
  settingsButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  settingsButtonArrow: {
    fontSize: 24,
    color: COLORS.gray,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginTop: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: SIZES.large,
    marginRight: SIZES.medium,
  },
  settingText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  
  // Premium Card
  premiumCard: {
    margin: SIZES.large,
    marginTop: 0,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  premiumGradient: {
    padding: SIZES.extraLarge,
  },
  premiumTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    lineHeight: 28,
    marginBottom: SIZES.large,
  },
  premiumPriceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    alignItems: 'center',
  },
  premiumPrice: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Buttons
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base * 2,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  linkText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  linkArrow: {
    fontSize: 20,
    color: COLORS.gray,
  },
  
  // Other
  versionText: {
    textAlign: 'center',
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginVertical: SIZES.extraLarge,
    opacity: 0.5,
  },
  loadingContainer: {
    padding: SIZES.medium,
    alignItems: 'center',
  },
  interestItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  interestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  interestIcon: {
    fontSize: SIZES.large,
    marginRight: SIZES.base,
  },
  interestName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  interestDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base * 2,
    alignItems: 'center',
    marginTop: SIZES.medium,
    ...SHADOWS.light,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  
  // Notification Info
  notificationInfoCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
    padding: SIZES.large,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  notificationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  notificationInfoLabel: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  notificationInfoValue: {
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  notificationInfoNote: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base * 2,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  notificationButtonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  notificationButtonIcon: {
    fontSize: SIZES.large,
    marginRight: SIZES.base,
  },
  notificationButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  
  // Notification Count
  notificationCountSection: {
    marginTop: SIZES.large,
    padding: SIZES.medium,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base * 2,
  },
  notificationCountTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  notificationCountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.medium,
  },
  countButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    ...SHADOWS.light,
  },
  countButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  countButtonText: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  countButtonTextActive: {
    color: COLORS.white,
  },
  notificationCountHint: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
