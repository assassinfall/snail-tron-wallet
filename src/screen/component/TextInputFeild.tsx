import {
    View,
    TextInput,
    Pressable,
    Image,
    GestureResponderEvent,
    Text,
    ScrollView,
    StyleSheet,
    KeyboardTypeOptions,
} from 'react-native';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';


type Props = {
    title?: string;
    icon?: string;
    placeholder?: string;
    isInvalid?: boolean;
    caption?: string;
    value: string;
    valueSetter: Dispatch<SetStateAction<string>>;
    disabled?: boolean;
    autoFill?: boolean;
    keyboardType?: KeyboardTypeOptions | undefined;
    isAmount?:boolean
};
export default function TextInputField({
    title,
    icon,
    placeholder,
    isInvalid,
    value,
    valueSetter,
    caption,
    disabled = false,
    autoFill = false,
    keyboardType = 'default',
    isAmount = false
}: Props) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if(value != undefined && isAmount) {
            let vals:any = value.replace(/[^\d^\.?]+/g, "").replace(/^0+(\d)/, "$1").replace(/^\./, "0.").match(/^\d*(\.?\d{0,2})/g)
            if (vals?.length > 0) {
                let val = vals[0] || ""
                if (val != value) {
                    valueSetter(val)
                    console.log(val)
                    console.log(value)
                }
            }
        }
    }, [value]);

    return (
        <View style={{ flex:1}}>
            <Pressable
                // onPress={() => inputRef.current?.focus()}
                style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.contentStyle}>
                    {/* {icon && (
              <Image
                style={{width:20,height:20}}
                resizeMethod="resize"
                source={assets.PersonImage}
              />
            )} */}
                    <TextInput
                        editable={!disabled}
                        //   selectionColor={theme.neutralGray1}
                        value={value}
                        onChangeText={valueSetter}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        style={styles.inputField}
                        placeholder={placeholder}
                        ref={inputRef}
                        keyboardType={keyboardType}
                    />
                    {focused && (
                        <Pressable
                        style={{padding:5}}
                            onPress={() => {
                                valueSetter('');
                            }}>
                            <Ionicons name={"close-circle"} size={15} color="#999999" />
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({

    title: {

    },
    container: {
       
        flexDirection: 'row',
        borderRadius: 5,
        alignItems: 'center',
    },
    inputField: {
        flex: 1,
    },
    contentStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eeeeee',
        borderRadius: 5,
        borderColor: '#eeeeee',
        paddingHorizontal: 10
    }
});
