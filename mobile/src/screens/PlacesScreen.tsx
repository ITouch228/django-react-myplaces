import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Button, colors, ErrorText, Field, layout, Page } from '../components/ui';
import type { PlaceSummary } from '../domain/places';
import { listPlaces } from '../storage/placesRepository';
import { useRead } from './useRead';

export default function PlacesScreen({ onAdd, onOpen, query, onQuery }: {
  onAdd: () => void;
  onOpen: (place: PlaceSummary) => void;
  query: string;
  onQuery: (query: string) => void;
}) {
  const { data, failed, reload } = useRead(listPlaces);
  const term = query.trim().toLocaleLowerCase('ru-RU');
  const places = data?.filter((place) => [place.name, place.address]
    .some((value) => value.toLocaleLowerCase('ru-RU').includes(term)));

  return (
    <Page>
      <Text accessibilityRole="header" style={layout.title}>Мои места</Text>
      <Button label="Добавить место" onPress={onAdd} disabled={!data} />
      {Boolean(data?.length) && (
        <Field label="Поиск" placeholder="Название или адрес" value={query}
          onChangeText={onQuery}
          returnKeyType="search" />
      )}
      {failed && (
        <>
          <ErrorText message="Не удалось открыть список мест." />
          <Button variant="secondary" label="Повторить" onPress={reload} />
        </>
      )}
      {!data && !failed && <ActivityIndicator color={colors.accent} />}
      {places?.length === 0 && (
        <View style={layout.card}>
          <Text style={layout.heading}>{term ? 'Места не найдены' : 'Мест пока нет'}</Text>
          <Text style={layout.muted}>{term ? 'Попробуй другое название или адрес.' : 'Добавь первое место, чтобы записывать посещения.'}</Text>
        </View>
      )}
      {!!query && <Button label="Очистить поиск" variant="secondary" onPress={() => onQuery('')} />}
      {places?.map((place) => (
        <Pressable key={place.id} accessibilityRole="button" onPress={() => onOpen(place)} style={layout.card}>
          <Text style={layout.heading}>{place.name}</Text>
          {!!place.address && <Text style={layout.text}>{place.address}</Text>}
          <Text style={layout.muted}>
            Чеков: {place.checkCount}
            {place.averageRating !== null && `  ·  Оценка ${place.averageRating.toFixed(1)} из 5`}
          </Text>
        </Pressable>
      ))}
    </Page>
  );
}
