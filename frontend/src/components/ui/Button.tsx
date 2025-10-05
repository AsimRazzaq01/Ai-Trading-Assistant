export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className="w-full rounded-md bg-black text-white py-2 px-4 hover:opacity-90 disabled:opacity-50"
            {...props}
        >
            {children}
        </button>
    );
}