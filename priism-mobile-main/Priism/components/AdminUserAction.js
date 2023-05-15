import React from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { List, Appbar, ActivityIndicator, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getAuth } from "firebase/auth";

const AdminUserAction = ({ navigation, route }) => {
  const [users, setUsers] = React.useState([]);
  const [displayUser, setDisplayUser] = React.useState([]);
  const [queryText, setQueryText] = React.useState("");
  const [isSubgroup, setIsSubgroup] = React.useState(false);
  const [affiliation, setAffiliation] = React.useState("");
  const [userLoaded, setUserLoaded] = React.useState(false);

  React.useEffect(() => {
    async function userRequest() {
      const subgroupCheck = route.params.groupId.split("-");
      if (subgroupCheck.length > 1) {
        console.log("is subgroup");
        setIsSubgroup(true);
        setAffiliation(subgroupCheck[0]);
      }
      console.log(route.params.groupId);

      const userQ = query(
        collection(db, "users"),
        where("groups", "array-contains", route.params.groupId)
      );

      const docSnap = await getDocs(userQ);
      if (docSnap.size > 0) {
        console.log("We have members");
        docSnap.forEach((doc) => {
          console.log(doc.data().email);
          if (doc.id != getAuth().currentUser.uid) {
            var obj = {
              id: doc.id,
              email: doc.data().email,
            };
            setUsers((users) => [...users, obj]);
            setDisplayUser((displayUser) => [...displayUser, obj]);
          }
        });
      }

      setUserLoaded(true);
    }
    userRequest();
  }, []);

  const onChangeSearch = (query) => {
    setQueryText(query);
    const res = users.filter((item) => {
      return item.email.includes(query);
    });
    setDisplayUser(res);
  };

  function banUser(item, index) {
    displayUser.map(async (item, i) => {
      if (index == i) {
        if (isSubgroup) {
          const docRef = doc(
            db,
            "groups/" + affiliation + "/subgroup",
            route.params.groupId
          );
          await updateDoc(docRef, {
            bannedUsers: arrayUnion(item.id),
          });
        } else {
          const docRef = doc(db, "groups", route.params.groupId);
          await updateDoc(docRef, {
            bannedUsers: arrayUnion(item.id),
          });
        }
        const userRef = doc(db, "users", item.id);
        await updateDoc(userRef, {
          bannedFrom: arrayUnion(route.params.groupId),
        });
        Alert.alert("You have banned " + item.email);
      }
    });
  }

  function unbanUser(item, index) {
    displayUser.map(async (item, i) => {
      if (index == i) {
        let ref;
        if (isSubgroup) {
          ref = doc(
            db,
            "groups/" + affiliation + "/subgroup",
            route.params.groupId
          );
        } else {
          ref = doc(db, "groups", route.params.groupId);
        }
        const groupSnap = await getDoc(ref);
        const tempBannedUsers = groupSnap.get("bannedUsers");
        const tempIndex = tempBannedUsers.indexOf(item.id);
        if (tempIndex > -1) {
          //delete from group
          tempBannedUsers.splice(tempIndex, 1);
          await updateDoc(ref, {
            bannedUsers: tempBannedUsers,
          });

          //delete from user
          const userRef = doc(db, "users", item.id);
          const userSnap = await getDoc(userRef);
          const tempBannedGroups = userSnap.get("bannedFrom");
          const userTempIndex = tempBannedGroups.indexOf(route.params.groupId);
          tempBannedGroups.splice(userTempIndex, 1);
          await updateDoc(userRef, {
            bannedFrom: tempBannedGroups,
          });
        } else {
          Alert.alert("User Not Banned", item.email + " is already unbanned.", [
            {
              text: "OK",
            },
          ]);
          return;
        }
        Alert.alert("You have unbanned " + item.email);
      }
    });
  }
  const loadedUsers = displayUser.map((item, index) => {
    return (
      <List.Accordion
        key={item.id}
        title={item.email}
        titleStyle={styles.userItem}
      >
        <List.Item
          title="Ban"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="cancel" size="15" />
          )}
          titleStyle={styles.itemText}
          onPress={() =>
            Alert.alert("Ban User", "Ban " + item.email + "from the group?", [
              {
                text: "OK",
                onPress: () => {
                  banUser(item, index);
                },
              },
              {
                text: "Canel",
                onPress: () => {
                  console.log("Ban Canceled");
                },
              },
            ])
          }
        />
        <List.Item
          title="Unban"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="account-check" size="15" />
          )}
          titleStyle={styles.itemText}
          onPress={() =>
            Alert.alert(
              "Unban User",
              "Unban " + item.email + "from the group?",
              [
                {
                  text: "OK",
                  onPress: () => {
                    unbanUser(item, index);
                  },
                },
                {
                  text: "Canel",
                  onPress: () => {
                    console.log("Unban Canceled");
                  },
                },
              ]
            )
          }
        />
      </List.Accordion>
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.navigate("AdminPage")}
        />
        <Appbar.Content title="Manage Users" style={styles.headerText} />
      </Appbar.Header>
      <View style={styles.container}>
        <View>
          <TextInput
            placeholder="Search Users..."
            onChangeText={onChangeSearch}
            value={queryText}
            label="Search Users"
            mode="outlined"
            autoFocus={true}
            left={
              <TextInput.Icon
                icon={(props) => (
                  <Ionicons {...props} name="ios-search" size="20" />
                )}
                style={{ marginTop: 15 }}
              />
            }
            style={styles.searchBar}
          />
          <ScrollView>
            <List.Section title="User List" titleStyle={{ fontWeight: "bold" }}>
              {userLoaded ? (
                displayUser.length > 0 ? (
                  loadedUsers
                ) : (
                  <Text style={{ marginLeft: 15 }}>No Users In Group</Text>
                )
              ) : (
                <ActivityIndicator animating={true} />
              )}
            </List.Section>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    alignItems: "left",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  userItem: {
    fontSize: 15,
  },
  itemText: {
    fontSize: 13,
  },
  searchBar: {
    marginLeft: 20,
    marginRight: 20,
    height: 40,
    backgroundColor: "rgb(255,255,255)",
    marginBottom: 10,
  },
});
export default AdminUserAction;
