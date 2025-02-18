import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const genres = [
  { name: "Fiction", icon: "book" },
  { name: "Nonfiction", icon: "book-open" },
  { name: "Mystery", icon: "search" },
  { name: "Education", icon: "pen-tool" },
  { name: "Romance", icon: "heart" },
  { name: "Thriller", icon: "alert-triangle" },
  { name: "Biography", icon: "user" },
  { name: "History", icon: "clock" },
]

const GenreSection = ({ onSelectGenre }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pick by Genre</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {genres.map((genre) => (
          <TouchableOpacity key={genre.name} style={styles.genreItem} onPress={() => onSelectGenre(genre.name)}>
            <View style={styles.iconContainer}>
              <Feather name={genre.icon} size={20} color="#fff" />
            </View>
            <Text style={styles.genreName}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "black",
  },
  scrollView: {
    flexDirection: "row",
  },
  genreItem: {
    alignItems: "center",
    marginRight: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  genreName: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
  },
})

export default GenreSection

