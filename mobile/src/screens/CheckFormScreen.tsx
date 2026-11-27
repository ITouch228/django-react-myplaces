import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, ErrorText, Field, layout, Page } from '../components/ui';
import { isVisitDate, parsePrice, priceInput, today, type Check, type CheckItem } from '../domain/places';
import { saveCheck } from '../storage/placesRepository';
import { FormError, useSave } from './useSave';

type DraftItem = Omit<CheckItem, 'priceKopecks'> & { price: string };

function newItem(): DraftItem {
  return { id: randomUUID(), name: '', price: '', rating: null };
}

export default function CheckFormScreen({ placeId, check, onSaved }: {
  placeId: string;
  check?: Check;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(check?.visitedAt ?? today());
  const [comment, setComment] = useState(check?.comment ?? '');
  const [items, setItems] = useState<DraftItem[]>(() => check?.items.map((item) => ({
    id: item.id, name: item.name, rating: item.rating, price: priceInput(item.priceKopecks),
  })) ?? [newItem()]);
  const { busy, error, save } = useSave();

  function updateItem(id: string, changes: Partial<DraftItem>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function submit() {
    void save(async () => {
      const visitedAt = date.trim();
      if (!isVisitDate(visitedAt)) throw new FormError('Введи дату визита в формате ГГГГ-ММ-ДД.');
      if (items.length === 0) throw new FormError('Добавь хотя бы одну позицию.');
      const positions = items.map((item, index) => {
        const name = item.name.trim();
        if (!name) throw new FormError(`Введи название позиции ${index + 1}.`);
        try {
          return { id: item.id, name, priceKopecks: parsePrice(item.price), rating: item.rating };
        } catch (failure) {
          throw new FormError(`Позиция ${index + 1}. ${(failure as Error).message}`);
        }
      });
      await saveCheck(placeId, { visitedAt, comment: comment.trim(), items: positions }, check?.id);
      onSaved();
    });
  }

  return (
    <Page>
      <Text accessibilityRole="header" style={layout.title}>{check ? 'Редактировать чек' : 'Новый чек'}</Text>
      <Field label="Дата визита" placeholder="ГГГГ-ММ-ДД" value={date}
        onChangeText={setDate} maxLength={10} editable={!busy} />
      <Field label="Комментарий" value={comment} onChangeText={setComment} multiline editable={!busy} />
      {items.map((item) => (
        <View key={item.id} style={layout.card}>
          <Field label="Название позиции" value={item.name} maxLength={200}
            onChangeText={(name) => updateItem(item.id, { name })} editable={!busy} />
          <Field label="Цена, ₽" value={item.price} keyboardType="decimal-pad"
            onChangeText={(price) => updateItem(item.id, { price })} editable={!busy} />
          <Text style={layout.muted}>Оценка</Text>
          <View style={layout.row}>
            {[1, 2, 3, 4, 5, null].map((rating) => (
              <Button key={rating ?? 'none'} label={rating === null ? 'Без оценки' : String(rating)}
                variant={rating === item.rating ? 'primary' : 'secondary'} disabled={busy}
                onPress={() => updateItem(item.id, { rating })} />
            ))}
          </View>
          {items.length > 1 && <Button label="Убрать позицию" variant="danger" disabled={busy}
            onPress={() => setItems((current) => current.filter(({ id }) => id !== item.id))} />}
        </View>
      ))}
      <Button label="Добавить позицию" variant="secondary" disabled={busy}
        onPress={() => setItems((current) => [...current, newItem()])} />
      {error && <ErrorText message={error} />}
      <Button label={busy ? 'Сохраняем…' : 'Сохранить чек'} onPress={submit} disabled={busy} />
    </Page>
  );
}
