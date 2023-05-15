import { StyleSheet, StatusBar, View, Image } from "react-native";
import { Button, Text, Divider, List, Appbar } from "react-native-paper";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { auth } from "./utils/firebaseConfig";
import { getAuth } from "firebase/auth";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused, useScrollToTop } from "@react-navigation/native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
  get,
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";

const SettingsScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isAdmin, setIsAdmin] = React.useState("");

  async function getProfile() {
    try {
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      // const getUname = query(collection(db, "users"), where("UID", "==", uid));
      const getUname = doc(db, "users", uid);
      const usernameSnapshot = await getDoc(getUname);
      if (usernameSnapshot.exists()) {
        if (usernameSnapshot.get("admin") != undefined) {
          setIsAdmin(usernameSnapshot.get("admin"));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleLogout = async () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("LoginScreen");
      })
      .catch((error) => alert(error.message));
  };

  React.useEffect(() => {
    getProfile();
  }, [isFocused]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title="Settings" style={styles.headerText} />
      </Appbar.Header>
      <View style={styles.container}>
        {/* <View>
                    <List.Item 
                        title='Edit Profile' 
                        left={(props) => <MaterialCommunityIcons {...props} name="account-edit-outline" size='20' />} 
                    />
                    <List.Item title='Privacy' left={(props) => <Ionicons {...props} name="lock-closed-outline" size='20' />} />
                    <List.Item title='Security' left={(props) => <Ionicons {...props} name="shield-checkmark-outline" size='20' />} />
                    <List.Item title='Help' left={(props) => <Ionicons {...props} name="help-buoy" size='20' />} />
                    <List.Item title='About' left={(props) => <Ionicons {...props} name="ios-information-circle-outline" size='20' />} />
                    </View>
                  <Divider /> */}
          <View>
            <List.Accordion 
              title='Account' 
              left={(props) => <FontAwesome5 {...props} name='user-alt' size='16' />} 
            >
              <List.Item 
                title='Reset Password'
                left={(props) => <Ionicons {...props} name='ios-lock-closed' size='20' />}
                onPress={() => navigation.navigate("UpdatePW")}
              />
            </List.Accordion>
        {isAdmin != "" ? (
          <>
            <List.Item
              key={"admin-details"}
              title="Admin Actions"
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="account-group"
                  size="20"
                />
              )}
              onPress={() => navigation.navigate("AdminPage")}
            />
            <Divider />
          </>
          ) : (
            <Divider />
          )}
          </View>
        <View style={styles.compInfo}>
            <Image 
                source={require('../images/textlogos/Priism-Text.png')} 
                style={{ 
                    height: 25,
                    width: undefined,
                    aspectRatio: 8174 / 2727,
                    marginBottom: 15
                }} 
            />
          {/* <Text style={{ paddingBottom: 10 }}>Priism</Text> */}
          <Text style={{ paddingBottom: 10, marginLeft: 5 }}>Powered By</Text>
          <View style={styles.paper}>
            <Button
              icon={() => (
                <Image
                  source={require("../reactnativepapericon.png")}
                  style={{ width: 66.89, height: 25 }}
                />
              )}
              style={{ marginLeft: -10 }}
            />
            <Text style={{ marginTop: 6.7, marginLeft: -12 }}>
              React Native Paper
            </Text>
          </View>
        </View>
        <Divider />
        <View style={styles.logins}>
          <Text style={styles.loginText}>Logins</Text>
          <View style={styles.logout}>
            <Button mode="text" style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </Button>
          </View>
        </View>
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
    padding: 20,
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
});

export default SettingsScreen;
