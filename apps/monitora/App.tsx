import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Monitora</Text>
        <Text style={styles.title}>Camino Seguro</Text>
        <Text style={styles.body}>Esqueleto de aplicación móvil para supervisión y sincronización offline.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 24
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
    color: '#0f172a'
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24
  }
});
