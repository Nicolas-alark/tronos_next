import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const navigation = useNavigation();

  let ganados = 0;
  let perdidos = 0;

  const handleRegistro = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre,
        correo,
        fecha,
        telefono,
        ganados,
        perdidos
      });

      Alert.alert('Éxito', 'Usuario registrado correctamente');
      navigation.navigate('Login');

    } catch (error) {
      Alert.alert('Error al registrarse', error.message);
    }
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>CREAR CUENTA</Text>

      <TextInput 
        placeholder="Nombre completo" 
        placeholderTextColor="#9DA3B4"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

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
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        style={styles.input}
      />

      <TextInput 
        placeholder="Fecha de nacimiento" 
        placeholderTextColor="#9DA3B4"
        value={fecha}
        onChangeText={setFecha}
        style={styles.input}
      />

      <TextInput 
        placeholder="Teléfono" 
        placeholderTextColor="#9DA3B4"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={handleRegistro}>
        <Text style={styles.btnText}>REGISTRARSE</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E1B',  // Fondo espacial
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    letterSpacing: 2,
  },
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
  btn: {
    backgroundColor: '#0B3D91', 
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  linkText: {
    color: '#4C8BFF',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 15,
  }
});
