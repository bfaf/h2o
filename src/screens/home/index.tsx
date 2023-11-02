/**
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Image, Platform, AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { FAB, Portal, Icon, Button } from 'react-native-paper';
import WaterLevelContainer from './waterLevelContainer';
import Notifications from '../../Notifications';

import MaskedView from '@react-native-masked-view/masked-view';
import { fetchSettingDesiredDailyConsumption, fetchWaterConsumptionSoFar, fetchWaterLevelSoFar, fetchCoffeesConsumedSoFar, addWaterLevelSoFar, addCoffeesConsumed, addWaterConsumedSoFar, resetDailyData } from '../../stores/redux/thunks/dailyConsumption';
import { currentDateSelector } from '../../stores/redux/slices/currentDateSlice';
import { getCurrentDate, getCurrentDateForNotifications, getNextDayNotification } from '../../utils/date';
import { fetchCurrentDate, setCurrentDate } from '../../stores/redux/thunks/currentDate';

const getRandomInt = (max: number):number => Math.floor(Math.random() * max);

export const Home = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const [openLiquids, setOpenLiquids] = useState<boolean>(false);
    const { currentConsumtionMl, desiredDailyConsumption, waterLevel, coffeesConsumed } = useSelector(daylyConsumption);
    const { currentDate } = useSelector(currentDateSelector);

    const scheduleNotifications = () => {
        const nnn = getCurrentDateForNotifications();
        const currentHour = new Date(Date.now()).getHours() + 1;
        for (let i = currentHour; i < 18; i++) {
            const hh = i < 10 ? '0' + i : i;
            console.log(`${nnn}${hh}:00:00`);
            const date = new Date(Date.parse(`${nnn}${hh}:00:00`));
            Notifications.scheduleNotification(date);
        }
        const nextDayNotif = new Date(Date.parse(getNextDayNotification()));
        Notifications.scheduleNotification(nextDayNotif);
    };

    useEffect(() => {
        const initValues = async () => {
            try {
                await dispatch(fetchSettingDesiredDailyConsumption());
                await dispatch(fetchWaterConsumptionSoFar());
                await dispatch(fetchWaterLevelSoFar());
                await dispatch(fetchCoffeesConsumedSoFar());
                await dispatch(fetchCurrentDate());
            } catch (err) {
                // need to use common way to display errors
                console.log(err);
            }
        };
        initValues();
    }, []);

    useEffect(() => {

        const reset = () => {
            const today = getCurrentDate();
            if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
                dispatch(setCurrentDate());
                dispatch(resetDailyData());
                scheduleNotifications();
            }
        };
        const subscription = AppState.addEventListener('change', nextAppState => {
            reset(); // When app wasn't closed but  changed state to background or foreground
        });
        reset(); // When app is launched if OS closed it

        return () => {
            subscription.remove();
        };
    }, [currentDate]);

    const calculateIncrease = (value: number) => {
        const totalHeight = 200;
        const calculated = totalHeight * (((value / desiredDailyConsumption)));
        if ((waterLevel - calculated) < 0) {
            dispatch(addWaterLevelSoFar(0))
            return;
        }

        dispatch(addWaterLevelSoFar(waterLevel - calculated));
    }

    const renderMaskedView = (waterLevel: number) => {
        const isIOS = Platform.OS === 'ios';
        if (isIOS) {
            return (
                <MaskedView
                    key="maskedView"
                    style={styles.maskedView}
                    maskElement={<WaterLevelContainer increse={waterLevel} />} >
                    <Image key="watered" source={require('../../images/human-watered-200.png')} style={styles.mask} />
                </MaskedView>
            );
        } else {
            return (<MaskedView
                key="maskedView"
                style={styles.maskedView}
                maskElement={<WaterLevelContainer increse={waterLevel} />} >
                <Image key="watered" source={require('../../images/human-watered-200.png')} style={styles.mask} />
            </MaskedView>
            );
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dailyLimit}>
                <Text style={styles.dailyLimitText}>Daily limit</Text>
                <Text style={styles.dailyLimitText}>{desiredDailyConsumption} ml</Text>
                <Text style={styles.dailyLimitTextSmall}>{coffeesConsumed} <Icon source='coffee' size={14} color='#000' /> included</Text>
            </View>
            <View style={styles.maskView}>
                <Image key="top" source={require('../../images/human-200.png')} style={styles.image} />
                {renderMaskedView(waterLevel)}
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
                            onPress: () => { dispatch(addCoffeesConsumed()); calculateIncrease(-200) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 500ml',
                            onPress: () => { dispatch(addWaterConsumedSoFar(500)); calculateIncrease(500) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 300ml',
                            onPress: () => { dispatch(addWaterConsumedSoFar(300)); calculateIncrease(300) },
                        },
                        {
                            icon: 'cup',
                            label: '+ 200ml',
                            onPress: () => { dispatch(addWaterConsumedSoFar(200)); calculateIncrease(200) },
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
