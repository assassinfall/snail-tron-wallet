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
    useWindowDimensions
} from 'react-native';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation ,useRoute} from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import RenderHtml from 'react-native-render-html';
import BottomButton from '../component/BottomButton';
import TouchID from 'react-native-touch-id';
import { ExportWalletRememberNavigationProp } from '../../navigation/types';

const deviceWidth = Dimensions.get("window").width;


export default function ExportWalletSeedScreen(): JSX.Element {

    const route = useRoute()
    const navigation = useNavigation<ExportWalletRememberNavigationProp>()
    const [count, setCount] = useState(5)
    const { width } = useWindowDimensions();
    const latestCount = useRef(count)

    const source = {
        html: `
      <p style='text-align:left;font-size:33px;color:#333333'>
        请牢记以下信息
        </p>
        <p style='text-align:left;font-size:33px;color:#333333'>
        如果我弄丢了<span style='color:tomato'> 助记词 </span>或<span style='color:tomato'> 私钥 </span>，我的资产将永远丢失。
        </p>
        <p style='text-align:left;font-size:33px;color:#333333'>

        如果我给任何人泄露<span style='color:tomato'> 助记词 </span>或<span style='color:tomato'> 私钥 </span>，我的资产可能会被盗。
        </p>
        <p style='text-align:left;font-size:33px;color:#333333'>

        保护助记词和私钥的责任完全在我。
      </p>
      `
    };

    useEffect(() => {
        latestCount.current = count
    })

    useEffect(() => {
        const timer = setInterval(() => {
            if (latestCount.current === 0) {
                clearInterval(timer)
                return
            }
            setCount(c => c - 1)
        }, 1000);

        return () => {
            clearInterval(timer)
        }
    }, [])


    const okAction = async () => {

        const optionalConfigObject = {
            title: '需要授权指纹', // Android
            imageColor: '#e00606', // Android
            imageErrorColor: '#ff0000', // Android
            sensorDescription: 'Touch sensor', // Android
            sensorErrorDescription: '授权失败', // Android
            cancelText: '取消', // Android
            fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
            unifiedErrors: false, // use unified error messages (default false)
            passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
        };

        try {
            const biometryType = await TouchID.isSupported(optionalConfigObject)
            if (biometryType){
                console.log('TouchID is supported.');
                const success = await TouchID.authenticate('授权指纹以确保此操作是本人，保证资产安全', optionalConfigObject)
                if (success) {
                    console.log('TouchID is success.');
                    navigation.navigate("ExportWalletRemember",{wallet:route.params?.wallet})
                } else {
                    console.log('TouchID is fail.');
                }
            } else {
                navigation.navigate("ExportWalletRemember",{wallet:route.params?.wallet})
            }
        } catch (error) {
            console.log(error);
        }
        
    }
    const title = () => {
        if (count > 0) {
            return "我已阅读(" + (count) + ")s"
        }
        return "开始"
    }

    return (
        <View style={styles.container}>
            <View style={{ padding: 10 }}>
                <RenderHtml
                    contentWidth={width}
                    source={source}
                />
            </View>

            {BottomButton({ disabled: count > 0, title: title(), onPress: okAction })}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'space-between'
    }
});

