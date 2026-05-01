import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/authSlice';

export function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(login(credentials)).unwrap();
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Login Failed', error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visitour</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={credentials.email}
        onChangeText={(text) => setCredentials((prev) => ({ ...prev, email: text }))}
        editable={!loading}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={credentials.password}
        onChangeText={(text) => setCredentials((prev) => ({ ...prev, password: text }))}
        editable={!loading}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 4,
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 12,
  },
});

