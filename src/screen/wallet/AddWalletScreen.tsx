import React, { useState } from 'react';
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
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import Modal from "react-native-modal";
import BigButton from '../component/BigButton';

const deviceWidth = Dimensions.get("window").width;


export default function AddWealletScreen(): JSX.Element {

    const navigation = useNavigation()
    const route = useRoute()
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const walletFromSeed = () => {
        toggleModal()
        navigation.navigate('ImportWallet')
    }
    const walletFromPrivateKey = () => {
        toggleModal()
        navigation.navigate('AddWalletFromPrivateKey')
    }
    return (
        <View style={styles.container}>

            <View style={{ padding: 15 }}>
                {
                    route.params?.showBack ?
                        <TouchableOpacity
                            onPress={() => {
                                navigation.goBack()
                            }}>
                            <View style={{ padding: 4 }}>
                                <Ionicons name={"arrow-back-outline"} size={25} color="#333333" />
                            </View>

                        </TouchableOpacity> : <View style={{ padding: 15 }} />
                }

            </View>
            <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                <Text style={{ fontSize: 25, color: '#333333', fontWeight: 'bold' }}>添加新钱包</Text>
            </View>

            {BigButton({
                onPress: () => {
                    nodejs.channel.post('addWallet', { "load": true })
                    if(route.params?.showBack){
                        navigation.goBack()
                    }
                }, title: "创建钱包", desc: "可生成新的随机钱包", icon: ''
            })}
            {BigButton({ onPress: toggleModal, title: "导入钱包", desc: "使用助记词或私钥导入恢复钱包", icon: '' })}

            <Modal
                onBackButtonPress={toggleModal}
                onBackdropPress={toggleModal}
                deviceWidth={deviceWidth}
                isVisible={isModalVisible}
                style={{ margin: 0, justifyContent: 'flex-end' }}
                backdropOpacity={0.7}
                useNativeDriver={true}
            >
                <View style={{ paddingBottom: 30, backgroundColor: '#f9f9f9', borderTopLeftRadius: 10, borderTopEndRadius: 10, justifyContent: 'flex-end' }}>
                    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                        <View style={{ height: 3, width: 30, backgroundColor: '#999999', borderRadius: 1.5 }} />
                    </View>
                    {BigButton({ onPress: walletFromSeed, title: "助记词", desc: "你需要输入之前备份的助记词", icon: '' })}
                    {BigButton({ onPress: walletFromPrivateKey, title: "私钥", desc: "粘贴或输入私钥导入", icon: '' })}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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

