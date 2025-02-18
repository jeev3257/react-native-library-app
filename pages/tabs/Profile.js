import { useState, useEffect, useCallback } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Dimensions } from "react-native"
import { getAuth, signOut } from "firebase/auth"
import { getFirestore, doc, getDoc,updateDoc } from "firebase/firestore"
import { AvatarSelectionModal } from "./AvatarSelectionModal"
import { CommonActions } from "@react-navigation/native"
import { BarChart, ContributionGraph } from "react-native-chart-kit"
import { Ionicons } from "@expo/vector-icons"

const auth = getAuth()
const db = getFirestore()
const ACCENT_COLOR = "black"
const screenWidth = Dimensions.get("window").width

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [monthlyActivityData, setMonthlyActivityData] = useState([])
  const [contributionData, setContributionData] = useState([])

  useEffect(() => {
    fetchUserData()
    fetchMonthlyBorrowingActivity()
    fetchContributionData()
  }, [])

  const fetchUserData = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        setUserData(data)
        setSelectedAvatar(getAvatarSource(data.profileImage))
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchMonthlyBorrowingActivity = async () => {
    const mockData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return {
        month: date.toLocaleString("default", { month: "short" }),
        booksRead: Math.floor(Math.random() * 10) + 1,
      }
    }).reverse()
    setMonthlyActivityData(mockData)
  }

  const fetchContributionData = async () => {
    const mockData = Array.from({ length: 365 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 5),
      }
    })
    setContributionData(mockData)
  }

  const getAvatarSource = (profileImage) => {
    if (typeof profileImage === "number") {
      const avatars = [
        require("../../assets/avatars/av1.png"),
        require("../../assets/avatars/av2.png"),
        require("../../assets/avatars/av3.png"),
        require("../../assets/avatars/av4.png"),
        require("../../assets/avatars/av5.png"),
        require("../../assets/avatars/av6.png"),
        require("../../assets/avatars/default.png"),
      ]
      return avatars[profileImage % avatars.length]
    } else if (typeof profileImage === "string") {
      return { uri: profileImage }
    }
    return require("../../assets/avatars/default.png")
  }
  const handleSelectAvatar = async (avatar, index) => {
    if (index === undefined || index === null) {
      console.error("Invalid avatar index:", index)
      return
    }
  
    setSelectedAvatar(avatar)
  
    const user = auth.currentUser
    if (!user) return
  
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        profileImage: index, 
      })
      console.log("Avatar updated successfully in Firestore")
    } catch (error) {
      console.error("Error updating avatar:", error)
    }
  }
  
  
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }], // Ensures "Login" is the only screen in the stack
        })
      )
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }
  
  

  const calculateTotalBooksThisMonth = () => {
    return monthlyActivityData[monthlyActivityData.length - 1]?.booksRead || 0
  }

  const calculateAverageBooksPerMonth = () => {
    const total = monthlyActivityData.reduce((sum, month) => sum + month.booksRead, 0)
    return (total / monthlyActivityData.length).toFixed(1)
  }

  const renderMonthlyActivityChart = () => {
    const chartData = {
      labels: monthlyActivityData.map((item) => item.month),
      datasets: [
        {
          data: monthlyActivityData.map((item) => item.booksRead),
        },
      ],
    }

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    )
  }

  const renderContributionGraph = () => {
    return (
      <View style={styles.chartContainer}>
        <ContributionGraph
          values={contributionData}
          endDate={new Date()}
          numDays={365}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={useCallback(() => navigation.goBack(), [navigation])}>
          <Ionicons name="arrow-back" size={24} color={ACCENT_COLOR} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {userData && (
            <View style={styles.content}>
              <View style={styles.section}>
                <View style={styles.avatarContainer}>
                  <Image source={selectedAvatar} style={styles.avatar} />
                  <TouchableOpacity style={styles.editButton} onPress={toggleModal}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.name}>{userData.name || "User"}</Text>
                <Text style={styles.email}>{userData.email}</Text>
                <Text style={styles.info}>Registration ID: {userData.regid || "N/A"}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reading Statistics</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{calculateTotalBooksThisMonth()}</Text>
                    <Text style={styles.statLabel}>Books This Month</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{calculateAverageBooksPerMonth()}</Text>
                    <Text style={styles.statLabel}>Avg. Books/Month</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userData.totalBooksRead || 0}</Text>
                    <Text style={styles.statLabel}>Total Books Read</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monthly Reading Activity</Text>
                {renderMonthlyActivityChart()}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yearly Reading Contributions</Text>
                {renderContributionGraph()}
              </View>

              <View style={styles.section}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Edit Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      <AvatarSelectionModal
  visible={isModalVisible}
  onClose={toggleModal}
  onSelectAvatar={handleSelectAvatar}
  selectedAvatar={selectedAvatar}
/></SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 50,
  },
  content: {
    alignItems: "center",
    paddingVertical: 30,
  },
  section: {
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: ACCENT_COLOR,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
    alignSelf: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 15,
    padding: 5,
    width: 50,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: ACCENT_COLOR,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  chartContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
})

export default Profile

