/**
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { FAB, Portal, Icon } from 'react-native-paper';
import WaterLevelContainer from './waterLevelContainer';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  addCoffeesConsumed,
  addWaterConsumedSoFar,
} from '../../stores/redux/thunks/dailyConsumption';
import { calculateIncrease } from '../../utils/hooks';
import { settings } from '../../stores/redux/slices/settingSlice';

export const Home = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const [openLiquids, setOpenLiquids] = useState<boolean>(false);
  const {
    currentConsumtionMl,
    desiredDailyConsumption,
    waterLevel,
    coffeesConsumed,
  } = useSelector(daylyConsumption);
  const {
    waterPerCoffeeCup,
    femaleIcon,
    errors
} = useSelector(settings);

  useEffect(() => {
    if (errors) {
      Alert.alert(
        'Errors Detected',
        `Error(s) while loading the settings: ${errors}. Will load default settings`,
        [
            {
                text: "OK",
                onPress: () => {},
                style: "cancel"
            },
        ],
        { cancelable: false }
    );
    }
  }, [errors]);

  const renderMaskedView = (waterLevel: number) => {
    const isIOS = Platform.OS === 'ios';
    if (isIOS) {
      return (
        <MaskedView
          key="maskedView"
          style={styles.maskedView}
          maskElement={<WaterLevelContainer increse={waterLevel} femaleIcon={femaleIcon} />}>
          <Image
            key="watered"
            source={femaleIcon ? require('../../images/female-watered-200.png') : require('../../images/male-watered-200.png')}
            style={styles.mask}
          />
        </MaskedView>
      );
    } else {
      return (
        <MaskedView
          key="maskedView"
          style={styles.maskedView}
          maskElement={<WaterLevelContainer increse={waterLevel} femaleIcon={femaleIcon} />}>
          <Image
            key="watered"
            source={femaleIcon ? require('../../images/female-watered-200.png') : require('../../images/male-watered-200.png')}
            style={styles.mask}
          />
        </MaskedView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dailyLimit}>
        <Text style={styles.dailyLimitText}>Daily limit</Text>
        <Text style={styles.dailyLimitText}>{desiredDailyConsumption} ml</Text>
        <Text style={styles.dailyLimitTextSmall}>
          {coffeesConsumed} <Icon source="coffee" size={14} color="#000" />{' '}
          included
        </Text>
      </View>
      <View style={styles.maskView}>
        <Image
          key="top"
          source={femaleIcon ? require('../../images/female-200.png') : require('../../images/male-200.png')}
          style={styles.image}
        />
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
              onPress: () => {
                dispatch(addCoffeesConsumed(waterPerCoffeeCup));
                calculateIncrease(-waterPerCoffeeCup, desiredDailyConsumption, currentConsumtionMl, dispatch);
              },
            },
            {
              icon: 'cup',
              label: '+ 500ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(500));
                calculateIncrease(500, desiredDailyConsumption, currentConsumtionMl, dispatch);
              },
            },
            {
              icon: 'cup',
              label: '+ 300ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(300));
                calculateIncrease(300, desiredDailyConsumption, currentConsumtionMl, dispatch);
              },
            },
            {
              icon: 'cup',
              label: '+ 200ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(200));
                calculateIncrease(200, desiredDailyConsumption, currentConsumtionMl, dispatch);
              },
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
    position: 'absolute',
  },
  image: {
    flex: 1,
    height: 200,
    position: 'absolute',
  },
});
