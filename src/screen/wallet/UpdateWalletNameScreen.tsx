import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Platform,
    UIManager,
    Alert
} from 'react-native';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { WalletModel, WalletAccountModel } from "../../redux/wallet/walletModel.js"
import store from "../../redux/store.js";
import { updateWalletName, deleteWalletAction } from '../../redux/wallet/walletSlice';
type RootState = ReturnType<typeof store.getState>;
import Modal from "react-native-modal";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UpdateWalletNameScreen(): JSX.Element {

    const wallets = useSelector((state: RootState) => {
        return state.walletState.wallets;
    });
    
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const [isModalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const accountIndexRef = useRef(-1)
    const walletIndexRef = useRef(-1)

    useEffect(() => {
        navigation.setOptions({
            title: "编辑钱包",
        });
        console.log("组件挂载完之后执行");

        return () => {
            console.log("组件卸载完之后执行");
        }
    }, []);

    const removeWallet = (item: WalletModel) => {
        Alert.alert(
            "确认",
            "是否要删除此钱包？",
            [
                {
                    text: "取消",
                    onPress: () => { },
                    style: "cancel",
                },
                {
                    text: "确定",
                    onPress: () => {
                        dispatch(deleteWalletAction(item))
                        nodejs.channel.post("removeWallet", { word: item.phrase, index: item.index })
                    },
                },
            ],
            {
                cancelable: false,
            }
        );
    }

    const updateName = () => {
        if (name.length == 0) {
            return
        }
        const w = wallets.filter(wallet => {
            return wallet.index == walletIndexRef.current
        })
        if (w.length == 0) {
            return
        }
        console.log(wallets)
        dispatch(updateWalletName({ index: accountIndexRef.current, parentIndex: walletIndexRef.current, name: name }))
        
        if (accountIndexRef.current == -1) {
            nodejs.channel.post("editWalletName", { word: w[0].phrase, name: name })
        } else {
            nodejs.channel.post("editAccountName", { word: w[0].phrase, index: accountIndexRef.current, name: name })
        }
        setName('')
        walletIndexRef.current = -1
        accountIndexRef.current = -1
    }

    const renderAccount = (wallet: WalletModel, account: WalletAccountModel, accountIndex: number) => {
        return (
            <View
                key={accountIndex}
                style={styles.listSubItemTouch}
            >
                <Text style={{ flex: 1 }}>
                    {account.name}
                </Text>
                <TouchableOpacity onPress={() => {
                    setModalVisible(true)
                    walletIndexRef.current = wallet.index
                    accountIndexRef.current = account.index
                }}
                    style={{ justifyContent: 'center', width: 25 }}>
                    <Ionicons name={"create-outline"} size={20} color="#333333" />
                </TouchableOpacity>
            </View>
        )
    }

    // 渲染FlatList的item
    const renderItem = (item: WalletModel) => {
        const text = item.name
        return (
            <View style={styles.list}>
                <View style={{
                    flexDirection: 'row', borderBottomColor: '#eeeeee',
                    borderBottomWidth: 1,
                }}>
                    <View
                        style={styles.listItemTouch}
                    >
                        <Text
                            style={styles.listItemText}
                        >
                            {text}
                        </Text>
                        {
                            wallets.length > 1 ?
                                <TouchableOpacity onPress={() => {
                                    removeWallet(item)
                                }} style={{ justifyContent: 'center', width: 25, marginLeft: 10 }}>
                                    <Ionicons name={"remove-circle"} size={20} color="red" />

                                </TouchableOpacity>
                                : null
                        }

                    </View>
                    <TouchableOpacity onPress={() => {
                        setModalVisible(true)
                        walletIndexRef.current = item.index
                    }}
                        style={{ justifyContent: 'center', width: 25 }}>
                        <Ionicons name={"create-outline"} size={20} color="#333333" />
                    </TouchableOpacity>
                </View>
                {
                    item.accounts.map((subItem, subItemIndex) => {
                        return renderAccount(item, subItem, subItemIndex)
                    })
                }
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                keyExtractor={item => '' + item.index}
                data={wallets}
                renderItem={({ item }) => renderItem(item)}
            />
            <Modal
                isVisible={isModalVisible}
                backdropOpacity={0.7}
                useNativeDriver={true}
                style={{ alignItems: 'center' }}
            >

                <View style={{ padding: 20, backgroundColor: '#eeeeee', borderRadius: 10, width: 250 }}>
                    <TextInput placeholder='输入名称'
                        style={{ borderRadius: 5, borderWidth: 1, borderColor: '#999999' }}
                        maxLength={5}
                        onChangeText={text => {
                            setName(text)
                        }}
                        value={name}
                    ></TextInput>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity
                            style={{ flex: 1, paddingTop: 15 }}
                            activeOpacity={0.6}
                            onPress={() => { setModalVisible(false) }}
                        >
                            <Text
                                style={styles.listItemText}
                            >
                                取消
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, paddingTop: 15 }}
                            activeOpacity={0.6}
                            onPress={() => {
                                setModalVisible(false)
                                updateName()
                            }}
                        >
                            <Text
                                style={styles.listItemText}
                            >
                                确定
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        marginTop: 5,
        paddingHorizontal: 15
    },
    list: {
        marginVertical: 3,
        borderRadius: 10,
        backgroundColor: 'white'
    },
    listItemTouch: {
        flex: 1,
        height: 40,
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,

    },
    listItemText: {
        textAlign: 'center',
        fontSize: 15
    },
    listSubItemTouch: {
        marginTop: 2,
        height: 40,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomColor: '#eeeeee',
        borderBottomWidth: 1,
        marginLeft: 25,
        alignItems: 'center',
        borderBottomRightRadius: 10,
    },
    renderAddAccount: {
        marginLeft: 16,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        backgroundColor: '#999999',
    },
});

