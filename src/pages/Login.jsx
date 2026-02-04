import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Droplets, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false); // Toggle between Login and Reset Password

    const { signInWithEmail, signInWithGoogle, isAuthenticated, resetPassword } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            await signInWithEmail(email, password);
            toast.success('Login realizado com sucesso!');
        } catch (error) {
            console.error("Login Page Error:", error);
            if (error.message.includes("Email not confirmed")) {
                setErrorMsg({
                    title: "Email não confirmado",
                    description: "Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login."
                });
            } else if (error.message.includes("Invalid login credentials")) {
                setErrorMsg({
                    title: "Credenciais inválidas",
                    description: "Email ou senha incorretos. Tente novamente."
                });
            } else {
                setErrorMsg({
                    title: "Erro ao entrar",
                    description: error.message || "Ocorreu um erro inesperado."
                });
            }
            toast.error('Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            await resetPassword(email);
            toast.success('Email de recuperação enviado!');
            setErrorMsg({
                title: "Email enviado",
                description: `Um link para redefinir sua senha foi enviado para ${email}.`,
                variant: 'success' // Custom flag/variant logic if needed, or just style differently
            });
            setIsResetMode(false); // Optionally stay to verify or go back
        } catch (error) {
            console.error("Reset Password Error:", error);
            setErrorMsg({
                title: "Erro ao enviar email",
                description: error.message || "Não foi possível enviar o email de recuperação."
            });
            toast.error('Erro ao solicitar redefinição');
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error(error.message || 'Erro ao fazer login com Google');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="mx-auto bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center">
                        <Droplets className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold text-emerald-900">
                            {isResetMode ? 'Recuperar Senha' : 'Irriga-Cias'}
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            {isResetMode ? 'Digite seu email para receber um link de redefinição' : 'Gestão de Irrigação'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {errorMsg && (
                        <Alert variant={errorMsg.variant === 'success' ? 'default' : 'destructive'} className={errorMsg.variant === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}>
                            <AlertTitle>{errorMsg.title}</AlertTitle>
                            <AlertDescription>{errorMsg.description}</AlertDescription>
                        </Alert>
                    )}

                    {!isResetMode ? (
                        /* LOGIN FORM */
                        <>
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Senha
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-xs text-emerald-600 hover:underline font-medium"
                                        >
                                            Esqueceu a senha?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : (
                                        'Entrar'
                                    )}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500">ou</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="w-full h-12 border-2 hover:bg-slate-50 font-medium"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuar com Google
                            </Button>

                            <p className="text-center text-sm text-slate-600">
                                Não tem uma conta?{' '}
                                <button
                                    onClick={() => navigate('/cadastro')}
                                    className="text-emerald-600 font-semibold hover:underline"
                                >
                                    Cadastre-se
                                </button>
                            </p>
                        </>
                    ) : (
                        /* RESET PASSWORD FORM */
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Link de Recuperação'
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsResetMode(false);
                                    setErrorMsg(null);
                                }}
                                className="w-full text-slate-600 hover:text-slate-800"
                            >
                                Voltar para Login
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
