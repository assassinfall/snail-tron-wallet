import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import BottomButton from '../component/BottomButton';
import nodejs from "nodejs-mobile-react-native";
import Spinner from 'react-native-loading-spinner-overlay';


export default function AddWalletFromSeedScreen(): JSX.Element {

    const navigation = useNavigation()
    const [content, setContent] = useState('')
    const [valid, setValid] = useState(true)
    const [spinner, setSpinner] = useState(true)
    const okAction = () => {

        // navigation.goBack()
        const arr = content.split(" ")
        let ok = arr.length == 12
        setValid(ok)
        if (ok) {
            nodejs.channel.post("addWalletFromSeed", { seed: content })
        }

    }


    useEffect(() => {
        console.log("组件挂载完之后执行");
        const listener = nodejs.channel.addListener("addWalletFromSeedSuccess", (msg) => {
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
                        setValid(true)
                    }}
                    placeholder='请输入助记词,空格隔开'
                    value={content}
                />
                {!valid ? <Text style={{ color: 'red', marginLeft: 15 }}>助记词格式错误</Text> : null}
            </View>
            {BottomButton({ disabled: content.length == 0, title: '确定', onPress: okAction })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        height: 140,
        margin: 15,
        borderRadius: 5,
        textAlignVertical: 'top',
        padding: 10
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

