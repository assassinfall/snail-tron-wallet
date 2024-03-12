import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { useNavigation, StackActions, useRoute } from '@react-navigation/native';
import BottomButton from './component/BottomButton';
import nodejs from "nodejs-mobile-react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import { useSelector } from 'react-redux';
import store from '../redux/store';

type RootState = ReturnType<typeof store.getState>;

type Room = {
    id: string,
    title: string,
    desc?: string,
    unread?:number,
    time?:string
}

export default function MessageScreen(): JSX.Element {

    const navigation = useNavigation()
    const route = useRoute()
    const [content, setContent] = useState('')
    const [spinner, setSpinner] = useState(true)

    const [list, setList] = useState([] as Room[])


    useEffect(() => {
        setList([{ title: '系统消息', id: "1", desc: '不要泄漏你的助记词!!!' ,unread:0,time:""}])
        console.log("组件挂载完之后执行MessageScreen");
        const listener = nodejs.channel.addListener(
            "loadRoomsResult",
            (rooms: Room[]) => {
                setList(previousList => [...previousList, ...rooms])
            },
        );
        // nodejs.channel.post("loadRooms",{userId:currentUser?.id})
        return () => {
            console.log("组件卸载完之后执行MessageScreen");
            listener.remove()

        }
    }, []);



    const renderItem = (item: any) => {

        return (
            <TouchableOpacity onPress={() => {
                
            }} style={styles.item}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: 40, height: 40, backgroundColor: 'gray' }} />

                    <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 10 }}>
                        <Text style={{ fontSize: 16 }}>{item.title}</Text>
                        <Text style={{ fontSize: 12 }} numberOfLines={1} ellipsizeMode='tail'>{item.desc}...</Text>
                    </View>
                    <View>
                        <Text>
                            {item.time}
                        </Text>
                        <Text>
                            {item.unread > 0 ? '' : ''}
                        </Text>
                    </View>
                </View>

            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                style={{ flex: 1, marginTop: 10 }}
                data={list}
                renderItem={({ item }) => renderItem(item)}
                keyExtractor={item => '' + item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    item: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
});

