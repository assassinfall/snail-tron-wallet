import React, { Component } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Button
} from 'react-native';

export default class SplashScreen extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            console.log('页面进入SplashScreen');
            console.log(this.props.navigation.cou)
        });
        this.props.navigation.addListener('blur', () => {
            console.log('页面离开SplashScreen');
        });
    }

    render() {
        return (

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>SplashScreen</Text>
            </View>
        )
    }
}