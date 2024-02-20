/**
 * @format
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, Image, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { Icon } from 'react-native-paper';
import { settings } from '../../stores/redux/slices/settingSlice';
import { AddLiquid } from './AddLiquid';
import { RenderMaskedView } from './RenderMaskedView';

export const Home = (): JSX.Element => {
  const { currentConsumtionMl, desiredDailyConsumption, waterLevel, coffeesConsumed } =
    useSelector(daylyConsumption);
  const { femaleIcon } = useSelector(settings);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dailyLimit}>
        <Text style={styles.dailyLimitText}>Daily limit</Text>
        <Text style={styles.dailyLimitText} testID="desiredDailyConsumption">
          {desiredDailyConsumption} ml
        </Text>
        <Text style={styles.dailyLimitTextSmall} testID="coffeesIncluded">
          {coffeesConsumed} <Icon source="coffee" size={14} color="#000" /> included
        </Text>
      </View>
      <View style={styles.maskView}>
        <Image
          key="top"
          source={
            femaleIcon
              ? require('../../images/female-200.png')
              : require('../../images/male-200.png')
          }
          style={styles.image}
          testID="personImage"
        />
        <RenderMaskedView />
      </View>
      <View style={styles.consumedSoFarView}>
        <Text style={styles.dailyLimitText} testID="currentConsumtionMlSoFar">
          {currentConsumtionMl} ml
        </Text>
        <Text style={styles.dailyLimitTextSmall}>so far</Text>
      </View>
      <AddLiquid />
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
    marginBottom: 20,
  },
  dailyLimitText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  dailyLimitTextSmall: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  consumedSoFarView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    marginTop: 20,
  },
  maskView: {
    flex: 0,
    justifyContent: 'center',
    alignContent: 'center',
    height: 200,
    flexDirection: 'row',
    position: 'relative',
  },
  maskWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    height: 200,
    position: 'absolute',
  },
});
