import { StyleSheet, FlatList, View } from "react-native";
import { TextInput, ActivityIndicator } from "react-native-paper";
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useRef } from 'react';
import GroupCard from "./GetGroups";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import { textlogos } from '../images/textlogos/textlogos';
import { logos } from "../images/logos/logos";

const SearchScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [displayGroups, setDisplayGroups] = useState([]);
  const [top, setTop] = useState(0);
  const isFocused = useIsFocused();
  const scrollRef = useRef();

  useScrollToTop(scrollRef);

  useEffect(() => {
    async function getGroups() {
      try {
        const groupRef = collection(db, 'groups');
        const groupSnap = await getDocs(groupRef);
        if (!groupSnap.empty) {
          let hasSubs = [];
          let groupData = groupSnap.docs.map((doc) => {
            if (doc.data().hasChildren) {
              hasSubs.push(doc.id);
            }
            return doc.data();
          });
          for (let i = 0; i < hasSubs.length; i++) {
            const subgroupRef = collection(db, 'groups/' + hasSubs[i] + '/subgroup');
            const subgroupSnap = await getDocs(subgroupRef);
            if (!subgroupSnap.empty) {
              const subGroupData = subgroupSnap.docs.map((doc) => doc.data());
              if (subGroupData.length > 0) {
                groupData = groupData.concat(subGroupData);
              }
            }
          }
          setGroups(groupData);
          setDisplayGroups(groupData);
        }
      } catch (err) {
        console.error(err);
      }
    }
    getGroups();
    setSearch('');
  }, [isFocused]);

  const onChangeSearch = (query) => {
    setSearch(query);
    const res = groups.filter((item) => {
      const tempName = item.name.toLowerCase();
      return tempName.includes(query.toLowerCase());
    });
    setDisplayGroups(res);
  };

  const renderCards = displayGroups.map((group) => {
    let subsidiary = false;
    let textlogo = '';
    if (Object.keys(textlogos).includes(group['GID'])) {
      textlogo = textlogos[group['GID']];
    }
    if (group['GID'].includes('-')) {
      textlogo = logos[group['GID'].split('-')[0]];
      subsidiary = true;
    }

    return(
      <GroupCard group={group}  textlogo={textlogo} subsidiary={subsidiary} />
    );
  })

  return (
    <View style={styles.searchPage}>
      <View
        style={
          top <= 0
            ? { width: "100%" }
            : [styles.headerBorder, { width: "100%" }]
        }
      >
        <TextInput
          placeholder="Search Groups..."
          value={search}
          onChangeText={onChangeSearch}
          label='Search Groups'
          mode="outlined"
          left={<TextInput.Icon icon={(props) => <Ionicons {...props} name="ios-search" size='20' />} style={{marginTop:15}}/>}
          style={styles.searchBar}
          autoFocus={true}
        />
      </View>
      {
        displayGroups.length > 0 ?
          <FlatList 
            ref={scrollRef} 
            style={styles.topContainer} 
            onScroll={(e) => setTop(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle="16"
            data={displayGroups}
            renderItem={({item}) => {
              let subsidiary = false;
              let textlogo = '';
              if (Object.keys(textlogos).includes(item['GID'])) {
                textlogo = textlogos[item['GID']];
              }
              if (item['GID'].includes('-')) {
                textlogo = logos[item['GID'].split('-')[0]];
                subsidiary = true;
              }

              return(
                <GroupCard group={item}  textlogo={textlogo} subsidiary={subsidiary} />
              );
            }}
            keyExtractor={item => item.GID}
          />
          : <ActivityIndicator animating={true} />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  searchPage: {
    paddingTop: 60,
    backgroundColor: "white",
    flex: 1,
  },
  headerBorder: {
    borderBottomColor: "rgb(219,219,219)",
    borderBottomWidth: 0.5,
  },
  searchBar: {
    marginLeft: 20,
    marginRight: 20,
    height: 40,
    backgroundColor: 'rgb(255,255,255)',
    marginBottom: 10,
  },
  topContainer: {
    padding: 15,
  },
  recHeader1: {
    backgroundColor: "red",
    marginHorizontal: -23.7,
    marginVertical: -16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  recHeader2: {
    backgroundColor: "blue",
    marginHorizontal: -23.7,
    marginVertical: -16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    margin: 2,
    paddingBottom: 5,
    marginBottom: 20,
  },
  divider: {
    marginVertical: 10,
  },
});

export default SearchScreen;
