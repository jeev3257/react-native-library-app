import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import PropTypes from "prop-types"

const FilterPopup = ({ isVisible, onClose, onSelectFilter, currentFilter }) => {
  if (!isVisible) return null

  const filterOptions = ["title", "author", "isbn"]

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        <Text style={styles.title}>Search by:</Text>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, currentFilter === option && styles.selectedOption]}
            onPress={() => {
              onSelectFilter(option)
              onClose()
            }}
          >
            <Text style={[styles.optionText, currentFilter === option && styles.selectedOptionText]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
            {currentFilter === option && <Ionicons name="checkmark" size={20} color="#007AFF" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

FilterPopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  currentFilter: PropTypes.oneOf(["title", "author", "isbn"]).isRequired,
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  selectedOption: {
    backgroundColor: "#F0F0F0",
  },
  optionText: {
    fontSize: 14,
  },
  selectedOptionText: {
    color: "#007AFF",
  },
})

export default FilterPopup

