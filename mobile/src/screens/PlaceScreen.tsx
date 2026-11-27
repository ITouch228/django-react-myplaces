import { useCallback } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Button, colors, ErrorText, layout, Page } from '../components/ui';
import { formatPrice, type Check, type PlaceSummary } from '../domain/places';
import { deleteCheck, deletePlace, listChecks } from '../storage/placesRepository';
import { useRead } from './useRead';
import { useSave } from './useSave';

export default function PlaceScreen({ place, onEdit, onCheck, onDeleted }: {
  place: PlaceSummary;
  onEdit: () => void;
  onCheck: (check?: Check) => void;
  onDeleted: () => void;
}) {
  const load = useCallback(() => listChecks(place.id), [place.id]);
  const { data: checks, failed, reload } = useRead(load);
  const { busy, error, save } = useSave();

  function confirmPlaceDeletion() {
    Alert.alert('Удалить место?', 'Место и все его чеки будут удалены с телефона.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive', onPress: () => {
          void save(async () => {
            await deletePlace(place.id);
            onDeleted();
          });
        },
      },
    ]);
  }

  function confirmCheckDeletion(check: Check) {
    Alert.alert('Удалить чек?', 'Позиции этого чека также будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive', onPress: () => {
          void save(async () => {
            await deleteCheck(place.id, check.id);
            reload();
          });
        },
      },
    ]);
  }

  return (
    <Page>
      <Text accessibilityRole="header" style={layout.title}>{place.name}</Text>
      {!!place.address && <Text style={layout.text}>{place.address}</Text>}
      {place.latitude !== null && place.longitude !== null && (
        <Text style={layout.muted}>Координаты: {place.latitude}, {place.longitude}</Text>
      )}
      <View style={layout.row}>
        <Button label="Редактировать место" variant="secondary" onPress={onEdit} disabled={busy} />
        <Button label="Удалить место" variant="danger" onPress={confirmPlaceDeletion} disabled={busy} />
      </View>
      {error && <ErrorText message={error} />}
      <Text accessibilityRole="header" style={layout.heading}>Чеки</Text>
      <Button label="Добавить чек" onPress={() => onCheck()} disabled={busy} />
      {failed && (
        <>
          <ErrorText message="Не удалось открыть чеки." />
          <Button label="Повторить" variant="secondary" onPress={reload} />
        </>
      )}
      {!checks && !failed && <ActivityIndicator color={colors.accent} />}
      {checks?.length === 0 && <Text style={layout.muted}>У этого места пока нет чеков.</Text>}
      {checks?.map((check) => {
        const total = check.items.reduce((sum, item) => sum + item.priceKopecks, 0);
        return (
          <View key={check.id} style={layout.card}>
            <Text style={layout.heading}>{check.visitedAt.split('-').reverse().join('.')}</Text>
            {!!check.comment && <Text style={layout.text}>{check.comment}</Text>}
            {check.items.map((item) => (
              <Text key={item.id} style={layout.text}>
                {item.name}{'  ·  '}{formatPrice(item.priceKopecks)}
                {item.rating !== null && `  ·  ${item.rating} из 5`}
              </Text>
            ))}
            <Text style={layout.heading}>Итого {formatPrice(total)}</Text>
            <View style={layout.row}>
              <Button label="Редактировать чек" variant="secondary" onPress={() => onCheck(check)} disabled={busy} />
              <Button label="Удалить чек" variant="danger" onPress={() => confirmCheckDeletion(check)} disabled={busy} />
            </View>
          </View>
        );
      })}
    </Page>
  );
}
