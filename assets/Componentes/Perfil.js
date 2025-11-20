import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Perfil() {

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUsuario(snap.data());
        }
      }
    });

    return unsub;
  }, []);

  if (!usuario) {
    return <Text style={{color:'white', textAlign:'center'}}>Cargando perfil...</Text>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.info}>Nombre: {usuario.nombre}</Text>
      <Text style={styles.info}>Correo: {usuario.correo}</Text>
      <Text style={styles.info}>Fecha nacimiento: {usuario.fecha}</Text>
      <Text style={styles.info}>Teléfono: {usuario.telefono}</Text>
      <Text style={styles.info}>Ganados: {usuario.ganados}</Text>
      <Text style={styles.info}>Perdidos: {usuario.perdidos}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E1B',
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 25
  },
  info: {
    color: '#A5B6FF',
    fontSize: 18,
    marginBottom: 10
  }
});
