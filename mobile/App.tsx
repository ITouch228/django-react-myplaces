import { useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, layout } from './src/components/ui';
import type { Check, PlaceSummary } from './src/domain/places';
import CheckFormScreen from './src/screens/CheckFormScreen';
import PlaceFormScreen from './src/screens/PlaceFormScreen';
import PlaceScreen from './src/screens/PlaceScreen';
import PlacesScreen from './src/screens/PlacesScreen';

type Route =
  | { screen: 'places' }
  | { screen: 'place'; place: PlaceSummary }
  | { screen: 'placeForm'; place?: PlaceSummary }
  | { screen: 'checkForm'; place: PlaceSummary; check?: Check };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'places' });
  const [query, setQuery] = useState('');

  const back = useCallback(() => {
    if (route.screen === 'places') return false;
    if ((route.screen === 'placeForm' || route.screen === 'checkForm') && route.place) {
      setRoute({ screen: 'place', place: route.place });
    } else {
      setRoute({ screen: 'places' });
    }
    return true;
  }, [route]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', back);
    return () => subscription.remove();
  }, [back]);

  function finishAction(destination: Route) {
    setRoute((current) => current === route ? destination : current);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          {route.screen !== 'places' && <Button label="Назад" variant="secondary" onPress={back} />}
          <Text style={styles.brand}>MyPlaces</Text>
        </View>
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {route.screen === 'places' && (
            <PlacesScreen query={query} onQuery={setQuery} onAdd={() => setRoute({ screen: 'placeForm' })}
              onOpen={(place) => setRoute({ screen: 'place', place })} />
          )}
          {route.screen === 'place' && (
            <PlaceScreen place={route.place} onEdit={() => setRoute({ screen: 'placeForm', place: route.place })}
              onCheck={(check) => setRoute({ screen: 'checkForm', place: route.place, check })}
              onDeleted={() => finishAction({ screen: 'places' })} />
          )}
          {route.screen === 'placeForm' && (
            <PlaceFormScreen place={route.place} onSaved={(place) => finishAction({ screen: 'place', place })} />
          )}
          {route.screen === 'checkForm' && (
            <CheckFormScreen placeId={route.place.id} check={route.check}
              onSaved={() => finishAction({ screen: 'place', place: route.place })} />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60,
    paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  brand: { ...layout.heading, color: colors.accent },
});
