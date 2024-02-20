import React from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { Platform, Image, StyleSheet } from 'react-native';
import WaterLevelContainer from './waterLevelContainer';
import { useSelector } from 'react-redux';
import { settings } from '../../stores/redux/slices/settingSlice';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';

export const RenderMaskedView = (): React.JSX.Element => {
  const { femaleIcon } = useSelector(settings);
  const { waterLevel } = useSelector(daylyConsumption);

  const isIOS = Platform.OS === 'ios';
  if (isIOS) {
    return (
      <MaskedView
        key="maskedView"
        style={styles.maskedView}
        maskElement={<WaterLevelContainer increse={waterLevel} femaleIcon={femaleIcon} />}
      >
        <Image
          key="watered"
          source={
            femaleIcon
              ? require('../../images/female-watered-200.png')
              : require('../../images/male-watered-200.png')
          }
          style={styles.mask}
        />
      </MaskedView>
    );
  } else {
    return (
      <MaskedView
        key="maskedView"
        style={styles.maskedView}
        maskElement={<WaterLevelContainer increse={waterLevel} femaleIcon={femaleIcon} />}
      >
        <Image
          key="watered"
          source={
            femaleIcon
              ? require('../../images/female-watered-200.png')
              : require('../../images/male-watered-200.png')
          }
          style={styles.mask}
        />
      </MaskedView>
    );
  }
};

const styles = StyleSheet.create({
  maskedView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    height: 200,
  },
  mask: {
    flex: 1,
    height: 200,
    zIndex: 10,
    position: 'absolute',
  },
});
