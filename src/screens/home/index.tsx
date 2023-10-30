/**
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Image, Platform, AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { FAB, Portal, Icon } from 'react-native-paper';
import WaterLevelContainer from './waterLevelContainer';

import MaskedView from '@react-native-masked-view/masked-view';
import { fetchSettingDesiredDailyConsumption, fetchWaterConsumptionSoFar, fetchWaterLevelSoFar, fetchCoffeesConsumedSoFar, addWaterLevelSoFar, addCoffeesConsumed, addWaterConsumedSoFar, resetDailyData } from '../../stores/redux/thunks/dailyConsumption';
import { currentDateSelector } from '../../stores/redux/slices/currentDateSlice';
import { getCurrentDate } from '../../utils/date';
import { fetchCurrentDate } from '../../stores/redux/thunks/currentDate';
import BackgroundService from 'react-native-background-actions';


import { Notification, Notifications } from 'react-native-notifications';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const sleep = (time: number) => new Promise((resolve) => setTimeout(() => resolve(''), time));


export const Home = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const [openLiquids, setOpenLiquids] = useState<boolean>(false);
    const { currentConsumtionMl, desiredDailyConsumption, waterLevel, coffeesConsumed } = useSelector(daylyConsumption);
    const { currentDate } = useSelector(currentDateSelector);

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
        Notifications.registerRemoteNotifications();

        Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion) => {
            // console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`);
            completion({ alert: false, sound: false, badge: false });
        });

        Notifications.events().registerNotificationOpened((notification: Notification, completion) => {
            // console.log(`Notification opened: ${notification.payload}`);
            completion();
        });
    }, []);

    useEffect(() => {
        const task = async () => {
            const veryIntensiveTask = async (taskDataArguments: any) => {
                const { delay } = taskDataArguments;
                await new Promise(async (resolve) => {
                    while (BackgroundService.isRunning()) {
                        const time = new Date();
                        const hours = time.getHours();
                        const minutes = time.getMinutes();
                        const shouldShow = (hours >= 9 && hours <= 17) && (minutes === 0);
                        console.log('shouldShow', shouldShow, time.getMinutes());
                        if (shouldShow) {
                            Notifications.postLocalNotification({
                                body: 'Reminder to drink water!',
                                title: 'h2o',
                                sound: '',
                                type: 'local',
                                identifier: '',
                                payload: {},
                                badge: 0,
                                thread: '1',
                            }, getRandomInt(1000000));
                        }
                        await sleep(delay);
                    }
                });
            };

            const options = {
                taskName: 'Reminder',
                taskTitle: 'Drink water',
                taskDesc: 'Reminder to drink water!',
                taskIcon: {
                    name: 'ic_launcher',
                    type: 'mipmap',
                },
                color: '#ff00ff',
                linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
                parameters: {
                    delay: 60 * 1000,
                },
            };

            await BackgroundService.start(veryIntensiveTask, options);
        };

        task();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                const today = getCurrentDate();
                if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
                    dispatch(resetDailyData());
                }
            }
        });

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
                androidRenderingMode='software'
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
                <Text style={styles.dailyLimitTextSmall}>{coffeesConsumed} <Icon source='coffee' size={14} color='#000'/> included</Text>
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
