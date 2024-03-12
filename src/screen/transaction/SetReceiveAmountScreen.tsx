import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, NativeSyntheticEvent, TextLayoutEventData, StyleProp, TextStyle, Platform, StyleSheet } from 'react-native';
import { VirtualKeyboard } from 'react-native-screen-keyboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation ,useRoute} from '@react-navigation/native';
import { addReceiveAmount, setSelectCurrencyType } from '../../redux/wallet/walletSlice';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import BottomButton from '../component/BottomButton';
import { HomeScreenNavigationProp } from '../../navigation/types';
type RootState = ReturnType<typeof store.getState>;



export default function SetReceiveAmountScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const dispatch = useDispatch();
    const [disabled, setDisabled] = useState(true)
    const [amount, setAmount] = useState('')
    const [maxDigit, setMaxDigit] = useState(6)
    const [characters, setCharacters] = useState([] as string[])

    const { showActionSheetWithOptions } = useActionSheet();

    const selectCurrencyType = useSelector((state: RootState) => {
        return state.walletState.selectCurrencyType;
    });

    useEffect(() => {
        console.log("组件挂载完之后执行SetReceiveAmountScreen");
        onKeyDown('0')
        return () => {
            console.log("组件卸载完之后执行SetReceiveAmountScreen");
        }
    }, []);
    const addWord = (value: string) => {
        let array = characters
        array.push(value)
        setCharacters(array)
    }

    const popWord = () => {
        let array = characters
        array.pop()
        setCharacters(array)
    }
    const formatCurrency = (characters: string[]) => {
        let index = characters.indexOf('.')
        var count = 3
        var newArray: string[] = []
        if (index >= 0) {
            let dArray = characters.slice(0, index)
            let xArray = characters.slice(index)
            for (var i = 0; i < dArray.length; i++) {
                newArray.unshift(dArray[dArray.length - 1 - i])

                count -= 1
                if (count == 0 && i < dArray.length - 1) {
                    newArray.unshift(',')
                    count = 3
                }
            }
            newArray = newArray.concat(xArray)
        } else {
            for (var i = 0; i < characters.length; i++) {
                newArray.unshift(characters[characters.length - 1 - i])
                count -= 1
                if (count == 0 && i < characters.length - 1) {
                    newArray.unshift(',')
                    count = 3
                }
            }
        }
        return newArray
    }

    const onKeyDown = (value: string) => {
        console.log(value)
        if (value == "back") {//回退
            let str = characters.join('')
            if (characters.length > 1) {
                popWord()
            } else if (str != '0') {
                popWord()
                addWord('0')
            }
        } else if (value == "custom") {//小数点
            let hasDot = characters.indexOf('.') >= 0
            if (!hasDot) {
                addWord('.')
            }
        } else {//数字
            if (characters.length == 1 && characters[0] == '0') {
                popWord()
            }
            let index = characters.indexOf('.')
            if (index >= 0) {
                if (characters.length - index - 1 < maxDigit) {
                    addWord(value)
                }
            } else {
                addWord(value)
            }
        }
        let str1 = formatCurrency(characters).join('')
        setAmount(str1)
        setDisabled(!validAmount(characters))

    }

    const validAmount = (characters: string[]) => {
        let array = characters.filter((item)=>{
            return item != '0' && item != '.'
        })
        return array.length > 0
    }

    const okAction = () => {
        console.log(amount)
        let index = characters.indexOf('.')
        let count = 0
        if (index >= 0) {

        }
        // dispatch(addReceiveAmount({ amount: amount, count: count }))
        // navigation.goBack()
        navigation.navigate({
            name: 'QRCode',
            params: { amount: amount },
            merge: true
        });
    }

    const onChangeCurrency = () => {
        const options = ['人民币', '美元', '取消'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions({
            options,
            cancelButtonIndex,
            title: '选择显示的法币单位',
            cancelButtonTintColor: 'red',
        }, (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    dispatch(setSelectCurrencyType({ id: 'CNY', name: '人民币' }))
                    break;

                case 1:
                    dispatch(setSelectCurrencyType({ id: 'USD', name: '美元' }))
                    break;

                case cancelButtonIndex:
                // Canceled
            }
        });
    }

    const backgroundColor = disabled ? "#e8e8e8" : "#333333"
    const okColor = disabled ? "#999999" : "white"
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.amount}>
                            <Text allowFontScaling={true}
                                numberOfLines={1}
                                style={{ fontSize: 50, color: '#333333' }}
                                adjustsFontSizeToFit={true}
                            >
                                {amount} {route.params?.network}
                            </Text>
                        </View>
                        {/* <View style={styles.arrow}>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log("ok")
                                }}>
                                <Ionicons name={"swap-vertical"} size={25} color="#333333" />
                            </TouchableOpacity>
                        </View> */}
                    </View>
                    {/* <View style={{ flexDirection: 'row', marginTop: 15 }}>
                        <Text style={{ fontSize: 18, color: '#999999' }}>{amount} {selectCurrencyType?.id}</Text>
                        <TouchableOpacity
                            onPress={onChangeCurrency}>
                            <Ionicons name={"caret-down-outline"} size={20} color="#333333" />
                        </TouchableOpacity>
                    </View> */}
                </View>

            </View>
            <VirtualKeyboard
                keyboardStyle={{
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                    paddingHorizontal: 10,
                    height: 220
                }}
                keyStyle={{
                    borderRightWidth: 0,
                    borderBottomWidth: 0
                }}
                onKeyDown={onKeyDown}
                keyboardCustomKeyImage={<Ionicons name={"ellipse"} size={5} color="#333333" />}
                keyboardCustomBackKey={<Ionicons name={"backspace-outline"} size={25} color="#333333" />}
            />
            {BottomButton({disabled:disabled,title:'确定',onPress:okAction})}
        </View>
    );
}
const styles = StyleSheet.create({
    amount: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 70
    },
    arrow: {
        marginRight: 10,
        borderRadius: 20,
        height: 40,
        width: 40,
        backgroundColor: '#eeeeee',
        justifyContent: 'center',
        alignItems: 'center'
    },

});
