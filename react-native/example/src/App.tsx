import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home } from './screens/Home';
import { Privacy } from './screens/Privacy';

export type Routes = {
  Home: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<Routes>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Privacy" component={Privacy} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
