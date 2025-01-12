import React, { useCallback, useState } from "react";
import Animated, { FadeIn, FadeInUp, FadeInDown } from "react-native-reanimated";
import {
  TextInput,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator, // Import spinner
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";

const SignInScreen = () => {
  const [regid, setRegid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // Track focused field
  const navigation = useNavigation();

  const validateFields = useCallback(() => {
    const newErrors = {};
    if (!regid) newErrors.regid = "Registration number is required.";
    if (!name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [regid, name, email, password]);

  const handleSignup = useCallback(async () => {
    if (validateFields()) {
      try {
        setIsLoading(true); // Start loading
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("User created successfully.");
  
        // Save to Firestore
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          regid,
          name,
          email,
        });
        console.log("User data saved to Firestore.");
  
        // Show success alert and navigate back to Login
        Alert.alert(
          "Success",
          "Account created successfully! Please log in.",
          [
            {
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        const errorMessage = error.message;
        setErrors((prevErrors) => ({ ...prevErrors, auth: errorMessage }));
        console.error(`Firebase Error: ${errorMessage}`);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  }, [auth, email, password, regid, name, navigation, validateFields]);
  

  const handleRegidChange = (text) => {
    setRegid(text.toUpperCase());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.imageContainer}>
          <Animated.Image
            entering={FadeInUp.duration(400).delay(200)}
            style={styles.image}
            source={require("../assets/signin/signin.png")}
          />
        </View>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(300)}
          style={styles.h1container}
        >
          Let's get started!
        </Animated.Text>

        {isLoading ? (
          // Show Lottie animation while loading
          <LottieView
            source={{
              uri: "https://lottie.host/18c23044-14e1-4450-8c51-9461acb12bf7/9JVnvxntY1.json",
            }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        ) : (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.formContainer}
          >
            {/* Registration Number Input */}
            <Text style={styles.labeltext}>Registration number</Text>
            <TextInput
              style={[
                styles.input,
                errors.regid && styles.inputError,
                focusedField === "regid" && styles.inputFocused,
              ]}
              placeholder="IDK00AB000"
              value={regid}
              onChangeText={handleRegidChange}
              onFocus={() => setFocusedField("regid")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.regid && <Text style={styles.errorText}>{errors.regid}</Text>}

            {/* Name Input */}
            <Text style={styles.labeltext}>Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError,
                focusedField === "name" && styles.inputFocused,
              ]}
              placeholder="Example Name"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email Input */}
            <Text style={styles.labeltext}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                focusedField === "email" && styles.inputFocused,
              ]}
              placeholder="example@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Input */}
            <Text style={styles.labeltext}>Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
                focusedField === "password" && styles.inputFocused,
              ]}
              placeholder="**********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </Animated.View>
        )}

        {/* Firebase Authentication Errors */}
        {errors.auth && <Text style={styles.errorText}>{errors.auth}</Text>}

        {/* Signup Button */}
        {/* Signup Button */}
{/* Signup Button */}
<Animated.View
  entering={FadeInDown.duration(400).delay(600)}
  style={styles.formContainer}
>
  {!isLoading && (
    <TouchableOpacity
      onPress={handleSignup}
      style={[styles.button, isLoading && styles.buttonDisabled]}
      disabled={isLoading} // Disable button when loading
    >
      <Text style={styles.buttonText}>Sign Up</Text>
    </TouchableOpacity> // Show button only when not loading
  )}
</Animated.View>



        {/* Footer with Navigation to Login */}
        <Animated.View
          entering={FadeIn.duration(400).delay(600)}
          style={styles.footer}
        >
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 10,
  },
  image: {
    width: 260,
    height: 250,
  },
  formContainer: {
    width: "80%",
  },
  labeltext: {
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    width: "100%",
    height: 50,
    borderColor: "lightgrey",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  inputFocused: {
    borderColor: "black",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  loginLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
  h1container: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
});

export default SignInScreen;
