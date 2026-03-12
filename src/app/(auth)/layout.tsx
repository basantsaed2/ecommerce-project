export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="absolute inset-0 z-[100] bg-white">
            {children}
        </div>
    );
}
