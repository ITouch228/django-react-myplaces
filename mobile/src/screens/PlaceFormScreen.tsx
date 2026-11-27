import { useState } from 'react';
import { Text } from 'react-native';
import { Button, ErrorText, Field, layout, Page } from '../components/ui';
import { parseCoordinates, type PlaceSummary } from '../domain/places';
import { savePlace } from '../storage/placesRepository';
import { FormError, useSave } from './useSave';

export default function PlaceFormScreen({ place, onSaved }: {
  place?: PlaceSummary;
  onSaved: (place: PlaceSummary) => void;
}) {
  const [name, setName] = useState(place?.name ?? '');
  const [address, setAddress] = useState(place?.address ?? '');
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? '');
  const { busy, error, save } = useSave();

  function submit() {
    void save(async () => {
      if (!name.trim()) throw new FormError('Введи название места.');
      let coordinates;
      try {
        coordinates = parseCoordinates(latitude, longitude);
      } catch (failure) {
        throw new FormError((failure as Error).message);
      }
      const input = { name: name.trim(), address: address.trim(), ...coordinates };
      const id = await savePlace(input, place?.id);
      onSaved({ id, ...input, checkCount: place?.checkCount ?? 0, averageRating: place?.averageRating ?? null });
    });
  }

  return (
    <Page>
      <Text accessibilityRole="header" style={layout.title}>{place ? 'Редактировать место' : 'Новое место'}</Text>
      <Field label="Название" value={name} onChangeText={setName} maxLength={200} editable={!busy} />
      <Field label="Адрес" value={address} onChangeText={setAddress} editable={!busy} />
      <Text style={layout.muted}>Координаты можно оставить пустыми.</Text>
      <Field label="Широта" value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" editable={!busy} />
      <Field label="Долгота" value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" editable={!busy} />
      {error && <ErrorText message={error} />}
      <Button label={busy ? 'Сохраняем…' : 'Сохранить место'} onPress={submit} disabled={busy} />
    </Page>
  );
}
