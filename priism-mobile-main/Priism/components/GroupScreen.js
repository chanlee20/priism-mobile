import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, Switch, useTheme } from "react-native-paper";
import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const GroupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [uni, setUni] = useState([]);
  const [subsidiary, setSubsidiary] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [uniLoc, setUniLoc] = useState("");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");

  const theme = useTheme();
  const ref = useRef();

  const auth = getAuth();
  const userid = auth.currentUser.uid;

  async function getAPIKey() {
    try {
      const getKey = doc(db, "placesAPI", "apiKey");
      const keySnap = await getDoc(getKey);
      if (keySnap.exists()) {
        setApiKey(keySnap.get("key"));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function getUni() {
    try {
      const getUname = query(
        collection(db, "users"),
        where("UID", "==", userid)
      );
      const usernameSnapshot = await getDocs(getUname);
      let university = [];
      usernameSnapshot.forEach((doc) => {
        university.push(doc.get("university"));
      });

      const getUniName = doc(db, "groups", university[0]);
      const uniSnapshot = await getDoc(getUniName);
      if (uniSnapshot.exists()) {
        university.push(uniSnapshot.get("name"));
        if (uniSnapshot.get("bio")) {
          const bio = uniSnapshot.get("bio");
          if (Object.keys(bio).includes("location")) {
            setUniLoc(bio.location);
          }
        }
      }
      setUni(university);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getAPIKey();
    getUni();
  }, []);

  async function createGroup() {
    try {
      const path = subsidiary ? "groups/" + uni[0] + "/subgroup" : "groups";
      const docRef = doc(collection(db, path));
      const groupData = {
        GID: docRef.id,
        admin: [userid],
        bannedUsers: [],
        name: name,
        hasChildren: false,
        users: [userid],
        isUniversity: false,
        bio: {
          location: location,
          text: desc,
        },
      };
      await setDoc(docRef, groupData);
      setName("");

      const userRef = doc(db, "users", userid);
      if (subsidiary) {
        const docRef2 = doc(db, path, uni[0] + "-" + docRef.id);
        const groupData2 = {
          admin: [userid],
          bannedUsers: [],
          name: name,
          parent: uni[0],
          users: [userid],
          GID: uni[0] + "-" + docRef.id,
          bio: {
            location: uniLoc,
            text: desc,
          },
        };

        await setDoc(docRef2, groupData2);
        await deleteDoc(doc(db, path, docRef.id));
        
        await updateDoc(userRef, {
          groups: arrayUnion(uni[0] + "-" + docRef.id),
          admin: arrayUnion(uni[0] + "-" + docRef.id),
        });
        const schoolRef2 = doc(db, "groups", uni[0]);
        const schoolSnap2 = await getDoc(schoolRef2);

        if (schoolSnap2.exists()) {
          if (!schoolSnap2.get("hasChildren")) {
            await updateDoc(schoolRef2, { hasChildren: true });
          }
        }
      } else {
        await updateDoc(userRef, {
          groups: arrayUnion(docRef.id),
          admin: arrayUnion(docRef.id),
        });
      }
      alert("Group successfully created.");
      navigation.navigate("School", {
        school: name,
        group: subsidiary ? uni[0] + "-" + docRef.id : docRef.id,
        subsidiary: subsidiary,
        adminOverride: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function toggleSub() {
    if (!subsidiary) {
      ref.current?.setAddressText("");
      setLocation("");
    }
    setSubsidiary(!subsidiary);
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <Text variant="headlineMedium" style={{ fontSize: 20 }}>
            Create as subsidiary of:
          </Text>
          <View style={styles.subWrap}>
            <Text variant="headlineSmall" style={{ fontSize: 16 }}>
              {uni[1]}
            </Text>
            <Switch
              value={subsidiary}
              onValueChange={() => toggleSub()}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <TextInput
            value={name}
            label="Group Name"
            placeholder="Enter Group Name"
            mode="outlined"
            onChangeText={setName}
            dense={true}
            style={styles.title}
            left={
              <TextInput.Icon
                icon={() => (
                  <FontAwesome5
                    name="asterisk"
                    size="10"
                    style={{ color: theme.colors.error }}
                  />
                )}
                style={{
                  marginTop: 1,
                  marginHorizontal: -25,
                }}
              />
            }
            contentStyle={{ marginLeft: 40 }}
          />
          <GooglePlacesAutocomplete
            keyboardShouldPersistTaps="always"
            ref={ref}
            placeholder="Set Location"
            disableScroll={true}
            query={{
              key: apiKey,
              language: "en",
              types: "(cities)",
            }}
            onPress={(data) => setLocation(data.description)}
            onFail={(error) => console.log(error)}
            onNotFound={() => console.log("no results")}
            listEmptyComponent={() => (
              <View>
                <Text>No results were found.</Text>
              </View>
            )}
            enablePoweredByContainer={false}
            textInputProps={{
              InputComp: TextInput,
              mode: "outlined",
              label: subsidiary ? uniLoc : "Location",
              dense: true,
              left: (
                <TextInput.Icon
                  icon={() => (
                    <Ionicons
                      name="ios-location-outline"
                      size="20"
                      style={
                        subsidiary && { color: theme.colors.onSurfaceDisabled }
                      }
                    />
                  )}
                  style={{
                    marginTop: 15,
                    marginHorizontal: -25,
                  }}
                />
              ),
              contentStyle: { marginLeft: 40 },
              disabled: subsidiary,
            }}
            styles={{
              container: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 15,
              },
              textInputContainer: {
                justifyContent: "center",
                alignItems: "center",
                width: "94%",
              },
              textInput: {
                paddingVertical: 0,
                paddingHorizontal: 0,
                height: 41,
                fontSize: 16,
              },
              listView: {
                width: "90%",
              },
            }}
          />
          <TextInput
            mode="outlined"
            multiline={true}
            label="Description"
            placeholder="Enter Group Description"
            value={desc}
            onChangeText={setDesc}
            style={styles.bio}
            contentStyle={{
              paddingTop: 15,
            }}
          />
        </View>
        <View style={styles.buttons}>
          <Button
            mode="contained"
            style={{ marginRight: 10 }}
            disabled={!name}
            onPress={createGroup}
          >
            Create
          </Button>
          <Button
            mode="text"
            textColor={theme.colors.secondary}
            onPress={() => navigation.navigate("Home")}
          >
            Cancel
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "white",
  },
  wrap: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  subWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
    marginLeft: 20,
  },
  title: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 20,
    justifyContent: "flex-end",
  },
  bio: {
    height: 250,
    marginHorizontal: 10,
    marginBottom: 20,
    marginTop: 5,
  },
});

export default GroupScreen;
