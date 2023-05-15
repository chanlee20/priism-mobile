import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostViewScreen from './PostViewScreen';
import EditPostScreen from './EditPostScreen';

const EStack = createNativeStackNavigator();

const SearchStack = ({ navigation }) => {
    return (
        <EStack.Navigator screenOptions={{headerShown:false}}>
            <EStack.Screen name="PostViewScreen" component={PostViewScreen} />
            <EStack.Screen name="EditPostScreen" component={EditPostScreen} />
        </EStack.Navigator>
    );
};

export default SearchStack;