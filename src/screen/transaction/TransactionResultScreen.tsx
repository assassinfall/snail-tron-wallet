import React, { useState, useEffect, useRef } from 'react';
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
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import nodejs from "nodejs-mobile-react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import BottomButton from '../component/BottomButton';
import { StackActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-community/clipboard';
import {timestampToTime} from './../../utils/Util.js'

interface Props {
    title: string, value: string, unit?: string, showIcon?: boolean
}

// type ProfileScreenRouteProp = RouteProp<StackParamList, 'Profile'>;


export default function TransactionResultScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation()
    const [times, setTimes] = useState(0)
    const timesRef = useRef<number>()
    const [data, setData] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log("times 变化了", times);
        timesRef.current = times
    }, [times]);

    useEffect(() => {
        console.log("组件进入完之后执行transaction");


        const getTransactionInfoResult = nodejs.channel.addListener(
            "getTransactionInfoResult",
            (data) => {
                console.log("getTransactionInfoResult", data)
                handleTransactionInfoResult(data)
            },
        );

        return () => {
            console.log("组件离开之后执行transaction");
            getTransactionInfoResult.remove()
        }
    }, []);

    const showToast = (value: string) => {
        Clipboard.setString(value)
        let text = value + " 已复制到剪切板👋"
        Toast.show({
            type: 'success',
            text1: '复制成功',
            text2: text,
        });
    }


    const handleTransactionInfoResult = async (data: any) => {
        let newtimes = timesRef.current ?? 0
        if (data.id != undefined) {//查询成功
            setData(data)
            setLoading(false)
        } else if (newtimes > 5) {
            showToast('交易结果查询失败!')
            setLoading(false)
        } else {
            let times2 = newtimes + 1
            setTimes(times2)
            getTransactionInfo()
        }
    }

    const getTransactionInfo = async () => {
        setTimeout(() => {
            const _txid = route.params?.id ?? ''
            if (_txid.length > 0) {
                nodejs.channel.post("getTransactionInfo", { txid: _txid })
            }
        }, 10000);
    }

    const okAction = () => {
        navigation.dispatch(StackActions.popToTop());
    }


    const ResultItem: React.FC<Props> = ({ title, value, unit = '', showIcon = false }) => {

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 15 }}>
                <Text>
                    {title}
                </Text>
                <View style={{ flexDirection: 'row', flex: 1, marginLeft: 20, justifyContent: 'flex-end' }}>
                    <Text ellipsizeMode="middle" numberOfLines={1} style={{ fontSize: 12, color: '#333333' }}>
                        {value}{unit}
                    </Text>
                    {showIcon ? <TouchableOpacity
                        onPress={() => {
                            showToast(value)
                        }}>
                        <Ionicons name={"copy-outline"} size={15} color="#333333" />
                    </TouchableOpacity> : null}

                </View>

            </View>
        );
    }
    /*
    {
      id: 'e8d97d1fb2e7376fce720e60b9bca94f8d7de48cd951c4d69d3d2dcfb5c2fbbe',
      blockNumber: 51865198,
      blockTimeStamp: 1686216294000,
      contractResult: [ '' ],
      receipt: { net_usage: 268 }

        receipt: {
    energy_fee: 27255900,
    energy_usage_total: 64895,
    net_usage: 345,
    result: 'SUCCESS',
    energy_penalty_total: 35245
  },
    }
    */
    const shortTxid = (txid: string) => {
        if (txid && txid.length > 30) {
            return txid.substring(0, 30) + "..."
        }
        return txid
    }

    return (
        <View style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 20 }}>成功</Text>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
                    <ResultItem title={"转账地址"} value={route.params?.address_from} />
                    <ResultItem title={"收款地址"} value={route.params?.address_to} />
                    <ResultItem title={"转账金额"} value={route.params?.amount} unit={route.params?.network} />
                    <ResultItem title={"交易哈希"} value={route.params?.id} showIcon={true} />
                    {
                        data.id ?
                            <ResultItem title={"当前区块"} value={data.blockNumber} />
                            : null
                    }
                    {
                        data.id ?
                            <ResultItem title={"交易时间"} value={timestampToTime(data.blockTimeStamp)} />
                            : null
                    }
                    {
                        data.receipt?.net_usage ?
                            <ResultItem title={"宽带消耗"} value={data.receipt.net_usage} />
                            : null
                    }
                    {
                        data.receipt?.energy_fee ?
                            <ResultItem title={"能量消耗"} value={data.receipt.energy_fee} />
                            : null
                    }
                    {
                        data.fee ?
                            <ResultItem title={"网络费用"} value={data.fee * 0.000001 + " TRX"} />
                            : null
                    }
                    {
                        loading ?
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size={"small"} color={"#333333"} animating={loading} />
                                <Text style={{ fontSize: 12, marginLeft: 5 }}>明细查询中...</Text>
                            </View> : null
                    }


                </View>
            </View>

            {BottomButton({ disabled: false, title: '返回首页', onPress: okAction })}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
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
