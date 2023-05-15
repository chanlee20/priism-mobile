import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text, Appbar, useTheme, HelperText } from 'react-native-paper';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "./utils/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";

const UpdatePWScreen = ({ navigation }) => {
    const [currPW, setCurrPW] = useState('');
    const [newPW, setNewPW] = useState('');
    const [checkPW, setCheckPW] = useState('');

    const theme = useTheme();
    const auth = getAuth();
    const user = auth.currentUser;

    async function updatePW() {
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currPW
            );
    
            reauthenticateWithCredential(user, credential)
                .then(() => {
                    updatePassword(user, checkPW)
                        .then(() => {
                            alert("Successfully updated password.");
                            navigation.goBack();
                        })
                        .catch((err) => {
                            console.error(err);
                            alert("Error updating password. Please try again later.");
                        })
                })
                .catch((err) => {
                    console.error(err);
                    alert("Error updating password. Please try again later.");
                });
        } catch(err) {
            console.error(err);
            alert("Error updating password. Please try again later.");
        }
    }

    return (
        <View style={{flex:1}}>
            <Appbar.Header>
                <Appbar.Action
                    icon={(props) => <Ionicons {...props} name="ios-chevron-back" />}
                    onPress={() => navigation.goBack()}
                />
                <Appbar.Content title="Reset Password" style={styles.headerText} />
            </Appbar.Header>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView style={styles.container}>
                    <View style={styles.inputWrap}>
                        <TextInput 
                            mode='outlined'
                            label='Current Password'
                            placeholder='Enter Current Password'
                            value={currPW}
                            onChangeText={setCurrPW}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TextInput 
                            mode='outlined'
                            label='New Password'
                            placeholder='Enter New Password'
                            value={newPW}
                            onChangeText={setNewPW}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TextInput 
                            mode='outlined'
                            label='Confirm Password'
                            placeholder='Confirm New Password'
                            value={checkPW}
                            onChangeText={setCheckPW}
                            secureTextEntry
                            style={styles.input}
                            activeOutlineColor={(newPW !== checkPW) && checkPW ? theme.colors.error : theme.colors.primary}
                        />
                        <HelperText type='error' visible={(newPW !== checkPW) && checkPW} style={styles.helpertext}>
                            Password does not match.
                        </HelperText>
                    </View>
                    <View style={styles.buttonWrap}>
                        <Button
                            mode='contained'
                            disabled={(newPW !== checkPW) || !(currPW && newPW && checkPW)}
                            onPress={updatePW}
                        >
                            Save
                        </Button>
                        <Button
                            textColor={theme.colors.secondary}
                            style={{marginLeft : 10}}
                            onPress={() => navigation.goBack()}
                        >
                            Cancel
                        </Button>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    headerText: {
        alignItems: "left",
        marginLeft: -5,
    },
    inputWrap: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
    },
    input: {
        width: '90%',
        marginVertical: 5,
    },
    helpertext: {
        alignSelf: 'left',
        marginLeft: 15,
        marginTop: -5,
    },
    buttonWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 15
    },
});

export default UpdatePWScreen;