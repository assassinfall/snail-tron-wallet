import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State, WalletModel, AccountAddedType, ReceiveAmountType, CurrencyType, SelectedWalletModel, ExportedType, updateWalletNameType, BalanceModel } from "./walletModel";
import nodejs from "nodejs-mobile-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const initState: State = {
    wallets: [],
    selectWallet: undefined,
    selectAccount: undefined,
    selectCurrencyType: { id: 'CNY', name: '人民币' },
    balance: undefined
};

//1.创建 Slice，每个业务一个 分片
const walletSlice = createSlice({
    name: 'wallet',   // 这个名称似乎没啥用
    initialState: initState,
    //最重要的 reducers 属性，包括多个函数
    reducers: {
        loadWalletAction: (state: State, action: PayloadAction<[WalletModel]>) => {
            console.log('reducers loadWalletAction >>> ' + action.payload + ", current: " + JSON.stringify(state))
            const wallets = action.payload
            AsyncStorage.setItem('walletsCount', wallets.length.toString());
            if (wallets.length > 0 && state.selectWallet == undefined && state.selectAccount == undefined) {
                const wallet = wallets[0]
                const account = wallet.accounts[0]
                nodejs.channel.post('saveSelectWalletAndAccount', { "wallet": wallet, "account": account })
                return {
                    ...state,
                    wallets: wallets,
                    selectWallet: wallet,
                    selectAccount: account
                };
            }
            return {
                ...state,
                wallets: wallets,
            };
        },

        addWalletAction: (state: State, action: PayloadAction<WalletModel>) => {
            console.log('reducers addWallet >>> ' + action.payload + ", current: " + JSON.stringify(state))
            return {
                ...state,
                wallets: [...state.wallets, action.payload]
            };
        },

        deleteWalletAction: (state: State, action: PayloadAction<WalletModel>) => {
            console.log('reducers deleteWallet >>> ' + action.payload)

            const wallets = state.wallets.filter((item: WalletModel, index: number) => {
                return item.index !== action.payload.index
            });
            
            return {
                ...state,
                wallets:wallets
            };
        },

        changeCurrentWallet: (state: State, action: PayloadAction<SelectedWalletModel>) => {
            console.log('reducers changeCurrentWallet >>> ' + action.payload)

            const wallet = action.payload.wallet
            const account = action.payload.account
            if (wallet != undefined && account != undefined) {
                //刷新钱包
                nodejs.channel.post('getBalance', { "address": account.address })
            }
            return {
                ...state,
                selectWallet: wallet,
                selectAccount: account
            };
        },

        addWalletAccountAction: (state: State, action: PayloadAction<AccountAddedType>) => {
            console.log('reducers addWalletAccountAction >>> ' + JSON.stringify(action.payload))
            const index = action.payload.parentIndex
            const account = action.payload.account
            // state.wallets[index].accounts.push(account)
            state.wallets.forEach((wallet) => {
                if (wallet.index == index) {
                    wallet.accounts.push(account)
                }
            })

        },

        setSelectCurrencyType: (state: State, action: PayloadAction<CurrencyType>) => {
            console.log('reducers setSelectCurrencyType >>> ' + JSON.stringify(action.payload))
            return {
                ...state,
                selectCurrencyType: action.payload
            }
        },

        updateWalletExport: (state: State, action: PayloadAction<ExportedType>) => {
            console.log('reducers setSelectCurrencyType >>> ' + JSON.stringify(action.payload))
            state.wallets.forEach((wallet) => {
                if (wallet.index == action.payload.index) {
                    wallet.exported = action.payload.exported
                }
            })
        },

        updateWalletName: (state: State, action: PayloadAction<updateWalletNameType>) => {
            console.log('reducers setSelectCurrencyType >>> ' + JSON.stringify(action.payload))
            state.wallets.forEach((wallet) => {
                if (wallet.index == action.payload.parentIndex) {
                    if (action.payload.index >= 0) {
                        wallet.accounts.forEach((account) => {
                            if (account.index == action.payload.index) {
                                account.name = action.payload.name
                                if (account.index == state.selectAccount?.index) {
                                    state.selectAccount.name = action.payload.name
                                }
                            }
                        })
                    } else {
                        wallet.name = action.payload.name
                        if (wallet.index == state.selectWallet?.index) {
                            state.selectWallet.name = action.payload.name
                        }
                    }
                }
            })
        },

        setBalance: (state: State, action: PayloadAction<BalanceModel>) => {
            console.log('reducers setBalance >>> ' + JSON.stringify(action.payload))
            return {
                ...state,
                balance: action.payload
            }
        },

    }
})


export const {
    loadWalletAction,
    addWalletAction,
    deleteWalletAction,
    addWalletAccountAction,
    setSelectCurrencyType,
    changeCurrentWallet,
    updateWalletExport,
    updateWalletName,
    setBalance
} = walletSlice.actions;
export default walletSlice.reducer;