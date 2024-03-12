import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-community/clipboard';
import RootToast from 'react-native-root-toast';

export function timestampToTime (timestamp) {
    var date = new Date(timestamp);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
}

export default function copyToboard(address) {
    Clipboard.setString(address)
    let text = address + " 已复制到剪切板👋"
    Toast.show({
        type: 'success',
        text1: '复制成功',
        text2: text,
    });
}

export function showToast (msg) {
    RootToast.show(msg, {
        duration: RootToast.durations.LONG,
        position: RootToast.positions.CENTER,
    });
}