import React, { useCallback, useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import {
  TextInput,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,ActivityIndicator
} from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';


const Loginscreen = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Redirect to Home only if explicitly logging in, not after sign-up
        const routeName = navigation.getState().routes.at(-1)?.name; // Get the current route name
        if (routeName === "Login") {
          // navigation.replace("TabLayout");
        }
      }
    });
    return unsubscribe; // Clean up the listener
  }, [navigation]);
  

  const handleLogin = useCallback(() => {
    setIsLoading(true ,<LottieView source={{ uri: "https://lottie.host/18c23044-14e1-4450-8c51-9461acb12bf7/9JVnvxntY1.json" }}
      autoPlay
      loop
      style={styles.lottieAnimation}
  />); // Start loading
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User signed in:', userCredential.user);
        
        navigation.replace("Tabs");
      })
      .catch((error) => {
        console.error('Error signing in:', error);
      });
        setIsLoading(false);
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.imageContainer}>
          <Animated.Image
            entering={FadeInUp.duration(400).delay(200)}
            style={styles.image}
            source={require('../assets/login/login.jpg')} // Make sure the path is correct
          />
        </View>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(300)}
          style={styles.h1container}
        >
          Welcome back!
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.formContainer}
        >
          <Text style={styles.labeltext}>Email</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="example@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
          <Text style={styles.labeltext}>Password</Text>
          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            placeholder="**********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(400).delay(600)}
          style={styles.formContainer}
        >
          <TouchableOpacity 
  onPress={handleLogin} 
  style={[styles.button, isLoading && styles.buttonDisabled]} 
  disabled={isLoading}
>
  {isLoading ? (
    <ActivityIndicator size="small" color="#FFFFFF" />
  ) : (
    <Text style={styles.buttonText}>Log In</Text>
  )}
</TouchableOpacity>
        </Animated.View>
        <Animated.View
          entering={FadeIn.duration(400).delay(600)}
          style={styles.footer}
        >
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Signin')}>
            <Text style={styles.loginLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // ... (your styles - same as before)
    loginText: {
      marginTop: 20,
      color: 'blue',
      textDecorationLine: 'underline',
    },
    loginLinkContainer:{
        alignItems:'center',
    },
        h1container:{
        fontFamily:'sf-pro-display-semibold',
        fontSize:35,
        fontWeight:'bold',
        marginBottom:20,
        bottom:20,
        right:20,
    },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    bottom:0,
  },
  imageContainer: {
    bottom:40,
    marginBottom:20,
  },
  image: {
    width: 350,
    height: 260,
  },
  formContainer: {
    bottom:30,
    width: '80%',
    justifyContent:'space-evenly',
  },
  labeltext:{
    fontFamily:'sf-pro-display-semibold',
    marginBottom:10,
    left:5,
    
  },
  input: {
    borderWidth: 1, 
    width:'100%',
    height: 50,
    borderColor: 'lightgrey',
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 15,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2, 
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  
  inputFocused: {
    borderColor: 'black', 
    borderWidth:2,
  },
  button: {
    backgroundColor: 'black',
    marginTop:15,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row', // Arrange text and link horizontally
    marginTop:0, // Add some spacing
    alignItems: 'center', // Vertically align items
  },
  loginLink: {
    color: 'blue', // Style the "Login" text as a link
    textDecorationLine: 'underline', // Add underline for better UX
  },
});

export default Loginscreen;