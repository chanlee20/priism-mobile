import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme, Text, Appbar } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getDoc, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { db } from "./utils/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";

const VerifyCode = () => {
  const [value, setValue] = useState("");
  const [checkCode, setCheckCode] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");

  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const navigation = useNavigation();
  const theme = useTheme();
  const auth = getAuth();
  const currentUserUID = auth.currentUser.uid;

  // UID, username, email, universityId
  useEffect(() => {
    async function userInfoFetch() {
      const getUser = doc(db, "users", currentUserUID);
      const userSnap = await getDoc(getUser);
      setUsername(userSnap.get("username"));
      setEmail(userSnap.get("email"));
      setUniversity(userSnap.get("university"));
      setCheckCode(userSnap.get("verificationCode"));
    }
    userInfoFetch();
  }, []);

  const handleVerify = async () => {
    try {
      const getUser = doc(db, "users", currentUserUID);
      if (checkCode == value) {
        await updateDoc(getUser, {
          verificationCode: "isVerified",
        });
        Alert.alert("Verified!", "Your email has been verified successfully", [
          {
            text: "OK",
            onPress: () => navigation.replace("BottomNav"),
          },
        ]);
      } else {
        alert("Wrong Verification Code");
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const resendEmail = async () => {
    try {
      await deleteDoc(doc(db, "users", currentUserUID));
      writeUser(currentUserUID, username, email, university);
    } catch (e) {
      console.log(e);
    }
  };

  async function writeUser(UID, username, email, universityId) {
    try {
      //generate random number for email verification
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
        verificationCode: result,
      });

      console.log(
        "New user added with ID: ",
        userRef.id + "with random code: " + result
      );
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  function handleBack() {
    auth.signOut();
    navigation.replace("LoginScreen");
  }

  return (
    <View
      styles={[styles.container, { backgroundColor: theme.colors.onPrimary }]}
    >
      <Appbar.Header>
        <Appbar.Action
          icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
          onPress={handleBack}
        />
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={[styles.content, { backgroundColor: theme.colors.onPrimary }]}
          behavior="padding"
        >
          <View style={styles.inputContainer}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../images/textlogos/Priism-Text.png")}
                style={{
                  height: 40,
                  width: undefined,
                  aspectRatio: 8174 / 2727,
                }}
              />
            </View>
            <Text variant="titleLarge" style={styles.titleText}>
              Verify account to Log In.
            </Text>
            <CodeField
              ref={ref}
              {...props}
              caretHidden={true}
              value={value}
              onChangeText={setValue}
              cellCount={6}
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              rootStyle={styles.inputContainer}
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  onLayout={getCellOnLayoutHandler(index)}
                  style={[
                    styles.cell,
                    isFocused && { borderColor: theme.colors.primary },
                  ]}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
          </View>

          {/* Verify if code is right */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleVerify}
              style={[
                styles.button,
                styles.buttonText,
                {
                  backgroundColor:
                    value.length !== 6
                      ? "rgb(149,171,253)"
                      : theme.colors.primary,
                },
              ]}
              disabled={value.length !== 6}
            >
              <Text variant="bodySmall" style={styles.buttonText}>
                Verify
              </Text>
            </TouchableOpacity>

            <View style={styles.section}>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgb(219,219,219)",
                }}
              />
              <Text style={styles.sectionText}>OR</Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgb(219,219,219)",
                }}
              />
            </View>
            {/* Send Verification Code Again */}
            <View style={styles.signupWrap}>
              <Text style={{ color: "rgb(147,147,147)" }}>
                Didn't get the email?
              </Text>
              <Text
                style={{ color: theme.colors.secondary }}
                onPress={resendEmail}
              >
                {" "}
                Send Email Again
              </Text>
              <Text style={{ color: "rgb(147,147,147)" }}>.</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default VerifyCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    height: "95%",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    marginTop: -50,
  },
  titleText: {
    fontWeight: "600",
    textAlign: "center",
    marginTop: 25,
    marginBottom: 25,
  },
  inputContainer: {
    width: "85%",
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
    marginTop: 5,
    height: 40,
  },
  buttonContainer: {
    width: "90%",
    justifyContent: "center",
    alignItem: "center",
    marginTop: 50,
  },
  button: {
    width: "100%",
    padding: 0,
    borderRadius: 5,
    alignItems: "center",
    height: 40,
    justifyContent: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#7FEEFF",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#7FEEFF",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    marginVertical: 50,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    justifyContent: "center",
  },
  sectionText: {
    color: "rgb(147,147,147)",
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 15,
  },
  signupWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    width: 40,
    height: 50,
    lineHeight: 45,
    fontSize: 28,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "black",
    textAlign: "center",
  },
});
