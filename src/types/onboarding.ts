export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
  emoji?: string;
  gradient?: string[];
}

export interface InterestArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserPreferences {
  userId: string;
  selectedInterests: string[];
  notificationTime: string;
  isPremium: boolean;
  customContent?: string[];
  notificationCount: number;
} 