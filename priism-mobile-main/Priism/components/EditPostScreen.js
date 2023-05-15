import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
  Button,
  TextInput,
  List,
  RadioButton,
  Appbar,
  useTheme,
  SegmentedButtons,
} from "react-native-paper";
import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, collection, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { logos } from "../images/logos/logos";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function EditPostScreen({ navigation, route }) {
  const [title, setTitle] = useState(route.params.title);
  const [body, setBody] = useState(route.params.body);
  const [expanded, setExpanded] = React.useState(false);
  const [checked, setChecked] = React.useState(route.params.checked);
  const [user, setUser] = React.useState("");
  const [groups, setGroups] = React.useState([]);
  const [groupedData, setGroupedData] = React.useState([]);
  const [isPublic, setIsPublic] = React.useState(route.params.public);
  const [subGroupedData, setSubGroupedData] = React.useState([]);
  const isFocused = useIsFocused();
  const theme = useTheme();

  React.useEffect(() => {
    async function getUser() {
      try {
        const auth = getAuth();
        const userid = auth.currentUser.uid;
        const uid = auth.currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser(userDoc.data().username);
          setGroups(userDoc.data().groups);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getUser();
  }, [isFocused]);

  React.useEffect(() => {
    async function groupData() {
      let tempGroups = [];
      let subGroups = [];

      groups.map(async (groupId) => {
        if (groupId.includes("-")) {
          var idStringArray = groupId.split("-");
          const subGroupRef = doc(
            db,
            "groups",
            idStringArray[0],
            "subgroup",
            groupId
          );
          const subGroupSnap = await getDoc(subGroupRef);
          if (subGroupSnap.exists()) {
            const subGroupName = subGroupSnap.get("name");
            subGroups.push({
              parent_id: idStringArray[0],
              id: subGroupSnap.id,
              name: subGroupName,
            });
          }
        }
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const groupName = groupSnap.get("name");
          tempGroups.push({
            id: groupId,
            name: groupName,
            subGroups: subGroups,
          });
        }
      });
      setSubGroupedData(subGroups);
      setGroupedData(tempGroups);
    }
    groupData();
  }, [groups]);

  const renderGroup = (group) => (
    <RadioButton.Group
      onValueChange={(newValue) => {
        setChecked(newValue);
      }}
      value={checked}
      key={group.name}
    >
      <RadioButton.Item
        style={{ height: 50 }}
        label={group.name}
        value={group.id + "/" + group.name}
      />
      {subGroupedData.map((subgroup) =>
        group.id == subgroup.parent_id ? (
          <View key={subgroup.id} style={styles.subgroup}>
            <Image
              source={logos[subgroup.id.split("-")[0]].uri}
              style={[
                styles.subLogo,
                { aspectRatio: logos[subgroup.id.split("-")[0]].ratio },
              ]}
            />
            <RadioButton.Group
              onValueChange={(newValue) => {
                setChecked(newValue);
              }}
              value={checked}
              key={subgroup.name}
            >
              <RadioButton.Item
                label={subgroup.name}
                value={subgroup.id + "/" + subgroup.name}
                style={{ width: Dimensions.get("window").width - 45 }}
              />
            </RadioButton.Group>
          </View>
        ) : (
          <></>
        )
      )}
    </RadioButton.Group>
  );

  async function savePost() {
    if (title != "" && body != "") {
      try {
        const docRef = doc(collection(db, "posts"), route.params.postID); // add the post ID to the reference
        const postData = {
          body: body,
          public: isPublic,
          group: checked.split("/")[0],
          school: checked.split("/")[1],
          title: title,
          username: user,
        };

        await updateDoc(docRef, postData); // use updateDoc instead of setDoc to update the existing document
        setTitle("");
        setBody("");
        setChecked("");

        if (checked != route.params.checked) {
          const gid = checked.split("/")[0];
          const path = gid.includes("-")
            ? `groups/${gid.split("-")[0]}/subgroup`
            : "groups";
          const groupRef = doc(db, path, gid);
          const groupSnap = await getDoc(groupRef);
          alert("Successfully updated");
          navigation.navigate("PostView", {
            post: {
              id: route.params.postID,
              title: title,
              body: body,
              comments: route.params.comments,
              date: route.params.date,
              public: isPublic,
              group: gid,
              school: checked.split("/")[1],
              username: user,
            },
            group: groupSnap.data(),
          });
        } else {
          navigation.navigate("PostView", {
            post: {
              id: route.params.postID,
              title: title,
              body: body,
              comments: route.params.comments,
              date: route.params.date,
              public: isPublic,
              group: checked.split("/")[0],
              school: checked.split("/")[1],
              username: user,
            },
            group: route.params.group,
          });
        }

        // change to go back to post view and update post
        // navigation.navigate('Home');
        // navigation.navigate('PostView', {
        //     post: {
        //         id: route.params.postID,
        //         title: title,
        //         body: body,
        //         comments: route.params.comments,
        //         public: isPublic,
        //         group: checked.split("/")[0],
        //         school: checked.split("/")[1],
        //         username: user
        //     },
        //     group: {
        //         name: checked.split("/")[1],
        //     }
        // })
      } catch (e) {
        console.error("Error updating document: ", e);
      }
    } else {
      alert("Missing title or body");
    }
  }

  const alertMessageEdit = () => {
    if (
      title != route.params.title ||
      body != route.params.body ||
      checked != route.params.checked ||
      isPublic != route.params.public
    ) {
      Alert.alert("Do you want to save your changes?", "", [
        {
          text: "Save",
          onPress: () => savePost(),
        },
        {
          text: "Cancel",
        },
      ]);
    } else {
      savePost();
    }
  };

  const alertMessageCancel = () => {
    if (
      title != route.params.title ||
      body != route.params.body ||
      checked != route.params.checked ||
      isPublic != route.params.public
    ) {
      Alert.alert("Are you sure you want to discard your changes?", "", [
        {
          text: "Discard Changes",
          onPress: () => navigation.goBack(),
        },
        {
          text: "Cancel",
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Appbar.Header>
        <Appbar.Content title="Edit Post" style={styles.headerText} />
      </Appbar.Header>
      <ScrollView>
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <List.Accordion
            title="Select Affiliation"
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            style={{ height: 50 }}
            left={(props) => (
              <FontAwesome5
                {...props}
                name="asterisk"
                size="10"
                style={{ color: theme.colors.error }}
              />
            )}
          >
            {groupedData.map(renderGroup)}
          </List.Accordion>
        </View>
        <SafeAreaView>
          <SegmentedButtons
            value={isPublic}
            onValueChange={setIsPublic}
            style={styles.segemented}
            density="medium"
            buttons={[
              {
                value: true,
                label: "Public",
                icon: isPublic
                  ? (props) => (
                      <Ionicons
                        {...props}
                        name="ios-lock-open-outline"
                        size="20"
                        style={{ color: theme.colors.primary }}
                      />
                    )
                  : null,
              },
              {
                value: false,
                label: "Private",
                icon: !isPublic
                  ? (props) => (
                      <Ionicons
                        {...props}
                        name="ios-lock-closed-outline"
                        size="20"
                        style={{ color: theme.colors.secondary }}
                      />
                    )
                  : null,
              },
            ]}
          />
        </SafeAreaView>
        <View>
          <TextInput
            value={title}
            mode="outlined"
            onChangeText={(nextValue) => setTitle(nextValue)}
            dense={true}
            style={styles.title}
          />
          <TextInput
            value={body}
            mode="outlined"
            onChangeText={(nextValue) => setBody(nextValue)}
            multiline={true}
            style={styles.body}
          />
        </View>
        <View style={styles.buttons}>
          <Button
            mode="contained"
            style={{ marginRight: 10 }}
            disabled={!checked || !title || !body}
            onPress={alertMessageEdit}
          >
            Save
          </Button>
          <Button
            mode="text"
            onPress={alertMessageCancel}
            textColor={theme.colors.secondary}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "white",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  title: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  body: {
    marginHorizontal: 20,
    minHeight: 300,
    maxHeight: 450,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 20,
    justifyContent: "flex-end",
  },
  headerText: {
    alignItems: "left",
    marginLeft: -30,
  },
  segemented: {
    flex: 1,
    maxWidth: "80%",
    alignSelf: "center",
  },
  subgroup: {
    width: "100%",
    flexDirection: "row",
  },
  subLogo: {
    height: 30,
    width: undefined,
    alignSelf: "center",
    marginLeft: 15,
  },
});
