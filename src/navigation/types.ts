/**
 * TypeScript route names for React Navigation stack and drawer navigators.
 */
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  WordDetail: undefined;
};

export type RootDrawerParamList = {
  Main: NavigatorScreenParams<RootStackParamList>;
};
