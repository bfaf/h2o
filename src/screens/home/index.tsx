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
  addWaterLevelSoFar,
} from '../../stores/redux/thunks/dailyConsumption';
import { calculateIncrease } from '../../utils/hooks';
import { settings } from '../../stores/redux/slices/settingSlice';
import { useNavigation } from '@react-navigation/native';

export const Home = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation();
  const [openLiquids, setOpenLiquids] = useState<boolean>(false);
  const [showFabGroup, setShowFabGroup] = useState<boolean>(true);
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
    // Show and hide the fab group
    navigation.addListener('focus', () => setShowFabGroup(true));
    navigation.addListener('blur', () => setShowFabGroup(false));
    return () => {
      navigation.removeListener('focus', () => {});
      navigation.removeListener('blur', () => {});
    };
  }, [navigation]);

  useEffect(() => {
    if (errors) {
      Alert.alert(
        'Errors Detected',
        `Error(s) while loading the settings: ${errors}. Will load default settings`,
        [
          {
            text: "OK",
            onPress: () => { },
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

  const createAction = (amount: number, isCoffee = false,) => {
    const onPress = () => {
      let calculated = 0;
      if (isCoffee) {
        dispatch(addCoffeesConsumed(amount));
        calculated = calculateIncrease(-amount, desiredDailyConsumption, currentConsumtionMl);
      } else {
        dispatch(addWaterConsumedSoFar(amount));
        calculated = calculateIncrease(amount, desiredDailyConsumption, currentConsumtionMl);
      }

      dispatch(addWaterLevelSoFar(calculated));
    }

    return {
      icon: isCoffee ? 'coffee' : 'cup',
      label: isCoffee ? '+ Coffee' : `+ ${amount}ml`,
      onPress,
    };
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
          visible={showFabGroup}
          icon="plus"
          onStateChange={({ open }) => setOpenLiquids(open)}
          actions={[
            createAction(waterPerCoffeeCup, true),
            createAction(500),
            createAction(300),
            createAction(200),
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
