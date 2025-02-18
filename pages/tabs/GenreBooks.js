import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { collection, query, where, limit, getDocs } from "firebase/firestore"
import { firestore } from "../../firebase"

const BookItem = ({ book, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.bookItem}>
    <Image source={{ uri: book.coverImg }} style={styles.bookCover} />
    <View style={styles.bookInfo}>
      <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
    </View>
  </TouchableOpacity>
)

const GenreBooks = ({ route }) => {
  const { genre } = route.params
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()

  useEffect(() => {
    const fetchBooksByGenre = async () => {
      try {
        const booksRef = collection(firestore, "books")
        const genreQuery = query(booksRef, where("genres", "array-contains", genre), limit(20))
        const genreSnapshot = await getDocs(genreQuery)
        const genreBooks = genreSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setBooks(genreBooks)
      } catch (error) {
        console.error("Error fetching books by genre:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooksByGenre()
  }, [genre])

  const handleBookPress = (bookId) => {
    navigation.navigate("Bookdetails", { bookId })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookItem book={item} onPress={() => handleBookPress(item.id)} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.bookList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  bookList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookItem: {
    flex: 1,
    margin: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  bookCover: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bookInfo: {
    padding: 10,
    alignItems: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default GenreBooks
