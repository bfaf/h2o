/**
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Image, Dimensions, Animated, Easing } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../stores/redux/store';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { addCoffee, addConsumtion, fetchSettingDesiredDailyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { FAB, Portal } from 'react-native-paper';
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

type FadeInViewProps = PropsWithChildren<{ style?: ViewStyle, increse: number }>;
const FadeInView = ({ style, increse }: FadeInViewProps) => {
    const initialValue = 200;
    const fadeAnim = useRef(new Animated.Value(initialValue)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: increse,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, increse]);

    return (
        <Animated.View>
            <Animated.Image
                source={require('../../images/human-200.png')}
                style={{
                    width: 300,
                    transform: [{
                        translateY: fadeAnim
                    },
                    { perspective: 1000 }]
                }} />
        </Animated.View>
    );
};

export const Home = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const [openLiquids, setOpenLiquids] = useState<boolean>(false);
    const { currentConsumtionMl, desiredDailyConsumption } = useSelector((state: RootState) => state.daylyConsumption);
    const [inc, setInc] = useState<number>(200);
    const totalHeight = 200;

    useEffect(() => {
        const initValues = async () => {
            try {
                await dispatch(fetchSettingDesiredDailyConsumption());
            } catch (err) {
                // need to use common way to display errors
                console.log(err);
            }
        };
        initValues();
    }, []);

    const calculateIncrease = (value: number) => {
        const calculated = totalHeight * (((value / desiredDailyConsumption)));
        if ((inc - calculated) < 0) {
            setInc(0);
            return;
        }

        setInc(inc - calculated);
    }

    // <View>

    //             <Text style={{color: '#000'}}>Daily limit: {desiredDailyConsumption} ml</Text>
    //             <Text style={{color: '#000'}}>Current consumption: {currentConsumtionMl} ml</Text>
    //         </View>
    // 
    // 
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dailyLimit}>
                <Text style={styles.dailyLimitText}>Daily limit</Text>
                <Text style={styles.dailyLimitText}>{desiredDailyConsumption} ml</Text>
            </View>
            <View style={styles.maskView}>
                <Image key="top" source={require('../../images/human-200.png')} style={styles.image} />
                <MaskedView
                    key="maskedView"
                    style={styles.maskedView}
                    androidRenderingMode='software'
                    maskElement={<FadeInView increse={inc} />} >
                        <Image key="watered" source={require('../../images/human-watered-200.png')} style={styles.mask} />
                </MaskedView>
            </View>
            <View style={styles.consumedSoFarView}>
                <Text style={styles.dailyLimitText}>{currentConsumtionMl} ml</Text>
                <Text style={styles.dailyLimitTextSmall}>so far</Text>
            </View>
            <Portal>
                <FAB.Group
                    open={openLiquids}
                    visible
                    icon="plus"
                    onStateChange={({ open }) => setOpenLiquids(open)}
                    actions={[
                        {
                            icon: 'coffee',
                            label: '+ Coffee',
                            onPress: () => { dispatch(addCoffee()); calculateIncrease(-200) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 500ml',
                            onPress: () => { dispatch(addConsumtion(500)); calculateIncrease(500) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 300ml',
                            onPress: () => { dispatch(addConsumtion(300)); calculateIncrease(300) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 200ml',
                            onPress: () => { dispatch(addConsumtion(200)); calculateIncrease(200) },
                        },
                    ]}
                />
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
    },
    dailyLimit: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignContent: 'center',
        marginBottom: 20
    },
    dailyLimitText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '900',
        color: '#000'
    },
    dailyLimitTextSmall: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: '#000'
    },
    consumedSoFarView: {
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'center',
        marginTop: 20
    },
    maskView: {
        flex: 0,
        justifyContent: 'center',
        alignContent: 'center',
        height: 200,
        flexDirection: 'row',
        position: 'relative'
    },
    maskedView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        height: 200,
    },
    maskWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mask: {
        flex: 1,
        height: 200,
        zIndex: 10,
        position: 'absolute'
    },
    image: {
        flex: 1,
        height: 200,
        position: 'absolute'
    },
});
