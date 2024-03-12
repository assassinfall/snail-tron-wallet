import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Button,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    LayoutAnimation,
    UIManager
} from 'react-native';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { State, WalletModel, WalletAccountModel, AccountAddedType } from "../../redux/wallet/walletModel.js"
import store from "../../redux/store.js";
import { addWalletAccountAction, loadWalletAction } from '../../redux/wallet/walletSlice';
import BottomButton from '../component/BottomButton';


type RootState = ReturnType<typeof store.getState>;


if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ReceiveAddressScreen(): JSX.Element {

    const wallets = useSelector((state: RootState) => {
        var w = state.walletState.wallets.filter((wallet) => {
            return (wallet.index != state.walletState.selectWallet?.index) || (wallet.accounts.length > 1)
        })
        return w;
    });

    const selectWallet = useSelector((state: RootState) => {
        return state.walletState.selectWallet;
    });

    const selectAccount = useSelector((state: RootState) => {
        return state.walletState.selectAccount;
    });
    const route = useRoute()
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const [selectIndexs, setSelectIndexs] = useState([] as number[]);
    const [valid, setValid] = useState(false)
    const [address, setAddress] = useState('')
    useEffect(() => {

        navigation.setOptions({
            title: '接收地址',
        });
        console.log("组件挂载完之后执行");

        const loadWalletsListener = nodejs.channel.addListener("loadWallets", (wallets) => {
            dispatch(loadWalletAction(wallets))
        })

        const checkAddressListener = nodejs.channel.addListener("checkAddressResult", (valid) => {
            setValid(valid)
        })


        nodejs.channel.post("loadWallets")
        return () => {
            console.log("组件卸载完之后执行");
            loadWalletsListener.remove()
            checkAddressListener.remove()
        }
    }, [navigation]);


    // header点击
    const itemTap = (index: number) => {

        var newIndexs = selectIndexs.filter((selectIndex) => {
            return selectIndex != index
        })
        if (selectIndexs.indexOf(index) == -1) {
            newIndexs.push(index)
        }
        LayoutAnimation.easeInEaseOut();
        setSelectIndexs(newIndexs)
        // this.setState({
        //   selectIndexs: newIndexs
        // })
        // this.changeValue+=180;
        // Animated.timing(                  // Animate over time
        //     this.state.rotateValue,            // The animated value to drive
        //     {
        //       toValue: this.changeValue,                   // Animate to opacity: 1 (opaque)
        //       duration: 400,              // Make it take a while
        //     }
        //   ).start(()=>

        //    this.state.rotateValue.setValue(this.changeValue)
        //   ); 
    }
    const renderAccount = (wallet: WalletModel, account: WalletAccountModel, accountIndex: number) => {
        return (
            <TouchableOpacity
                key={accountIndex}
                style={styles.listSubItemTouch}
                onPress={() => {
                    // navigation.navigate('SendConfirm', { name: wallet.name + " - " + account.name, address: account.address, network: route.params?.network })
                    navigation.navigate('SendAmount', { ...route.params,name: wallet.name + " - " + account.name,address:account.address})
                }}
            >
                <Text style={{ fontSize: 16, color: '#333333' }}>
                    {account.name}
                </Text>
                <Text style={{ fontSize: 12, marginTop: 5, color: '#999999' }}>
                    {account.address}
                </Text>
            </TouchableOpacity>
        )
    }

    const scanButton = () => {
        return (
            <TouchableOpacity
                style={{ marginHorizontal: 10 }}
                onPress={() => {
                    navigation.navigate('QRcodeScan')
                }}>
                <Ionicons name={"scan-outline"} size={20} color="black" />

            </TouchableOpacity>
        )
    }
    // 渲染FlatList的item
    const renderItem = (item: WalletModel) => {
        const text = item.name
        return (
            <View style={styles.list}>
                <TouchableOpacity
                    style={styles.listItemTouch}
                    activeOpacity={0.6}
                    onPress={() => { itemTap(item.index) }}
                >
                    <Text
                        style={styles.listItemText}
                    >
                        {text}
                    </Text>
                    {
                        selectIndexs.indexOf(item.index) == -1 ?
                            <Ionicons name={"chevron-up-outline"} size={15} color="#333333" />
                            :
                            <Ionicons name={"chevron-down-outline"} size={15} color="#333333" />
                    }

                </TouchableOpacity>

                {selectIndexs.indexOf(item.index) == -1 ?
                    <View>
                        {
                            item.accounts.filter((subItem) => {
                                return (item.index != selectWallet?.index) || (item.index == selectWallet.index && subItem.index != selectAccount?.index)
                            }).map((subItem, subItemIndex) => {
                                return renderAccount(item, subItem, subItemIndex)
                            })
                        }
                    </View> : null}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.search}>
                <TextInput
                    style={{ flex: 1, marginLeft: 2 }}
                    keyboardType='email-address'
                    onChangeText={text => {
                        setAddress(text)
                        nodejs.channel.post('checkAddress', { address: text })
                    }}
                    placeholder='请输入钱包地址'
                    value={address}
                />
                {scanButton()}
            </View>

            <FlatList
                style={styles.flatList}
                keyExtractor={item => '' + item.index}
                data={wallets}
                renderItem={({ item }) => renderItem(item)}
            />
            {
                BottomButton({
                    disabled: address.length == 0 || !valid,
                    title: '下一步',
                    onPress: () => {
                        // navigation.navigate('SendConfirm', {address: address, network: route.params?.network })
                        navigation.navigate('SendAmount', { ...route.params,address:address})
                    }
                })
            }
        </View>
    );
}

// const windowW = Dimensions.get('window').width;


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    flatList: {
        flex: 1,
        backgroundColor: 'white'
    },
    list: {
        borderRadius: 0,
    },
    search: {
        backgroundColor: 'white',
        height: 40,
        margin: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eeeeee',
        flexDirection: 'row',
        alignItems: 'center'
    },
    listItemTouch: {
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#eeeeee',
        marginTop: -1
    },
    listItemText: {
        flex: 1,
        fontSize: 13,
        color: '#333333'
    },
    listSubItemTouch: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        paddingVertical: 10,
        borderBottomColor: '#eeeeee',
        borderBottomWidth: 1
    },
});
