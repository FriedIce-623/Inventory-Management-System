import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <View />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }
  return <Redirect href="/(auth)/login" />;
}
