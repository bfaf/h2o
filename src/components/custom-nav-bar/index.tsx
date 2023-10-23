/**
 * @format
 */

import React, { useState } from 'react';
import { Appbar, Menu } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase, Route } from '@react-navigation/native';

type Props = {
    navigation: NativeStackNavigationProp<ParamListBase, string, undefined>;
    route: Route<string>;
    options: NativeStackNavigationOptions;
    back?: { title: string; } | undefined;
}

const CustomNavigationBar = ({ navigation, route, options, back }: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const title = getHeaderTitle(options, route.name);

    return (
        <Appbar.Header>
            {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
            <Appbar.Content title={title} />
            {!back ? (
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={
                        <Appbar.Action
                            icon="dots-vertical"
                            onPress={openMenu}
                        />
                    }>
                    <Menu.Item
                        leadingIcon="cog"
                        onPress={() => {closeMenu(); navigation.push('Settings');}}
                        title="Settings"
                    />
                    <Menu.Item
                        leadingIcon="chart-bar"
                        onPress={() => {closeMenu(); navigation.push('History');}}
                        title="History"
                    />
                </Menu>
            ) : null}
        </Appbar.Header>
    );
}

export default CustomNavigationBar;
