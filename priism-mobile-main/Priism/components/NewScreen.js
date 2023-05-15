import React from "react";
import { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import PagerView from 'react-native-pager-view';
import GroupScreen from "./GroupScreen";
import PostScreen from "./PostScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const NewScreen = ({navigation}) => {
    const [header, setHeader] = useState('New Post');
    const [tabIndex, setTabIndex] = useState(0);
    const [scroll, setScroll] = useState(false);

    const theme = useTheme();

    const pagerRef = useRef(null);

    const headerTexts = ['New Post', 'Create Group'];

    function tabPressed (idx) {
        setScroll(false);
        tabPress(idx);
    }

    function tabPress (idx) {

        const newTab = Math.abs(tabIndex - 1);

        if (idx !== tabIndex) {
            setTabIndex(newTab);
            setHeader(headerTexts[newTab]);
            pagerRef.current.setPage(newTab);
        }
    };

    function updateStates(e) {
        if (scroll) {
            if (e != tabIndex) {
                setTabIndex(Math.abs(tabIndex - 1));
                setHeader(headerTexts[Math.abs(tabIndex - 1)]);
            }
        }
    };

    return (
        <View style={{flex:1}}>
            <Appbar.Header>
                <Appbar.Content title={header} titleStyle={{textAlign : 'center'}} />
            </Appbar.Header>
            <View style={styles.container}>
                <View style={styles.pagerTabs}>
                    <TouchableOpacity
                        style={
                            tabIndex === 0 ?
                                [styles.pagerTab, styles.pagerTabBorder, {borderBottomColor : theme.colors.primary}]
                                : styles.pagerTab
                        }
                        onPress={() => tabPressed(0)}
                    >
                        {
                            tabIndex === 0 ?
                                <MaterialCommunityIcons name='plus-box' size='20' style={{color : theme.colors.primary}} />
                                : <MaterialCommunityIcons name='plus-box-outline' size='20' />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={
                            tabIndex === 1 ?
                                [styles.pagerTab, styles.pagerTabBorder, {borderBottomColor : theme.colors.secondary}]
                                : styles.pagerTab
                        }
                        onPress={() => tabPressed(1)}
                    >
                        {
                            tabIndex === 1 ?
                                <MaterialCommunityIcons name='tag-plus' size='20' style={{color : theme.colors.secondary}} />
                                : <MaterialCommunityIcons name='tag-plus-outline' size='20' />
                        }
                    </TouchableOpacity>
                </View>
                <PagerView 
                    style={{flex:1}} 
                    initialPage={0}
                    onPageScrollStateChanged={() => setScroll(true)}
                    onPageSelected={(e) => updateStates(e)}
                    ref={pagerRef}
                >
                    <PostScreen />
                    <GroupScreen />
                </PagerView>
            </View>
        </View>
    );
};

export default NewScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: "white",
    },
    pagerTabs: {
        flexDirection: 'row',
        width: '100%'
    },
    pagerTab: {
        flexDirection: 'row',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 7,
        paddingTop: 5
    },
    pagerTabBorder: {
        borderBottomWidth: 1
    }
  });