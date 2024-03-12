import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface BigButtonProps {
    onPress?: ((event: GestureResponderEvent) => void) | undefined;
    title: string;
    desc: string;
    icon: string
}

export default function BigButton(props: BigButtonProps) {

    return (

        <View style={styles.sectionContainer}>
            <TouchableOpacity
                onPress={props.onPress}
            >
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.sectionTitle}>
                            {props.title}
                        </Text>

                        <Text>
                            {props.desc}
                        </Text>
                    </View>
                    <View style={{ width: 80, height: 80 }}>
                        {/* <Ionicons name="wallet-outline" size={80} color="gray" /> */}
                    </View>
                </View>

            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    sectionContainer: {
        height: 120,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10
    },
    sectionTitle: {
        fontSize: 18,
        color: '#333333',
        marginBottom: 10
    },
});

