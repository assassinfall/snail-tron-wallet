import rn_bridge from './bridge.cjs';
import TronWeb from 'tronweb'
import md5 from 'md5'

const trc20ContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//contract address    

const isDebug = false;

export default class Wallet {

    constructor(db, network) {
        this.db = db
        this.network = network
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.trongrid.io");//https://api.shasta.trongrid.io
        const solidityNode = new HttpProvider("https://api.trongrid.io");
        const eventServer = new HttpProvider("https://api.trongrid.io");
        this.tronWeb = new TronWeb(fullNode, solidityNode, eventServer, '');
        // this.tronWeb.setHeader({ "TRON-PRO-API-KEY": '4865bb9a-cda8-42f1-867b-e1e0f9ec5240' });
    }

    sendMessage(msg) {
        rn_bridge.channel.send(JSON.stringify(msg) ?? "null")
    }

    async start() {
        rn_bridge.channel.on('loadWallets', (params) => {
            this.loadWallets()
        });
        rn_bridge.channel.on('addWallet', (params) => {
            this.addWallet(params)
        });
        rn_bridge.channel.on('addAccount', (params) => {
            this.addAccount(params)
        });
        rn_bridge.channel.on('removeWallet', (params) => {
            this.removeWallet(params)
        });
        rn_bridge.channel.on('addWalletFromSeed', (params) => {
            this.addWalletFromSeed(params)
        });
        rn_bridge.channel.on('addWalletFromPrivateKey', (params) => {
            this.addWalletFromPrivateKey(params)
        });
        rn_bridge.channel.on('editWalletName', (params) => {
            this.editWalletName(params)
        });
        rn_bridge.channel.on('editAccountName', (params) => {
            this.editAccountName(params)
        });
        rn_bridge.channel.on('getBalance', (params) => {
            this.getBalance(params)
        });
        rn_bridge.channel.on('saveSelectWalletAndAccount', (params) => {
            this.saveSelectWalletAndAccount(params)
        });
        rn_bridge.channel.on('getSelectWalletAndAccount', () => {
            this.getSelectWalletAndAccount()
        });
        rn_bridge.channel.on('sendTRXTransaction', (params) => {
            this.sendTRXTransaction(params)
        });
        rn_bridge.channel.on('sendTrc20Transaction', (params) => {
            this.sendTrc20Transaction(params)
        });
        rn_bridge.channel.on('getTransaction', (params) => {
            this.getTransaction(params)
        });
        rn_bridge.channel.on('getTransactionInfo', (params) => {
            this.getTransactionInfo(params)
        });
        rn_bridge.channel.on('getAccountActive', (params) => {
            this.getAccountActive(params)
        });
        rn_bridge.channel.on('updateWalletExport', (params) => {
            this.updateWalletExport(params)
        });
        rn_bridge.channel.on('estimateFee', (params) => {
            this.estimateFee(params)
        });
        rn_bridge.channel.on('checkAddress', (params) => {
            this.checkAddress(params)
        });

        await this.checkWallet()
    }

    async checkAddress(params) {
        const address = params.address
        const valid = this.tronWeb.isAddress(address)
        rn_bridge.channel.post("checkAddressResult", valid)
    }

    async updateWalletExport(params) {
        const word = params.word
        try {
            let key = this.genWalletKey(word)
            let wallet = await this.db.get(key)
            wallet.exported = true
            await this.db.insert(key, wallet)
        } catch (error) {
            this.sendMessage('更新备份flag失败!')
        }
    }

    async checkWallet() {
        var indexs = await this.getWalletIndexs()
        if (indexs.length == 0) {
            if (isDebug) {
                console.log('创建第一个钱包')
            }
            await this.addWallet({ load: false })
        }
    }

    async editWalletName(params) {
        const word = params.word
        try {
            let key = this.genWalletKey(word)
            let wallet = await this.db.get(key)
            wallet.name = params.name
            await this.db.insert(key, wallet)
        } catch (error) {
            this.sendMessage('修改名称失败!')
        }
    }

    async editAccountName(params) {
        const word = params.word
        const index = params.index
        try {
            let key = this.genWalletKey(word)
            let wallet = await this.db.get(key)
            wallet.accounts.forEach(element => {
                if (element.index == index) {
                    element.name = params.name
                }
            });
            await this.db.insert(key, wallet)
        } catch (error) {
            this.sendMessage('修改名称失败!')
        }
    }

    async loadWallets() {

        var wallets = []
        var indexs = await this.getWalletIndexs()
        for (var i = 0; i < indexs.length; i++) {
            let index = indexs[i] + 1
            try {
                let wordKey = this.genWalletSeedKey(index)
                let word = await this.db.get(wordKey)
                let key = this.genWalletKey(word)
                let value = await this.db.get(key)
                wallets.push(value)
            } catch (error) {
                console.log(error)
            }
        }
        if (isDebug) {
            console.log(wallets)
        }
        wallets.sort((a, b) => {
            return a.index - b.index
        })
        // this.sendMessage('wallets count ' + wallets.length)
        rn_bridge.channel.post("loadWalletsResult", wallets)
    }

    async getWalletIndexs() {
        var arr = []
        let key = 'wallet_word_key_count_indexs'
        try {
            arr = await this.db.get(key)
        } catch (error) {
            console.log(error)
        }
        return arr
    }

    async updateWalletIndexs(index) {
        let key = 'wallet_word_key_count_indexs'
        var indexs = await this.getWalletIndexs()
        if (indexs.indexOf(index) >= 0) {
        } else {
            indexs.push(index)
            await this.db.insert(key, indexs)
        }
    }

    async deleteWalletIndexs(index) {
        let key = 'wallet_word_key_count_indexs'
        var indexs = await this.getWalletIndexs()
        indexs = indexs.filter((item) => {
            return item != index
        })
        await this.db.insert(key, indexs)
    }

    async nextWalletIndex() {
        var indexs = await this.getWalletIndexs()
        if (indexs.length == 0) {
            return 0
        }
        indexs = indexs.sort()
        var index = 0
        for (var i = 0; i < indexs.length; i++) {
            const item = indexs[i]
            if (item == i) {
                index = i
            } else if (item > i) {
                index = i
                break
            }
        }
        return index == indexs.length - 1 ? index + 1 : index
    }

    genWalletSeedKey(index) {
        //wallet_word_key_1
        return 'wallet_word_key_' + index
    }

    genWalletKey(word) {
        //wallet_word_key_2b5ff1405d7d45c5eeb91392fb5c3d9b_1_tron
        let key = md5(word)
        return 'wallet_word_key_' + key + "_" + this.network
    }

    async addWalletFromSeed(params) {
        const seed = params.seed
        var exist = false
        try {
            let key = this.genWalletKey(seed)
            const w = await this.db.get(key)
            exist = true
        }catch(error) {

        }
        if (exist) {
            this.sendMessage('钱包已存在')
            return
        }

        try {
            const w = await TronWeb.fromMnemonic(seed)
            var obj = new Object()
            obj.mnemonic = w.mnemonic
            obj.privateKey = w.privateKey
            obj.publicKey = w.publicKey
            obj.address = w.address
            var index = await this.nextWalletIndex()
            obj.name = "账户1"
            obj.index = 0
            let wordKey = this.genWalletSeedKey(index + 1)
            let key = this.genWalletKey(w.mnemonic.phrase)
            var wallet = new Object()
            wallet.name = "钱包" + (index + 1)
            wallet.accounts = [obj]
            wallet.phrase = w.mnemonic.phrase
            wallet.index = index
            wallet.from = 'seed'
            wallet.exported = true
            var success = true
            await this.db.insert(wordKey, w.mnemonic.phrase)
            await this.db.insert(key, wallet)
            await this.updateWalletIndexs(index)
        } catch (error) {
            console.log(error)
            success = false
            var msg = "添加钱包失败!"
            if (error.message == "invalid mnemonic") {
                msg = "无效的种子!"
            }
            this.sendMessage(msg)
        }
        if (success) {
            this.loadWallets()
            rn_bridge.channel.post("addWalletFromSeedSuccess")
        }
    }

    removePrefixPrivateKey(privateKey) {
        if (privateKey.indexOf('0x') === 0) {
            privateKey = privateKey.slice(2)
        }
        return privateKey
    }

    //私钥导入钱包
    async addWalletFromPrivateKey(params) {
        var privateKey = params.privateKey
        if (privateKey.indexOf('0x') === 0) {
            privateKey = privateKey.slice(2)
        }
        const address = await this.tronWeb.address.fromPrivateKey(privateKey)
        if (!address) {
            this.sendMessage('无效的私钥')
            return
        }
        var exist = false
        try {
            let key = this.genWalletKey(privateKey)
            const w = await this.db.get(key)
            exist = true
        }catch(error) {

        }
        if (exist) {
            this.sendMessage('钱包已存在')
            return
        }
        try {
            var obj = new Object()
            obj.mnemonic = ''
            obj.privateKey = privateKey
            obj.publicKey = ''
            obj.address = address
            var index = await this.nextWalletIndex()
            obj.name = "账户1"
            obj.index = 0
            let wordKey = this.genWalletSeedKey(index + 1)
            let key = this.genWalletKey(privateKey)
            var wallet = new Object()
            wallet.name = "钱包" + (index + 1)
            wallet.accounts = [obj]
            wallet.phrase = privateKey
            wallet.index = index
            wallet.from = 'privateKey'
            wallet.exported = true
            var success = true
            await this.db.insert(wordKey, privateKey)
            await this.db.insert(key, wallet)
            await this.updateWalletIndexs(index)
        } catch (error) {
            console.log(error)
            success = false
            var msg = "导入钱包失败!"
            this.sendMessage(msg)
        }
        if (success) {
            this.loadWallets()
            rn_bridge.channel.post("addWalletFromPrivateKeySuccess")
        }
    }

    async addWallet(params) {
        const load = params.load
        //随机一个钱包
        const w = await this.tronWeb.createRandom({ path: "m/44'/195'/0'/0/0", extraEntropy: '', locale: 'en' });
        var obj = new Object()
        obj.mnemonic = w.mnemonic
        obj.privateKey = w.privateKey
        obj.publicKey = w.publicKey
        obj.address = w.address
        var index = await this.nextWalletIndex()
        obj.name = "账户1"
        obj.index = 0
        let wordKey = this.genWalletSeedKey(index + 1)
        let key = this.genWalletKey(w.mnemonic.phrase)
        var wallet = new Object()
        wallet.name = "钱包" + (index + 1)
        wallet.accounts = [obj]
        wallet.phrase = w.mnemonic.phrase
        wallet.index = index
        wallet.from = 'seed'
        wallet.exported = false
        var success = true
        try {
            await this.db.insert(wordKey, w.mnemonic.phrase)
            await this.db.insert(key, wallet)
            await this.updateWalletIndexs(index)
        } catch (error) {
            console.log(error)
            success = false
            rn_bridge.channel.send('添加钱包失败!')
        }
        if (isDebug) {
            console.log(obj)
        }
        if (success && load) {
            this.loadWallets()
        }
    }


    async addAccount(params) {
        const word = params.word
        const parentIndex = params.parentIndex

        try {
            let key = this.genWalletKey(word)
            let wallet = await this.db.get(key)
            let path = "m/44'/195'/0'/0/" + wallet.accounts.length
            const w = await this.tronWeb.fromMnemonic(word, path)
            var obj = new Object()
            obj.mnemonic = w.mnemonic
            obj.privateKey = w.privateKey
            obj.publicKey = w.publicKey
            obj.address = w.address
            obj.name = "账户" + (wallet.accounts.length + 1)
            obj.index = wallet.accounts.length
            wallet.accounts.push(obj)
            await this.db.insert(key, wallet)
        } catch (error) {
            rn_bridge.channel.send('添加账户失败!')
        }
        rn_bridge.channel.post('addAccount', { 'account': obj, 'parentIndex': parentIndex })
    }

    async saveSelectWalletAndAccount(params) {
        const wallet = params.wallet
        const account = params.account
        try {
            await this.db.insert('selectWallet', wallet)
            await this.db.insert('selectWalletAccount', account)
        } catch (error) {
            this.sendMessage(error.message)
        }
    }

    async getSelectWalletAndAccount() {
        // this.sendMessage('getSelectWalletAndAccount')
        try {
            const wallet = await this.db.get('selectWallet')
            const account = await this.db.get('selectWalletAccount')
            rn_bridge.channel.post('getSelectWalletAndAccountResult', { 'wallet': wallet, 'account': account })

        } catch (error) {
            rn_bridge.channel.post('getSelectWalletAndAccountResult', { 'wallet': undefined, 'account': undefined })
        }
    }

    async removeWallet(params) {
        const index = params.index
        const word = params.word
        try {
            let key = this.genWalletKey(word)
            await this.db.del(key)
            await this.deleteWalletIndexs(index)
        } catch (error) {

        }
    }

    async getAccountInfo() {

    }

    async getAccountActive(params) {
        const address = params.address
        const info = await this.tronWeb.trx.getAccount(address)
        if (info.active_permission != undefined && info.active_permission[0].type == 'Active') {
            rn_bridge.channel.post('getAccountActiveResult', { "active": true })
        } else {
            rn_bridge.channel.post('getAccountActiveResult', { "active": false })
        }
    }

    async getBalance(params) {
        const address = params.address
        var obj = new Object()
        try {
            const result = await Promise.all(
                [
                    this.tronWeb.trx.getAccount(address),
                    this.getTrc20Balance(address),
                    this.tronWeb.trx.getAccountResources(address),
                    this.tronWeb.trx.getBalance(address),
                ]
            )
            const account = result[0]
            const resource = result[2]
            obj.address = address
            obj.active = account.active_permission && account.active_permission[0].type == "Active"
            obj.trxBalance = this.tronWeb.fromSun(result[3])
            obj.usdtBalance = this.tronWeb.fromSun(result[1])
            obj.freeNetLimit = resource.freeNetLimit ?? 0
            obj.freeNetUsed = resource.freeNetUsed ?? 0
            obj.EnergyUsed = resource.EnergyUsed ?? 0
            obj.EnergyLimit = resource.EnergyLimit ?? 0
            if (obj.freeNetLimit > 0) {
                const progress = (obj.freeNetLimit - obj.freeNetUsed) * 1.0 / obj.freeNetLimit
                obj.netProgress = progress > 1 ? 1 : progress
            } else {
                obj.netProgress = 0
            }
            if (obj.EnergyLimit > 0) {
                const progress = (obj.EnergyLimit - obj.EnergyUsed) * 1.0 / obj.EnergyLimit
                obj.energyProgress = progress > 1 ? 1 : progress
            } else {
                obj.energyProgress = 0
            }
            rn_bridge.channel.post('setBalance', obj)
        } catch (error) {
            this.sendMessage(error.message)
            rn_bridge.channel.post('setBalance', undefined)
        }

    }

    async getTransaction(params) {
        const txid = params.txid
        try {
            const info = await this.tronWeb.trx.getTransaction(txid)
            rn_bridge.channel.post('getTransactionResult', info)
        } catch (error) {
            this.sendMessage(error.message)
        }
    }

    async getTransactionInfo(params) {
        const txid = params.txid
        // this.sendMessage("txid: " + txid)
        try {
            const info = await this.tronWeb.trx.getTransactionInfo(txid)
            rn_bridge.channel.post('getTransactionInfoResult', info)
        } catch (error) {
            this.sendMessage(error.message)
        }
    }

    async sendTRXTransaction(params) {
        const privateKey = this.removePrefixPrivateKey(params.privateKey)
        const address_to = params.address_to
        const amount = params.amount
        console.log(params)
        // this.sendMessage(JSON.stringify(params))
        try {
            const result = await this.tronWeb.trx.sendTransaction(address_to, this.tronWeb.toSun(amount), privateKey)
            rn_bridge.channel.post('sendTRXTransactionResult', result)
        } catch (error) {
            this.sendMessage(error.message)
        }
    }

    async sendTrc20Transaction(params) {
        const privateKey = this.removePrefixPrivateKey(params.privateKey)
        const address_to = params.address_to
        const amount = params.amount
        try {
            const result = await this.transferTrc20(address_to, this.tronWeb.toSun(amount), privateKey)
            rn_bridge.channel.post('sendTrc20TransactionResult', result)//只有id
        } catch (error) {
            this.sendMessage(error.message)
        }
    }

    //估算价格
    async estimateFee(params) {
        // this.sendMessage("estimateFee params" + JSON.stringify(params))
        try {
            const address_from = params.address_from
            const address_to = params.address_to
            const network = params.network
            const amount = params.amount
            const parameters = await this.tronWeb.trx.getChainParameters();
            if (network == 'TRX') {
                const info = await this.tronWeb.trx.getAccount(address_to)
                if (info.active_permission != undefined && info.active_permission[0].type == 'Active') {
                    var getTransactionFee = 0
                    parameters.forEach(e => {
                        var key = e['key']
                        var value = e['value']
                        if ('getTransactionFee' == key) {
                            getTransactionFee = value
                        }
                    });
                    const transactionBuilder = await this.tronWeb.transactionBuilder.sendTrx(address_to, this.tronWeb.toSun(amount), address_from);
                    const fee = getTransactionFee * transactionBuilder.raw_data_hex.length
                    // this.sendMessage("estimateFee  2 fee" + fee)
                    rn_bridge.channel.post('estimateFeeResult', this.tronWeb.fromSun(fee))
                } else {

                    var getCreateAccountFee = 0
                    var getCreateNewAccountFeeInSystemContract = 0
                    parameters.forEach(e => {
                        var key = e['key']
                        var value = e['value']
                        if ('getCreateAccountFee' == key) {
                            getCreateAccountFee = value
                        } else if ('getCreateNewAccountFeeInSystemContract' == key) {
                            getCreateNewAccountFeeInSystemContract = value
                        }
                    });
                    // this.sendMessage("estimateFee  3 fee" +( getCreateAccountFee + getCreateNewAccountFeeInSystemContract))
                    rn_bridge.channel.post('estimateFeeResult', this.tronWeb.fromSun(getCreateAccountFee + getCreateNewAccountFeeInSystemContract))
                }
            } else {
                const parameter1 = [{ type: 'address', value: address_to }, { type: 'uint256', value: this.tronWeb.toSun(amount) }];
                const contractAddress = this.tronWeb.address.toHex(trc20ContractAddress)
                const address = this.tronWeb.address.toHex(address_from)
                const transaction = await this.tronWeb.transactionBuilder.triggerConstantContract(contractAddress, "transfer(address,uint256)", {},
                    parameter1, address);
                var fee = 0
                parameters.forEach(e => {
                    var key = e['key']
                    var value = e['value']
                    if ('getEnergyFee' == key) {
                        fee = value
                    }

                });
                // this.sendMessage("estimateFee  u fee" + transaction.energy_used * fee)
                rn_bridge.channel.post('estimateFeeResult', this.tronWeb.fromSun(transaction.energy_used * fee))
            }
        } catch (error) {
            this.sendMessage("estimateFee " + error)
        }

    }
    async getTrc20Balance(address) {
        try {
            let contract = await this.tronWeb.contract().at(trc20ContractAddress);
            let result = await contract.balanceOf(address).call();
            if (isDebug) {
                console.log('result: ', result);
            }
            return result.toNumber()
        } catch (error) {
            console.error("trigger smart contract error", error)
        }
        return 0;
    }

    async transferTrc20(address_to, amount, privateKey) {
        this.tronWeb.setPrivateKey(privateKey);
        try {
            let contract = await this.tronWeb.contract().at(trc20ContractAddress);
            let result = await contract.transfer(
                address_to,
                amount
            ).send();
            if (isDebug) {
                console.log('result: ', result);
            }
            return result
        } catch (error) {
            console.error("trigger smart contract error", error)
        }
    }
}
