import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletModel } from '../redux/wallet/walletModel';
export type HomeStackNavigatorParamList = {
  Home: undefined;
  QRCode: {network:string,amount:number};
  WalletList: undefined;
  SetAmount: {network:string,amount:number};
  ReceiveAddress: undefined;
  ExportWalletRemember:{wallet:WalletModel};
  GetTRanscationHistory:undefined;
  RegisterCaptcha:{email:string,password:string,password_confirmation:string,res:any};
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'QRCode',
  'WalletList'
>;

export type ReceiveAddressScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'ReceiveAddress'
>;
export type GetTRanscationHistoryScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'GetTRanscationHistory'
>;

export type QRcodeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'SetAmount'
>;

export type ExportWalletRememberNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'ExportWalletRemember'
>;

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  HomeStackNavigatorParamList,
  'RegisterCaptcha'
>;