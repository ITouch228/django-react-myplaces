export function validatePlaceName(name: string): string | null {
  if (!name.trim()) return "Введите название места.";
  if (name.trim().length > 200) return "Название не может быть длиннее 200 символов.";
  return null;
}

