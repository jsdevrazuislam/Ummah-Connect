import { useState, useRef, useEffect } from 'react';
import { init, SearchIndex } from 'emoji-mart';
import emojiData from "@emoji-mart/data";
import { Input } from '@/components/ui/input';


init({ data: emojiData });

export const CompactEmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const typeSafeEmojiData = emojiData as EmojiMartData;
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const popularEmojis = typeSafeEmojiData.categories[0].emojis.slice(0, 24);
        setCategories([
            {
                id: 'popular',
                name: 'Frequently Used',
                emojis: popularEmojis
            },
            ...typeSafeEmojiData.categories.slice(1, 4)
        ]);
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            SearchIndex.search(searchQuery).then((results) => {
                setFilteredEmojis(results.slice(0, 30));
            });
        } else {
            setFilteredEmojis([]);
        }
    }, [searchQuery]);

    return (
        <div
            ref={pickerRef}
            className="w-[220px] h-[200px] bg-background border rounded-lg shadow-lg flex flex-col"
        >
            <div className="p-2 border-b">
                <Input
                    type="text"
                    placeholder="Search emojis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 h-8 text-sm border rounded"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {searchQuery ? (
                    <div className="grid grid-cols-8">
                        {filteredEmojis.map((emoji) => (
                            <button
                                key={emoji.id}
                                onClick={() => onSelect(emoji.skins[0].native)}
                                className="text-lg hover:bg-accent rounded p-1 cursor-pointer"
                                aria-label={emoji.name}
                            >
                                {emoji.skins[0].native}
                            </button>
                        ))}
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.id}>
                            <div className="text-xs font-medium text-muted-foreground">
                                {category.name}
                            </div>
                            <div className="grid grid-cols-8">
                                {category.emojis.map((emojiId: string) => {
                                    const emoji = typeSafeEmojiData.emojis[emojiId];
                                    return (
                                        <button
                                            key={emojiId}
                                            onClick={() => onSelect(emoji.skins[0].native)}
                                            className="text-lg hover:bg-accent rounded p-1 cursor-pointer"
                                            aria-label={emoji.name}
                                        >
                                            {emoji.skins[0].native}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

