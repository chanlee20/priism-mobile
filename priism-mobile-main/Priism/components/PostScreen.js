import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Dimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
  Button,
  TextInput,
  List,
  RadioButton,
  useTheme,
  SegmentedButtons,
} from "react-native-paper";
import React from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  collection,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { logos } from "../images/logos/logos";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const PostScreen = () => {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const [checked, setChecked] = React.useState("");
  const [user, setUser] = React.useState("");
  const [groups, setGroups] = React.useState([]);
  const [groupedData, setGroupedData] = React.useState([]);
  const [subGroupedData, setSubGroupedData] = React.useState([]);
  const [isPublic, setIsPublic] = React.useState(true);
  const isFocused = useIsFocused();
  const theme = useTheme();
  const navigation = useNavigation();

  React.useEffect(() => {
    async function getUser() {
      try {
        const auth = getAuth();
        const userid = auth.currentUser.uid;
        const uid = auth.currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        if(userDoc.exists()){
          setUser(userDoc.data().username)
          setGroups(userDoc.data().groups)
        }
      } catch (error) {
        console.log(error);
      }
    }
    getUser();
    setChecked("");
    setTitle("");
    setBody("");
    setExpanded(false);
  }, [isFocused]);

  React.useEffect(() => {
    async function groupData() {
      let tempGroups = [];
      let subGroups = [];

      groups.map(async (groupId) => {
        if(groupId.includes("-")){
          var idStringArray = groupId.split("-")
          const subGroupRef = doc(db, "groups", idStringArray[0], "subgroup", groupId)
          const subGroupSnap = await getDoc(subGroupRef)
          if(subGroupSnap.exists()){
            const subGroupName = subGroupSnap.get("name")
            subGroups.push({parent_id: idStringArray[0], id: subGroupSnap.id, name: subGroupName})
          }
        }
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);
        
        if (groupSnap.exists()) {
          const groupName = groupSnap.get("name");    
          tempGroups.push({ id: groupId, name: groupName, subGroups: subGroups });
        }
      });
      setSubGroupedData(subGroups);
      setGroupedData(tempGroups);
    }    
    groupData();
  }, [groups]);

  const renderGroup = (group) => (
    <>
      <RadioButton.Group 
        onValueChange={(newValue) => {
          setChecked(newValue);
        }}
        value={checked}
        key={group.name}
      >
        <RadioButton.Item
          style={{height:50}}
          label={group.name}
          value={group.id+"/"+group.name}
        />
        { subGroupedData.map((subgroup) => (
            group.id == subgroup.parent_id ?
                <View key={subgroup.id} style={styles.subgroup}>
                    <Image 
                        source={logos[subgroup.id.split('-')[0]].uri}
                        style={[styles.subLogo, {aspectRatio : logos[subgroup.id.split('-')[0]].ratio}]}
                    />
                    <RadioButton.Item
                        label={subgroup.name}
                        value={subgroup.id+"/"+subgroup.name}
                        style={{width: Dimensions.get('window').width - 45}}
                    />
                </View>
                : <></>
          ))}
      </RadioButton.Group> 
    </>
  );


  async function createPost() {
    if (title != "" && body != "") {
      try {
        const docRef = doc(collection(db, "posts"));
        const postData = {
          body: body,
          date: new Date(),
          public: isPublic,
          group: checked.split("/")[0],
          school: checked.split("/")[1] ,
          title: title,
          comments: [],
          username: user,
          postID: docRef.id,
          upvotes: 0
        };
        await setDoc(docRef, postData);
        setTitle("");
        setBody("");
        setChecked("");
        alert("Successfully posted");
        navigation.navigate("Home");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      alert("Missing title or body");
    }
  }

  return (
      <KeyboardAwareScrollView>
          <View style={{marginTop: 10, marginBottom: 20}}>
              <List.Accordion
                  title="Select Affiliation"
                  expanded={expanded}
                  onPress={() => setExpanded(!expanded)}
                  style={{height:50}}
                  left={(props) => <FontAwesome5 {...props} name='asterisk' size='10' style={{color : theme.colors.error}} />}
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
                      icon: isPublic ? (props) =>
                          <Ionicons 
                              {...props}
                              name='ios-lock-open-outline' 
                              size='20' 
                              style={{color:theme.colors.primary}} 
                          /> : null
                  },
                  {
                      value: false,
                      label: "Private",
                      icon: !isPublic ? (props) => 
                          <Ionicons 
                              {...props}
                              name='ios-lock-closed-outline' 
                              size='20' 
                              style={{color:theme.colors.secondary}} 
                          /> : null
                  },
                  ]}
              />
          </SafeAreaView>
          <View>
              <TextInput
                  value={title}
                  label="Title"
                  placeholder="Enter title"
                  mode="outlined"
                  onChangeText={(nextValue) => setTitle(nextValue)}
                  dense={true}
                  style={styles.title}
              />
              <TextInput
                  value={body}
                  label="Body"
                  placeholder="Enter body"
                  mode="outlined"
                  onChangeText={(nextValue) => setBody(nextValue)}
                  multiline={true}
                  style={styles.body}
                  contentStyle={{
                    paddingTop: 15
                  }}
              />
          </View>
          <View style={styles.buttons}>
              <Button
                  mode="contained"
                  style={{ marginRight: 10 }}
                  disabled={!checked || !title || !body}
                  onPress={createPost}
              >
                  Post
              </Button>
              <Button
                  mode="text"
                  onPress={() => navigation.navigate("Home")}
                  textColor={theme.colors.secondary}
              >
                  Cancel
              </Button>
          </View>
      </KeyboardAwareScrollView>
  );
};

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
    height: 300,
    maxHeight: 450,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 20,
    justifyContent: "flex-end",
    paddingBottom: 40
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
    width: '100%',
    flexDirection: 'row',
  },
  subLogo: {
    height: 30,
    width: undefined,
    alignSelf: 'center',
    marginLeft: 15
  }
});

export default PostScreen;
