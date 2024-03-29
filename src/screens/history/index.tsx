/**
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { BarChart, LineChart, type barDataItem, ruleTypes } from 'react-native-gifted-charts';
import { useDispatch, useSelector } from 'react-redux';
import {
  daylyConsumption,
  selectHistoryData,
  selectMonthlyAverageDataMemorized,
} from '../../stores/redux/slices/daylyConsumptionSlice';
import { type AppDispatch, type RootState } from '../../stores/redux/store';
import { getHistoryData } from '../../stores/redux/thunks/dailyConsumption';
import { type HistoryDataTimeFilter } from '../../utils/hooks';
import { Button, Menu, Divider } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    fontSize: 16,
  },
  biggerText: {
    fontSize: 16,
  },
});

export const History = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const { desiredDailyConsumption, historyDataisLoading } = useSelector(daylyConsumption);
  const [maxValue, setMaxValue] = useState<number>(desiredDailyConsumption);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [filter, setFilter] = useState<HistoryDataTimeFilter>('week');
  const [menuText, setMenuText] = useState<string>('7 days');
  const historyData = useSelector((state: RootState) => selectHistoryData(state, filter));
  const monthlyAverageData = useSelector((state: RootState) =>
    selectMonthlyAverageDataMemorized(state, filter),
  );

  const lcomp = (v: string, filter: HistoryDataTimeFilter) => {
    const width = v.length * 10;
    const marginHorizontal = filter !== 'week' ? v.length * -2.5 : 10;
    return <Text style={{ width, color: 'black', marginHorizontal }}>{v}</Text>;
  };

  const formatedData = useMemo(
    () =>
      historyData.data.map((d) => {
        const calcYShift = (value: number, maxValue: number) => {
          if (maxValue - 150 < value) {
            return 11;
          }

          return -11;
        };

        return {
          ...d,
          labelComponent: d.label ? () => lcomp(d.label, filter) : undefined,
          dataPointText: d.label ? d.label : undefined,
          dataPointLabelComponent: () => {
            return (
              <View>
                <Text style={{ color: 'black' }}>{d.value}</Text>
              </View>
            );
          },
          dataPointLabelShiftY: calcYShift(d.value, maxValue),
          dataPointLabelShiftX: d.value < 100 ? 18 : 10,
        };
      }),
    [historyData],
  );

  const openMenu = () => {
    setShowFilterMenu(true);
  };
  const closeMenu = () => {
    setShowFilterMenu(false);
  };
  const onSelectedFilterMenuItem = async (
    value: '7 days' | '1 month' | '3 months' | '6 months',
  ) => {
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
    dispatch(getHistoryData());
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

  if (historyDataisLoading) {
    return (
      <View style={{ flex: 1, marginVertical: 'auto', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
        <Text
          style={{
            fontSize: 16,
            color: '#000',
            paddingTop: 15,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          Fetching data...
        </Text>
      </View>
    );
  }

  let barData: barDataItem[] = [];
  if (filter === 'month') {
    const barlcomp = (value: number) => {
      let width = 35;
      if (value < 100) {
        width = 10;
      } else if (value < 1000) {
        width = 28;
      }
      return (
        <View>
          <Text style={{ color: 'black', width }}>{value}</Text>
        </View>
      );
    };
    barData = [
      {
        value: monthlyAverageData.Mon.average,
        label: 'Mon',
        frontColor: '#4ABFF4',
        topLabelComponent: () => barlcomp(monthlyAverageData.Mon.average),
      },
      {
        value: monthlyAverageData.Tue.average,
        label: 'Tue',
        frontColor: '#79C3DB',
        topLabelComponent: () => barlcomp(monthlyAverageData.Tue.average),
      },
      {
        value: monthlyAverageData.Wed.average,
        label: 'Wed',
        frontColor: '#28B2B3',
        topLabelComponent: () => barlcomp(monthlyAverageData.Wed.average),
      },
      {
        value: monthlyAverageData.Thu.average,
        label: 'Thu',
        frontColor: '#4ADDBA',
        topLabelComponent: () => barlcomp(monthlyAverageData.Thu.average),
      },
      {
        value: monthlyAverageData.Fri.average,
        label: 'Fri',
        frontColor: '#91E3E3',
        topLabelComponent: () => barlcomp(monthlyAverageData.Fri.average),
      },
      {
        value: monthlyAverageData.Sat.average,
        label: 'Sat',
        frontColor: '#4af49b',
        topLabelComponent: () => barlcomp(monthlyAverageData.Sat.average),
      },
      {
        value: monthlyAverageData.Sun.average,
        label: 'Sun',
        frontColor: '#f4a74a',
        topLabelComponent: () => barlcomp(monthlyAverageData.Sun.average),
      },
    ];
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text
          style={{ fontSize: 16, color: '#000', paddingTop: 15, paddingLeft: 10, paddingRight: 10 }}
        >
          You can see your progress for different periods
        </Text>
        <View style={styles.repeatInterval}>
          <Text style={styles.reminderFromText}>Select period:</Text>
          <Menu
            visible={showFilterMenu}
            onDismiss={closeMenu}
            anchor={
              <Button mode="outlined" labelStyle={styles.biggerText} onPress={openMenu}>
                {menuText}
              </Button>
            }
          >
            <Menu.Item
              onPress={async () => {
                await onSelectedFilterMenuItem('7 days');
              }}
              title="7 days"
            />
            <Menu.Item
              onPress={async () => {
                await onSelectedFilterMenuItem('1 month');
              }}
              title="1 month"
            />
            <Menu.Item
              onPress={async () => {
                await onSelectedFilterMenuItem('3 months');
              }}
              title="3 months"
            />
            <Menu.Item
              onPress={async () => {
                await onSelectedFilterMenuItem('6 months');
              }}
              title="6 months"
            />
          </Menu>
        </View>
        <View
          style={{
            paddingVertical: 30,
            backgroundColor: '#fff',
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <LineChart
            thickness={3}
            color="#07BAD1"
            maxValue={maxValue}
            noOfSections={5}
            areaChart
            curved
            yAxisTextStyle={{ color: 'black' }}
            data={formatedData}
            startFillColor={'rgb(84,219,234)'}
            endFillColor={'rgb(84,219,234)'}
            startOpacity={0.4}
            endOpacity={0.1}
            spacing={historyData.spacing}
            backgroundColor="#fff"
            rulesColor="gray"
            rulesType={ruleTypes.SOLID}
            yAxisColor="lightgray"
            xAxisColor="lightgray"
          />
        </View>
        {filter === 'month' && (
          <View
            style={{
              paddingVertical: 30,
              backgroundColor: '#fff',
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 0,
            }}
          >
            <Divider />
            <Text style={{ fontSize: 16, color: '#000', paddingTop: 15, paddingBottom: 15 }}>
              Monthly average consumption per day
            </Text>
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
              spacing={historyData.spacing + 3}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
