import { StyleSheet, View, Image } from 'react-native';
import { Text, Card, Divider, useTheme, IconButton } from 'react-native-paper';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { db } from "./utils/firebaseConfig"
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { logos } from '../images/logos/logos';
import getTime from '../getTime';

export default function PostCard(post) {
    const navigation = useNavigation();
    const [count, setCount] = useState(post.postObj.upvotes);
    const [hasUpvote, setHasUpvote] = useState(false);
    const [color, setColorBlue] = useState("black");
    const theme = useTheme();

    async function updateUpvoteCount(postId, vote) {
        
        try{
            const postRef = doc(db, "posts", postId);
            const auth = getAuth();
            const uid = auth.currentUser.uid;
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
                post.postObj.upvotes += vote;
                await updateDoc(postRef, { upvotes: post.postObj.upvotes });
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
            updateUpvoteCount(post.postObj.id, 1);
        } else {
            setHasUpvote(false);
            setColorBlue("black");
            setCount(count - 1);
            updateUpvoteCount(post.postObj.id, -1);
        }
    };

    useEffect(()=>{
        async function updatePostUpvote(postId) {
            const auth = getAuth();
            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);
            try{
                const userDoc = await getDoc(userRef);
                if(userDoc.exists()){              
                    if(userDoc.data().upvotedList != null && userDoc.data().upvotedList.includes(postId)){
                        setColorBlue(theme.colors.primary)
                        setHasUpvote(true)
                    }
                    else{
                        setHasUpvote(false)
                        setColorBlue("black")
                    }
                }
            }
            catch(e){
                console.log(e)
            }
        }
        async function fetchPostUpvotes(postId) {
            const postRef = doc(db, "posts", postId)
            try{
                const postDoc = await getDoc(postRef)
                if(postDoc.exists()){
                    setCount(postDoc.data().upvotes)
                }
                else{
                    setCount(0)
                }
            }
            catch(e){
                console.log(e)
            }
        }
        updatePostUpvote(post.postObj.id)
        fetchPostUpvotes(post.postObj.id)
    },[post.postObj.id, post.postObj]);

    return(
        <View style = {{flex:1, flexDirection:"row", marginBottom: 0}}>
            <Card 
                mode='outlined' 
                key={post.date} 
                style={styles.card} 
                onPress={() => navigation.navigate('PostView', {
                    post : post.postObj,
                    group : post.group
                })}
            >
                <View>
                    <Card.Title 
                        title = {post.postObj.title}
                        subtitle = {getTime(post.postObj.date)}
                        left={
                            Object.keys(logos).includes(post.postObj.group) ?
                                (props) => 
                                <Image 
                                    {...props} 
                                    source={logos[post.postObj.group].uri} 
                                    style={[styles.logo, {aspectRatio : logos[post.postObj.group].ratio}]} 
                                />
                                : null
                        }
                        right={
                            post.postObj.public ? 
                                null 
                                : (props) => <Ionicons {...props} name='ios-lock-closed' size='20' style={styles.lock} />
                        }
                        style={styles.title}
                        titleStyle={{ paddingTop : 3, fontWeight : '500' }}
                        subtitleStyle={styles.subtitle}
                    />        
                    <Divider style={styles.divider} />
                    <Card.Content style={{paddingTop:15, paddingBottom: 15}}>
                        <Text>
                            {post.postObj.body}
                        </Text>
                        <View style={styles.footer}>
                            <View style={styles.interact}> 
                                <View style={styles.intItems}>
                                    <IconButton
                                        style = {styles.upArrowBtn}
                                        icon="arrow-up"
                                        iconColor = {color}
                                        size={16}
                                        onPress={handlePress}
                                    />
                                    <Text style={{color: color, fontSize: 12}}>
                                        {count}
                                    </Text>
                                </View> 
                                <View style={styles.intItems}>
                                    <Octicons name="comment" size={16} />
                                    <Text style={{fontSize : 12, marginLeft: 12}}>
                                        {post.postObj.comments.length}
                                    </Text>
                                </View>
                            </View>
                            {
                                !Object.keys(logos).includes(post.postObj.group) ?
                                    post.postObj.group.includes('-') ?
                                        <View style={styles.subFoot}>
                                            <Image 
                                                source={logos[post.postObj.group.split('-')[0]].uri}
                                                style={[styles.subFootLogo, {aspectRatio : logos[post.postObj.group.split('-')[0]].ratio}]}
                                            />
                                            <Text style={styles.footText} numberOfLines={1}>{post.group.name}</Text>
                                        </View>
                                        : 
                                        <View style={styles.subFoot}>
                                            <Text style={styles.footText} numberOfLines={1}>{post.group.name}</Text>
                                        </View>
                                    : <></>
                            }
                        </View>
                    </Card.Content>
                </View>             
            </Card> 
        </View>
    )
}

const styles = StyleSheet.create({
    
    posttitle: {
        flex: 1,
        flexDirection: 'row',
        padding: 20
    },
    card: {
        flex: 10,
        width: "100%",
        height: "100%",
        margin: 2,
        paddingBottom: 5,
        marginBottom: 40
    },
    headerText: {
        alignItems: 'left',
        marginLeft: -30
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    interact: {
        flexDirection: 'row',
        width: '50%',
        alignItems: 'center',
        marginLeft: -15,
        marginBottom: -15,
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
    logo: {
        height: 30,
        width: undefined
    },
    lock: {
        marginRight: 10,
        color: 'gray'
    },
    title: {
        marginVertical: 0,
        paddingVertical: 0,
    },
    divider: {
        height : 0.8,
        backgroundColor: 'black',
    },
    subtitle: {
        marginTop: 0,
        color: 'gray',
        fontSize: 12,
        fontWeight: '500'
    },
    subFoot: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: '50%',
        justifyContent: 'flex-end'
    },
    subFootLogo: {
        height: 20,
        width: undefined,
        marginRight: 10
    },
    footText: {
        fontSize: 14,
        fontWeight: '600',
    }
});