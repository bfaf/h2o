import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Portal, FAB } from 'react-native-paper';
import { useCreateAction, useSortedWaterAmounts } from '../../utils/hooks';

export const AddLiquid = () => {
    const navigation = useNavigation();
    const [openLiquids, setOpenLiquids] = useState<boolean>(false);
    const [showFabGroup, setShowFabGroup] = useState<boolean>(true);
    const createAction = useCreateAction();

    const sortedWaterAmounts = useSortedWaterAmounts();

    useEffect(() => {
        // Show and hide the fab group
        navigation.addListener('focus', () => setShowFabGroup(true));
        navigation.addListener('blur', () => setShowFabGroup(false));
        return () => {
            navigation.removeListener('focus', () => { });
            navigation.removeListener('blur', () => { });
        };
    }, [navigation]);

    return (
        <Portal>
            <FAB.Group
                testID='addLiquidButton'
                open={openLiquids}
                visible={showFabGroup}
                icon="plus"
                onStateChange={({ open }) => setOpenLiquids(open)}
                actions={[
                    createAction('coffee'),
                    ...[...sortedWaterAmounts].map((amount: string) => createAction(amount))
                ]}
            />
        </Portal>
    );
};