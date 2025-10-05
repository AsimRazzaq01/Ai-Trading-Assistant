// export default function AuthLayout({ children }: { children: React.ReactNode }) {
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50">
//             <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
//                 {children}
//             </div>
//         </div>
//     );
// }

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
                {children}
            </div>
        </div>
    );
}
