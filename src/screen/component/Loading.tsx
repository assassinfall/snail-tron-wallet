import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-native-modal";
import store from "./../../redux/store";


type RootState = ReturnType<typeof store.getState>;

export default function Loading(): JSX.Element{

    const loading = useSelector((state: RootState) => {
        return state.loadingState.loading;
    });

    return (
        <Modal
            isVisible={loading}
            backdropOpacity={0.2}
            useNativeDriver={true}
            style={{ alignItems: 'center' }}
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
        >

            <View style={styles.loading}>
                <ActivityIndicator size={'large'} color={'white'} />
                <Text style={{ marginTop: 10,color:'white' }}>加载中...</Text>

            </View>
        </Modal>
    )

}

const styles = StyleSheet.create({
    loading: {
        padding: 20,
        alignItems: "center",
        backgroundColor: '#333333',
        borderRadius: 10,
        width: 100,
        height: 100
    }
});
