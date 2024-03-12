import {
    AppRegistry,
    StyleSheet,
    View,
    PixelRatio,
    Image
} from 'react-native';

global.GStyle = {
    pixel: 1 / PixelRatio.get(),

    // 边框
    borT: {borderTopWidth: 1 / PixelRatio.get(), borderTopColor: '#dedede',},
    borB: {borderBottomWidth: 1 / PixelRatio.get(), borderBottomColor: '#dedede',},

    /* __ 布局控制 */
    align_l: {textAlign: 'left'},
    align_c: {textAlign: 'center'},
    align_r: {textAlign: 'right'},

    pos_rel: {position: 'relative'},
    pos_abs: {position: 'absolute'},

    /* __ 颜色（背景、文字） */
    bg_fff: {backgroundColor: '#fff'},
    bg_45cff5: {backgroundColor: '#45cff5'},
    c_fff: {color: '#fff'},
    c_999: {color: '#999'},
    c_45cff5: {color: '#45cff5'},

    /* __ 字号 */
    fs_14: {fontSize: 14},
    fs_16: {fontSize: 16},
    fs_20: {fontSize: 20},
    fs_24: {fontSize: 24},

    /* __ 字体 */
    ff_ic: {fontFamily: 'iconfont'},
    ff_ar: {fontFamily: 'arial'},
    iconfont: {fontFamily: 'iconfont', fontSize: 16,},

    /* __ 间距（ 5/10/15/20/25/30/50 ） */
    mt_10: {marginTop: 10}, mt_15: {marginTop: 15}, mt_20: {marginTop: 20},
    mb_10: {marginBottom: 10}, mb_15: {marginBottom: 15}, mb_20: {marginBottom: 20},

    /* __ 行高 */
    lh_20: {lineHeight: 20},
    lh_25: {lineHeight: 25},
    lh_30: {lineHeight: 30},
    lh_35: {lineHeight: 35},
    lh_40: {lineHeight: 40},

    flex1: {flex: 1},
    flex2: {flex: 2},

    flex_alignC: {alignItems: 'center'},
    flex_alignT: {alignItems: 'flex-start'},
    flex_alignB: {alignItems: 'flex-end'},
}