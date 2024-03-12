import React, { Component, useEffect, useRef } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './HomeScreen';
import MessageScreen from './MessageScreen';
import { Alert, DeviceEventEmitter, ToastAndroid, TouchableOpacity } from "react-native";
import { connect, useDispatch, useSelector } from "react-redux";
import nodejs from 'nodejs-mobile-react-native';
import notifee, { AndroidStyle, EventType } from '@notifee/react-native';
import { useNavigation } from "@react-navigation/native";
import { setLoading, setWalletServiceLoading } from "../redux/loading/LoadingSlice";
import store from "../redux/store";
import AddWealletScreen from "./wallet/AddWalletScreen";
import { changeCurrentWallet, loadWalletAction } from "../redux/wallet/walletSlice";
import { WalletModel } from "../redux/wallet/walletModel";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Global from "../Global";
type RootState = ReturnType<typeof store.getState>;


const Tab = createBottomTabNavigator();

const Home = "钱包"
const Message = "消息"


export default function TabRouter(): JSX.Element {

  const dispatch = useDispatch();
  const navigation = useNavigation()
  const isLogin = useRef(false)
  const isConnected = useRef(false)
  const wallets = useSelector((state: RootState) => {
    return state.walletState.wallets;
  });

  useEffect(() => {
    console.log("组件挂载完之后执行TabRoutere");

    nodejs.start("main.js")
    const messageListener = nodejs.channel.addListener(
      "message",
      (msg) => {
        console.log("【node】" + msg);
        if (msg == 'nodejs-started') {
          nodejs.channel.post('getSelectWalletAndAccount')
          dispatch(setWalletServiceLoading(false))
          SplashScreen.hide();
        } else {
          ToastAndroid.show(msg, ToastAndroid.SHORT)
        }
      },
    );


    const getSelectWalletAndAccountListener = nodejs.channel.addListener("getSelectWalletAndAccountResult", (data) => {
      dispatch(changeCurrentWallet(data))
      nodejs.channel.post('loadWallets')

    })

    const walletsListener = nodejs.channel.addListener("loadWalletsResult", (wallets: [WalletModel]) => {
      dispatch(loadWalletAction(wallets))
    })
    // onDisplayNotification()
    return () => {
      console.log("组件离开之后执行TabRouter");
      walletsListener.remove()
      getSelectWalletAndAccountListener.remove()
      messageListener.remove()

    }
  }, []);


  return (

    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";
          if (route.name === Home) {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          if (route.name === Message) {
            iconName = focused ? 'list' : 'list-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>

      <Tab.Screen name={Home} component={HomeScreen} options={({ navigation }) => ({
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTitleAlign: 'center',
        headerShown: true,
        headerTitle: '蜗牛钱包',
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              navigation.navigate('QRcodeScan')
            }}>
            <Ionicons name={"scan-outline"} size={20} color="black" />

          </TouchableOpacity>

        )
      })} />
      <Tab.Screen name={Message} component={MessageScreen} options={{
        headerShown: true,
      }} />
    </Tab.Navigator>
  )

}