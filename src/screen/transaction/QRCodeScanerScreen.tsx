import React, { useState, useEffect } from 'react';
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
    Linking,
    TouchableOpacity,
    Alert
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { ImageLibraryOptions, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LocalBarcodeRecognizer from 'react-native-local-barcode-recognizer';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import copyToboard from '../../utils/Util';


const windowW = Dimensions.get('window').width;
const windowH = Dimensions.get('window').height;

type TRonType = {
    name:string,
    address:string
}

function QRcodeScanerScreen(): JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    const navigation = useNavigation()


    useEffect(() => {

        navigation.setOptions({
            title: '接收地址',
            headerRight: () => (
                <TouchableOpacity
                    onPress={choosePicker}>
                    <Text>相册</Text>
                </TouchableOpacity>

            )
        });
        console.log("组件挂载完之后执行");
        return () => {
            console.log("组件卸载完之后执行");
        }
    }, [navigation]);

    const onSuccess = (e: any) => {
        // Linking.openURL(e.data).catch(err =>
        //     console.error('An error occured', err)
        // );
        const url = e.data
        decodeUrl(url)

    };

    const showToast = (url:string) => {

        Toast.show('解析失败,请识别Tron网络地址二维码', {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            onShow: () => {
                // calls on toast\`s appear animation start
            },
            onShown: () => {
                // calls on toast\`s appear animation end.
            },
            onHide: () => {
                // calls on toast\`s hide animation start.
            },
            onHidden: () => {
                // calls on toast\`s hide animation end.
            }
        });

    }

    const decodeUrl = (url: string) => {
        // tron:TCqdyTuazoBXYBsswquWtxY1rn22XJE6GT?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimal=6&value=99996738&network=tron
        var success = true
        let data:{[key:string]:any} = {name:'收款账户'}
        if (url.indexOf('tron:') == 0) {
            let paths = url.split(':')
            if (paths.length == 2) {
                let arr = paths[1].split('?')
                if (arr.length == 2) {
                    data.address= arr[0]
                    let params = arr[1].split('&')
                    params.forEach(element => {
                        let kv = element.split('=')
                         data[kv[0]] = kv[1]
                    });
                } else {
                    success = false
                }
            } else {
                success = false
            }
        } else {
            success = false
        }
        if (success) {
             console.log(data)
            if(data['amount'] == 'undefined') {
                navigation.navigate('SendAmount', data)
             } else {
                navigation.navigate('SendConfirm', data)
             }
            
        } else {
            // showToast(url)
            Alert.alert(
                "识别结果",
                url,
                [
                    {
                        text: "取消",
                        onPress: () => { },
                        style: "cancel",
                    },
                    {
                        text: "复制",
                        onPress: ()=>{
                            copyToboard(url)
                        },
                    },
                ],
                {
                    cancelable: false,
                }
            );
        }
    }
    
    const choosePicker = async () => {
        const options = {
            mediaType: 'photo',
            videoQuality: 'low',
            quality: 0.5,
            includeBase64: true
        }
        const response = await launchImageLibrary(options as ImageLibraryOptions)
        // console.log(response)
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorCode);
        } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
        } else {
            if (response.assets) {
                console.log(response.assets[0].fileName)
                if (response.assets[0].base64) {
                    let result = await LocalBarcodeRecognizer.decode(response.assets[0].base64.replace("data:image/jpeg;base64,", ""), { codeTypes: ['ean13', 'qr'] });
                    console.log(result);
                    decodeUrl(result)
                }
                // tron:TCqdyTuazoBXYBsswquWtxY1rn22XJE6GT?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimal=6&value=99996738&network=tron

            }
        }
    };

    return (
        <QRCodeScanner
            onRead={onSuccess}
            showMarker={true}
            vibrate={true}
            checkAndroid6Permissions={true}
            flashMode={RNCamera.Constants.FlashMode.auto}
            cameraStyle={{ flex: 1, overflow: 'hidden', height: windowH }}
            cameraContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            topContent={
                <Text style={styles.centerText}>

                </Text>
            }
            bottomContent={
                <TouchableOpacity style={styles.buttonTouchable}>
                    <Text style={styles.buttonText}>将二维码放入框内，即可自动扫描</Text>
                </TouchableOpacity>
            }
        />
    );


}

const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 13,
        color: 'white'
    },
    buttonTouchable: {
        padding: 16
    }
});
export default QRcodeScanerScreen;
