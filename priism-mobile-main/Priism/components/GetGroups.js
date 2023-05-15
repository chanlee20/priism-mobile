import { StyleSheet, View, Image } from "react-native";
import { Text, Card, Divider, useTheme, IconButton } from "react-native-paper";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function GroupCard({ group, textlogo, subsidiary }) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, flexDirection: "row", marginBottom: 0 }}>
      <Card
        mode="outlined"
        key={group["GID"]}
        style={styles.card}
        onPress={() =>
          navigation.navigate("School", {
            school: group.name,
            group: group["GID"],
            subsidiary: subsidiary,
          })
        }
      >
        <View>
          <Card.Title
            title={group.name}
            style={styles.title}
            titleStyle={[
              { paddingTop: 3, fontWeight: "500" },
              group.isUniversity ? { marginLeft: -15 } : { marginLeft: -50 },
            ]}
            left={(props) =>
              group.isUniversity && (
                <Ionicons
                  {...props}
                  name="ios-school-outline"
                  size="24"
                  style={{
                    color: theme.colors.primary,
                  }}
                />
              )
            }
          />
          <Divider style={styles.divider} />
          <Card.Content
            style={{
              paddingTop: 15,
              paddingBottom: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {textlogo === "" ? (
              <View style={styles.subGroupTitle}>
                <Text variant="headlineMedium">{group.name}</Text>
              </View>
            ) : subsidiary ? (
              <View style={styles.subGroupTitle}>
                <Image
                  source={textlogo.uri}
                  style={{
                    height: 30,
                    width: undefined,
                    backgroundColor: theme.colors.onPrimary,
                    aspectRatio: textlogo.ratio,
                    marginRight: 10,
                    marginLeft: -30,
                  }}
                />
                <Text
                  variant="headlineMedium"
                  numberOfLines={1}
                  style={{ maxWidth: "75%" }}
                >
                  {group.name}
                </Text>
              </View>
            ) : (
              <Image
                source={textlogo.uri}
                style={{
                  width: "100%",
                  height: undefined,
                  maxHeight: 200,
                  aspectRatio: textlogo.ratio,
                  backgroundColor: theme.colors.onPrimary,
                }}
              />
            )}
          </Card.Content>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  posttitle: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
  },
  card: {
    flex: 10,
    width: "100%",
    height: "100%",
    margin: 2,
    paddingBottom: 5,
    marginBottom: 40,
  },
  headerText: {
    alignItems: "left",
    marginLeft: -30,
  },
  interact: {
    flexDirection: "row",
    width: "50%",
    alignItems: "center",
    marginLeft: -15,
    marginBottom: -15,
    marginTop: 10,
    justifyContent: "space-between",
  },
  intItems: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
  },
  upArrowBtn: {
    marginRight: -1,
  },
  logo: {
    height: 30,
    width: 30,
  },
  lock: {
    marginRight: 10,
    color: "gray",
  },
  title: {
    marginVertical: -10,
  },
  divider: {
    height: 0.8,
    backgroundColor: "black",
  },
  subGroupTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
