import React, { useState, useEffect } from "react";
import { List, Divider, Appbar, ActivityIndicator } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./utils/firebaseConfig";

const Admin = ({ navigation }) => {
  //get groups from user's admin array
  //map them and pass in parameter
  const [groups, setGroups] = useState([]);
  const [groupNames, setGroupNames] = useState([]);

  useEffect(() => {
    async function getGroups() {
      try {
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const tempGroups = userSnap.get("admin");
          setGroups(tempGroups);
        } else {
          console.log("user not found for admin actions");
        }
      } catch (e) {
        console.log(e);
      }
    }
    getGroups();
  }, []);

  useEffect(() => {
    function getGroupNames() {
      groups.forEach(async (g) => {
        const trySplit = g.split("-");
        if (trySplit.length == 1) {
          const groupRef = doc(db, "groups", g);
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            const tempGroupname = groupSnap.get("name");
            setGroupNames((old) => [...old, tempGroupname]);
          } else {
            console.log("group doesnt exist");
          }
        } else {
          const groupRef = doc(db, "groups/" + trySplit[0] + "/subgroup", g);
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            const tempGroupname = groupSnap.get("name");
            setGroupNames((old) => [...old, tempGroupname]);
          } else {
            console.log("group doesnt exist2");
          }
        }
      });
    }
    getGroupNames();
  }, [groups]);

  const navigateToGroupPage = (temp, index) => {
    groups.map((item, i) => {
      if (index == i) {
        navigation.navigate("AdminUserAction", {
          groupId: item,
        });
      }
    });
  };

  const loadedGroups = groupNames.map((item, index) => {
    return (
      <List.Item
        title={item}
        onPress={() => {
          navigateToGroupPage(item, index);
        }}
        right={(props) => (
          <Ionicons {...props} name="chevron-forward" size="20" />
        )}
      />
    );
  });
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.navigate("Profile")}
        />
        <Appbar.Content title="Admin Page" style={styles.headerText} />
      </Appbar.Header>
      <View style={styles.container}>
        <Divider />
        <View>
          <List.Section>
            <List.Subheader>
              List of groups you are currently managing
            </List.Subheader>
            {groupNames.length > 0 ? (
              loadedGroups
            ) : (
              <ActivityIndicator animating={true} />
            )}
          </List.Section>
        </View>
        <Divider />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  headerText: {
    alignItems: "left",
    marginLeft: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default Admin;
