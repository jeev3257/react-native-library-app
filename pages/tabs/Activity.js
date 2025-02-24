import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore, auth } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchBorrowedBooks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) throw new Error("User document not found");

      const userRegid = userDoc.data().regid;
      const borrowedDoc = await getDoc(doc(firestore, "borrowed", userRegid));
      if (!borrowedDoc.exists()) throw new Error("No borrowed books found");

      const borrowedData = borrowedDoc.data();
      const books = borrowedData.takenBooks || [];

      // Sort: Active books first
      books.sort((a, b) => (a.status === "active" ? -1 : 1));
      setBorrowedBooks(books);
    } catch (err) {
      console.error("Error fetching borrowed books:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBorrowedBooks();
  }, []);

  const getDueStatus = (returnDate, fine) => {
    const today = new Date();
    const dueDate = new Date(returnDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Fine: $${fine.toFixed(2)}`, color: "red" };
    } else if (diffDays <= 2) {
      return { text: `Due in ${diffDays} days`, color: "orange" };
    } else if (diffDays <= 8) {
      return { text: `Due in ${diffDays} days`, color: "green" };
    } else {
      return { text: `Due in ${diffDays} days`, color: "green" };
    }
  };

  const BookItem = ({ book }) => {
    const isReturned = book.status === "returned";
  
    return (
      <View style={styles.bookItem}>
        <Image source={{ uri: book.coverImg }} style={styles.bookCover} />
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>
          <Text style={styles.bookDates}>Taken: {new Date(book.takenDate).toLocaleDateString()}</Text>
          <Text style={styles.bookDates}>
            {isReturned
              ? `Returned Date: ${new Date(book.returnedDate).toLocaleDateString()}`
              : `Due Date: ${new Date(book.returnDate).toLocaleDateString()}`}
          </Text>
          <View style={[styles.statusBadge, isReturned ? styles.returned : styles.active]}>
            <Text style={styles.statusText}>{book.status.charAt(0).toUpperCase() + book.status.slice(1)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Borrowed Books</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={borrowedBooks}
          renderItem={({ item }) => <BookItem book={item} />}
          keyExtractor={(item) => `${item.isbn}-${item.regid}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyList}>No borrowed books found</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 6,
    marginRight: 16,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bookDates: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  dueStatus: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  emptyList: {
    textAlign: "center",
    color: "#999",
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  returned: {
    backgroundColor: "#4CAF50", // Green for returned books
  },
  active: {
    backgroundColor: "#FFA500", // Orange for active books
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default BorrowedBooks;
