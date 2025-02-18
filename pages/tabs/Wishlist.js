import { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { Ionicons } from "@expo/vector-icons"
import { MotiView } from "moti"

const db = getFirestore()
const auth = getAuth()

function Wishlist() {
  const [wishlistBooks, setWishlistBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    fetchWishlistBooks()
  }, [])

  const fetchWishlistBooks = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      setLoading(true)
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const wishlist = userData.wishlist || []

        if (wishlist.length > 0) {
          const booksQuery = query(collection(db, "books"), where("__name__", "in", wishlist))
          const booksSnap = await getDocs(booksQuery)
          const books = booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setWishlistBooks(books)
        } else {
          setWishlistBooks([])
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist books:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchWishlistBooks()
  }

  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => navigation.navigate("Bookdetails", { bookId: item.id })}>
      <Image
        source={{ uri: item.coverImg }}
        style={styles.bookCover}
        defaultSource={require("../../assets/bookicon.png")}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(5)].map((_, index) => (
        <MotiView
          key={index}
          style={styles.skeletonItem}
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
        >
          <View style={styles.skeletonCover} />
          <View style={styles.skeletonInfo}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonAuthor} />
          </View>
        </MotiView>
      ))}
    </View>
  )

  const renderContent = () => {
    if (loading) {
      return renderSkeletonLoader()
    }

    if (wishlistBooks.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Your wishlist is empty</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate("Search")}>
              <Text style={styles.browseButtonText}>Browse Books</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )
    }

    return (
      <FlatList
        data={wishlistBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  bookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
  },
  emptyStateContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonCover: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  skeletonInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  skeletonTitle: {
    height: 16,
    width: "80%",
    backgroundColor: "#e0e0e0",
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonAuthor: {
    height: 14,
    width: "60%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
})

export default Wishlist

