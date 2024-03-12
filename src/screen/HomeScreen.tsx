import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { ImageLibraryOptions, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from "react-redux";
import { State, WalletModel, WalletAccountModel } from "./../redux/wallet/walletModel.js"
import store from "./../redux/store";
import { changeCurrentWallet, loadWalletAction, setBalance } from './../redux/wallet/walletSlice';
import LocalBarcodeRecognizer from 'react-native-local-barcode-recognizer';
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp, ReceiveAddressScreenNavigationProp, GetTRanscationHistoryScreenNavigationProp } from '../navigation/types.js';
import notifee from '@notifee/react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import copyToboard from '../utils/Util.js';

const windowW = Dimensions.get('window').width;
type RootState = ReturnType<typeof store.getState>;

export default function HomeScreen(): JSX.Element {

  const navigation = useNavigation<HomeScreenNavigationProp | ReceiveAddressScreenNavigationProp | GetTRanscationHistoryScreenNavigationProp>()

  const selectWallet = useSelector((state: RootState) => {
    return state.walletState.selectWallet;
  });

  const selectAccount = useSelector((state: RootState) => {
    return state.walletState.selectAccount;
  });

  const balance = useSelector((state: RootState) => {
    return state.walletState.balance;
  });

  const walletServiceLoading = useSelector((state: RootState) => {
    return state.loadingState.walletServiceLoading;
  });

  const { showActionSheetWithOptions } = useActionSheet();
  const [list, setList] = useState([
    { title: 'TRX', id: 1, img: require('./../assets/trx.png') },
    { title: 'USDT', id: 2, img: require('./../assets/usdt.png') }
  ])
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch();

  interface Props {
    title: String, onPress: any, icon: any
  }


  useEffect(() => {
    console.log("组件挂载完之后执行home");

    const setBalanceListener = nodejs.channel.addListener("setBalance", (balance) => {
      if (balance) {
        dispatch(setBalance(balance))
      }
      setRefreshing(false)
    })

    return () => {
      console.log("组件离开之后执行home");
      setBalanceListener.remove()
    }
  }, []);

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
        }
        // tron:TCqdyTuazoBXYBsswquWtxY1rn22XJE6GT?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&decimal=6&value=99996738&network=tron

      }
    }
  };


  const onRefresh = () => {

    if (selectAccount && selectAccount.address.length > 0) {
      setRefreshing(true)
      nodejs.channel.post('getBalance', { "address": selectAccount?.address })
    }
  }
  const getBalance = (item: any) => {
    if (item.title == 'TRX') {
      return balance?.trxBalance ?? 0
    } else if (item.title == 'USDT') {
      return balance?.usdtBalance ?? 0
    }
    return 0
  }

  const showUnActive = () =>
    Alert.alert(
      "账户未激活",
      "请先转入TRX再进行转账操作！！！",
      [
        {
          text: "确定",
          onPress: () => { },
          style: "cancel",
        }
      ],
      {
        cancelable: false,
      }
    );


  const sendWithNetwork = () => {
    const options = ['TRX', 'USDT', '取消'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions({
      options,
      cancelButtonIndex,
      title: '选择需要的网络',
      cancelButtonTintColor: 'red',
    }, (selectedIndex?: number) => {
      switch (selectedIndex) {
        case 0:
          navigation.navigate("ReceiveAddress", { network: "TRX" })
          break;

        case 1:
          navigation.navigate("ReceiveAddress", { network: "USDT" })
          break;

        case cancelButtonIndex:
        // Canceled
      }
    });
  }

  const changeNetWork = () => {
    const options = ['TRX', 'USDT', '取消'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions({
      options,
      cancelButtonIndex,
      title: '选择需要的网络',
      cancelButtonTintColor: 'red',
    }, (selectedIndex?: number) => {
      switch (selectedIndex) {
        case 0:
          navigation.navigate("QRCode", { network: "TRX" })
          break;

        case 1:
          navigation.navigate("QRCode", { network: "USDT" })
          break;

        case cancelButtonIndex:
        // Canceled
      }
    });
  }

  const renderItem = (item: any) => {

    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10 }}>
        <Image source={item.img} style={{ width: 35, height: 35 }} />
        <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 10, alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: 16, color: '#333333' }}>{item.title}</Text>
          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: '#333333' }} numberOfLines={1} >{getBalance(item)}</Text>
          </View>
        </View>
      </View>
    );
  }

  const Item: React.FC<Props> = ({ title, onPress, icon }) => {
    return (
      <TouchableOpacity style={{ flex: 1, marginHorizontal: 5 }} onPress={onPress}>
        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ padding: 4 }}>
            <Ionicons name={icon} size={25} color="#666666" />
          </View>
          <Text style={{ fontSize: 12 }}>{title}</Text>
        </View>

      </TouchableOpacity>
    )

  }

  const HeaderSection = () => {
    return (
      <View>
        <View style={{ backgroundColor: 'white' }}>

          <View style={{ flexDirection: 'column', margin: 10, backgroundColor: '#999999', height: 140, borderRadius: 12 }}>

            <View style={{ flexDirection: 'column', backgroundColor: 'tomato', height: 140, borderRadius: 12, padding: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {selectWallet?.name} - {selectAccount?.name}
                </Text>

                <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                  <Text style={{ color: 'white', fontSize: 10 }}>
                    {selectAccount?.address}
                  </Text>
                  <View style={{ marginLeft: 15 }}>
                    <TouchableOpacity
                      onPress={() => {
                        copyToboard(selectAccount?.address)
                      }}>
                      <Ionicons name={"copy-outline"} size={13} color="white" />
                    </TouchableOpacity>
                  </View>

                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }} >
                <Text style={{ color: 'white', fontSize: 20 }}>{balance && balance.trxBalance ? balance.trxBalance : 0} TRX</Text>
              </View>
            </View>

          </View>
          <View style={{ flexDirection: 'row', height: 80, alignItems: 'center', justifyContent: 'space-around' }}>
            <Item title={"转账"} icon="arrow-up-outline" onPress={() => {
              balance?.active ? sendWithNetwork() : showUnActive()

            }} ></Item>
            <Item title={"收款"} icon="arrow-down-outline" onPress={() => {

              changeNetWork()
            }} />

            <Item title={"我的钱包"} icon="wallet-outline" onPress={() => {
              navigation.navigate("WalletList")
            }} />
          </View>

        </View>
        <View style={{ marginVertical: 15, height: 100, backgroundColor: 'white' }}>

          <View style={{ flex: 1, padding: 15 }}>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={{ flex: 1, fontSize: 12, color: '#333333' }}>宽带</Text>
              <Text style={{ fontSize: 10, color: '#666666' }}>{(balance?.freeNetLimit ?? 0) - (balance?.freeNetUsed ?? 0)}</Text>
              <Text style={{ fontSize: 10, color: '#666666' }}>/{balance?.freeNetLimit ?? 0}</Text>
            </View>
            <Progress.Bar
              width={windowW - 30}
              color='#009688'
              progress={balance?.netProgress ?? 0}
              height={5}
              borderRadius={2}
              borderWidth={0}
              unfilledColor="#f0f0f0"
            />
          </View>
          <View style={{ flex: 1, padding: 15 }}>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={{ flex: 1, fontSize: 12, color: '#333333' }}>能量</Text>
              <Text style={{ fontSize: 10, color: '#666666' }}>{balance?.EnergyUsed ?? 0}</Text>
              <Text style={{ fontSize: 10, color: '#666666' }}>/{balance?.EnergyLimit ?? 0}</Text>
            </View>

            <Progress.Bar
              width={windowW - 30}
              color='orange'
              progress={balance?.energyProgress ?? 0}
              height={5}
              borderRadius={2}
              borderWidth={0}
              unfilledColor="#f0f0f0"
            />


          </View>

        </View>
        <View style={{ backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text style={{ fontSize: 16 }}>资产</Text>
        </View>
      </View>
    )
  }
  return (
    <View style={{ flex: 1 }}>

      <FlatList
        style={{ flex: 1 }}
        keyExtractor={item => '' + item.id}
        data={list}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={HeaderSection}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      {
        walletServiceLoading ?
          <View style={{position:'absolute',left:0,top:0,right:0,bottom:0,justifyContent:'center',alignItems:'center'}}>
            <View style={{padding:20,borderRadius:10,backgroundColor:'gray'}}>
              <Text style={{color:'white'}}>钱包服务加载中...</Text>
            </View>
          </View>
          : null
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 32,
  },
});
