import nodejs from "nodejs-mobile-react-native";
import Global from "../Global";
import { DeviceEventEmitter } from "react-native";


export default class HttpClient {

    static baseUrl = Global.baseUrl + '/api/v1/'

    static getRequest(url: string) {
        console.log(Global.token)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'app_version' : Global.appVersion
                },
            })
                .then(response => response.json())
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    static get(url: string) {
        console.log(Global.token)
        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                    'app_version' : Global.appVersion
                },
            })
                .then(response => response.json())
                .then(result => {
                    if (result.code == 403) {
                        DeviceEventEmitter.emit('Unauthenticated')
                    } else if (result.code !== 0) {
                        throw new Error(result.msg ?? "服务异常!")
                    } else {
                        resolve(result.data);
                    }
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    static post(url: string, data: any) {
        console.log(data)
        return new Promise((resolve, reject) => {
            console.log(this.baseUrl + url)
            fetch(this.baseUrl + url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                    'app_version' : Global.appVersion
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    console.log('result ', result)

                    if (result.code == 403) {
                        if(result.data.indexOf('checkLogin') >= 0) {
                            DeviceEventEmitter.emit('Unauthenticated',{'showLogin':false})
                        } else {
                            DeviceEventEmitter.emit('Unauthenticated',{'showLogin':true})
                        }
                    } else if (result.code !== 0) {
                        throw new Error(result.msg + Global.baseUrl ?? "服务异常!")
                    } else {
                        resolve(result.data);
                    }

                })
                .catch(error => {
                    console.log('err ', error.message)
                    reject(error);
                })
        })
    }

}
