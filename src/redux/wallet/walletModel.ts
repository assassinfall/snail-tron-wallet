
export type MnemonicModel = {
    phrase: string,
    path: string,
    locale: string
}

export type WalletAccountModel = {
    mnemonic: MnemonicModel,
    privateKey: string,
    publicKey: string,
    address: string,
    name:string,
    index:number
}
export type WalletModel = {
    accounts: WalletAccountModel[],
    name:string,
    phrase: string,
    index:number,
    from:string,
    exported:boolean
}

export type AccountAddedType = {
    account:WalletAccountModel,
    parentIndex:number
}
export type SelectedWalletModel = {
    wallet:WalletModel,
    account: WalletAccountModel,
}

export type ReceiveAmountType = {
    amount:string,
    count:number
}
//货币， 人民币：CNY ，美元：USD
export type CurrencyType = {
    id:string,
    name:string
}

//导出助记词
export type ExportedType = {
    index:number,
    exported:boolean
}
export type updateWalletNameType = {
    index:number, //账号index
    name:string,
    parentIndex:number//钱包index
}

export type BalanceModel = {
    active:boolean,
    trxBalance: number,
    usdtBalance: number,
    address: string,
    freeNetUsed: number,
    freeNetLimit: number,
    EnergyUsed: number,
    EnergyLimit: number,
    netProgress:number,
    energyProgress:number,
  }
  

//1.定义状态数据
export type State = {
    wallets: WalletModel[],
    selectWallet?:WalletModel
    selectAccount?:WalletAccountModel,
    selectCurrencyType?:CurrencyType,
    balance?: BalanceModel
}