import React from "react";
import { Image, StyleSheet, View } from "react-native";

const AppHeader = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require("../../assets/images/train_imgage.jpg")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  image: {
    width: 100,
    height: 40,
  },
});

export default AppHeader;
