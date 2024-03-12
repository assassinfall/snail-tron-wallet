import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface BottomButtonProps {
    disabled: boolean,
    onPress?: ((event: GestureResponderEvent) => void) | undefined;
    title: string,
    borderRadis?:number
}

export default function BottomButton(props: BottomButtonProps) {

    const disabled = props.disabled
    const backgroundColor = disabled ? "#ebebeb" : "#333333"
    const okColor = disabled ? "#999999" : "white"
    const  borderRadis = props.borderRadis ? props.borderRadis : 25
    return (

        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
            <TouchableOpacity
                activeOpacity={0.5}
                disabled={disabled}
                style={[styles.confirm, {
                    backgroundColor: backgroundColor,
                    borderRadius:borderRadis
                }]}
                onPress={props.onPress}
            >
                <Text style={{ fontSize: 16, color: okColor }}>
                    {props.title}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    confirm: {
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
