import { StyleSheet, View } from "react-native";
import {
  Button,
  Text,
  TextInput,
  Switch,
  useTheme,
  Appbar,
} from "react-native-paper";
import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import { Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const EditGroupScreen = ({ navigation, route }) => {
  const [name, setName] = useState(route.params.school);
  const uni = route.params.uni;
  const [subsidiary, setSubsidiary] = useState(route.params.subsidiary);
  const [apiKey, setApiKey] = useState("");
  const uniLoc = route.params.groupObj.bio.location;
  const [location, setLocation] = useState(route.params.groupObj.bio.location);
  const [desc, setDesc] = useState(route.params.groupObj.bio.text);

  const theme = useTheme();
  const ref = useRef();

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

  useEffect(() => {
    getAPIKey();
  }, []);

  function toggleSub() {
    if (!subsidiary) {
      ref.current?.setAddressText("");
      setLocation("");
    } else {
      ref.current?.setAddressText(route.params.groupObj.bio.location);
      setLocation(route.params.groupObj.bio.location);
    }
    setSubsidiary(!subsidiary);
  }

  async function updateGroup() {
    try {
      let groupRef;
      let groupData = {};
      if (route.params.group.includes("-")) {
        groupRef = doc(
          db,
          "groups/" + uni[0] + "/subgroup",
          route.params.group
        );
        groupData = {
          name: name,
          bio: {
            location: uniLoc,
            text: desc,
          },
        };
      } else {
        groupRef = doc(db, "groups", route.params.group);
        groupData = {
          name: name,
          bio: {
            location: location,
            text: desc,
          },
        };
      }
      await updateDoc(groupRef, groupData);

      alert("Successfully updated group description.");
      navigation.navigate("School", {
        adminOverride: route.params.adminOverride,
        school: route.params.school,
        group: route.params.group,
        subsidiary: route.params.subsidiary,
      });
    } catch (err) {
      alert("Error updating group description. Please try again later.");
      console.error(err);
    }
  }

  function updateAlert() {
    Alert.alert("Save edits?", "", [
      {
        text: "Save",
        onPress: updateGroup,
      },
      {
        text: "Cancel",
      },
    ]);
  }

  function cancelEdit() {
    if (
      (subsidiary
        ? subsidiary === route.params.subsidiary
        : location === route.params.groupObj.bio.location) &&
      name === route.params.school &&
      desc === route.params.groupObj.bio.text
    ) {
      navigation.goBack();
      return;
    }
    Alert.alert("Discard edits?", "", [
      {
        text: "Discard",
        onPress: () => navigation.goBack(),
      },
      {
        text: "Cancel",
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content
          title="Edit Group Profile"
          titleStyle={{ textAlign: "center" }}
        />
      </Appbar.Header>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
      >
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
                    <Ionicons name="ios-location-outline" size="20" />
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
            disabled={
              !name ||
              ((subsidiary
                ? subsidiary === route.params.subsidiary
                : location === route.params.groupObj.bio.location) &&
                name === route.params.school &&
                desc === route.params.groupObj.bio.text)
            }
            onPress={updateAlert}
          >
            Save
          </Button>
          <Button
            mode="text"
            textColor={theme.colors.secondary}
            onPress={cancelEdit}
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

export default EditGroupScreen;
