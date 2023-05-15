import { StyleSheet, View, RefreshControl, FlatList } from "react-native";
import {
  Text,
  Divider,
  Appbar,
  ActivityIndicator,
  useTheme,
  List
} from "react-native-paper";
import Octicons from "@expo/vector-icons/Octicons";
import { getAuth } from "firebase/auth";
import { db } from "./utils/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import React from "react";
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import PostCard from "./GetPosts";
import Ionicons from "@expo/vector-icons/Ionicons";


const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = React.useState("");
  const [myPosts, setMyPosts] = React.useState([]);
  const [myGroups, setMyGroups] = React.useState([]);
  const [groupObj, setGroupObj] = React.useState({});
  const [postExists, setPostExists] = React.useState(true);
  const [top, setTop] = React.useState(0);
  const [banned, setBanned] = React.useState([]);
  const [expanded, setExpanded] = React.useState(true);

  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = React.useState(false);

  const didMount = React.useRef(true);
  const scrollRef = React.useRef();

  const theme = useTheme();
  const auth = getAuth();
  const uid = auth.currentUser.uid;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfile();
    setTimeout(() => {
    setRefreshing(false);
    }, 2000);
}, []);

  useScrollToTop(scrollRef);

  async function getProfile() {
    try {
      const getUname = doc(db, "users", uid);
      const usernameSnapshot = await getDoc(getUname);
      if(usernameSnapshot.exists()){
        setUser(usernameSnapshot.get("username"));
        setMyGroups(usernameSnapshot.get("groups"));
        const tempBanned = usernameSnapshot.get("bannedFrom");
        if (tempBanned != undefined) {
          setBanned(tempBanned);
        } else {
          setBanned(["N/A"]);
        }
      };
    } catch (error) {
      console.error(error);
    }
  }

  async function getGroups() {
    try {
      if (myGroups.length == 0) {return}
      const groupRef = collection(db, 'groups');
      const groupSnap = await getDocs(groupRef);
      let groups = {};
      let hasSubs = '';
      groupSnap.forEach((doc) => {
        if (myGroups.includes(doc.id)) {
          groups[doc.id] = { 
            name: doc.get('name'), 
            isUni: doc.get('isUniversity'),
            isAdmin: doc.get('admin').includes(uid)
           };
          if (doc.data().hasChildren) {
            hasSubs = doc.id;
          }
        }
      });

      if (hasSubs != '') {
        const subgroupRef = collection(db, 'groups/' + hasSubs + '/subgroup');
        const subgroupSnap = await getDocs(subgroupRef);
        groups[hasSubs]['subgroups'] = {};
        subgroupSnap.forEach((doc) => {
          if (myGroups.includes(doc.id)) {
            groups[hasSubs].subgroups[doc.id] = { name : doc.get('name'), isAdmin : doc.get('admin').includes(uid) };
            groups[hasSubs].sub
          }
        });
      }
      setGroupObj(groups);
    }
    catch(err) {
      console.error(err);
    }
  }

  async function getPosts() {
    try {
      const myPostQ = query(
        collection(db, "posts"),
        where("username", "==", user)
      );
      const myPostSnap = await getDocs(myPostQ);
      if (!myPostSnap.empty) {
        let myPostArr = [];
        myPostSnap.forEach((doc) => {
          if (!banned.includes(doc.data().group)){
            const data = doc.data();
            data['id'] = doc.id;
            data.date = data.date.toDate();
            for (let i = 0; i < data.comments.length; i++) {
              data.comments[i].date = data.comments[i].date.toDate();
              if ('replies' in data.comments[i]) {
                data.comments[i].replies.forEach(repl => {repl.date = repl.date.toDate()});
              }
            }
            myPostArr.push(data);
          }
        });
        myPostArr.sort((a,b) => b.date - a.date);
        setMyPosts(myPostArr);
        setPostExists(myPostArr.length > 0);
      } else {
        setPostExists(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  React.useEffect(() => {
    getProfile();
  }, [isFocused]);

  React.useEffect(() => {
    getGroups();
  }, [myGroups]);

  React.useEffect(() => {
    if (didMount.current) {
      didMount.current = false;
    } else {
      getPosts();
    }
  }, [groupObj]);

  const renderGroups = Object.keys(groupObj).map((group) => {
    let renderSubgroups = () => (<></>);
    if (Object.keys(groupObj[group]).includes('subgroups')) {
      renderSubgroups = Object.keys(groupObj[group].subgroups).map((sub) => {
        return (
          <List.Item 
            key={sub}
            title={groupObj[group].subgroups[sub].name}
            right={(props) => groupObj[group].subgroups[sub].isAdmin ? <List.Icon {...props} icon='account-group' color={theme.colors.secondary} /> : <></> } 
            titleStyle={[styles.affils, { marginLeft : 40, color : theme.colors.secondary }]}
            onPress={() => navigation.navigate('School', {
              school: groupObj[group].subgroups[sub].name,
              group: sub,
              subsidiary: true
            })}
            style={{width : '108%', marginHorizontal : -15}}
          />
        );
      })
    }

    
    return (
      <>
        <List.Item 
          key={group}
          title={groupObj[group].name}
          left={(props) => groupObj[group].isUni ? <List.Icon {...props} icon={() => <Ionicons name='ios-school' size='20' style={{color : theme.colors.primary}} />} /> : <></>}
          right={(props) => groupObj[group].isAdmin ? <List.Icon {...props} icon='account-group' color={theme.colors.primary} /> : <></>}
          titleStyle={[styles.affils, {color : theme.colors.primary}]}
          onPress={() => navigation.navigate("School", {
            school: groupObj[group].name,
            group: group,
            subsidiary: false
          })}
          style={{width : '108%', marginHorizontal: -15}}
        />
        {renderSubgroups}
      </>
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
        style={
          top <= 0 ? null : styles.headerBorder
        }
      >
        <Appbar.Content title={user} style={styles.headerText} />
        <Appbar.Action
          icon={(props) => <Octicons {...props} name="inbox" />}
          onPress={() => navigation.navigate("Inbox")}
        />
        <Appbar.Action
          icon={(props) => <Octicons {...props} name="gear" />}
          onPress={() => navigation.navigate("Settings")}
        />
      </Appbar.Header>
      <View style={styles.container}> 
        {
          postExists ?
              myPosts.length > 0 ? 
                <FlatList 
                  ref={scrollRef} 
                  style={styles.topContainer}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  onScroll={(e) => setTop(e.nativeEvent.contentOffset.y)}
                  scrollEventThrottle="16"
                  data={myPosts}
                  renderItem={({item}) => {
                    let group = groupObj[item.group];
                    if (item.group.includes('-')) {
                      group = groupObj[item.group.split('-')[0]].subgroups[item.group];
                    }
                    return (
                      <PostCard postObj={item} group={group} />
                    );
                  }}
                  keyExtractor={item => item.id}
                  ListHeaderComponent={
                    <>
                      <View style={styles.bio}>
                        <List.Accordion
                          title='Affiliations'
                          left={(props) => <List.Icon {...props} icon={() => <Ionicons name='ios-school' size='20'/>} />}
                          expanded={expanded}
                          onPress={() => setExpanded(!expanded)}
                          style={{width : '108%', marginHorizontal: -15}}
                          titleStyle={{color : 'black'}}
                        >
                          {renderGroups}
                        </List.Accordion>
                      </View>
                      <Divider style={styles.div} />
                    </>
                  }
                />
                : <ActivityIndicator animating={true} />
              : 
              <>
                <View style={styles.bioNoPost}>
                  <List.Accordion
                    title='Affiliations'
                    left={(props) => <List.Icon {...props} icon={() => <Ionicons name='ios-school' size='20'/>} />}
                    expanded={expanded}
                    onPress={() => setExpanded(!expanded)}
                    style={{width : '108%', marginHorizontal : -15}}
                    titleStyle={{color : 'black'}}
                  >
                    {renderGroups}
                  </List.Accordion>
                  <Divider style={styles.div} />
                </View>
                <Text variant="titleMedium">No Posts Made</Text>
              </>
        }
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
    width: '100%'
  },
  topContainer: {
    padding: 15,
    width: '100%'
  },
  posttitle: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
  },
  card: {
    flex: 1,
    margin: 2,
    paddingBottom: 5,
    marginBottom: 20,
  },
  bio: {
    marginBottom: 10,
    paddingHorizontal: 0,
    width: '100%',
    justifyContent: 'center',
  },
  bioNoPost: {
    marginBottom: 10,
    padding: 15,
    width: '100%',
    justifyContent: 'center',
  },
  name: {
    marginBottom: 30,
  },
  affText: {
    marginBottom: 10,
  },
  affils: {
    textAlign: "left",
  },
  div: {
    marginVertical: 10,
    marginHorizontal: -15
  },
  headerText: {
    alignItems: "left",
    marginLeft: -30,
  },
  headerBorder: {
    borderBottomColor: "rgb(219,219,219)",
    borderBottomWidth: 0.5,
  },
});

export default ProfileScreen;
