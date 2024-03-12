
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "./LoadingMoel";

const initState: State = {
    loading: false,
    walletServiceLoading:true
};

//1.创建 Slice，每个业务一个 分片
const LoadingSlice = createSlice({
    name: 'loading',   // 这个名称似乎没啥用
    initialState: initState,
    //最重要的 reducers 属性，包括多个函数
    reducers: {
        setLoading: (state: State, action: PayloadAction<boolean>) => {
            console.log('reducers setLoading >>> ' + JSON.stringify(action.payload))
            return {
                ...state,
                loading: action.payload
            }
        },
        setWalletServiceLoading: (state: State, action: PayloadAction<boolean>) => {
            console.log('reducers setWalletServiceLoading >>> ' + JSON.stringify(action.payload))
            return {
                ...state,
                walletServiceLoading: action.payload
            }
        },

    }
})

export const {
    setLoading,
    setWalletServiceLoading
} = LoadingSlice.actions;
export default LoadingSlice.reducer;