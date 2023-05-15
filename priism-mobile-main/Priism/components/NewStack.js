import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewScreen from './NewScreen';
import PostScreen from './PostScreen';
import GroupScreen from './GroupScreen';

const NStack = createNativeStackNavigator();

const NewStack = ({ navigation }) => {
    return (
        <NStack.Navigator screenOptions={{headerShown:false}}>
            <NStack.Screen name="New" component={NewScreen} />
            <NStack.Screen name="Post" component={PostScreen} />
            <NStack.Screen name="Group" component={GroupScreen} />
        </NStack.Navigator>
    );
};

export default NewStack;