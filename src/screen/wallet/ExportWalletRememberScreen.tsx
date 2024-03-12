import React, { useEffect, useRef, useState } from 'react';
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
    TouchableWithoutFeedback,
    useWindowDimensions,
    Alert
} from 'react-native';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomButton from '../component/BottomButton';
import { useDispatch, useSelector } from "react-redux";
import { updateWalletExport } from '../../redux/wallet/walletSlice';


const deviceWidth = Dimensions.get("window").width;


export default function ExportWalletRememberScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation()
    const [show, setShow] = useState(false)
    const dispatch = useDispatch();
    useEffect(() => {

        return () => {

        }
    }, [])


    const okAction = () => {
        Alert.alert(
            "确认",
            "是否已备份助记词？",
            [
                {
                    text: "取消",
                    onPress: () => { },
                    style: "cancel",
                },
                {
                    text: "确定",
                    onPress: () => {
                        navigation.navigate("WalletList")
                        const wallet = route.params?.wallet
                        if (wallet && wallet.phrase) {
                            nodejs.channel.post("updateWalletExport", { word: wallet.phrase })
                            dispatch(updateWalletExport({index:wallet.index,exported:true}))
                        }
                    },
                },
            ],
            {
                cancelable: false,
            }
        );
    }


    const showSeed = () => {

        setShow(true)

    }

    const getSeeds = (index: number) => {
        const phrase = route.params?.wallet.phrase
        if (route.params?.wallet && phrase) {
            const arr = phrase.split(" ")
            if (index < arr.length) {
                return arr[index]
            }
        }
        return "null"
    }
    const SeedItem = (index: number, title: string) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginLeft: 10 }}>
                <Text style={{ color: '#999999' }}>
                    {index}
                </Text>
                <Text style={{ color: '#333333', fontSize: 16, marginLeft: 10 }}>
                    {title}
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 28, color: '#333333', fontWeight: 'bold' }}>请记住下面的单词</Text>
            </View>

            <View style={{ paddingHorizontal: 15 }}>
                <Text>不要截屏，建议您手写保存。</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 15, backgroundColor: '#f9f9f9', margin: 20, borderRadius: 10 }}>

                <View style={{ flex: 1 }}>

                    {SeedItem(1, getSeeds(0))}
                    {SeedItem(2, getSeeds(1))}
                    {SeedItem(3, getSeeds(2))}
                    {SeedItem(4, getSeeds(3))}
                    {SeedItem(5, getSeeds(4))}
                    {SeedItem(6, getSeeds(5))}
                </View>
                <View style={{ flex: 1 }}>
                    {SeedItem(7, getSeeds(6))}
                    {SeedItem(8, getSeeds(7))}
                    {SeedItem(9, getSeeds(8))}
                    {SeedItem(10, getSeeds(9))}
                    {SeedItem(11, getSeeds(10))}
                    {SeedItem(12, getSeeds(11))}
                </View>
                {
                    !show ?
                        <TouchableOpacity activeOpacity={1} onPress={showSeed} style={{ borderRadius: 10, top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position: 'absolute', backgroundColor: '#f2f2f2' }}>
                            <Ionicons name={"eye-off-outline"} size={25} />
                            <Text>
                                点击查看助记词
                            </Text>
                            <Text>
                                请确保周围没有其他人及摄像头
                            </Text>
                        </TouchableOpacity>
                        :
                        null
                }

            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
                <Ionicons name={"ellipse"} size={5} color="#333333" style={{ marginRight: 5, marginTop: 5 }} />
                <View>
                <Text>蜗牛不会记录或上传您的助记词。</Text>
                <Text/>
                <Text>蜗牛不会记录或上传您的助记词。</Text>
                <Text/>
                <Text>蜗牛不会记录或上传您的助记词。</Text>
                </View>
                
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
                <Ionicons name={"ellipse"} size={5} color="#333333" style={{ marginRight: 5, marginTop: 5 }} />
                <Text>助记词备份只有一次机会。</Text>
            </View>
            <View style={{ flex: 1 }} />
            {BottomButton({ disabled: !show, title: '确定', onPress: okAction })}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});
