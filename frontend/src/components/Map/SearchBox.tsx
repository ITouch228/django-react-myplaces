import { useState, useRef } from 'react';

interface SearchBoxProps {
    onSearch: (query: string) => void;
    onGeocode: (address: string) => void;
}

export const SearchBox = ({ onSearch, onGeocode }: SearchBoxProps) => {
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'local' | 'map'>('local');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (mode === 'local') {
            onSearch(query.trim());
        } else {
            onGeocode(query.trim());
        }
    };

    return (
        <div className="search-box">
            <form onSubmit={handleSubmit} className="search-box__form">
                <div className="search-box__tabs">
                    <button
                        type="button"
                        className={`search-box__tab ${mode === 'local' ? 'active' : ''}`}
                        onClick={() => setMode('local')}
                    >
                        📍 Мои места
                    </button>
                    <button
                        type="button"
                        className={`search-box__tab ${mode === 'map' ? 'active' : ''}`}
                        onClick={() => setMode('map')}
                    >
                        🗺️ На карте
                    </button>
                </div>

                <div className="search-box__row">
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-box__input"
                        placeholder={
                            mode === 'local'
                                ? 'Поиск по названию или адресу...'
                                : 'Введите адрес для поиска на карте...'
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary search-box__btn">
                        Искать
                    </button>
                </div>
            </form>
        </div>
    );
};