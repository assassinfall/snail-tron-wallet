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
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import nodejs from "nodejs-mobile-react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store.js";
import { State, WalletModel, WalletAccountModel, AccountAddedType } from "../../redux/wallet/walletModel.js"
import { addWalletAccountAction, loadWalletAction, changeCurrentWallet } from '../../redux/wallet/walletSlice';
type RootState = ReturnType<typeof store.getState>;
import Menu, {
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function WalletListScreen(): JSX.Element {

  const wallets = useSelector((state: RootState) => {
    return state.walletState.wallets;
  });

  const selectWallet = useSelector((state: RootState) => {
    return state.walletState.selectWallet;
  });

  const selectAccount = useSelector((state: RootState) => {
    return state.walletState.selectAccount;
  });
  const navigation = useNavigation()
  const dispatch = useDispatch();
  const [selectIndexs, setSelectIndexs] = useState([] as number[]);
  // React.useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     // do something
  //   });

  //   return unsubscribe;
  // }, [navigation]);
  useEffect(() => {
    navigation.setOptions({
      title: "我的钱包",
      headerRight: NavigatorMenu
    });
    console.log("组件挂载完之后执行");

    // const walletsListener = nodejs.channel.addListener("loadWallets",(wallets: [WalletModel])=>{
    //   dispatch(loadWalletAction(wallets))
    // })
    // addAccount
    const addAccountListener = nodejs.channel.addListener('addAccount',(accountAdded: AccountAddedType)=>{
      console.log(accountAdded)
      dispatch(addWalletAccountAction(accountAdded))
    })
 
    nodejs.channel.post("loadWallets")
    return () => {
      console.log("组件卸载完之后执行");
      addAccountListener.remove()
    }
  }, []);


  const optionsStyles = {
    optionsContainer: {
      padding: 5,
      width: 100
    }
  };

  const NavigatorMenu = () => {
    return (
      <Menu>
        <MenuTrigger text='钱包管理'/>
        <MenuOptions customStyles={optionsStyles}>
          <MenuOption onSelect={() => {
            navigation.navigate('AddWallet',{showBack:true})
          }} text='添加钱包' />
          <MenuOption onSelect={() => {
            navigation.navigate("UpdateWalletName")
          }} text='编辑钱包' />
        </MenuOptions>
      </Menu>
    )
  }

  // header点击
  const itemTap = (index: number) => {

    var newIndexs = selectIndexs.filter((selectIndex) => {
      return selectIndex != index
    })
    if (selectIndexs.indexOf(index) == -1) {
      newIndexs.push(index)
    }
    LayoutAnimation.easeInEaseOut();
    setSelectIndexs(newIndexs)

    // Animated.timing(                  // Animate over time
    //     this.state.rotateValue,            // The animated value to drive
    //     {
    //       toValue: this.changeValue,                   // Animate to opacity: 1 (opaque)
    //       duration: 400,              // Make it take a while
    //     }
    //   ).start(()=>

    //    this.state.rotateValue.setValue(this.changeValue)
    //   ); 
  }
  const renderAccount = (wallet: WalletModel, account: WalletAccountModel, accountIndex: number) => {
    return (
      <TouchableOpacity
        key={accountIndex}
        style={styles.listSubItemTouch}
        onPress={() => {
          nodejs.channel.post('saveSelectWalletAndAccount', { "wallet": wallet, "account": account })
          dispatch(changeCurrentWallet({ "wallet": wallet, "account": account }))
        }}
      >
        <View style={{ flexDirection: 'column', paddingLeft: 10, justifyContent: 'center' }}>
          <Text style={{ color: '#333333' }}>
            {account.name}
          </Text>
          <Text style={{ fontSize: 10, marginTop: 3 }}>
            {account.address}
          </Text>
        </View>

        {
          (selectWallet?.index == wallet.index && selectAccount?.index == account.index) ?
            <View style={{ padding: 10 }}>
              <Ionicons name={"checkmark-circle"} size={16} color="#333333" />
            </View>
            :
            null
        }
      </TouchableOpacity>
    )
  }

  const renderAddAccount = (item: WalletModel, accountIndex: number) => {
    return (
      <TouchableOpacity
        key={accountIndex}
        style={styles.renderAddAccount}
        onPress={() => {
          nodejs.channel.post("addAccount",{ 'word': item.phrase, 'parentIndex': item.index })
        }}
      >
        <Text>
          添加账户
        </Text>
      </TouchableOpacity>
    )
  }

  // 渲染FlatList的item
  const renderItem = (item: WalletModel) => {
    const text = item.name
    const itemColor = item.index % 2 === 0 ? 'white' : 'white';
    // const scale = interpolate(scrollY.value, [100, 0], [3, 1], {
    //   extrapolateRight: Extrapolate.CLAMP,
    // });
    // const rotate =  interpolate(this.state.rotateValue,[0, 360],["0deg", "360deg"])
    // const rotate =  this.state.rotateValue.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] })


    return (
      <View style={styles.list}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.listItemTouch, { backgroundColor: itemColor }]}
            activeOpacity={0.6}
            onPress={() => { itemTap(item.index) }}
          >
            <Text
              style={styles.listItemText}
            >
              {text}
            </Text>
          </TouchableOpacity>
          {
            selectIndexs.indexOf(item.index) >= 0 ?
              <View style={{ padding: 10, justifyContent: 'center' }}>
                <Ionicons name={"chevron-up-outline"} size={20} color="#333333" />
              </View>
              :
              <View style={{ padding: 10, justifyContent: 'center' }}>
                <Ionicons name={"chevron-down-outline"} size={20} color="#333333" />
              </View>
          }


        </View>


        {selectIndexs.indexOf(item.index) >= 0 ?
          <View>
            {
              item.accounts.map((subItem, subItemIndex) => {
                return renderAccount(item, subItem, subItemIndex)
              })
            }
            {item.from == 'seed' ? renderAddAccount(item, item.accounts.length + 1) : null}
          </View> : null}



        {
          !item.exported ?
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => { 
                // navigation.navigate("ExportWalletSeed", { wallet: item })
                navigation.navigate("ExportWalletRemember",{wallet:item})
              }}
              style={{ borderBottomLeftRadius: 10,borderBottomRightRadius: 10,flexDirection: 'row', alignItems: 'center' , backgroundColor: '#FEF9F6',paddingEnd:10}}
            >
              <View style={{ flex: 1, paddingHorizontal: 15,paddingVertical:10, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={"alert-circle"} size={17} color="#DB4524" />
                <Text style={{ textAlign: 'center', color: '#A93A33',marginLeft:5}}>
                  请备份 {item.name} 以确保资产安全
                </Text>
              </View>

              <Ionicons name={"chevron-forward-outline"} size={15} color='#A93A33' />
            </TouchableOpacity>
            : null
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
    marginVertical:15,
    paddingHorizontal:15
  },
  list: {
    marginVertical: 3,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  listItemTouch: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 10,
  },
  listItemText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#333333'
  },
  listSubItemTouch: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 16,
    height: 50,
    backgroundColor: '#eeeeee',
    justifyContent: 'space-between'
  },
  renderAddAccount: {

    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default WalletListScreen;
