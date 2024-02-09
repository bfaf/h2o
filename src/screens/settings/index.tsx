/**
 * @format
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Alert, ScrollView } from 'react-native';
import { Button, Switch, Menu, Divider, Card, IconButton, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { settings } from '../../stores/redux/slices/settingSlice';
import { addWaterAmount, removeWaterAmount, setFromDate, setHumanIcon, setReminderSwitch, setRepeatInterval, setToDate, setWaterPerCoffeeCup } from '../../stores/redux/thunks/settings';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSortedWaterAmounts } from '../../utils/hooks';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
        marginLeft: 10,
        marginRight: 10,
        textAlignVertical: 'center',
        color: '#000',
        fontSize: 16
    },
    biggerText: {
        fontSize: 16
    },
    waterAmountsContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: 20,
        marginBottom: 0,
        // height: 100,
    },
    waterAmountsTitle: {
        color: '#000',
        fontSize: 20,
        fontWeight: '600'
    },
    waterAmountsDescriptionText: {
        color: '#000',
        fontSize: 16,
        margin: 0,
        padding: 0,
    },
    waterAmountInputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    applyButtonContent: {
        fontSize: 30,
        fontWeight: '800',
        verticalAlign: 'bottom'
    },
    weightInput: {
        flex: 2,
        margin: 10,
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
    const [text, setText] = React.useState("");

    const sortedWaterAmounts = useSortedWaterAmounts();

    const onChangeFromDate = async (selectedDate: Date | undefined, toDate: Date) => {
        // TODO: validate whether fromDate is bigger than toDate
        setShowFromDate(false);
        await dispatch(setFromDate(selectedDate?.toISOString() || ''));
    };

    const onChangeToDate = async (selectedDate: Date | undefined, fromDate: Date) => {
        // TODO: validate whether toDate is bigger than fromDate
        setShowToDate(false);
        await dispatch(setToDate(selectedDate?.toISOString() || ''));
    };

    const openMenu = () => setShowRepeatIntervalMenu(true);
    const closeMenu = () => setShowRepeatIntervalMenu(false);
    const onSelectedRepeatIntervalMenuItem = async (value: '30 min' | '60 min' | '90 min') => {
        switch (value) {
            case '30 min':
                await dispatch(setRepeatInterval(30));
                break;
            case '60 min':
                await dispatch(setRepeatInterval(60));
                break;
            case '90 min':
                await dispatch(setRepeatInterval(90));
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

    const onAddAmount = useCallback(async (amount: string) => {
        if (amount.length === 0) {
            return;
        }
        if (sortedWaterAmounts.includes(amount)) {
            Alert.alert(
                'Duplicate amount',
                `There is already amount of ${amount}ml.`,
                [
                    {
                        text: "OK",
                        onPress: () => { },
                        style: "cancel"
                    },
                ],
                { cancelable: false }
            );
            return;
        }
        if (sortedWaterAmounts.length >= 3) {
            Alert.alert(
                'Limit reached',
                'You can have maximum 3 water amounts.',
                [
                    {
                        text: "OK",
                        onPress: () => { },
                        style: "cancel"
                    },
                ],
                { cancelable: false }
            );
            return;
        }
        await dispatch(addWaterAmount(amount));
        setText("");
    }, [sortedWaterAmounts]);

    const onRemoveAmount = async (amount: string) => {
        await dispatch(removeWaterAmount(amount));
    }

    const fromTimeConverted = new Date(Date.parse(fromTime));
    const toTimeConverted = new Date(Date.parse(toTime));
    const onToggleIconSwitch = () => { dispatch(setHumanIcon(!femaleIcon)) };
    const onToggleSwitch = () => { dispatch(setReminderSwitch(!remindersToggleEnabled)) };
    const timeFormatOptions = { hour: "2-digit", minute: "2-digit", } as Intl.DateTimeFormatOptions;
    const fromTimeLocalised = fromTimeConverted.toLocaleTimeString('bg-BG', timeFormatOptions);
    const toTimeLocalised = toTimeConverted.toLocaleTimeString('bg-BG', timeFormatOptions);

    const renderCard = (amount: string, idx: number) => {
        return (<Card key={`${idx}-${amount}`} mode='outlined' style={{ margin: 5 }}>
            <Card.Title
                title={`${amount}ml`}
                right={(props) => <IconButton {...props} mode='outlined' icon="minus" onPress={() => onRemoveAmount(amount)} />}
            />
        </Card>)
    };

    return (
        <SafeAreaView>
            <ScrollView>
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
                            <Text disabled={!remindersToggleEnabled} style={styles.reminderToText}>To: </Text>
                            <Button disabled={!remindersToggleEnabled} mode="outlined" labelStyle={styles.biggerText} onPress={() => setShowToDate(true)}>
                                {toTimeLocalised}
                            </Button>
                        </View>
                        <View>
                            {showFromDate && (<DateTimePicker
                                testID="fromDateTimePicker"
                                value={fromTimeConverted}
                                mode='time'
                                onChange={async (_event, date) => await onChangeFromDate(date, toTimeConverted)}
                                display='spinner'
                                is24Hour={true}
                                minuteInterval={30}
                            />)
                            }
                            {showToDate && (<DateTimePicker
                                testID="toDateTimePicker"
                                value={toTimeConverted}
                                mode='time'
                                onChange={async (_event, date) => await onChangeToDate(date, fromTimeConverted)}
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
                    <View key="waterAmounts" style={styles.waterAmountsContainer}>
                        <Text key="waterTitle" style={styles.waterAmountsTitle}>Water amounts</Text>
                        <Text key="waterDescriptionText" style={styles.waterAmountsDescriptionText}>Add up to 3 water amounts as you desire</Text>
                        <View key="waterInput" style={styles.waterAmountInputContainer}>
                            <TextInput
                                style={styles.weightInput}
                                contentStyle={styles.applyButtonContent}
                                label="Amount ml"
                                mode="outlined"
                                inputMode='decimal'
                                value={text}
                                onChangeText={text => setText(text)}
                            />
                            <IconButton mode='outlined' icon="plus" onPress={() => onAddAmount(text)} />
                        </View>
                        <View key="wamounts">
                            {sortedWaterAmounts.map((amount, idx) => renderCard(amount, idx))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
