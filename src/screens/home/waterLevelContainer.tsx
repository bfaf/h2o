import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import type { PropsWithChildren } from 'react';

type WaterLevelContainerProps = PropsWithChildren<{ increse: number }>;
const WaterLevelContainer = ({ increse }: WaterLevelContainerProps) => {
    const initialValue = 200;
    const fadeAnim = useRef(new Animated.Value(initialValue)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: increse,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, increse]);

    return (
        <Animated.View>
            <Animated.Image
                source={require('../../images/human-200.png')}
                style={{
                    width: 300,
                    transform: [{
                        translateY: fadeAnim
                    },
                    { perspective: 1000 }]
                }} />
        </Animated.View>
    );
};

export default WaterLevelContainer;
