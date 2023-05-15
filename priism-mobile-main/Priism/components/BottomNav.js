import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react';
import ProfileStack from './ProfileStack';
import HomeStack from './HomeStack';
import SearchStack from './SearchStack';
import NewStack from './NewStack';

const Tab = createBottomTabNavigator();

const tabPressListener = (props) => {
    const { navigation } = props;
    return {
        blur: (e) => {
            const target = e.target;
            const state = navigation.getState();
            const route = state.routes.find(r => r.key === target);
            // If we are leaving a tab that has its own stack navigation, then clear it
            if (route.state?.type === "stack" && route.state.routes?.length > 1) {
                navigation.dispatch(StackActions.popToTop());
            }
        }
    };
};

const BottomNav = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            initialRoutingName="home"
            screenOptions={{
                tabBarBackground: () => (
                    <View style={{ flex:1 }}>
                        <LinearGradient 
                            start={{ x:0, y:0 }}
                            end={{ x:1, y:0 }}
                            colors={[ theme.colors.accentOne, theme.colors.accentTwo ]}
                            style={{ height : 2.5 }}
                        />
                    </View>
                ),
                tabBarShowLabel: false,
                tabBarStyle: { 
                    backgroundColor : theme.colors.onPrimary,
                    height: 80
                }
            }}
        >
            <Tab.Screen 
                name="home" 
                component={HomeStack} 
                options={{
                    headerShown: false,
                    tabBarIcon: (tabInfo) => {
                        return (
                            tabInfo.focused ? <Ionicons name='home' size='24' /> : <Ionicons name='home-outline' size='24' />
                        );
                    }
                }}
                listeners={props => tabPressListener({ ...props })}
            />
            <Tab.Screen 
                name="search" 
                component={SearchStack} 
                options={{
                    headerShown: false,
                    tabBarIcon: (tabInfo) => {
                        return (
                            tabInfo.focused ? <Ionicons name='ios-search' size='24' /> : <Ionicons name='ios-search-outline' size='24' />
                        );
                    }
                }}
                listeners={props => tabPressListener({ ...props })}
            />
            <Tab.Screen 
                name="post" 
                component={NewStack} 
                options={{
                    headerShown: false,
                    tabBarIcon: (tabInfo) => {
                        return (
                            tabInfo.focused ? <MaterialCommunityIcons name='plus-box' size='24' /> : <MaterialCommunityIcons name='plus-box-outline' size='24' />
                        );
                    }
                }}
                listeners={props => tabPressListener({ ...props })}
            />
            <Tab.Screen 
                name="profile" 
                component={ProfileStack} 
                options={{
                    headerShown: false,
                    tabBarIcon: (tabInfo) => {
                        return (
                            tabInfo.focused ? <FontAwesome5 name='user-alt' size='20' /> : <FontAwesome5 name='user' size='20' />
                        );
                    }
                }}
                listeners={props => tabPressListener({ ...props })}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    profileHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

export default BottomNav;