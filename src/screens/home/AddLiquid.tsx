import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Portal, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { addCoffeesConsumed, addWaterConsumedSoFar, addWaterLevelSoFar } from '../../stores/redux/thunks/dailyConsumption';
import { calculateIncrease } from '../../utils/hooks';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { settings } from '../../stores/redux/slices/settingSlice';

export const AddLiquid = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigation = useNavigation();
    const [openLiquids, setOpenLiquids] = useState<boolean>(false);
    const [showFabGroup, setShowFabGroup] = useState<boolean>(true);

    const {
        currentConsumtionMl,
        desiredDailyConsumption,
    } = useSelector(daylyConsumption);

    const {
        waterPerCoffeeCup,
    } = useSelector(settings);

    useEffect(() => {
        // Show and hide the fab group
        navigation.addListener('focus', () => setShowFabGroup(true));
        navigation.addListener('blur', () => setShowFabGroup(false));
        return () => {
            navigation.removeListener('focus', () => { });
            navigation.removeListener('blur', () => { });
        };
    }, [navigation]);

    const createAction = (amount: number, isCoffee = false,) => {
        const onPress = async () => {
            let calculated = 0;
            if (isCoffee) {
                await dispatch(addCoffeesConsumed(amount));
                calculated = calculateIncrease(-amount, desiredDailyConsumption, currentConsumtionMl);
            } else {
                await dispatch(addWaterConsumedSoFar(amount));
                calculated = calculateIncrease(amount, desiredDailyConsumption, currentConsumtionMl);
            }

            await dispatch(addWaterLevelSoFar(calculated));
        }

        return {
            icon: isCoffee ? 'coffee' : 'cup',
            label: isCoffee ? '+ Coffee' : `+ ${amount}ml`,
            onPress,
        };
    };

    return (
        <Portal>
            <FAB.Group
                testID='addLiquidButton'
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
    );
};