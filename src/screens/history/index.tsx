/**
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { LineChart, ruleTypes } from "react-native-gifted-charts";
import { useDispatch, useSelector } from 'react-redux';
import { HistoryData, daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { AppDispatch } from '../../stores/redux/store';
import { getHistoryData } from '../../stores/redux/thunks/dailyConsumption';
import { useHistoryData } from '../../utils/hooks';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
});

const weekData = {
    lcompMaxWith: 55,
    spacing: 45,
    formatFn: (timestamp: number) => {
        const d = new Date(timestamp);
        const date = d.toLocaleDateString('en-UK', { weekday: 'short'}).replace(/,.+/, '');

        return date;
    },
}

const monthData = {
    lcompMaxWith: 55,
    spacing: 11,
    formatFn: (timestamp: number) => {
        const d = new Date(timestamp);
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    },
};

const month3Data = {
    lcompMaxWith: 55,
    spacing: 4,
    formatFn: (timestamp: number) => {
        const d = new Date(timestamp);
        
        return d.toLocaleDateString('en-UK', { month: 'short' });
    },
};

const month6Data = {
    lcompMaxWith: 55,
    spacing: 4,
    formatFn: (timestamp: number) => {
        const d = new Date(timestamp);
        
        return d.toLocaleDateString('en-UK', { month: 'short' });
    },
};

export const History = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const { desiredDailyConsumption } = useSelector(daylyConsumption);
    const [maxValue, setMaxValue] = useState<number>(desiredDailyConsumption);

    const lcomp = (v: string) => (
        <Text style={{ width: 55, color: 'black', fontWeight: 'bold' }}>{v}</Text>
    );

    const historyData = useHistoryData('week', lcomp);

    useEffect(() => {
        dispatch(getHistoryData(0));
    }, [dispatch]);

    useEffect(() => {
        let maxValue = desiredDailyConsumption;
        historyData.data.forEach((d) => {
            if (d.value > maxValue) {
                maxValue = d.value;
            }
        });
        setMaxValue(maxValue);
    }, [historyData, desiredDailyConsumption]);


    if (historyData.data.length === 0) {
        return (
            <View style={{ flex: 1, marginVertical: 'auto', justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
                <Text>Fetching history data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView>
            <View
                style={{
                    paddingVertical: 30,
                    backgroundColor: '#fff',
                }}>
                <LineChart
                    isAnimated
                    thickness={3}
                    color="#07BAD1"
                    maxValue={maxValue}
                    noOfSections={5}
                    animateOnDataChange
                    animationDuration={1000}
                    onDataChangeAnimationDuration={300}
                    areaChart
                    yAxisTextStyle={{ color: 'black' }}
                    data={historyData.data}
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
        </SafeAreaView>
    );
};
