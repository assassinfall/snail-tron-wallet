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
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { State, WalletModel, WalletAccountModel, AccountAddedType } from "../../redux/wallet/walletModel.js"
import store from "../../redux/store.js";
import { addWalletAccountAction, loadWalletAction, changeCurrentWallet } from '../../redux/wallet/walletSlice';
import HttpClient from '../../http/HttpClient';
import { timestampToTime } from '../../utils/Util.js';
type RootState = ReturnType<typeof store.getState>;

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TokenInfo = {
    symbol: string,
    address: string,
    decimals: number,
    name: string,
}
type TransactionUSDTInfo = {
    transaction_id: string,
    token_info: TokenInfo,
    from: string,
    to: string,
    type: string,
    value: number,
    block_timestamp: number,
}


type TransactionInfo = {
    txID: string,
    net_usage: number,
    net_fee: number,
    energy_usage: number,
    blockNumber: number,
    block_timestamp: number,
    energy_fee: number,
    energy_usage_total: number,
    ret: TransactionRetInfo[]
}

type TransactionRetInfo = {
    contractRet: string,
    fee: number,
}
function GetTRanscationHistoryScreen(): JSX.Element {

    const wallets = useSelector((state: RootState) => {
        return state.walletState.wallets;
    });

    const selectWallet = useSelector((state: RootState) => {
        return state.walletState.selectWallet;
    });

    const selectAccount = useSelector((state: RootState) => {
        return state.walletState.selectAccount;
    });
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const [selectIndexs, setSelectIndexs] = useState([] as number[]);
    const [list, setList] = useState([] as TransactionUSDTInfo[])
    const [noData, setNoData] = useState(false)
    useEffect(() => {
        navigation.setOptions({
            title: "交易查询",
        });
        loadData()
        return () => {
            console.log("组件卸载完之后执行");
        }
    }, []);

    const loadData = async () => {

        try {
            const res = await HttpClient.getRequest("https://api.trongrid.io/v1/accounts/" + selectAccount?.address + "/transactions/trc20")
            setList(res.data)
            if (res.data.length == 0) {
                setNoData(true)
            }
        } catch (error) {
            console.log(error)
        }

    }

    const renderItem = (item: TransactionUSDTInfo) => {
        const itemColor = item.from == selectAccount?.address ? 'tomato' : 'green'
        return (
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={{ fontSize: 12, width: 200, color: '#333333' }} ellipsizeMode="middle" numberOfLines={1}>{item.from}</Text>
                    <Text style={[{ fontSize: 16 }, { color: itemColor }]}>{item.from == selectAccount?.address ? '支出' : '收入'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={[{ fontSize: 13 }]}>已确认</Text>

                    <Text style={{ fontSize: 12, color: '#333333' }}>金额 {item.value / 1000000.0} {item.token_info.symbol}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={{ fontSize: 10, width: 200 }} ellipsizeMode="middle" numberOfLines={1}> 目标账户:{item.to}</Text>
                    <Text style={{ fontSize: 10 }}>{timestampToTime(item.block_timestamp)}</Text>

                </View>


            </View>
        );
    }

    return (
        <View style={styles.container}>
            {
                !noData ?
                    <FlatList
                        style={styles.flatList}
                        keyExtractor={item => '' + item.transaction_id}
                        data={list}
                        renderItem={({ item }) => renderItem(item)}
                    />
                    :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>暂无数据</Text>
                    </View>

            }

        </View>
    );
}

// const windowW = Dimensions.get('window').width;


const styles = StyleSheet.create({

    container: {
        flex: 1
    },

    flatList: {
        flex: 1,
        marginVertical: 15,
        paddingHorizontal: 15
    },
    list: {
        marginVertical: 8,
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 10
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        alignItems: 'center'
    },
    listItemText: {
        textAlign: 'center',
        fontSize: 20,
        color: '#333333'
    },
    listSubItemTouch: {
        flexDirection: 'row',
        marginTop: 5,
        marginLeft: 16,
        height: 50,
        backgroundColor: '#eeeeee',
        justifyContent: 'space-between'
    },
    renderAddAccount: {

        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        backgroundColor: 'white',
        borderRadius: 10,
    },
});

export default GetTRanscationHistoryScreen;
