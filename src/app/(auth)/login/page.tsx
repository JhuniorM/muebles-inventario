'use client';
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Bienvenido
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ingresa tus credenciales para acceder al inventario
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
