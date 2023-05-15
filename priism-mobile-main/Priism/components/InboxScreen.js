import { RefreshControl, StyleSheet, View, FlatList } from "react-native";
import { Button, Text, Divider, Appbar, useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";

const InboxScreen = ({ navigation }) => {
  const [notif, setNotif] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const auth = getAuth();
  const uid = auth.currentUser.uid;
  const theme = useTheme();
  const didMountRec = useRef(true);
  const didMountReq = useRef(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getRequests();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    getRequests();
  }, []);

  // useEffect(() => {
  //   if (didMountReq.current) {
  //     didMountReq.current = false;
  //   } else if (didMountRec.current) {
  //     didMountRec.current = false;
  //   } else {
  //     renderNotifs();
  //   }
  // }, [received, requests]);

  async function getRequests() {
    try {
      const docRef = doc(db, "users", uid);
      const snapshot = await getDoc(docRef);
      let notif = {};
      notif = snapshot.get("notif");
      let notifs = notif.requests.concat(notif.received);
      notifs.sort((a, b) => b.time.toDate() - a.time.toDate());
      setNotif(notifs);
    } catch (e) {
      console.log(e);
    }
  }

  async function updateRequestAccept(item) {
    try {
      const isRID = (element) => element.RID == item.RID;
      const index = notif.findIndex(isRID);
      const adminRef = doc(db, "users", uid);
      await updateDoc(adminRef, {
        "notif.received": arrayRemove(notif[index]),
      });

      let userRequests = [];
      const userRef = doc(db, "users", item.UID);
      const snapshot = await getDoc(userRef);
      userRequests = snapshot.get("notif").requests;
      const userindex = userRequests.findIndex(isRID);
      userRequests[userindex].status = "accept";
      await updateDoc(userRef, {
        "notif.requests": userRequests,
        groups: arrayUnion(item.GID),
      });
      // setNotif(notif.splice(index, 1));
      let groupRef;
      if (item.GID.includes("-")) {
        groupRef = doc(
          db,
          "groups/" + item.GID.split("-")[0] + "/subgroup",
          item.GID
        );
      } else {
        groupRef = doc(db, "groups", item.GID);
      }
      await updateDoc(groupRef, {
        users: arrayUnion(item.UID),
      });

      getRequests();
    } catch (err) {
      console.error(err);
    }
  }

  async function updateRequestDelete(item) {
    try {
      const isRID = (element) => element.RID == item.RID;
      const index = notif.findIndex(isRID);
      const adminRef = doc(db, "users", uid);
      await updateDoc(adminRef, {
        "notif.received": arrayRemove(notif[index]),
      });
      let userRequests = [];
      const userRef = doc(db, "users", item.UID);
      const snapshot = await getDoc(userRef);
      userRequests = snapshot.get("notif").requests;
      const userindex = userRequests.findIndex(isRID);
      userRequests[userindex].status = "decline";
      await updateDoc(userRef, {
        "notif.requests": userRequests,
      });
      // console.log(index);
      // console.log(notif[index]);
      // let newNotif = notif;
      // newNotif.splice(index, 1);
      // setNotif(newNotif);
      // console.log(newNotif);
      getRequests();
      // const newNotif = notif.splice(index, 1);
      // setNotif(newNotif);
      // console.log(newNotif);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title="Notifications" style={styles.headerText} />
      </Appbar.Header>
      <View style={styles.container}>
        <FlatList
          data={notif}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) =>
            item.UID == uid ? (
              item.status === "pending" ? (
                <View>
                  <Text style={styles.compInfo}>
                    Your request to join{" "}
                    <Text style={{ color: theme.colors.secondary }}>
                      {item.name}
                    </Text>{" "}
                    has been sent.
                  </Text>
                  {/* <Button>Pending</Button> */}
                  <Divider />
                </View>
              ) : item.status === "accept" ? (
                <View>
                  <Text style={styles.compInfo}>
                    Your request to join{" "}
                    <Text style={{ color: theme.colors.secondary }}>
                      {item.name}
                    </Text>{" "}
                    has been{" "}
                    <Text style={{ color: theme.colors.primary }}>
                      accepted
                    </Text>
                    .
                  </Text>
                  <Divider />
                </View>
              ) : (
                <View>
                  <Text style={styles.compInfo}>
                    Your request to join{" "}
                    <Text style={{ color: theme.colors.secondary }}>
                      {item.name}
                    </Text>{" "}
                    has been{" "}
                    <Text style={{ color: theme.colors.error }}>declined</Text>.
                  </Text>
                  <Divider />
                </View>
              )
            ) : (
              <>
                <View style={styles.received}>
                  <Text numberOfLines={2} style={styles.receivedText}>
                    <Text style={{ color: theme.colors.primary }}>
                      {item.email}
                    </Text>{" "}
                    has requested to join{" "}
                    <Text style={{ color: theme.colors.secondary }}>
                      {item.name}
                    </Text>
                  </Text>
                  <View style={styles.receivedBtns}>
                    <Button
                      mode="contained"
                      compact={true}
                      onPress={() => updateRequestAccept(item)}
                      style={styles.receivedBtn}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      compact={true}
                      onPress={() => updateRequestDelete(item)}
                      textColor={theme.colors.primary}
                      style={[
                        styles.receivedBtn,
                        { borderColor: theme.colors.primary, marginLeft: 5 },
                      ]}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Decline
                    </Button>
                  </View>
                </View>
                <Divider />
              </>
            )
          }
          keyExtractor={(item) => item.RID}
          ListHeaderComponent={<Divider />}
        />
        <Divider />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  compInfo: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  received: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  receivedBtns: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  receivedText: {
    width: "60%",
    flexDirection: "row",
  },
  receivedBtn: {
    borderRadius: 5,
    height: 40,
    width: 70,
  },
  logins: {
    padding: 20,
  },
  loginText: {
    paddingBottom: 10,
  },
  logout: {},
  logoutBtn: {
    marginHorizontal: -10,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  logoutText: {
    fontStyle: "normal",
    textAlign: "left",
    alignItems: "left",
    color: "#458eff",
  },
  headerText: {
    alignItems: "left",
    marginLeft: -5,
  },
  paper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  buttonStyle: {
    marginHorizontal: 20,
    marginTop: 5,
  },
});

export default InboxScreen;
