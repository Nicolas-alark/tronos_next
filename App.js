import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './assets/firebase/firebaseConfig';
import Login from './assets/Componentes/Login';
import Registro from './assets/Componentes/Registro';
import Home from './assets/Componentes/Home';
import Original from './assets/Componentes/Original';
import Perfil from './assets/Componentes/Perfil';
import Logout from './assets/Componentes/Logout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ---------------------
// TABS PARA USUARIOS LOGEADOS
// ---------------------
function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Original" component={Original} />
      <Tab.Screen name="Perfil" component={Perfil} />
      <Tab.Screen name="Logout" component={Logout} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });

    return unsubscribe;
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <Stack.Screen name="Tabs" component={AppTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Registro" component={Registro} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
