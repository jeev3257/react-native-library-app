import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import bookIcon from "../../assets/bookicon.png"
import { MotiView } from "moti"
import { Skeleton } from "moti/skeleton"
import { getAuth } from "firebase/auth"

const { width } = Dimensions.get("window")
const db = getFirestore()
const auth = getAuth()

const Bookdetails = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { bookId } = route.params
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [showFlyingHearts, setShowFlyingHearts] = useState(false)
  const [similarBooks, setSimilarBooks] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const docRef = doc(db, "books", bookId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() })
        } else {
          console.log("No such document!")
          setBook(null)
        }

        // Check if book is in the user's wishlist
        const user = auth.currentUser
        if (user) {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const userData = userSnap.data()
            setInWishlist(userData.wishlist?.includes(bookId) || false)
          }
        }
      } catch (error) {
        console.error("Error fetching book details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [bookId])

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!book) return

      setLoadingSimilar(true)
      try {
        // Fetch similar book ISBNs from recommendations collection
        const recommendationsRef = doc(db, "recommendations", book.isbn)
        const recommendationsSnap = await getDoc(recommendationsRef)

        if (recommendationsSnap.exists()) {
          const isbnList = recommendationsSnap.data()

          // Ensure isbnList is an array
          const isbnArray = Array.isArray(isbnList) ? isbnList : Object.values(isbnList)

          // Fetch book details for each ISBN
          const bookPromises = isbnArray.map(async (isbn) => {
            // First try to get the book by ISBN
            const booksRef = collection(db, "books")
            const q = query(booksRef, where("isbn", "==", isbn))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
            }

            // If not found by ISBN, try to get directly by ID
            try {
              const docRef = doc(db, "books", isbn)
              const docSnap = await getDoc(docRef)

              if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() }
              }
            } catch (error) {
              console.log(`Error fetching book with ID ${isbn}:`, error)
            }

            return null
          })

          const bookResults = await Promise.all(bookPromises)
          setSimilarBooks(bookResults.filter((book) => book !== null))
        }
      } catch (error) {
        console.error("Error fetching similar books:", error)
      } finally {
        setLoadingSimilar(false)
      }
    }

    if (book) {
      fetchSimilarBooks()
    }
  }, [book])

  const toggleWishlist = async () => {
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, "users", user.uid)

    // Immediately update UI
    setInWishlist((prev) => !prev)
    if (!inWishlist) {
      setShowFlyingHearts(true)
    }

    try {
      if (inWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(bookId),
        })
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(bookId),
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      // Revert UI change if there's an error
      setInWishlist((prev) => !prev)
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const numRating = Number.parseFloat(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= numRating ? "star" : "star-outline"}
          size={16}
          color={i <= numRating ? "#FFD700" : "#BDC3C7"}
        />,
      )
    }
    return stars
  }

  const renderSimilarBookItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.similarBookItem}
        onPress={() => navigation.push("Bookdetails", { bookId: item.id })}
      >
        <Image
          source={item.coverImg ? { uri: item.coverImg } : bookIcon}
          style={styles.similarBookCover}
          resizeMode="cover"
        />
        <Text style={styles.similarBookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.similarBookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MotiView
          transition={{
            type: "timing",
          }}
          animate={{
            opacity: 1,
          }}
          style={styles.skeletonContainer}
        >
          <Skeleton
            width={width}
            height={width * 1.5}
            colorMode="light"
            backgroundColor="#E1E9EE"
            highlightColor="#F2F8FC"
          />
          <View style={styles.contentContainer}>
            <Skeleton
              width={width - 40}
              height={30}
              radius={4}
              colorMode="light"
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
            />
            <Skeleton
              width={width - 80}
              height={20}
              radius={4}
              colorMode="light"
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
              style={{ marginTop: 10 }}
            />
            <Skeleton
              width={120}
              height={20}
              radius={4}
              colorMode="light"
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
              style={{ marginTop: 10 }}
            />
            <Skeleton
              width={100}
              height={30}
              radius={20}
              colorMode="light"
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
              style={{ marginTop: 20 }}
            />
            <Skeleton
              width={width - 40}
              height={100}
              radius={4}
              colorMode="light"
              backgroundColor="#E1E9EE"
              highlightColor="#F2F8FC"
              style={{ marginTop: 20 }}
            />
          </View>
        </MotiView>
      </SafeAreaView>
    )
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Book not found</Text>
      </SafeAreaView>
    )
  }

  const FlyingHearts = ({ visible, onComplete }) => {
    const hearts = useRef([...Array(8)].map(() => new Animated.Value(0))).current

    useEffect(() => {
      if (visible) {
        const animations = hearts.map((heart, index) => {
          return Animated.timing(heart, {
            toValue: 1,
            duration: 1000,
            delay: index * 50,
            useNativeDriver: true,
          })
        })

        Animated.stagger(50, animations).start(() => {
          onComplete()
        })
      } else {
        hearts.forEach((heart) => heart.setValue(0))
      }
    }, [visible, hearts, onComplete])

    if (!visible) return null

    return (
      <>
        {hearts.map((heart, index) => (
          <Animated.View
            key={index}
            style={[
              styles.flyingHeart,
              {
                opacity: heart.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
                transform: [
                  {
                    translateY: heart.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100],
                    }),
                  },
                  {
                    translateX: heart.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (index % 2 === 0 ? -1 : 1) * 50],
                    }),
                  },
                  {
                    scale: heart.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="heart" size={20} color="red" />
          </Animated.View>
        ))}
      </>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton} onPress={toggleWishlist} disabled={loading}>
            <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={24} color={inWishlist ? "red" : "#fff"} />
          </TouchableOpacity>
          <FlyingHearts visible={showFlyingHearts} onComplete={() => setShowFlyingHearts(false)} />
        </View>
        <Image
          source={book.coverImg ? { uri: book.coverImg } : bookIcon}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <BlurView intensity={100} style={styles.contentContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            {book.rec && (
              <View style={styles.recommendedContainer}>
                <Text style={styles.recommendedText}>Recommended for: {book.rec}</Text>
              </View>
            )}
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>{renderStars(book.rating)}</View>
              <Text style={styles.ratingText}>({book.rating})</Text>
            </View>
            <Text style={styles.publishDate}>Published: {book.publishDate}</Text>
            <View style={styles.genreContainer}>
              {book.genres &&
                book.genres.slice(0, 3).map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
            </View>
            {book.awards && book.awards.length > 0 && (
              <View style={styles.awardsContainer}>
                <View style={styles.awardsHeader}>
                  <MaterialCommunityIcons name="trophy-award" size={24} color="#FFD700" />
                  <Text style={styles.awardsTitle}>Awards</Text>
                </View>
                <View style={styles.awardsContent}>
                  {book.awards.map((award, index) => (
                    <Text key={index} style={styles.awardItem}>
                      • {award}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>
                {book.available > 0 ? `${book.available} copies available` : "Not available"}
              </Text>
              <TouchableOpacity
                style={[styles.availabilityButton, { backgroundColor: book.available > 0 ? "#4CAF50" : "#F44336" }]}
              >
                <Text style={styles.availabilityButtonText}>
                  {book.available > 0 ? "Available to Borrow" : "Join Waitlist"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
              {book.description}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.readMore}>{expanded ? "Read Less" : "Read More"}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Similar Books Section */}
        <View style={styles.similarBooksSection}>
          <Text style={styles.sectionTitle}>Similar Books</Text>
          {loadingSimilar ? (
            <View style={styles.loadingContainer}>
              <Skeleton
                width={width - 40}
                height={200}
                radius={8}
                colorMode="light"
                backgroundColor="#E1E9EE"
                highlightColor="#F2F8FC"
              />
            </View>
          ) : similarBooks.length > 0 ? (
            <FlatList
              data={similarBooks}
              renderItem={renderSimilarBookItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarBooksContainer}
            />
          ) : (
            <Text style={styles.noSimilarBooks}>No similar books found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  skeletonContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  wishlistButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  coverImage: {
    width: width,
    height: width * 1.5,
  },
  contentContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    overflow: "hidden",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  author: {
    fontSize: 20,
    color: "#4a4a4a",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4a4a4a",
  },
  publishDate: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 16,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  genreTag: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
  },
  genreText: {
    fontSize: 14,
    color: "#333",
  },
  awardsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  awardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  awardsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  awardsContent: {
    paddingLeft: 8,
  },
  awardItem: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 6,
  },
  availabilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  availabilityText: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  availabilityButton: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  availabilityButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 24,
    marginBottom: 12,
  },
  readMore: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  flyingHeart: {
    position: "absolute",
    top: 40,
    right: 16,
  },
  recommendedContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  recommendedText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Similar Books Section Styles
  similarBooksSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: "#f8f8f8",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    marginTop: 10,
  },
  similarBooksContainer: {
    paddingRight: 20,
  },
  similarBookItem: {
    width: 140,
    marginRight: 16,
  },
  similarBookCover: {
    width: 140,
    height: 210,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e0e0e0",
  },
  similarBookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  similarBookAuthor: {
    fontSize: 12,
    color: "#4a4a4a",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  noSimilarBooks: {
    fontSize: 16,
    color: "#4a4a4a",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
})

export default Bookdetails

