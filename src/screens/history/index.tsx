/**
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { BarChart, LineChart, barDataItem, ruleTypes } from "react-native-gifted-charts";
import { useDispatch, useSelector } from 'react-redux';
import { daylyConsumption, selectHistoryData, selectMonthlyAverageData, selectMonthlyAverageDataMemorized } from '../../stores/redux/slices/daylyConsumptionSlice';
import { AppDispatch, RootState } from '../../stores/redux/store';
import { getHistoryData } from '../../stores/redux/thunks/dailyConsumption';
import { HistoryDataTimeFilter } from '../../utils/hooks';
import { Button, Menu } from 'react-native-paper';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    repeatInterval: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
    },
    reminderFromText: {
        marginLeft: 0,
        marginRight: 10,
        textAlignVertical: 'center',
        color: '#000',
        fontSize: 16
    },
    biggerText: {
        fontSize: 16
    },
});

export const History = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const { desiredDailyConsumption } = useSelector(daylyConsumption);
    const [maxValue, setMaxValue] = useState<number>(desiredDailyConsumption);
    const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
    const [filter, setFilter] = useState<HistoryDataTimeFilter>('week');
    const [menuText, setMenuText] = useState<string>('7 days');
    const historyData = useSelector((state: RootState) => selectHistoryData(state, filter));
    const monthlyAverageData = useSelector((state: RootState) => selectMonthlyAverageDataMemorized(state, filter));

    const lcomp = (v: string) => (
        <Text style={{ width: 55, color: 'black', fontWeight: 'bold' }}>{v}</Text>
    );

    const formatedData = useMemo(() => historyData.data.map((d) => {
        return {
            ...d,
            labelComponent: d.label ? () => lcomp(d.label) : undefined,
            dataPointText: d.label ? d.label : undefined,
        };
    }), [historyData]);

    const openMenu = () => setShowFilterMenu(true);
    const closeMenu = () => setShowFilterMenu(false);
    const onSelectedFilterMenuItem = async (value: '7 days' | '1 month' | '3 months' | '6 months') => {
        setMenuText(value);
        switch (value) {
            case '7 days':
                setFilter('week');
                break;
            case '1 month':
                setFilter('month');
                break;
            case '3 months':
                setFilter('3months');
                break;
            case '6 months':
                setFilter('6months');
                break;
        }
        closeMenu();
    };


    useEffect(() => {
        dispatch(getHistoryData(0));
    }, [dispatch]);

    useEffect(() => {
        let maxValue = desiredDailyConsumption;
        formatedData.forEach((d) => {
            if (d.value > maxValue) {
                maxValue = d.value;
            }
        });
        setMaxValue(maxValue);
    }, [formatedData, desiredDailyConsumption]);


    if (formatedData.length === 0) {
        return (
            <View style={{ flex: 1, marginVertical: 'auto', justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
                <Text style={{ fontSize: 16, color: '#000', paddingTop: 15, justifyContent: 'center', textAlign: 'center' }}>Fetching data...</Text>
            </View>
        );
    }

    let barData: barDataItem[] = [];
    if (filter === 'month') {
        barData = [
            { value: monthlyAverageData['Mon'].average, label: 'Mon', frontColor: '#4ABFF4' },
            { value: monthlyAverageData['Tue'].average, label: 'Tue', frontColor: '#79C3DB' },
            { value: monthlyAverageData['Wed'].average, label: 'Wed', frontColor: '#28B2B3' },
            { value: monthlyAverageData['Thu'].average, label: 'Thu', frontColor: '#4ADDBA' },
            { value: monthlyAverageData['Fri'].average, label: 'Fri', frontColor: '#91E3E3' },
            { value: monthlyAverageData['Sat'].average, label: 'Sat', frontColor: '#4af49b' },
            { value: monthlyAverageData['Sun'].average, label: 'Sun', frontColor: '#f4a74a' },
        ];
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={{ fontSize: 16, color: '#000', paddingTop: 15, paddingLeft: 10, paddingRight: 10 }}>You can see your progress for different periods</Text>
                <View style={styles.repeatInterval}>
                    <Text style={styles.reminderFromText}>Select period:</Text>
                    <Menu visible={showFilterMenu} onDismiss={closeMenu} anchor={<Button mode="outlined" labelStyle={styles.biggerText} onPress={openMenu}>{menuText}</Button>}>
                        <Menu.Item onPress={() => onSelectedFilterMenuItem('7 days')} title="7 days" />
                        <Menu.Item onPress={() => onSelectedFilterMenuItem('1 month')} title="1 month" />
                        <Menu.Item onPress={() => onSelectedFilterMenuItem('3 months')} title="3 months" />
                        <Menu.Item onPress={() => onSelectedFilterMenuItem('6 months')} title="6 months" />
                    </Menu>
                </View>
                <View
                    style={{
                        paddingVertical: 30,
                        backgroundColor: '#fff',
                        paddingLeft: 10,
                        paddingRight: 10
                    }}>
                    <LineChart
                        thickness={3}
                        color="#07BAD1"
                        maxValue={maxValue}
                        noOfSections={5}
                        areaChart
                        curved
                        yAxisTextStyle={{ color: 'black' }}
                        data={formatedData}
                        hideDataPoints
                        startFillColor={'rgb(84,219,234)'}
                        endFillColor={'rgb(84,219,234)'}
                        startOpacity={0.4}
                        endOpacity={0.1}
                        spacing={historyData.spacing}
                        backgroundColor="#fff"
                        rulesColor="gray"
                        rulesType={ruleTypes.SOLID}
                        initialSpacing={historyData.spacing}
                        yAxisColor="lightgray"
                        xAxisColor="lightgray"
                    />
                </View>
                {filter === 'month' && (<View style={{
                    paddingVertical: 30,
                    backgroundColor: '#fff',
                    paddingLeft: 10,
                    paddingRight: 10
                }}>
                    <Text style={{ fontSize: 16, color: '#000', paddingTop: 15, paddingBottom: 15 }}>Monthly average consumption per day</Text>
                    <BarChart
                        showFractionalValues
                        showYAxisIndices
                        noOfSections={5}
                        maxValue={maxValue}
                        data={barData}
                        isAnimated
                        disablePress
                        yAxisTextStyle={{ color: 'black' }}
                        xAxisLabelTextStyle={{ color: 'black' }}
                    />
                </View>)}
            </ScrollView>
        </SafeAreaView>
    );
};
