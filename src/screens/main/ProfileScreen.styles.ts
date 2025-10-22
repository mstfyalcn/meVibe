import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.extraLarge,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    padding: SIZES.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.large,
  },
  sectionNote: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.medium,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  premiumCard: {
    margin: SIZES.large,
    borderRadius: SIZES.base * 2,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: SIZES.large,
  },
  premiumTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.medium,
  },
  premiumDescription: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
  },
  settingLabel: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  linkButton: {
    paddingVertical: SIZES.medium,
  },
  linkText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  loadingContainer: {
    padding: SIZES.medium,
    alignItems: 'center',
  },
  interestItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
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
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  notificationTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.base,
  },
  notificationTimeLabel: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  notificationTimeValue: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
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
    fontSize: SIZES.large,
    color: COLORS.gray,
  },
}); 