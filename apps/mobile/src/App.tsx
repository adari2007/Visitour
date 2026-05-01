import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreToken } from '@/store/authSlice';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreToken());
  }, [dispatch]);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

