import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";

export default function Home() {
  const [rockets, setRockets] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRockets = async () => {
    try {
      const res = await fetch("https://api.spacexdata.com/v4/rockets");
      const data = await res.json();
      setRockets(data);
      setLoading(false);
    } catch (error) {
      console.log("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getRockets();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {rockets.map((rocket) => (
        <View key={rocket.id} style={styles.card}>
          
          {/* Imagen */}
          <Image 
            source={{ uri: rocket.flickr_images[0] }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Nombre */}
          <Text style={styles.title}>{rocket.name}</Text>
          <Text style={styles.subtitle}>{rocket.type.toUpperCase()}</Text>

          {/* Descripción */}
          <Text style={styles.description}>{rocket.description}</Text>

          {/* SECCIÓN: Info general */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            <Text style={styles.text}>País: {rocket.country}</Text>
            <Text style={styles.text}>Empresa: {rocket.company}</Text>
            <Text style={styles.text}>Primer vuelo: {rocket.first_flight}</Text>
            <Text style={styles.text}>
              Costo por lanzamiento: ${rocket.cost_per_launch.toLocaleString()}
            </Text>
            <Text style={styles.text}>Tasa de éxito: {rocket.success_rate_pct}%</Text>
          </View>

          {/* SECCIÓN: Dimensiones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dimensiones</Text>
            <Text style={styles.text}>Altura: {rocket.height.meters} m</Text>
            <Text style={styles.text}>Diámetro: {rocket.diameter.meters} m</Text>
            <Text style={styles.text}>
              Masa: {rocket.mass.kg.toLocaleString()} kg
            </Text>
          </View>

          {/* SECCIÓN: Motores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Motores</Text>
            <Text style={styles.text}>Número: {rocket.engines.number}</Text>
            <Text style={styles.text}>Tipo: {rocket.engines.type}</Text>
            <Text style={styles.text}>Versión: {rocket.engines.version}</Text>
            <Text style={styles.text}>Propelente 1: {rocket.engines.propellant_1}</Text>
            <Text style={styles.text}>Propelente 2: {rocket.engines.propellant_2}</Text>
          </View>

        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#0D0D0D",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: "#0A84FF33",
    shadowColor: "#0A84FF",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  subtitle: {
    color: "#9BB3C8",
    marginBottom: 10,
    fontSize: 14,
  },
  description: {
    color: "#D5D5D5",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#0A84FF",
    fontWeight: "700",
    marginBottom: 6,
  },
  text: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 3,
  },
});
