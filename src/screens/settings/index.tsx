/**
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { Button, Switch, Menu, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { settings } from '../../stores/redux/slices/settingSlice';
import { setFromDate, setHumanIcon, setReminderSwitch, setRepeatInterval, setToDate, setWaterPerCoffeeCup } from '../../stores/redux/thunks/settings';
import DateTimePicker from '@react-native-community/datetimepicker';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
    reminderSwitchContainer: {
        display: 'flex',
        flexDirection: 'row',
        margin: 20,
        marginBottom: 0
    },
    reminders: {
        display: 'flex',
        flexDirection: 'column',
        margin: 20,
        marginBottom: 0
    },
    timeManagement: {
        flexDirection: 'row',
    },
    repeatInterval: {
        flexDirection: 'row',
        marginTop: 15
    },
    remindersText: {
        flex: 3,
        fontSize: 20,
        fontWeight: '600',
        color: '#000'
    },
    reminderSwitch: {
        flex: 3,
    },
    reminderFromText: {
        marginLeft: 0,
        marginRight: 10,
        textAlignVertical: 'center',
        color: '#000',
        fontSize: 16
    },
    reminderToText: {
        //marginTop: 5,
        // textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
        textAlignVertical: 'center',
        color: '#000',
        fontSize: 16
    },
    biggerText: {
        fontSize: 16
    },
});

export const Settings = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const {
        remindersToggleEnabled,
        waterPerCoffeeCup,
        repeatInterval,
        fromTime,
        toTime,
        femaleIcon,
    } = useSelector(settings);
    const [showFromDate, setShowFromDate] = useState<boolean>(false);
    const [showToDate, setShowToDate] = useState<boolean>(false);
    const [showRepeatIntervalMenu, setShowRepeatIntervalMenu] = useState<boolean>(false);
    const [showCoffeeCupMenu, setShowCoffeeCupMenu] = useState<boolean>(false);

    const onChangeFromDate = (selectedDate: Date | undefined, toDate: Date) => {
        // TODO: validate whether fromDate is bigger than toDate
        setShowFromDate(false);
        dispatch(setFromDate(selectedDate?.toISOString() || ''));
    };

    const onChangeToDate = (selectedDate: Date | undefined, fromDate: Date) => {
        // TODO: validate whether toDate is bigger than fromDate
        setShowToDate(false);
        dispatch(setToDate(selectedDate?.toISOString() || ''));
    };

    const openMenu = () => setShowRepeatIntervalMenu(true);
    const closeMenu = () => setShowRepeatIntervalMenu(false);
    const onSelectedRepeatIntervalMenuItem = (value: '30 min' | '60 min' | '90 min') => {
        switch(value) {
            case '30 min':
                dispatch(setRepeatInterval(30));
                break;
            case '60 min':
                dispatch(setRepeatInterval(60));
                break;
            case '90 min':
                dispatch(setRepeatInterval(90));
                break;
        }
        closeMenu();
    };

    const openCoffeeMenu = () => setShowCoffeeCupMenu(true);
    const closeCoffeeMenu = () => setShowCoffeeCupMenu(false);
    const onSelectedCoffeeCupMenuItem = (value: '100 ml' | '200 ml' | '300 ml' | '400 ml' | '500 ml') => {
        switch (value) {
            case '100 ml':
                dispatch(setWaterPerCoffeeCup(100));
                break;
            case '200 ml':
                dispatch(setWaterPerCoffeeCup(200));
                break;
            case '300 ml':
                dispatch(setWaterPerCoffeeCup(300));
                break;
            case '400 ml':
                dispatch(setWaterPerCoffeeCup(400));
                break;
            case '500 ml':
                dispatch(setWaterPerCoffeeCup(500));
                break;
            default:
                console.log('Wrong value is passed for water per coffee cup');
        }

        closeCoffeeMenu();
    };

    const fromTimeConverted = new Date(Date.parse(fromTime));
    const toTimeConverted = new Date(Date.parse(toTime));
    const onToggleIconSwitch = () => { dispatch(setHumanIcon(!femaleIcon)) };
    const onToggleSwitch = () => { dispatch(setReminderSwitch(!remindersToggleEnabled)) };
    const timeFormatOptions = { hour: "2-digit", minute: "2-digit", } as Intl.DateTimeFormatOptions;
    const fromTimeLocalised = fromTimeConverted.toLocaleTimeString('bg-BG', timeFormatOptions);
    const toTimeLocalised = toTimeConverted.toLocaleTimeString('bg-BG', timeFormatOptions);

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <View style={styles.reminderSwitchContainer}>
                    <Text style={styles.reminderFromText}>Water to add per cup of coffee:</Text>
                    <Menu visible={showCoffeeCupMenu} onDismiss={closeCoffeeMenu} anchor={<Button mode="outlined" labelStyle={styles.biggerText} onPress={openCoffeeMenu}>{waterPerCoffeeCup} ml</Button>}>
                        <Menu.Item onPress={() => onSelectedCoffeeCupMenuItem('100 ml')} title="100 ml" />
                        <Menu.Item onPress={() => onSelectedCoffeeCupMenuItem('200 ml')} title="200 ml" />
                        <Menu.Item onPress={() => onSelectedCoffeeCupMenuItem('300 ml')} title="300 ml" />
                        <Menu.Item onPress={() => onSelectedCoffeeCupMenuItem('400 ml')} title="400 ml" />
                        <Menu.Item onPress={() => onSelectedCoffeeCupMenuItem('500 ml')} title="500 ml" />
                    </Menu>
                </View>
                <View style={styles.reminderSwitchContainer}>
                    <Text style={styles.reminderFromText}>Use female icon</Text>
                    <Switch style={styles.reminderSwitch} value={femaleIcon} onValueChange={onToggleIconSwitch} />
                </View>
                <View style={styles.reminderSwitchContainer}>
                    <Text style={styles.remindersText}>Show reminders</Text>
                    <Switch style={styles.reminderSwitch} value={remindersToggleEnabled} onValueChange={onToggleSwitch} />
                </View>
                <View style={styles.reminders}>
                    <View style={styles.timeManagement}>
                        <Text disabled={!remindersToggleEnabled} style={styles.reminderFromText}>From: </Text>
                        <Button disabled={!remindersToggleEnabled} mode="outlined" labelStyle={styles.biggerText} onPress={() => setShowFromDate(true)} >
                            {fromTimeLocalised}
                        </Button>
                        {showFromDate && (<DateTimePicker
                            testID="dateTimePicker"
                            value={fromTimeConverted}
                            mode='time'
                            onChange={(_event, date) => onChangeFromDate(date, toTimeConverted)}
                            display='spinner'
                            is24Hour={true}
                            minuteInterval={30}
                        />)
                        }
                        <Text disabled={!remindersToggleEnabled} style={styles.reminderToText}>To: </Text>
                        <Button disabled={!remindersToggleEnabled} mode="outlined" labelStyle={styles.biggerText} onPress={() => setShowToDate(true)}>
                            {toTimeLocalised}
                        </Button>
                        {showToDate && (<DateTimePicker
                            testID="dateTimePicker"
                            value={toTimeConverted}
                            mode='time'
                            onChange={(_event, date) => onChangeToDate(date, fromTimeConverted)}
                            display='spinner'
                            is24Hour={true}
                            minuteInterval={30}
                        />)
                        }
                    </View>
                    <View style={styles.repeatInterval}>
                        <Text disabled={!remindersToggleEnabled} style={styles.reminderFromText}>Show every:</Text>
                        <Menu visible={showRepeatIntervalMenu} onDismiss={closeMenu} anchor={<Button mode="outlined" labelStyle={styles.biggerText} disabled={!remindersToggleEnabled} onPress={openMenu}>{repeatInterval} min</Button>}>
                            <Menu.Item onPress={() => onSelectedRepeatIntervalMenuItem('30 min')} title="30 min" />
                            <Menu.Item onPress={() => onSelectedRepeatIntervalMenuItem('60 min')} title="60 min" />
                            <Menu.Item onPress={() => onSelectedRepeatIntervalMenuItem('90 min')} title="90 min" />
                        </Menu>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
