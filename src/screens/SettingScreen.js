import React from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { List, Card } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Card.Content>
          <List.Section>
            <List.Item
              title="Dark Mode"
              description="Toggle between light and dark theme"
              right={() => (
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title="App Version"
              description="1.0.0"
            />
          </List.Section>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
});

export default SettingsScreen;