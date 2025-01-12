import React from "react";
import { StyleSheet,Text,View,Touchable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Home from "../pages/tabs/Home";
import Explore from "../pages/tabs/Explore";
import Wishlist from "../pages/tabs/Wishlist";
import Profile from "../pages/tabs/Profile";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

const MyTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false, // Removes labels
                tabBarStyle: {
                    backgroundColor: "white", // Tab bar background color
                    position: "absolute", // Makes the tab bar float
                    bottom: 25, // Position 25 units from the bottom
                    marginLeft: 25, // 20 units from the left
                    marginRight: 20, // 20 units from the right
                    elevation: 0, // Removes shadow for Android
                    borderRadius: 15, // Makes corners rounded
                    height: 80, // Sets height for the tab bar
                    width:width-50,
                    ...styles.shadow
                },
                headerShown: false, // Hides headers for all screens
                gestureEnabled: false, // Disables gestures for all screens
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={Home} 
                options={{ tabBarIcon:({focused}) =>(
                    <View style={{alignItems:'center',justifyContent:"center",top:30}}>
                        <Feather name="home" size={24} style={{color: focused? "black":"grey"}} />
                        <Text>Home</Text>
                    </View>
                )}} 
            />
            <Tab.Screen 
                name="Explore" 
                component={Explore} 
                options={{ tabBarIcon:({focused}) =>(
                    <View style={{alignItems:'center',justifyContent:"center",top:30}}>
                        <Feather name="thumbs-up" size={24} style={{color: focused? "black":"grey"}} />
                        <Text>Recomended</Text>
                    </View>
                )}} 
            />
            <Tab.Screen 
                name="Wishlist" 
                component={Wishlist} 
                options={{ tabBarIcon:({focused}) =>(
                    <View style={{alignItems:'center',justifyContent:"center",top:30}}> 
                        <Feather name="heart" size={24} style={{color: focused? "black":"grey"}} />
                        <Text>Wishlist</Text>
                    </View>
                )}} 
            />
            <Tab.Screen 
                name="Profile" 
                component={Profile} 
                options={{ tabBarIcon:({focused}) =>(
                    <View style={{alignItems:'center',justifyContent:"center",top:30}}>
                        <Feather name="book" size={24} style={{color: focused? "black":"grey"}} />
                        <Text>Activity</Text>
                    </View>
                )}} 
            />
        </Tab.Navigator>
    );
}
const styles=StyleSheet.create({
shadow:{
    shadowColor:"grey",
    shadowOffset:{
        width:0,
        height:10,
    },
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5,
}
})

export default MyTabs;
