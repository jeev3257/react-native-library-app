"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  Image,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { Ionicons } from "@expo/vector-icons"
import debounce from "lodash.debounce"
import { MotiView } from "moti"
import bookIcon from "../../assets/bookicon.png"
import FilterPopup from "./FilterPopup"

const db = getFirestore()

const ModernSearch = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { searchTerm: initialSearchTerm } = route.params || {}
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [currentFilter, setCurrentFilter] = useState("title")
  const [isInitialSearch, setIsInitialSearch] = useState(!!initialSearchTerm)

  const fetchResults = useCallback(
    debounce(async (searchText, filter) => {
      if (!searchText.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true) // Set loading to true immediately

      const booksRef = collection(db, "books")
      const queryText = searchText.toLowerCase()
      let q

      switch (filter) {
        case "author":
          q = query(
            booksRef,
            where("author", ">=", searchText),
            where("author", "<=", searchText + "\uf8ff"),
            orderBy("author"),
            limit(20),
          )
          break
        case "isbn":
          q = query(booksRef, where("isbn", "==", searchText), limit(20))
          break
        default: // title
          q = query(
            booksRef,
            where("lowertitle", ">=", queryText),
            where("lowertitle", "<=", queryText + "\uf8ff"),
            orderBy("lowertitle"),
            limit(20),
          )
      }

      try {
        const querySnapshot = await getDocs(q)
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          author: doc.data().author,
          coverImage: doc.data().coverImg,
          isbn: doc.data().isbn,
          available: doc.data().available,
          genres: doc.data().genres,
          description: doc.data().description,
          publishDate: doc.data().publishDate,
          rating: doc.data().rating,
        }))

        setResults(booksData)
      } catch (error) {
        console.error("Error fetching books:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    [],
  )

  useEffect(() => {
    if (isInitialSearch) {
      fetchResults(searchTerm, currentFilter)
      setIsInitialSearch(false)
    } else if (searchTerm.trim() !== "") {
      fetchResults(searchTerm, currentFilter)
    } else {
      setResults([])
    }
  }, [searchTerm, currentFilter, fetchResults, isInitialSearch])

  const handleFilterSelect = (filter) => {
    setCurrentFilter(filter)
    setFilterVisible(false)
    if (searchTerm.trim() !== "") {
      fetchResults(searchTerm, filter)
    }
  }

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          navigation.navigate("Bookdetails", { bookId: item.id })
        }}
      >
        <Image
          source={item.coverImage ? { uri: item.coverImage } : bookIcon}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title.length > 20 ? item.title.substring(0, 20) + "..." : item.title}
          </Text>
          <Text style={styles.resultAuthor} numberOfLines={1} ellipsizeMode="tail">
            {item.author ? item.author : "Unknown Author"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    ),
    [navigation],
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${currentFilter}...`}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            onSubmitEditing={() => fetchResults(searchTerm, currentFilter)}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FilterPopup
        isVisible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSelectFilter={handleFilterSelect}
        currentFilter={currentFilter}
      />

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[...Array(6)].map((_, index) => (
            <MotiView
              key={index}
              style={styles.skeletonItem}
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ loop: true, type: "timing", duration: 1000 }}
            >
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: "80%" }]} />
                <View style={[styles.skeletonLine, styles.skeletonAuthorLine]} />
              </View>
              <View style={styles.skeletonIcon} />
            </MotiView>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loading &&
            !isInitialSearch && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.noResults}>
                  {searchTerm.trim() === "" ? "Start typing to search for books" : `No books found for "${searchTerm}"`}
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  filterButton: {
    marginRight: 8,
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: 50,
    height: 75,
    borderRadius: 5,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
    marginRight: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultAuthor: {
    fontSize: 14,
    color: "#666",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonImage: {
    width: 50,
    height: 75,
    borderRadius: 5,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
  },
  skeletonTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: "#E0E0E0",
    marginBottom: 6,
    borderRadius: 4,
    width: "90%",
  },
  skeletonAuthorLine: {
    width: "60%",
    marginBottom: 0,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
})

export default ModernSearch

