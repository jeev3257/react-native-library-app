"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, Easing, Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { BlurView } from "expo-blur"
import { MotiView } from "moti"
import { Feather } from "@expo/vector-icons"

// Keep your original screen components and import the new Activity component
import Home from "../pages/tabs/Home"
import Explore from "../pages/tabs/Explore"
import Wishlist from "../pages/tabs/Wishlist"
import Activity from "../pages/tabs/Activity" // New import

const Tab = createBottomTabNavigator()
const { width } = Dimensions.get("window")
const TAB_WIDTH = width / 4

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const animatedValues = useRef(state.routes.map(() => new Animated.Value(0))).current

  useEffect(() => {
    const focusedTab = state.index
    Animated.parallel(
      animatedValues.map((anim, index) =>
        Animated.timing(anim, {
          toValue: index === focusedTab ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
      ),
    ).start()
  }, [state.index, animatedValues])

  return (
    <BlurView intensity={80} style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel || options.title || route.name
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const animatedWidth = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 120],
          })

          const animatedOpacity = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          })

          return (
            <TouchableOpacity key={index} onPress={onPress} style={styles.tabItem}>
              <Animated.View style={[styles.tabItemContent, { width: animatedWidth }, isFocused && styles.activeTab]}>
                <MotiView
                  animate={{
                    scale: isFocused ? 1 : 0.85,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Feather name={options.tabBarIcon} size={24} color={isFocused ? "#FFF" : "#8E8E93"} />
                </MotiView>
                <Animated.Text style={[styles.label, { opacity: animatedOpacity }]} numberOfLines={1}>
                  {label}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          )
        })}
      </View>
    </BlurView>
  )
}

const ModernTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { position: "absolute" },
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={Home} options={{ tabBarIcon: "home" }} />
    <Tab.Screen name="Explore" component={Explore} options={{ tabBarIcon: "compass" }} />
    <Tab.Screen name="Wishlist" component={Wishlist} options={{ tabBarIcon: "heart" }} />
    <Tab.Screen name="Activity" component={Activity} options={{ tabBarIcon: "clock" }} />
  </Tab.Navigator>
)

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: "hidden",
    height: 65,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  activeTab: {
    backgroundColor: "black",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 8,
  },
})

export default ModernTabs

