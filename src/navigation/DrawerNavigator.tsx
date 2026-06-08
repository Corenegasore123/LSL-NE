/**
 * Side drawer wrapping the stack. DrawerContent shows search history;
 * swipe or menu button opens it from Home and Word Detail screens.
 */
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from '../components/DrawerContent';
import { useTheme } from '../context/ThemeContext';
import { RootStack } from './RootStack';
import { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export function DrawerNavigator() {
  const { isDark } = useTheme();
  const surfaceColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const overlayColor = isDark ? 'rgba(10,10,10,0.75)' : 'rgba(249,247,242,0.9)';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 320,
          backgroundColor: surfaceColor,
        },
        overlayColor,
        swipeEdgeWidth: 60,
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Main" component={RootStack} />
    </Drawer.Navigator>
  );
}
