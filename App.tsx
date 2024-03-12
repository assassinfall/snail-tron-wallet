/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, type PropsWithChildren } from 'react';
import { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TouchableOpacity,
  LogBox,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import store from './src/redux/store'
import { MenuProvider } from 'react-native-popup-menu';
import { RootSiblingParent } from 'react-native-root-siblings';
import Modal from "react-native-modal";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabRouter from './src/screen/TabRouter';
import DeviceInfo from 'react-native-device-info'
import WalletAddressQRcodeScreen from './src/screen/wallet/WalletAddressQRcodeScreen';
import QRcodeScanerScreen from './src/screen/transaction/QRCodeScanerScreen';
import ReceiveAddressScreen from './src/screen/transaction/ReceiveAddressScreen';
import WalletListScreen from './src/screen/wallet/WalletListScreen';
import SetAmountScreen from './src/screen/transaction/SetReceiveAmountScreen';
import SendAmountScreen from './src/screen/transaction/SetSendAmountScreen';
import SplashScreen from 'react-native-splash-screen'
import AddWealletScreen from './src/screen/wallet/AddWalletScreen';
import AddWalletFromSeedScreen from './src/screen/wallet/AddWalletFromSeedScreen';
import AddWalletFromPrivateKeyScreen from './src/screen/wallet/AddWalletFromPrivateKeyScreen';
import SendConfirmScreen from './src/screen/transaction/SendConfirmScreen';
import TransactionResultScreen from './src/screen/transaction/TransactionResultScreen';
import ExportWalletSeedScreen from './src/screen/wallet/ExportWalletSeedScreen';
import ExportWalletRememberScreen from './src/screen/wallet/ExportWalletRememberScreen';
import UpdateWalletNameScreen from './src/screen/wallet/UpdateWalletNameScreen';
import Loading from './src/screen/component/Loading';
import GetTRanscationHistoryScreen from './src/screen/transaction/GetTransactionHistory';


const Stack = createNativeStackNavigator();


LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
])


function App(): JSX.Element {

  useEffect(() => {
    console.log("组件挂载完之后执行app");
    // SplashScreen.hide();
    return () => {
      console.log("组件离开之后执行app");
    }
  }, []);




  return (
    <Provider store={store}>
      <RootSiblingParent>
        <MenuProvider>
          <ActionSheetProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName='HomeTab' screenOptions={{
                headerTitleAlign: 'center',
                gestureDirection: 'horizontal',
                gestureEnabled: true,
                animation: 'slide_from_right',
                headerShadowVisible: false,
                headerTitleStyle: { fontSize: 18 }
              }} >
                <Stack.Screen
                  name="HomeTab"
                  component={TabRouter}
                  options={{
                    title: 'HomeTab',
                    headerStyle: {
                      backgroundColor: 'white',
                    },
                    headerShown: false,
                    headerTitleAlign: 'center'
                  }}
                />


                <Stack.Screen
                  name="WalletList"
                  component={WalletListScreen}
                  options={({ navigation }) => ({
                    headerStyle: {
                      backgroundColor: 'white',

                    },
                    title: '钱包管理',
                    headerTitleAlign: 'center',
                    headerShown: true,
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('AddWallet')
                        }}>
                        <Ionicons name={"apps-outline"} size={20} color="black" />
                      </TouchableOpacity>

                    )
                  })}
                />

                <Stack.Screen
                  name="QRcodeScan"
                  component={QRcodeScanerScreen}
                  options={({ navigation }) => ({
                    headerStyle: {
                      backgroundColor: 'clear',
                    },
                    title: '扫描二维码',
                    headerTitleAlign: 'center',
                    headerShown: true,
                    headerTransparent: true,
                  })}
                />
                <Stack.Screen
                  name="QRCode"
                  component={WalletAddressQRcodeScreen}
                  options={() => ({
                    headerShown: false,
                  })}
                />
                <Stack.Screen
                  name="ReceiveAddress"
                  component={ReceiveAddressScreen}
                  options={() => ({
                    title: "接收地址",
                  })} />
                <Stack.Screen
                  name="SetAmount"
                  component={SetAmountScreen}
                  options={() => ({
                    title: "设置金额",
                  })} />
                <Stack.Screen
                  name="SendAmount"
                  component={SendAmountScreen}
                  options={() => ({
                    title: "设置金额",
                  })} />
                <Stack.Screen
                  name="SendConfirm"
                  component={SendConfirmScreen}
                  options={() => ({
                    title: "发送",
                  })} />

                <Stack.Screen
                  name="AddWallet"
                  component={AddWealletScreen}
                  options={() => ({
                    headerShown: false,
                  })}
                />

                <Stack.Screen
                  name="ImportWallet"
                  component={AddWalletFromSeedScreen}
                  options={() => ({
                    title: "助记词导入",
                  })}
                />
                <Stack.Screen
                  name="AddWalletFromPrivateKey"
                  component={AddWalletFromPrivateKeyScreen}
                  options={() => ({
                    title: "私钥导入",
                  })}
                />
                <Stack.Screen
                  name="TransactionResult"
                  component={TransactionResultScreen}
                  options={() => ({
                    title: "交易结果",
                  })}
                />
                <Stack.Screen
                  name="ExportWalletSeed"
                  component={ExportWalletSeedScreen}
                  options={() => ({
                    title: "钱包备份",
                  })}
                />

                <Stack.Screen
                  name="ExportWalletRemember"
                  component={ExportWalletRememberScreen}
                  options={() => ({
                    title: "钱包备份",
                  })}
                />
                <Stack.Screen
                  name="UpdateWalletName"
                  component={UpdateWalletNameScreen}
                />
                <Stack.Screen
                  name="GetTRanscationHistory"
                  component={GetTRanscationHistoryScreen}
                />

              </Stack.Navigator>

            </NavigationContainer>
          </ActionSheetProvider>
        </MenuProvider>
        <Toast />
        <Loading />
      </RootSiblingParent>
    </Provider>
  );
}

const styles = StyleSheet.create({

});

export default App;
