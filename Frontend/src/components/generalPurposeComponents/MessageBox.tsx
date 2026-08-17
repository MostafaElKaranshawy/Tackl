export function MessageBox({ message, type }: { message: string; type: 'success' | 'error' }) {
    const boxClassName = `p-4 mb-4 text-sm rounded-lg ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    return (
        <div className={boxClassName} role="alert">
            {message}
        </div>
    );
}