import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import PostViewScreen from './PostViewScreen';
import SchoolScreen from './SchoolScreen';
import EditPostScreen from './EditPostScreen';
import FeedScreen from './FeedScreen';
import ReportPostScreen from './ReportPostScreen';
import EditGroupScreen from './EditGroupScreen';
const HStack = createNativeStackNavigator();

const HomeStack = ({ navigation }) => {

    return (
        <HStack.Navigator initialRouteName='Home' screenOptions={{headerShown:false}}>
            <HStack.Screen name="Home" component={HomeScreen} />
            <HStack.Screen name="PostView" component={PostViewScreen} />
            <HStack.Screen name="EditPostScreen" component={EditPostScreen} />
            <HStack.Screen name="ReportPostScreen" component={ReportPostScreen} />
            <HStack.Screen name="School" component={SchoolScreen} />
            <HStack.Screen name="Feed" component={FeedScreen} />
            <HStack.Screen name="EditGroup" component={EditGroupScreen} />
        </HStack.Navigator>
    );
};

export default HomeStack;