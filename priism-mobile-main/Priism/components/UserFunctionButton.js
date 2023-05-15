import { StyleSheet, View, Pressable, Text } from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./utils/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  arrayUnion,
  updateDoc
} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import React from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";

export default function Button({
  label,
  data
}) {
  const navigation = useNavigation();
  const theme = useTheme();

  function containsSpecialChars(str) {
    const specialChars = "[`!@#$%^&*()+-=[]{};':\"\\|,<>/?~]/";
    return specialChars
      .split("")
      .some((specialChar) => str.includes(specialChar));
  }

  const getUniversity = async (domain) => {
    try {
      const response = await fetch(
        "http://universities.hipolabs.com/search?domain=" + domain
      );
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error);
    }
  };

  //To redirect users when verification email link clicked
  let actionCodeSettings = {
    url: "https://priism-e69f0.firebaseapp.com",
    // iOS: {
    //    bundleId: 'com.example.ios'
    // },
    // android: {
    //   packageName: 'com.example.android',
    //   installApp: true,
    //   minimumVersion: '12'
    // },
    handleCodeInApp: true,
  };

  //save the user to the firestore collection
  async function writeUser(UID, username, email, universityId) {
    try {
      let result = ""; //the randomly generated number for user
      const numbers = "0123456789";
      let i = 0;
      while (i < 6) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        i++;
      }

      const userRef = doc(db, "users", UID);
      await setDoc(userRef, {
        UID: UID,
        username: username,
        email: email,
        university: universityId,
        groups: [universityId],
        date: new Date(),
        upvotedList: [""],
        blockedUsers: [""],
        notif: {requests: [], received: []},
        verificationCode: result
      });

      console.log("New user added with ID: ", userRef.id + "with random code: " + result);
      Alert.alert('Sign Up Successful', "Check your email for a verification code!", [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  //sends the email verification - NOT USING ANYMORE
  async function verify(temp) {
    try {
      await sendEmailVerification(temp, actionCodeSettings);
      console.log("success")
    } catch (e) {
      console.error("Error sending verfication email", e);
    }
  }

  async function addToGroup(userId, universityId) {
    try {
      // console.log(universityId + "!!!!");
      const groupRef = doc(db, "groups", universityId);
      console.log(groupRef.id + "!!!!!");
      await updateDoc(groupRef, {
        users: arrayUnion(userId),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const createAccount = async () => {
    const username = data[0];
    const email = data[1];
    const password = data[2];
    const usernameExists = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const usernameSnapshot = await getDocs(usernameExists);

    //Input conditions
    if (!usernameSnapshot.empty) {
      alert("Username taken.");
      return;
    }
    let university = await getUniversity(email.split("@")[1]); //get university name
    if (university.length == 0 || email.includes(" ")) {
      alert("Invalid school email.");
      return;
    }
    if (
      username.length > 16 ||
      containsSpecialChars(username) ||
      username.includes(" ")
    ) {
      alert(
        "Username must be less than 16 characters and must not include spaces or special characters."
      );
      return;
    }

    console.log(university[0].name);
    const q = query(
      collection(db, "groups"),
      where("key", "==", university[0].name)
    );
    const querySnapshot = await getDocs(q);
    let universityId = "";
    querySnapshot.forEach((d) => {
      universityId = d.id;
    });

    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      writeUser(
        user.user.uid,
        username,
        user.user.email,
        universityId,
      )
        // .then(() => {
        //   verify(user.user);
        // })
        .then(() => {
          console.log("hereee");
          addToGroup(user.user.uid, universityId);
        })
        .then(() => {
          auth.signOut();
          navigation.replace('LoginScreen');
        });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Pressable 
        style={[styles.button, {
          backgroundColor : !data[0] || !data[1] || !data[2] ? 
            'rgb(149,171,253)' : theme.colors.primary
          }]} 
          onPress={createAccount}
          disabled={!data[0] || !data[1] || !data[2]}
        >
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles from previous step remain unchanged.
  buttonContainer: {
    width: '90%',
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  button: {
    width: "100%",
    height: 40,
    padding: 0,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: 'white'
  },
});
