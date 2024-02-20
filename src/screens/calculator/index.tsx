/**
 * @format
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch } from '../../stores/redux/store';
import {
  addWaterLevelSoFar,
  setSettingDesiredDailyConsumption,
} from '../../stores/redux/thunks/dailyConsumption';
import { useNavigation } from '@react-navigation/native';
import { calculateIncrease } from '../../utils/utils';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    paddingLeft: 10,
    paddingTop: 10,
  },
  weightContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  weightInput: {
    flex: 2,
    margin: 10,
  },
  applyButton: {
    margin: 10,
    justifyContent: 'center',
  },
  applyButtonContent: {
    fontSize: 30,
    fontWeight: '800',
    verticalAlign: 'bottom',
  },
  recommendationContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: '#000',
  },
  boldText: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export const Caluclator = (): JSX.Element => {
  // formula: kg * 35ml = recommended water per day in ml
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation();
  const [text, setText] = React.useState('');
  const [calculatedWater, setCalculatedWater] = useState<number>(0);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const { currentConsumtionMl } = useSelector(daylyConsumption);

  const calucalteRecommendedDailyAmount = (weight: string): void => {
    if (weight.length === 0) {
      setText(weight);
      return;
    }
    const num = parseFloat(weight);
    if (isNaN(num)) {
      return;
    }
    setText(weight);
    const result = num * 35;
    setCalculatedWater(parseFloat(result.toFixed(2)));
  };

  const onApplyPressed = useCallback(
    async (amount: number) => {
      await dispatch(setSettingDesiredDailyConsumption(amount));
      const calculated = calculateIncrease(0, amount, currentConsumtionMl);
      await dispatch(addWaterLevelSoFar(calculated));
      setDialogVisible(true);
    },
    [currentConsumtionMl],
  );

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View>
          <Text style={styles.titleText}>Please enter your weight</Text>
        </View>
        <View style={styles.weightContainer}>
          <TextInput
            style={styles.weightInput}
            contentStyle={styles.applyButtonContent}
            label="Weight"
            mode="outlined"
            inputMode="decimal"
            value={text}
            onChangeText={(text) => { calucalteRecommendedDailyAmount(text); }}
          />
          <Text style={styles.applyButton}> </Text>
        </View>
        <View>
          {calculatedWater > 0 && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationText}>
                Recommended water per day is{' '}
                <Text style={styles.boldText}>{calculatedWater}ml</Text>
              </Text>
              <Text style={styles.recommendationText}>
                Press the Apply button to set it as daily amount
              </Text>
              <Button
                style={styles.applyButton}
                mode="contained"
                onPress={() => onApplyPressed(calculatedWater)}
              >
                Apply
              </Button>
            </View>
          )}
        </View>
        <View>
          <Portal>
            <Dialog visible={dialogVisible} onDismiss={() => { setDialogVisible(false); }}>
              <Dialog.Title>Info</Dialog.Title>
              <Dialog.Content>
                <Text>The daily amount is updated</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => { navigation.goBack(); }}>Back</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </View>
    </SafeAreaView>
  );
};
