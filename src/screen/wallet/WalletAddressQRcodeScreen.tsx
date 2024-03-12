import React, { useEffect, useState, useRef, useCallback, MutableRefObject, ClassAttributes } from 'react';
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
    Dimensions,
    TouchableOpacity,
    Image
} from 'react-native';
import { PermissionsAndroid, Platform } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-community/clipboard';
import ViewShot, { ViewShotProperties, captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { QRcodeScreenNavigationProp } from '../../navigation/types.js';
import { useSelector } from "react-redux";
import store from "../../redux/store.js";


type RootState = ReturnType<typeof store.getState>;




const windowW = Dimensions.get('window').width;

function WalletAddressQRcodeScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation<QRcodeScreenNavigationProp>()
    const ref = useRef();
    // React.LegacyRef<ViewShot> 
    const [address, setAddress] = useState('23423')
    // const [amount, setAmount] = useState('23423')
    const [uri, setUri] = useState('')

    const selectWallet = useSelector((state: RootState) => {
        return state.walletState.selectWallet;
    });

    const selectAccount = useSelector((state: RootState) => {
        return state.walletState.selectAccount;
    });
    // tron:THiPiPL1VAVfofi8FjXgtCZLLBagGrsoT4?network=tron&amount=861.861
    // tron:TCqdyTuazoBXYBsswquWtxY1rn22XJE6GT?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimal=6&value=99996738&network=tron
    function genQrCodeAddress() {
        const address = selectAccount?.address
        const network = route.params?.network
        if (network == "USDT") {
            return "tron:" + address + "?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&network=USDT&amount=" + route.params?.amount ?? 0
        } 
        return "tron:" + address + "?network=TRX&amount=" + route.params?.amount ?? 0
    }

    async function hasAndroidPermission() {
        const permission = parseInt(Platform.Version.toString()) >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(permission);
        return status === 'granted';
    }


    const savePicture = async () => {
        const uri = await ref.current.capture()
        console.log("do something with ", uri);
        if (Platform.OS === "android" && !(await hasAndroidPermission())) {
            return;
        }
        const res = await CameraRoll.save(uri, { type: 'photo' })
        console.log("res ", res);
        Toast.show({
            type: 'success',
            text1: '保存成功',
        });
    }

    const showToast = (address: string) => {
        Clipboard.setString(address)
        let text = address + " 已复制到剪切板👋"
        Toast.show({
            type: 'success',
            text1: '复制成功',
            text2: text,
        });
    }
    return (
        <View style={styles.container}>
            <View style={{ padding: 15 }}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.goBack()
                    }}>
                    <View style={{ padding: 4 }}>
                        <Ionicons name={"arrow-back-outline"} size={25} color="#333333" />
                    </View>

                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} >
                {/* onCapture={onCapture} captureMode="mount" */}
                <ViewShot ref={ref} options={{ quality: 0.9 }}>

                    <View style={styles.qrcode} >
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                            <Image source={route.params?.network == "TRX" ? require('./../../assets/trx.png') : require('./../../assets/usdt.png')} style={{ width: 50, height: 50 }} />

                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: "#333333", fontWeight: 'bold', fontSize: 16 }}>{route.params?.network}</Text>
                                    <View style={{ borderRadius: 3, backgroundColor: '#eeeeee', marginLeft: 5, paddingHorizontal: 2, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>TRON</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                    <Text style={{ flex: 1, fontSize: 14, marginRight: 5 }} numberOfLines={2}>{selectAccount?.address}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#eeeeee', width: '80%' }} />
                        <View style={{ paddingVertical: 20 }}>
                            <Text>仅支持接收Tron网络资产</Text>
                        </View>
                        <QRCode
                            size={windowW - 120}
                            value={genQrCodeAddress()}
                            color='#333333'
                        />
                        {route.params?.amount ?
                            <View style={{ paddingTop: 25, alignItems: 'center' }}>
                                <Text style={{ color: '#333333', fontSize: 25, fontWeight: 'bold' }}>{route.params?.amount}{route.params?.network}</Text>
                                {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14 }}>≈￥{receiveAmount}</Text>
                                    <TouchableOpacity
                                        style={{ marginLeft: 5 }}
                                        onPress={() => {
                                        }}>
                                        <Ionicons name={"close-circle"} size={20} color="#666666" />
                                    </TouchableOpacity>
                                </View> */}

                            </View>
                            : null}

                    </View>
                </ViewShot>
            </View>
            <View style={styles.bottom}>
                <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={savePicture}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ padding: 4 }}>
                            <Ionicons name={"save-outline"} size={20} color="#333333" />
                        </View>
                        <Text style={{ fontSize: 12, color: "#333333" }}>保存</Text>
                    </View>

                </TouchableOpacity>
                <View style={{ width: 1, height: 30, backgroundColor: '#eeeeee' }} />
                <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={() => {
                    navigation.navigate("SetAmount", { network: route.params?.network })
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ padding: 4 }}>
                            <Ionicons name={"settings-outline"} size={20} color="#333333" />
                        </View>
                        <Text style={{ fontSize: 12, color: "#333333" }}>设置金额</Text>
                    </View>

                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    qrcode: {
        flexDirection: 'column',
        marginHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center',
        paddingBottom: 30
    },
    bottom: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 30,
        height: 60,
        marginHorizontal: 20,
        alignItems: 'center',
        marginBottom: 40
    },

});

export default WalletAddressQRcodeScreen;
