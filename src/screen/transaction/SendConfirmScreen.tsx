import React, { useEffect, useState, useRef } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Dimensions, Alert } from 'react-native';
import BottomButton from '../component/BottomButton';
import nodejs from "nodejs-mobile-react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch, useSelector } from "react-redux";
import store from "./../../redux/store";
type RootState = ReturnType<typeof store.getState>;
import Toast from 'react-native-root-toast';
import Modal from "react-native-modal";
import copyToboard from '../../Global';


let Stage = {
    start: 0,
    sending: 1,
    querying: 3,
}
interface Props {
    title: string, value?: string, unit?: string, showIcon?: boolean
}
const deviceWidth = Dimensions.get("window").width;

export default function SendConfirmScreen(): JSX.Element {


    const route = useRoute()
    const navigation = useNavigation()
    const [network, setNetwork] = useState('TRX')
    const [amount, setAmount] = useState(0)
    const [times, setTimes] = useState(0)
    const [fee, setFee] = useState(0)
    const [txid, setTxid] = useState('')
    const [isModalVisible, setModalVisible] = useState(false);
    const [stage, setStage] = useState(Stage.start)
    const [loading, setLoading] = useState(false)
    const { showActionSheetWithOptions } = useActionSheet();
    const timesRef = useRef<number>()
    const txidRef = useRef<string>()
    const amountRef = useRef<number>()

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
        console.log("组件进入完之后执行transaction");

        navigation.setOptions({
            title: '转账',
        });
        // tron:THiPiPL1VAVfofi8FjXgtCZLLBagGrsoT4?network=tron&amount=861.861
        // tron:TCqdyTuazoBXYBsswquWtxY1rn22XJE6GT?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimal=6&value=99996738&network=tron
        const getTransactionResult = nodejs.channel.addListener(
            "getTransactionResult",
            (data) => {
                console.log("getTransactionResult", data)
                handleTransactionResult(data)
            },
        );
        const sendTRXTransactionResult = nodejs.channel.addListener(
            "sendTRXTransactionResult",
            (data) => {
                console.log("sendTRXTransactionResult", data)
                handleSendTRXTransactionResult(data)
            },
        );
        const sendTrc20TransactionResult = nodejs.channel.addListener(
            "sendTrc20TransactionResult",
            (data) => {
                console.log("sendTrc20TransactionResult", data)
                handleSendTrc20TransactionResult(data)
            },
        );
        const estimateEnergyResult = nodejs.channel.addListener(
            "estimateFeeResult",
            (data) => {
                console.log("estimateFeeResult", data)
                setFee(data)
            },
        );


        const getAccountActiveResult = nodejs.channel.addListener(
            "getAccountActiveResult",
            (data) => {
                if (data.active == true) {
                    setFee(0.0025)
                } else {
                    setFee(1.1)
                }
            },
        );

        return () => {
            console.log("组件离开之后执行transaction");
            getTransactionResult.remove()
            sendTRXTransactionResult.remove()
            getAccountActiveResult.remove()
            sendTrc20TransactionResult.remove()
            estimateEnergyResult.remove()
        }
    }, []);

    useEffect(() => {
        console.log("组件进入完之后执行transaction route");
        console.log(route.params)
        if (route.params?.network) {
            setNetwork(route.params?.network)
        }
        if (route.params?.amount) {
            setAmount(route.params?.amount)
            amountRef.current = route.params?.amount
        }
        if (route.params?.contractAddress == 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t') {
            setNetwork('USDT')
        }
        const value = route.params?.value
        const decimal = route.params?.decimal
        if (value > 0) {
            if (decimal > 0) {
                var newValue = value
                for (var i = 0; i < decimal; i++) {
                    newValue = newValue * 0.1
                }
                setAmount(newValue.toFixed(decimal))
                amountRef.current = newValue.toFixed(decimal)
            } else {
                setAmount(value)
                amountRef.current = value
            }
        }

    }, [navigation, route]);

    useEffect(() => {
        timesRef.current = times
    }, [times]);

    useEffect(() => {
        txidRef.current = txid
    }, [txid]);

    useEffect(() => {
        amountRef.current = amount
        if (amount > 0) {
            if (route.params?.network) {
                nodejs.channel.post("estimateFee", { network: route.params?.network, address_to: route.params?.address, address_from: selectAccount?.address, amount: amount })
            }
            if (route.params?.contractAddress == 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t') {
                nodejs.channel.post("estimateFee", { network: 'USDT', address_to: route.params?.address, address_from: selectAccount?.address, amount: amount })
            }
        }

    }, [amount]);

    const handleSendTRXTransactionResult = async (data: any) => {
        if (data.result == true) {
            setModalVisible(false)
            let transactionInfo: { [key: string]: any } = {}
            transactionInfo.address_from = selectAccount?.address
            transactionInfo.address_to = route.params.address
            transactionInfo.amount = amountRef.current
            transactionInfo.network = network
            transactionInfo.id = data.txid
            navigation.navigate("TransactionResult", transactionInfo)
        } else {
            setModalVisible(false)
            showToast('交易失败!')
        }
    }

    const handleSendTrc20TransactionResult = (data: any) => {
        if (route.params?.type == 'recharge') {
            navigation.navigate({
                name: 'RechargeBalancePay',
                params: { txid: data },
                merge: true
            });
            return
        }
        if (data && data.length > 0) {
            setStage(Stage.querying)
            setTxid(data)
            getTransactionInfo()
        } else {
            setModalVisible(false)
            showToast('交易失败!')
        }
    }

    const handleTransactionResult = async (data: any) => {
        let newtimes = timesRef.current ?? 0
        if (data) {
            if (data.receipt && data.receipt.result == 'SUCCESS') {
                setModalVisible(false)
                let transactionInfo: { [key: string]: any } = {}
                transactionInfo.address_from = selectAccount?.address
                transactionInfo.address_to = route.params.address
                transactionInfo.amount = amountRef.current
                transactionInfo.network = network
                transactionInfo.id = data.id
                transactionInfo.fee = data.fee
                transactionInfo.receipt = data.receipt
                navigation.navigate("TransactionResult", transactionInfo)
            } else {
                setModalVisible(false)
                showToast('交易结果查询失败!')
            }
        } else if (newtimes > 5) {
            setModalVisible(false)
            showToast('交易结果查询失败!')
        } else {
            let times2 = newtimes + 1
            setTimes(times2)
            getTransactionInfo()
        }

    }

    const getTransactionInfo = async () => {
        setTimeout(() => {
            console.log('txid : ', txidRef.current)
            const _txid = txidRef.current ?? ''
            if (_txid.length > 0) {
                console.log('继续查询' + timesRef.current)
                nodejs.channel.post("getTransactionInfo", { txid: _txid })
            }
        }, 3000);
    }

    const changeAmount = () => {
        navigation.navigate('SendAmount', { network: network })
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

    const modalText = () => {
        if (stage == Stage.sending) {
            return "交易执行中..."
        } else if (stage == Stage.querying) {
            return "交易结果查询中..."
        }
        return "错误"
    }

    const okAction = () => {

        if (route.params?.address && selectAccount?.privateKey) {
            setStage(Stage.sending)
            setModalVisible(true)
            if (network == "TRX") {
                nodejs.channel.post("sendTRXTransaction", { address_to: route.params.address, amount: amount, privateKey: selectAccount?.privateKey })
            } else {
                nodejs.channel.post("sendTrc20Transaction", { address_to: route.params.address, amount: amount, privateKey: selectAccount?.privateKey })
            }
        } else {
            showToast('参数错误!')
        }


    }
    const showConfirm = () =>
        Alert.alert(
            "确认转账",
            "是否立即转账？",
            [
                {
                    text: "取消",
                    onPress: () => { },
                    style: "cancel",
                },
                {
                    text: "确定",
                    onPress: okAction,
                },
            ],
            {
                cancelable: false,
            }
        );

    const onChangeNetWork = () => {
        const options = ['TRX', 'USDT', '取消'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions({
            options,
            cancelButtonIndex,
            title: '选择需要转账的网络',
            cancelButtonTintColor: 'red',
        }, (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    setNetwork('TRX')
                    break;

                case 1:
                    setNetwork('USDT')
                    break;

                case cancelButtonIndex:
                // Canceled
            }
        });
    }


    return (

        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <View style={styles.address}>
                    <View style={{ paddingLeft: 15, paddingTop: 10 }}>
                        <Text style={{ fontSize: 13 }}>发送</Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' }}>
                        {
                            network == 'TRX' ?
                                <Image source={require('./../../assets/trx.png')} style={{ width: 40, height: 40 }} />
                                :
                                <Image source={require('./../../assets/usdt.png')} style={{ width: 40, height: 40 }} />
                        }


                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: "#333333", fontWeight: 'bold', fontSize: 16 }}> {selectWallet?.name} - {selectAccount?.name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ flex: 1, fontSize: 12, marginRight: 15 }} numberOfLines={2}> {selectAccount?.address}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: '#eeeeee', marginHorizontal: 20 }} />
                    <View style={{ paddingLeft: 15, paddingTop: 10 }}>
                        <Text style={{ fontSize: 13 }}>至</Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' }}>
                        {/* <Image source={require('./../../assets/trx.png')} style={{ width: 40, height: 40 }} /> */}

                        <View style={{ width: 40, height: 40, borderRadius: 20, borderColor: '#f0f0f0', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name={"wallet-outline"} size={25} color="#999999" />
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: "#333333", fontWeight: 'bold', fontSize: 16 }}>{route.params?.name ?? "收款账户"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ flex: 1, fontSize: 12, marginRight: 5 }} numberOfLines={2}>{route.params?.address ?? ""}</Text>
                                <View style={{ width: 1, height: '60%', backgroundColor: '#eeeeee' }} />
                                <View style={{ marginHorizontal: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => { copyToboard(route.params?.address) }}>
                                        <Ionicons name={"copy-outline"} size={15} color="#333333" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity disabled={true} style={styles.background} onPress={changeAmount}>
                    <Text style={{ flex: 1, fontSize: 13 }}>转账金额</Text>
                    <Text style={{ fontSize: 13, color: '#333333', fontWeight: 'bold' }}>{amount} {network}</Text>
                    {/* <Ionicons name={"chevron-forward-outline"} size={15} color="#333333" /> */}
                </TouchableOpacity>
                <View style={styles.background} >
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13 }}>预计网络费用</Text>
                    </View>

                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        {
                            fee > 0 ?
                                <Text style={{ fontSize: 12, color: '#666666', fontWeight: 'bold' }}>{fee} TRX</Text>
                                :
                                <ActivityIndicator size={"small"} color={"#666666"} />
                        }

                    </View>
                </View>
                {
                    balance?.trxBalance && (balance?.trxBalance - fee) < 0 ?
                        <View style={{ alignItems: 'flex-end', paddingEnd: 15 }}>
                            <Text style={{ color: 'red', fontSize: 10 }}>TRX余额不足,交易可能会失败</Text>
                            <Text>{balance?.trxBalance}</Text>
                        </View>
                        : null
                }
                <View
                    style={styles.background}>
                    <Text style={{ flex: 1, fontSize: 13 }}>当前网络</Text>
                    <Text style={{ fontSize: 13, color: '#333333', fontWeight: 'bold' }}>{network == 'USDT' ? 'TRC20' : network}</Text>

                </View>
            </View>

            {BottomButton({ disabled: amount == 0, title: '确定', onPress: showConfirm })}
            <Modal
                isVisible={isModalVisible}
                backdropOpacity={0.7}
                useNativeDriver={true}
                style={{ alignItems: 'center' }}
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
            >

                <View style={{ padding: 20, alignItems: "center", backgroundColor: '#eeeeee', borderRadius: 10, width: 200 }}>
                    <ActivityIndicator size={'small'} color={'#333333'} />
                    <Text style={{ marginTop: 10 }}>{modalText()}</Text>

                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    address: {
        flexDirection: 'column',
        borderRadius: 10,
        marginHorizontal: 15,
        marginVertical: 10,
        backgroundColor: 'white',
    },
    background: {
        flexDirection: 'row',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        marginVertical: 10,
        backgroundColor: 'white',
        height: 50,
        alignItems: 'center'
    }
});
