import { View, ScrollView, StyleSheet, Image } from "react-native";
import { Text, Appbar } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";

import PostCard from "./GetPosts";
import { textlogos } from "../images/textlogos/textlogos";
import { logos } from "../images/logos/logos";
import { useTheme } from "react-native-paper";

const FeedScreen = ({ navigation, route }) => {
  const [top, setTop] = useState(0);
  const scrollRef = useRef();
  const isFocused = useIsFocused();
  const theme = useTheme();

  useEffect(() => {
    console.log(route.params.group);
    scrollRef.current.scrollTo({
      y: 0,
    });
  }, [isFocused]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
        style={
          top == 0
            ? { width: "100%" }
            : [styles.headerBorder, { width: "100%" }]
        }
      >
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content
          title={
            <View style={{ flexDirection: "row", marginLeft: 10 }}>
              {route.params.auth == "Private" && (
                <Ionicons
                  name="ios-lock-closed-outline"
                  size="20"
                  style={{ alignSelf: "center" }}
                />
              )}
              {Object.keys(textlogos).includes(route.params.group.GID) ? (
                <Image
                  source={textlogos[route.params.group.GID].uri}
                  style={{
                    width: undefined,
                    height: "83%",
                    aspectRatio: textlogos[route.params.group.GID].ratio,
                    backgroundColor: theme.colors.onPrimary,
                    alignSelf: "center",
                  }}
                />
              ) : route.params.group.GID.includes("-") ? (
                <View
                  style={{
                    alignSelf: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={logos[route.params.group.GID.split("-")[0]].uri}
                    style={{
                      height: "75%",
                      width: undefined,
                      aspectRatio:
                        logos[route.params.group.GID.split("-")[0]].ratio,
                      marginRight: 10,
                    }}
                  />
                  <Text variant="headlineSmall">{route.params.school}</Text>
                </View>
              ) : (
                <Text variant="headlineSmall">{route.params.school}</Text>
              )}
            </View>
          }
        />
      </Appbar.Header>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          onScroll={(e) => setTop(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle="16"
        >
          {route.params.posts.map((post) => (
            <PostCard postObj={post} group={route.params.group} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
  },
  scroll: {
    padding: 10,
    paddingTop: 15,
    width: "100%",
  },
  schoolBio: {
    paddingVertical: 10,
  },
  schoolName: {
    marginBottom: 20,
  },
  schoolInfo: {
    marginBottom: 20,
  },
  feeds: {
    marginVertical: 20,
  },
  feed: {
    marginBottom: 20,
  },
  headerText: {
    alignItems: "left",
    marginLeft: -5,
  },
  headerBorder: {
    borderBottomColor: "rgb(219,219,219)",
    borderBottomWidth: 0.5,
  },
});

export default FeedScreen;
