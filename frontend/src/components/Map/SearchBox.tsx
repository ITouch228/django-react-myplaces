import { useState, type FormEvent } from "react";

interface SearchBoxProps {
  onGeocode: (address: string) => void;
}

export const SearchBox = ({ onGeocode }: SearchBoxProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = query.trim();
    if (address) onGeocode(address);
  };

  return (
    <form className="map-geocode" onSubmit={handleSubmit} role="search" aria-label="Поиск адреса на карте">
      <span className="map-geocode__icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Найти адрес на карте"
        aria-label="Найти адрес на карте"
      />
      <button className="map-geocode__submit" type="submit" disabled={!query.trim()}>
        Найти
      </button>
    </form>
  );
};
