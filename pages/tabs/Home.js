"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { auth, firestore } from "../../firebase"
import { doc, getDoc, collection, query, limit, getDocs, orderBy } from "firebase/firestore"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { MotiView } from "moti"
import GenreSection from "./GenreSection"

const ACCENT_COLOR = "black"
const { width } = Dimensions.get("window")

const BookItem = ({ book, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.bookItem}>
    <Image source={{ uri: book.coverImg }} style={styles.bookCover} />
    <View style={styles.bookInfo}>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {book.author}
      </Text>
    </View>
  </TouchableOpacity>
)

const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    {[...Array(3)].map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={styles.skeletonCover}
        />
        <View style={styles.skeletonTextContainer}>
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
            style={styles.skeletonTitle}
          />
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
            style={styles.skeletonAuthor}
          />
        </View>
      </View>
    ))}
  </View>
)

const Home = () => {
  const [firstName, setFirstName] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [placeholder, setPlaceholder] = useState("")
  const placeholders = ["books", "authors", "genres"]
  const navigation = useNavigation()
  const [popularBooks, setPopularBooks] = useState([])
  const [topRatedBooks, setTopRatedBooks] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        const uid = currentUser.uid
        const userDocRef = doc(firestore, "users", uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setFirstName(userData.name.split(" ")[0])
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message)
    }
  }

  const fetchBooks = async () => {
    try {
      const booksRef = collection(firestore, "books")

      // Fetch popular books (random 10)
      const popularQuery = query(booksRef)
      const popularSnapshot = await getDocs(popularQuery)
      const allBooks = popularSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const shuffledBooks = allBooks.sort(() => 0.5 - Math.random())
      setPopularBooks(shuffledBooks.slice(0, 10))

      // Fetch top rated books (10 random from top 100)
      const topRatedQuery = query(booksRef, orderBy("rating", "desc"), limit(50))
      const topRatedSnapshot = await getDocs(topRatedQuery)
      const top100Books = topRatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const randomTop10 = top100Books.sort(() => 0.5 - Math.random()).slice(0, 10)
      setTopRatedBooks(randomTop10)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchUserData()
    await fetchBooks()
    setRefreshing(false)
  }, [fetchUserData, fetchBooks]) // Added dependencies to useCallback

  useEffect(() => {
    fetchUserData()
    fetchBooks()

    let currentIndex = 0
    let currentPlaceholder = ""
    let isDeleting = false
    let animationTimer

    const animatePlaceholder = () => {
      if (isInputFocused) {
        // Pause animation when input is focused
        animationTimer = setTimeout(animatePlaceholder, 100)
        return
      }

      const targetPlaceholder = placeholders[currentIndex]

      if (!isDeleting && currentPlaceholder === targetPlaceholder) {
        isDeleting = true
        animationTimer = setTimeout(animatePlaceholder, 1500) // Pause before deleting
      } else if (isDeleting && currentPlaceholder === "") {
        isDeleting = false
        currentIndex = (currentIndex + 1) % placeholders.length
        animationTimer = setTimeout(animatePlaceholder, 500) // Pause before typing next word
      } else {
        setPlaceholder(currentPlaceholder)
        const nextChar = isDeleting
          ? currentPlaceholder.slice(0, -1)
          : targetPlaceholder.slice(0, currentPlaceholder.length + 1)
        currentPlaceholder = nextChar
        const delay = isDeleting ? 100 : 150
        animationTimer = setTimeout(animatePlaceholder, delay)
      }
    }

    animatePlaceholder()

    return () => {
      clearTimeout(animationTimer)
    }
  }, [isInputFocused])

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      navigation.navigate("Search", { searchTerm })
    }
  }

  const handleNotificationPress = () => {
    console.log("Notification pressed")
  }

  const handleBookPress = (bookId) => {
    navigation.navigate("Bookdetails", { bookId })
  }

  const handleSelectGenre = (genre) => {
    navigation.navigate("GenreBooks", { genre })
  }

  const renderBookSection = ({ item }) => {
    let title, books
    if (item.key === "popular") {
      title = "Popular Books"
      books = popularBooks
    } else if (item.key === "topRated") {
      title = "Top Rated Books"
      books = topRatedBooks
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <FlatList
            data={books}
            renderItem={({ item }) => <BookItem book={item} onPress={() => handleBookPress(item.id)} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            {loading ? (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 1000 }}
                style={{
                  height: 36,
                  width: 150,
                  borderRadius: 4,
                  backgroundColor: "#e0e0e0",
                }}
              />
            ) : (
              <Text style={styles.greeting}>Hey, {firstName}!</Text>
            )}
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={handleNotificationPress} style={styles.headerIcon}>
                <Feather name="bell" size={24} color={ACCENT_COLOR} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.headerIcon}>
                <Feather name="user" size={24} color={ACCENT_COLOR} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={[styles.searchBarContainer, isFocused && styles.searchBarFocused]}>
              <Feather name="search" size={20} color="#aaa" style={styles.searchIcon} />
              <TextInput
  style={styles.searchInput}
  placeholder={`Search for ${placeholder}...`}
  placeholderTextColor="#aaa"
  value={searchTerm}
  onChangeText={setSearchTerm}
  onFocus={() => {
    navigation.navigate("Search"); // Navigate to search page when search bar is clicked
  }}
  onSubmitEditing={handleSearchSubmit}
/>

            </View>
          </View>

          <GenreSection onSelectGenre={handleSelectGenre} />

          <FlatList
            showsVerticalScrollIndicator={false}
            data={[{ key: "popular" }, { key: "topRated" }]}
            renderItem={renderBookSection}
            keyExtractor={(item) => item.key}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT_COLOR} />}
            contentContainerStyle={styles.contentContainer}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    padding: 10,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: ACCENT_COLOR,
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchBarContainer: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBarFocused: {
    borderColor: ACCENT_COLOR,
    borderWidth: 2,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    height: 40,
    color: ACCENT_COLOR,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: ACCENT_COLOR,
  },
  bookItem: {
    width: 150,
    marginRight: 15,
  },
  bookCover: {
    width: 150,
    height: 225,
    borderRadius: 12,
  },
  bookInfo: {
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: ACCENT_COLOR,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  skeletonContainer: {
    flexDirection: "row",
  },
  skeletonItem: {
    width: 150,
    marginRight: 15,
  },
  skeletonCover: {
    width: 150,
    height: 225,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  skeletonTextContainer: {
    marginTop: 8,
  },
  skeletonTitle: {
    height: 14,
    width: "80%",
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
    borderRadius: 4,
  },
  skeletonAuthor: {
    height: 12,
    width: "60%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
})

export default Home

