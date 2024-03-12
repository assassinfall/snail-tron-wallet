import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, NativeSyntheticEvent, TextLayoutEventData, StyleProp, TextStyle, Platform, StyleSheet, Image } from 'react-native';
import { VirtualKeyboard } from 'react-native-screen-keyboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { setSelectCurrencyType } from '../../redux/wallet/walletSlice';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import BottomButton from '../component/BottomButton';
type RootState = ReturnType<typeof store.getState>;
import Toast from 'react-native-root-toast';

export default function SetSendAmountScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [disabled, setDisabled] = useState(true)
    const [amountText, setAmountText] = useState('')
    const [maxDigit, setMaxDigit] = useState(6)
    const [characters, setCharacters] = useState([] as string[])

    const { showActionSheetWithOptions } = useActionSheet();

    const selectCurrencyType = useSelector((state: RootState) => {
        return state.walletState.selectCurrencyType;
    });
    const selectWallet = useSelector((state: RootState) => {
        return state.walletState.selectWallet;
    });

    const selectAccount = useSelector((state: RootState) => {
        return state.walletState.selectAccount;
    });

    const balance = useSelector((state: RootState) => {
        return state.walletState.balance;
    });

    useEffect(() => {
        console.log("组件挂载完之后执行");
        onKeyDown('0')
        console.log(route.params)
        return () => {
            console.log("组件卸载完之后执行");
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

        setAmountText(formatCurrency(characters).join(''))
        setDisabled(!validAmount(characters))

    }
    const showToast = (msg: string) => {
        Toast.show(msg, {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
        });
    }

    const validAmount = (characters: string[]) => {
        let array = characters.filter((item) => {
            return item != '0' && item != '.'
        })
        return array.length > 0
    }

    const okAction = () => {
        const amount = Number(characters.join(''))
        console.log(amount)
        const walletBalance = route.params?.network == 'TRX' ? balance?.trxBalance ?? 0 : balance?.usdtBalance ?? 0
        if (walletBalance <= 0 || walletBalance < amount) {
            showToast('账户余额不足!')
            return
        }
        navigation.navigate('SendConfirm', { ...route.params, amount: amount })
    }

    const setMaxAmount = () => {
        const amount = route.params?.network == 'TRX' ? balance?.trxBalance ?? 0 : balance?.usdtBalance ?? 0
        console.log(amount)
        const chars = String(amount).split('')
        setCharacters(chars)
        setAmountText(formatCurrency(chars).join(''))
        setDisabled(!validAmount(chars))
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

    const backgroundColor = disabled ? "#ebebeb" : "#333333"
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
                                {amountText} {route.params?.network}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', marginHorizontal: 20, borderRadius: 5, height: 60, paddingHorizontal: 10 }}>
                {
                    route.params?.network == 'TRX' ?
                        <Image source={require('./../../assets/trx.png')} style={{ width: 35, height: 35 }} />
                        :
                        <Image source={require('./../../assets/usdt.png')} style={{ width: 35, height: 35 }} />
                }

                <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
                    <Text style={{ fontSize: 12 }}>余额</Text>
                    <Text style={{ color: '#333333' }}>{route.params?.network == 'TRX' ? balance?.trxBalance : balance?.usdtBalance} {route.params?.network}</Text>
                </View>
                <TouchableOpacity onPress={setMaxAmount} style={{ backgroundColor: '#f2f2f2', alignItems: 'center', borderRadius: 10, height: 20, width: 40 }}>
                    <Text>最大</Text>
                </TouchableOpacity>
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
            {BottomButton({ disabled: disabled, title: '确定', onPress: okAction })}
        </View>
    );
}
const styles = StyleSheet.create({
    amount: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 20,
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
    confirm: {
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
