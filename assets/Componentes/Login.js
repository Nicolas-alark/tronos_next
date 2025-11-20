import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>INICIAR SESIÓN</Text>

      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#9DA3B4"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#9DA3B4"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>ENTRAR</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E1B', justifyContent: 'center', padding: 25 },
  title: { color: 'white', fontSize: 28, marginBottom: 30, textAlign: 'center', letterSpacing: 2 },
  input: {
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#2B3245',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  btn: { backgroundColor: '#0B3D91', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
  btnText: { color: 'white', textAlign: 'center', fontSize: 16 },
  link: { color: '#4C8BFF', textAlign: 'center', marginTop: 15 },
});
