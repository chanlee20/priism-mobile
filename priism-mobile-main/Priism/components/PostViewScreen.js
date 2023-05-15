import { View , ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Button, Text, Divider, Appbar, TextInput, useTheme, IconButton, Menu } from 'react-native-paper';

import Feather from 'react-native-vector-icons/Feather';
import { getAuth } from "firebase/auth";
import { db } from "./utils/firebaseConfig"
import { collection, doc, getDocs, getDoc, query, where, updateDoc, deleteDoc, arrayRemove, arrayUnion} from "firebase/firestore";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { textlogos } from '../images/textlogos/textlogos';
import { logos } from '../images/logos/logos';
import getTime from '../getTime';
import getTimeComm from '../getTimeComm';

const PostViewScreen = ({ navigation, route }) => {
    const [comment, setComment] = React.useState('');
    const [reply, setReply] = React.useState('');
    const [updateReply, setUpdateReply] = React.useState([]);
    const [isPublic, setIsPublic] = React.useState(false);
    const [user, setUser] = React.useState("");
    const [size, setSize] = React.useState(16);
    const [commIdx, setCommIdx] = React.useState();
    const [showReplies, setShowReplies] = React.useState(new Array(route.params.post.comments.length).fill(false));
    const [color, setColorBlue] = React.useState("black");
    const [count, setCount] = React.useState(route.params.post.upvotes);
    const [hasUpvote, setHasUpvote] = React.useState(false);
    const isFocused = useIsFocused();
    const theme = useTheme();
    const didMount = React.useRef(true);
    const commRef = React.useRef();
    const [menuVisible, setIsMenuVisible] = React.useState(false);
    const [blockedUsers, setBlockedUsers] = React.useState([])
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);
    const handleReportClick = () => {
        // handle report logic here
        navigation.navigate("ReportPostScreen", {
            post: route.params.post,
        });
        closeMenu();
      };
    
      const handleBlockClick = async () => {
        // handle block logic here
        Alert.alert(
            'Block User',
            'Do you want to block this user?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => {
                  // handle block logic here
                  try{
                    let userRef = doc(db, "users", uid);
                    updateDoc(userRef, { 
                        blockedUsers: arrayUnion(route.params.post.username)
                     });
                     navigation.navigate("Home")
                  }
                  catch(e){  
                    console.log(e)
                  }
                  
                },
              },
            ],
          );
          closeMenu();
      };
    


    async function getUser() {
        try {
            const getUname = query(collection(db, "users"), where("UID", "==", uid));
            const usernameSnapshot = await getDocs(getUname);
            usernameSnapshot.forEach((doc) => {
                setUser(doc.get("username"));
            });
        }
        catch(error) {
            console.error(error);
        }
    }

    async function insertComment() {
        const newComm = { user : user, comment : comment, date : new Date() };
        if (route.params.post.comments.length == 0) {
            route.params.post.comments = [newComm];
        } else {
            route.params.post.comments.push(newComm);
        }
        setComment('');
        setShowReplies(showReplies.push(false));
        const postRef = doc(db, 'posts', route.params.post.id);
        await updateDoc(postRef, {
            comments: route.params.post.comments
        });
        // setPostComm(postComm + 1);
    }

    async function updateUpvoteCount(postId, vote) {
        try{
            const postRef = doc(db, "posts", postId);
            const userRef = doc(db, "users", uid)
            const postDoc = await getDoc(postRef);
            const userDoc = await getDoc(userRef);
            if(userDoc.exists()){
                if(vote == 1){
                    await updateDoc(userRef, {
                        upvotedList: arrayUnion(postId)
                    });
                }
                else{
                    await updateDoc(userRef, {
                        upvotedList: arrayRemove(postId)
                    });                
                }
            }
            if (postDoc.exists()) {
                route.params.post.upvotes += vote;
                await updateDoc(postRef, { upvotes: route.params.post.upvotes });
            } else {
                console.log("No such document!");
            }
        }
        catch(e){
            console.log(e)
        }
    }

    const handlePress = () => {
        if (!hasUpvote) {
            setHasUpvote(true);
            setColorBlue(theme.colors.primary);
            setCount(count + 1);
            updateUpvoteCount(route.params.post.id, 1);
        } else {
            setHasUpvote(false);
            setColorBlue("black");
            setCount(count - 1);
            updateUpvoteCount(route.params.post.id, -1);
        }
    };

    React.useEffect(()=>{
        async function updatePostUpvote(postId) {
            const auth = getAuth();
            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);

            try{
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {                    
                    if (userDoc.data().upvotedList != null && userDoc.data().upvotedList.includes(postId)) {
                        setColorBlue(theme.colors.primary);
                        setHasUpvote(true);
                    }
                    else {
                        setHasUpvote(false);
                        setColorBlue("black");
                    }
                }
            }
            catch(e){
                console.log(e)
            }
        }
        updatePostUpvote(route.params.post.id)
    }, [route.params.post])

    React.useEffect(() => {
        if(route.params.post.public) {
            setIsPublic(true);
        }
        else {
            setIsPublic(false);
        }
        getUser();
        filterComments()
    }, [isFocused]);


    async function handleDelete() {
        try {
            await deleteDoc(doc(db, "posts", route.params.post.id));
            navigation.popToTop();
        }
        catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    const alertMessage = () => {
        Alert.alert(
            'Do you want to delete this post?','',
            [
                {
                    text: 'OK',
                    onPress: ()=>handleDelete()
                },
                {
                    text: "Cancel"
                }
            ]
        );
    }

    async function insertReply() {
        try {
            if (updateReply) {
                const repl = { user: user, reply: reply, date: new Date() };
                if (!('replies' in route.params.post.comments[updateReply[1]])) {
                    updateReply[0]['replies'] = [repl];
                    route.params.post.comments[updateReply[1]] = updateReply[0];
                } else {
                    route.params.post.comments[updateReply[1]].replies.push(repl);
                }
                setReply('');
                setCommIdx(-1);
                const commRef = doc(db, "posts", route.params.post.id);
                await updateDoc(commRef, { comments: route.params.post.comments });
            }
        } catch(err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        if (didMount.current) {
            didMount.current = false;
        } else {
            insertReply();
        }
    }, [updateReply]);

    async function filterComments(){
        try{
            const usersCollectionRef = collection(db, "users");
            const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const bU = 'blockedUsers' in userDoc.data() ? userDoc.data().blockedUsers : [];
            setBlockedUsers(bU)
        }
        catch(e){
            console.log(e)
        }
    }
    const renderComments = route.params.post.comments.map((comm, index) => {
        let renderReplies = null;
        if ('replies' in comm) {
            renderReplies = comm.replies.map((repl, index) => {
                if (!blockedUsers.includes(repl.user)) {
                    return (
                        <>
                            <View key={index} style={styles.replyWrap}>
                                <View style={styles.commUserWrap}>
                                    <Text variant='titleSmall' style={{marginRight:5}}>
                                        {repl.user == user ? repl.user : repl.user[0] + '*'.repeat(repl.user.length - 1)}
                                    </Text>
                                    <Text style={{color:'gray'}}>{getTimeComm(repl.date)}</Text>
                                </View>
                                <Text>{repl.reply}</Text>
                            </View>
                        </>
                    );
                }
            })
        }
        if(!blockedUsers.includes(comm.user)){
            return (
                <>
                    <View key={index} style={styles.comment}>
                        <View style={styles.commUserWrap}>
                            <Text variant='titleSmall' style={{marginRight:5}}>
                                {comm.user == user ? comm.user : comm.user[0] + '*'.repeat(comm.user.length - 1)}
                            </Text>
                            <Text style={{color:'gray'}}>{getTimeComm(comm.date)}</Text>
                        </View>
                        <Text>{comm.comment}</Text>
                        {commIdx != index && <Text variant='labelSmall' style={styles.reply} onPress={() => setCommIdx(index)}>Reply</Text>}
                        {commIdx == index && 
                            <TextInput 
                                mode='outlined' 
                                value={reply} 
                                label='Reply'
                                placeholder={`Reply to ${comm.user == route.params.post.username ? comm.user : comm.user[0] + '*'.repeat(comm.user.length - 1)}`}
                                onChangeText={(text) => setReply(text)} 
                                style={styles.replyIpt}
                                activeOutlineColor={theme.colors.secondary}
                                autoFocus={true}
                                right={
                                    <TextInput.Icon 
                                        icon={() => <Feather name="send" size='20' />} 
                                        style={styles.commentBtn}
                                        onPress={() => setUpdateReply([comm, index])}
                                        disabled={!reply}
                                    />
                                }
                                
                            />
                        }
                        {renderReplies}
                    </View>
                    <Divider />
                </>
            );
        }
    });
    
    return (
        <View style={{flex:1, backgroundColor:'white'}}>
            <Appbar.Header style={{height:30}}>
                <Appbar.Action 
                    icon={(props) => <Ionicons {...props} name='ios-chevron-back' />}
                    onPress={() => navigation.goBack()}
                />
                {
                    user == route.params.post.username ?
                    <>
                        <Appbar.Action 
                            icon = {(props) => <Ionicons {...props}  name='create-outline' /> } 
                            onPress={() => navigation.navigate("EditPostScreen", {
                                    post: route.params.post,
                                    postID: route.params.post.id,
                                    body: route.params.post.body, 
                                    title: route.params.post.title,
                                    comments: route.params.post.comments,
                                    date: route.params.post.date,
                                    checked: route.params.post.group + "/" + route.params.post.school,
                                    group: route.params.group,
                                    public: route.params.post.public
                                }
                            )}
                            style={{marginLeft:240}}
                        />
                        <Appbar.Action 
                            icon = {(props) => <Ionicons {...props}  name='trash-outline' /> }
                            onPress={alertMessage}
                            style={{marginLeft:-5}}
                        />
                    </>
                        :
                    <>
                        <Appbar.Action
                            icon = {(props) => <Ionicons {...props}  name='ellipsis-horizontal-outline' /> }
                            onPress={openMenu}
                            style={{marginLeft:280}}
                        />
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={<IconButton icon="dots-vertical" />}
                        >
                            <Menu.Item onPress={handleReportClick} title="Report" />
                            <Divider />
                            <Menu.Item onPress={handleBlockClick} title="Block" />
                        </Menu>
                    </>
                }
            </Appbar.Header>
            <View style={styles.container}>
                <ScrollView style={styles.scrollBody} automaticallyAdjustKeyboardInsets={true} keyboardShouldPersistTaps='handled'>
                    <View>
                        <View style={styles.postHeader}>
                            <Text variant='headlineMedium' numberOfLines={1}>{route.params.post.title}</Text>
                            <Text variant='bodyMedium' style={styles.username}>
                                {user == route.params.post.username 
                                    ? route.params.post.username
                                    : route.params.post.username[0] + '*'.repeat(route.params.post.username.length - 1)
                                }
                            </Text>
                            <View style={{ flexDirection:'row', alignItems:'center' }}>
                                {!isPublic && <Ionicons name='ios-lock-closed' size='15' style={{color:'gray',}} />
                                }
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('School', {
                                        school: route.params.post.school, 
                                        group: route.params.post.group,
                                        subsidiary: route.params.post.group.includes('-'),
                                        
                                    })}
                                    style={{flex:1}}
                                >
                                    {
                                        Object.keys(textlogos).includes(route.params.post.group) ?
                                            <Image 
                                                source={textlogos[route.params.post.group].uri} 
                                                style={{
                                                    width: undefined,
                                                    maxWidth: '70%',
                                                    height: 35,
                                                    aspectRatio: textlogos[route.params.post.group].ratio
                                                }}
                                            />
                                            : route.params.post.group.includes('-') ?
                                                <View style={styles.subFoot}>
                                                    <Image
                                                        source={logos[route.params.post.group.split('-')[0]].uri} 
                                                        style={[styles.subFootLogo, {
                                                            aspectRatio : logos[route.params.post.group.split('-')[0]].ratio
                                                        }]}
                                                    />
                                                    <Text style={{fontWeight : '500'}} numberOfLines={1}>{route.params.group.name}</Text>
                                                </View>
                                                : 
                                                <Text 
                                                    style={{fontWeight : '500', marginLeft : 5}} 
                                                    numberOfLines={1}
                                                >
                                                    {route.params.group.name}
                                                </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={styles.time}>
                                <Text style={styles.timeText}>
                                    {getTime(route.params.post.date)}
                                </Text>
                            </View>
                        </View>
                        <Divider />
                        <View style={styles.fSizeWrap}>
                            <Button
                                mode='text'
                                onPress={() => setSize(size > 12 ? size - 2 : 12)}
                                textColor={theme.colors.secondary}
                                style={styles.fSize}
                                compact={true}
                            >
                                <MaterialCommunityIcons
                                    name='format-font-size-decrease'
                                    size='20'
                                    style={{color : theme.colors.secondary}}
                                />
                            </Button>
                            <Button
                                mode='text'
                                onPress={() => setSize(size < 50 ? size + 2 : 50)}
                                style={styles.fSize}
                                compact={true}
                            >
                                <MaterialCommunityIcons
                                    name='format-font-size-increase'
                                    size='20'
                                    style={{color : theme.colors.primary}}
                                />
                            </Button>
                        </View>
                        <Text 
                            variant='bodyLarge' 
                            style={[
                                styles.postBody, 
                                {
                                    fontSize: size, 
                                    paddingTop: size >= 38 ? size - 26 : 10,
                                    lineHeight: size + 4
                                }
                            ]}
                            numberOfLines={10}
                        >
                            {route.params.post.body}
                        </Text>
                        <View style={styles.interact}> 
                            <View style={styles.intItems}>
                                <IconButton
                                    style = {styles.upArrowBtn}
                                    icon="arrow-up"
                                    iconColor = {color}
                                    size={20}
                                    onPress={handlePress}
                                />
                                <Text style={{color: color, fontSize: 16}}>
                                    {count}
                                </Text>
                            </View> 
                            <View style={styles.intItems}>
                                <Octicons name="comment" size={20} onPress={() => commRef.current.focus()} />
                                <Text style={{fontSize : 16, marginLeft: 12}}>
                                    {route.params.post.comments.length}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Divider />

                    <Divider />
                    <View style={styles.comments}>
                        <Text variant='titleMedium'>Comments</Text>
                        <ScrollView keyboardShouldPersistTaps='always'>
                            <TextInput
                                value={comment}
                                label='Comment'
                                placeholder="Enter comment"
                                mode='outlined'
                                onChangeText={nextValue => setComment(nextValue)}
                                // dense={true}
                                style={styles.newComm}
                                right={
                                    <TextInput.Icon 
                                        icon={() => <Feather name="send" size='20' />} 
                                        style={styles.commentBtn}
                                        onPress={insertComment}
                                        disabled={!comment}
                                    />
                                }
                                ref={commRef}
                            />
                        </ScrollView>
                        <Divider />
                        <View>
                            {route.params.post.comments ? renderComments : <></>}
                            <Divider />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        // backgroundColor: 'white',
        paddingTop: 0,
        width: '100%',
    },
    subModalContainer: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postHeader: {
        marginVertical: 10
    },
    postBody: {
        paddingTop: 10,
        paddingBottom: 20,
        minHeight: 200,
    },
    comments: {
        paddingVertical: 10
    },
    newComm: {
        marginVertical: 10,
        height: 30
    },
    comment: {
        marginVertical: 5
    },
    commentBtn: {
        marginTop: 13,
        marginRight: -20
    },
    header: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between'
    },
    scrollBody: {
        width: '100%',
        padding: 20,
        paddingTop: 0
    },
    username: {
        marginHorizontal: 4,
        marginVertical: 5
    },
    fSizeWrap: {
        flexDirection: 'row',
        alignItems: 'right',
        justifyContent: 'flex-end',
        marginTop: 5
    },
    fSize: {
        // height: 35,
        width: 50,
    },
    reply: {
        color: 'gray',
        fontWeight: '600',
        letterSpacing: -0.5
    },
    replyIpt: {
        height: 30,
        marginVertical: 5,
        fontSize: 14
    },
    replyWrap: {
        marginVertical: 5,
        marginLeft: 15
    },
    interact: {
        flexDirection: 'row',
        width: '80%',
        alignItems: 'center',
        marginLeft: -15,
        marginTop: 10,
        justifyContent: 'space-between'
    },
    intItems : {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
    },
    upArrowBtn: {
        marginRight: -1
    },
    time: {
        flexDirection: 'row',
        marginLeft: 4,
        marginTop: 5
    },
    timeText: {
        color: 'gray',
        fontSize: 12,
        fontWeight: '500'
    },
    subFoot: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
        // width: '60%',
        justifyContent: 'flex-start',
        marginLeft: 5
    },
    subFootLogo: {
        height: 20,
        width: undefined,
        marginRight: 5
    },
    commUserWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default PostViewScreen;