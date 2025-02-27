"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import Icon from "react-native-vector-icons/Feather"

// Get screen width to calculate grid dimensions
const { width } = Dimensions.get("window")
const numColumns = 2
const bookWidth = (width - 48) / numColumns

const Explore = () => {
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setError("Please sign in to see recommendations")
      setLoading(false)
      return
    }

    try {
      const userRecRef = doc(db, "user_rec", user.uid)
      const userRecSnap = await getDoc(userRecRef)

      if (!userRecSnap.exists()) {
        setRecommendedBooks([])
        return
      }

      const isbnList = userRecSnap.data().recommended_books || []

      // Fetch book details from Firestore
      const bookDetailsPromises = isbnList.map(async (isbn) => {
        const bookRef = doc(db, "books", isbn)
        const bookSnap = await getDoc(bookRef)
        return bookSnap.exists() ? { id: isbn, ...bookSnap.data() } : null
      })

      const booksData = await Promise.all(bookDetailsPromises)
      setRecommendedBooks(booksData.filter((book) => book !== null))
    } catch (err) {
      setError("Couldn't load recommendations")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, db])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRecommendations()
  }, [fetchRecommendations])

  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.coverImg }} style={styles.coverImage} resizeMode="cover" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          by {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="book-open" size={48} color="#ccc" />
      <Text style={styles.emptyStateText}>No recommendations yet</Text>
      <Text style={styles.emptyStateSubtext}>We'll suggest books based on your interests soon</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Icon name="refresh-cw" size={16} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Recommended for you</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Finding books for you...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recommendedBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          numColumns={numColumns}
          contentContainerStyle={styles.bookList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366f1"]} // Android
              tintColor="#6366f1" // iOS
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  bookList: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  bookItem: {
    width: bookWidth,
    marginBottom: 24,
  },
  imageContainer: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#fff",
  },
  coverImage: {
    width: "100%",
    height: bookWidth * 1.5,
    borderRadius: 12,
  },
  bookInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#6b7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default Explore

