import { useRef } from "react";

export default function SortByComponent(
    {
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        attributesList,
        setShowSortOptions
    }: {
        sortBy: string;
        setSortBy: (value: string) => void; sortOrder: string;
        setSortOrder: (value: string) => void;
        attributesList: string[];
        setShowSortOptions: (value: boolean) => void
    }) {
    const menuRef = useRef<HTMLDivElement>(null);
    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(event.target.value);
    };

    const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(event.target.value);
    };

    return (
        <div className="sort-by-component absolute top-full right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg" ref={menuRef}>
            <div className="mb-3 flex items-center gap-2">
                <label htmlFor="sortBy" className="w-16 text-xs font-medium text-gray-700">
                    Sort By
                </label>
                <select
                    id="sortBy"
                    value={sortBy}
                    onChange={handleSortByChange}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                >
                    {attributesList.map((attr) => (
                        <option key={attr} value={attr}>
                            {attr.charAt(0).toUpperCase() + attr.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="sortOrder" className="w-16 text-xs font-medium text-gray-700">
                    Order
                </label>
                <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </div>
    );
}