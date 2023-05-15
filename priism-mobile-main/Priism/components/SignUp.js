import { StyleSheet, StatusBar, View, KeyboardAvoidingView, Image } from "react-native";
import { Text, TextInput, useTheme } from 'react-native-paper';
import Button from "./UserFunctionButton";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";


const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const navigation = useNavigation();
  const theme = useTheme();

  const switchToLoginPage = () => {
    navigation.replace("LoginScreen");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.logoWrap}>
        {/* <Text variant="displaySmall">Priism</Text> */}
        <Image 
          source={require('../images/textlogos/Priism-Text.png')} 
          style={{ 
            height: 50,
            width: undefined,
            aspectRatio: 8174 / 2727
          }} 
        />
      </View>
      <View style={styles.headerWrap}>
        <Text variant="headlineSmall" style={styles.headerText}>Sign up to see what your friends at colleges are talking about.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          mode='outlined'
          label='Username'
          style={styles.input}
          onChangeText={(newUsername) => setUsername(newUsername)}
          value={username}
          placeholder="Username"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          mode='outlined'
          label='Email'
          style={styles.input}
          onChangeText={(newEmail) => setEmail(newEmail)}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          mode='outlined'
          label='Password'
          style={styles.input}
          onChangeText={(newPassword) => setPassword(newPassword)}
          secureTextEntry={secure}
          right={
            <TextInput.Icon
              icon={secure ? "eye" : "eye-off"}
              onPress={() => setSecure(!secure)}
              style={{ marginTop: 14 }}
            />
          }
          value={password}
          placeholder="Password"
        />
      </View>
      <Button label="Sign Up" data={[username, email, password]} />
      <View style={styles.loginWrap}>
        <Text style={{color : 'rgb(147,147,147)'}}>Have an account? </Text>
        <Text style={{color : theme.colors.secondary}} onPress={switchToLoginPage}>Log In</Text>
        <Text style={{color : 'rgb(147,147,147)'}}>.</Text>
      </View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  headerWrap: { 
    flexDirection : 'row',
    width: '85%', 
    alignItems : 'center', 
    justifyContent : 'center',
    marginTop: 10,
    marginBottom: 30
  },
  headerText: {
    fontWeight: '600',
    color: 'rgb(147,147,147)',
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 20
  },
  inputContainer: {
    width: '90%'
  },
  input: {
    backgroundColor: 'white',
    marginTop: 5,
    height: 40
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItem: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#7FEEFF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#7FEEFF',
    borderWidth: 2
  },
  buttonOutlineText: {
    color: '#7FEEFF',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  loginWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30
  }
})

export default SignUp;
