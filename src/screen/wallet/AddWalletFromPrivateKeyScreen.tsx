import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    Button,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    TextInput,
    FlatList,
    TouchableOpacity
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import BottomButton from '../component/BottomButton';
import nodejs from 'nodejs-mobile-react-native';


export default function AddWalletFromPrivateKeyScreen(): JSX.Element {

    const navigation = useNavigation()
    const [content, setContent] = useState('')
    const okAction = () => {
        nodejs.channel.post("addWalletFromPrivateKey", { privateKey: content })
    }
    
    useEffect(() => {
        console.log("组件挂载完之后执行");
        const listener = nodejs.channel.addListener("addWalletFromPrivateKeySuccess", (msg) => {
            const popAction = StackActions.pop(2);
            navigation.dispatch(popAction);
        })

        return () => {
            console.log("组件卸载完之后执行");
            listener.remove()
        }
    }, []);

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <TextInput
                
                    style={styles.input}
                    multiline={true}
                    onChangeText={text => {
                        setContent(text)
                    }}
                    onFocus={() => {

                    }}
                    placeholder='粘贴或输入私钥'
                    value={content}
                />
            </View>
            {BottomButton({ disabled: content.length == 0, title: '确定', onPress: okAction })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        height: 140,
        margin: 15,
        borderRadius: 5,
        textAlignVertical: 'top',
        padding:10
    },
    sectionContainer: {
        height: 120,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10
    },
    sectionTitle: {
        fontSize: 18,
        color: '#333333',
        marginBottom: 10
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

