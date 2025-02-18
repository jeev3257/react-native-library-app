import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import Loginscreen from "./pages/Loginscreen"
import Signin from "./pages/Signin"
import MyTabs from "./components/Tabs"
import Search from "./pages/tabs/Search"
import Bookdetails from "./pages/tabs/Bookdetails"
import GenreBooks from "./pages/tabs/GenreBooks"
import Profile from "./pages/tabs/Profile"

// Create Stack Navigator
const Stack = createStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen name="Login" component={Loginscreen} options={{ headerShown: false }} />

        {/* Signin Screen */}
        <Stack.Screen name="Signin" component={Signin} options={{ headerShown: false }} />

        {/* Tab Navigation Screen */}
        <Stack.Screen
          name="Tabs"
          component={MyTabs}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        {/* BookDetails Screen */}
        <Stack.Screen
          name="Bookdetails"
          component={Bookdetails}
          options={{
            headerShown: false,
          }}
        />

        {/* Search Screen */}
        <Stack.Screen
          name="Search"
          component={Search}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Profile" component={Profile}options={{
            headerShown: false,
          }}/>

        {/* GenreBooks Screen */}
        <Stack.Screen
          name="GenreBooks"
          component={GenreBooks}
          options={({ route }) => ({
            title: `${route.params.genre} Books`,
            headerShown: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

