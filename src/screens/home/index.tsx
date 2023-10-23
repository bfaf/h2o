/**
 * @format
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/redux/store';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
});

export const Home = (): JSX.Element => {
    const { currentConsumtionMl } = useSelector((state: RootState) => state.daylyConsumption);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text><FontAwesome6 name={'comments'} solid /> {currentConsumtionMl} ml</Text>
            </View>
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
