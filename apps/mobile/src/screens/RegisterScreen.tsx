import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/store/authSlice';

export function RegisterScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Registration Failed', error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
        editable={!loading}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 8 chars)"
        value={formData.password}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
        editable={!loading}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="First Name (optional)"
        value={formData.firstName}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name (optional)"
        value={formData.lastName}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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

