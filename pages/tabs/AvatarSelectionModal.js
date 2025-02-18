import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
  } from "react-native"
  
  const avatars = [
    require("../../assets/avatars/av1.png"),
    require("../../assets/avatars/av2.png"),
    require("../../assets/avatars/av3.png"),
    require("../../assets/avatars/av4.png"),
    require("../../assets/avatars/av5.png"),
    require("../../assets/avatars/av6.png"),
    require("../../assets/avatars/default.png"),
  ]
  
  export const AvatarSelectionModal = ({ visible, onClose, onSelectAvatar, selectedAvatar }) => {
    const handleSelectAvatar = (avatar, index) => {
      onSelectAvatar(avatar, index)
      onClose()
    }
    
  
    const renderItem = ({ item, index }) => {
      const isSelected = selectedAvatar === item
      return (
        <TouchableOpacity
          style={[styles.avatarItem, isSelected && styles.selectedAvatarItem]}
          onPress={() => handleSelectAvatar(item, index)}
        >
          <Image source={item} style={styles.avatarImage} />
        </TouchableOpacity>
      )
    }
  
    return (
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Choose Your Avatar</Text>
                <FlatList
                  data={avatars}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                  numColumns={3}
                  contentContainerStyle={styles.avatarList}
                />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }
  
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 20,
      width: "80%",
      maxHeight: "80%",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    avatarList: {
      alignItems: "center",
    },
    avatarItem: {
      margin: 10,
      borderWidth: 2,
      borderColor: "transparent",
      borderRadius: 40,
      padding: 5,
    },
    selectedAvatarItem: {
      borderColor: "#007AFF",
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    closeButton: {
      backgroundColor: "#007AFF",
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      marginTop: 20,
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  })
  
