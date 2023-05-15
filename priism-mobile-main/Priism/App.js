import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { Provider as PaperProvider } from 'react-native-paper';
import BottomNav from './components/BottomNav';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SignUp from './components/SignUp';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import VerifyCode from './components/VerifyCode';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name = "LoginScreen" component = {LoginScreen} options={{headerShown:false}} />
          <Stack.Screen name = "SignUp" component = {SignUp} options={{headerShown:false}} />
          <Stack.Screen name = "VerifyCode" component={VerifyCode} options={{headerShown:false}} />
          <Stack.Screen name = "BottomNav" component={BottomNav} options={{headerShown:false}} />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});