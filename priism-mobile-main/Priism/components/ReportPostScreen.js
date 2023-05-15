import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc, arrayRemove, arrayUnion} from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
const ReportPostScreen = ({ navigation, route }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  console.log(route.params.post.title)
  const handleOptionPress = (option) => {
    const isSelected = selectedOptions.includes(option);
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert('Please select at least one option');
      return;
    }
  
    try {
        const docRef = doc(collection(db, "reports"));
        const reportData = {
          body: route.params.post.body,
          date: new Date(),
          title: route.params.post.title,
          postID: route.params.post.postID,
          selectedOptions: selectedOptions,
          additionalDetails: additionalDetails,  
        };
        await setDoc(docRef, reportData);
        Alert.alert("Successfully Reported");
        navigation.goBack();
      } catch (e) {
        console.error("Error adding document: ", e);
      }

  };
  
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.heading}>Report this post</Text>
        </View>

      <TouchableOpacity
        style={[styles.optionButton, selectedOptions.includes("It's rude, vulgar, or uses bad language<") && styles.selectedOptionButton]}
        onPress={() => handleOptionPress("It's rude, vulgar, or uses bad language<")}
      >
        <Text style={styles.optionText}>It's rude, vulgar, or uses bad language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, selectedOptions.includes("It's sexually explicit") && styles.selectedOptionButton]}
        onPress={() => handleOptionPress("It's sexually explicit")}
      >
        <Text style={styles.optionText}>It's sexually explicit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, selectedOptions.includes("It's harrassment or hate speech") && styles.selectedOptionButton]}
        onPress={() => handleOptionPress("It's harrassment or hate speech")}
      >
        <Text style={styles.optionText}>It's harrassment or hate speech</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, selectedOptions.includes("It's threatening, violent, or suicidal") && styles.selectedOptionButton]}
        onPress={() => handleOptionPress("It's threatening, violent, or suicidal")}
      >
        <Text style={styles.optionText}>It's threatening, violent, or suicidal</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Additional details (optional)"
        value={additionalDetails}
        onChangeText={setAdditionalDetails}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  selectedOptionButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#333',
  },
  optionText: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ReportPostScreen;
