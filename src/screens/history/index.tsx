/**
 * @format
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../stores/redux/store';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
});

export const History = (): JSX.Element => {
    // const { message } = useSelector((state: RootState) => state.message);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text>History</Text>
            </View>
        </SafeAreaView>
    );
};
