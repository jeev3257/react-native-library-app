import { Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const BookItem = ({ book }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Bookdetails", { bookId: book.id });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Image source={{ uri: book.coverImg }} style={styles.cover} />
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author}>{book.author}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginRight: 15,
  },
  cover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: "#666",
  },
});

export default BookItem;
