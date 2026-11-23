import * as React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../ui';

export function Home({ navigation }: { navigation: { navigate(route: string): void } }) {
  return (
    <View testID="home" style={{ flex: 1, padding: 16 }}>
      <Text testID="welcome">Atelier Mona</Text>
      <Button testID="open_privacy" title="Privacy" onPress={() => navigation.navigate('Privacy')} />
    </View>
  );
}
