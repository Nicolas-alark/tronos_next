import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const preguntas = [
  {
    pregunta: "¿Cuál es el cohete más poderoso de SpaceX?",
    opciones: ["Falcon 9", "Starship", "Falcon Heavy", "Dragon"],
    correcta: 1
  },
  {
    pregunta: "¿Quién es el fundador de SpaceX?",
    opciones: ["Jeff Bezos", "Bill Gates", "Elon Musk", "Tony Stark"],
    correcta: 2
  },
  {
    pregunta: "¿En qué año se fundó SpaceX?",
    opciones: ["1999", "2002", "2010", "2015"],
    correcta: 1
  }
];

export default function Trivia() {
  const [index, setIndex] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const usuario = auth.currentUser;

  const responder = (i) => {
    setSeleccion(i);

    if (i === preguntas[index].correcta) {
      setPuntaje(puntaje + 1);
      setResultado("correcto");
    } else {
      setResultado("incorrecto");
    }

    setTimeout(() => {
      setSeleccion(null);
      setResultado(null);
      if (index + 1 < preguntas.length) {
        setIndex(index + 1);
      } else {
        guardarResultado();
      }
    }, 900);
  };

  const guardarResultado = async () => {
    setGuardando(true);

    try {
      const ref = doc(db, "usuarios", usuario.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        await updateDoc(ref, {
          ganados: puntaje === preguntas.length ? data.ganados + 1 : data.ganados,
          perdidos: puntaje !== preguntas.length ? data.perdidos + 1 : data.perdidos,
        });
      }
    } catch (e) {
      console.log("Error guardando:", e);
    }

    setGuardando(false);
    setResultado("fin");
  };

  if (guardando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Guardando resultados...</Text>
      </View>
    );
  }

  if (resultado === "fin") {
    return (
      <View style={styles.center}>
        <Text style={styles.finTitulo}>¡Trivia Finalizada!</Text>

        <Text style={styles.finTexto}>
          Aciertos: {puntaje} / {preguntas.length}
        </Text>

        <Text style={styles.finTexto}>
          {puntaje === preguntas.length ? "¡Perfecto! +1 victoria" : "Fallaste. +1 derrota"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pregunta}>{preguntas[index].pregunta}</Text>

      {preguntas[index].opciones.map((op, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => responder(i)}
          style={[
            styles.opcion,
            seleccion === i && resultado === "correcto" && styles.correcta,
            seleccion === i && resultado === "incorrecto" && styles.incorrecta,
          ]}
        >
          <Text style={styles.opcionTexto}>{op}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.progreso}>
        Pregunta {index + 1} de {preguntas.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
    justifyContent: "center",
  },
  pregunta: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 25,
  },
  opcion: {
    padding: 15,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
  },
  opcionTexto: {
    color: "#DADADA",
    fontSize: 16,
  },
  correcta: {
    backgroundColor: "#0A8F42",
    borderColor: "#0A8F42",
  },
  incorrecta: {
    backgroundColor: "#8F0A0A",
    borderColor: "#8F0A0A",
  },
  progreso: {
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
  },
  finTitulo: {
    color: "#0A84FF",
    fontSize: 28,
    fontWeight: "700",
  },
  finTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 15,
  },
});
