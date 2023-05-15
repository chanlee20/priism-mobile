import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostViewScreen from './PostViewScreen';
import ProfileScreen from './ProfileScreen';
import SchoolScreen from './SchoolScreen';
import SettingsScreen from './SettingsScreen';
import EditPostScreen from './EditPostScreen';
import FeedScreen from './FeedScreen';
import InboxScreen from './InboxScreen';

import Admin from './Admin';
import AdminUserAction from './AdminUserAction';
import UpdatePWScreen from './UpdatePWScreen';
import ReportPostScreen from './ReportPostScreen';
import EditGroupScreen from './EditGroupScreen';

const ProfStack = createNativeStackNavigator();

const ProfileStack = ({ navigation }) => {
    return (
        <ProfStack.Navigator initialRouteName='Profile' screenOptions={{headerShown:false}}>
            <ProfStack.Screen name="Profile" component={ProfileScreen} />
            <ProfStack.Screen name="Settings" component={SettingsScreen} />
            <ProfStack.Screen name="PostView" component={PostViewScreen} />
            <ProfStack.Screen name="School" component={SchoolScreen} />
            <ProfStack.Screen name="EditPostScreen" component={EditPostScreen} />
            <ProfStack.Screen name="ReportPostScreen" component={ReportPostScreen} />
            <ProfStack.Screen name="Feed" component={FeedScreen} />
            <ProfStack.Screen name="AdminPage" component={Admin} />
            <ProfStack.Screen name="AdminUserAction" component={AdminUserAction} />
            <ProfStack.Screen name="UpdatePW" component={UpdatePWScreen} />
            <ProfStack.Screen name="EditGroup" component={EditGroupScreen} />
            <ProfStack.Screen name="Inbox" component={InboxScreen} />
        </ProfStack.Navigator>
    );
};

export default ProfileStack;