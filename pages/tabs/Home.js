import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { auth, firestore } from "../../firebase"; // Make sure this path is correct
import { doc, getDoc } from "firebase/firestore";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Skeleton } from "moti/skeleton";


const Home = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser; // Get currently logged-in user
        if (currentUser) {
          const uid = currentUser.uid;
          const userDocRef = doc(firestore, "users", uid); // Reference user document
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.name); // Set username from Firestore data
          } else {
            console.error("No such document!");
          }
        } else {
          console.error("No user is logged in!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* Title with Skeleton Loader */}
        <View style={styles.titleview}>
          {loading ? (
            <Skeleton
              colorMode="grey"
              height={36}
              width={250}
              borderRadius={4}
              style={styles.skeleton}
            />
          ) : (
            <Animated.Text
              entering={FadeIn.duration(400).delay(200)}
              style={styles.title}
            >
              Hey, {username}!
            </Animated.Text>
          )}
        </View>

        <Text style={styles.subtitle}>Welcome to the Home Screen!</Text>
        {/* Add more components here */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  titleview: {
    position: "absolute", // Positioning the text
    top: 10, // Distance from the top
    left: 10, // Distance from the left
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: "gray",
  },
  skeleton: {
    marginTop: 5,
  },
});

export default Home;
