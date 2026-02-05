import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Droplets, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import bgImage from '../assets/bg-irrigation.jpg';

export default function Cadastro() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { signUpWithEmail, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [successMsg, setSuccessMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validações
        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            console.log("Iniciando cadastro para:", formData.email);
            const { user, session } = await signUpWithEmail(formData.email, formData.password, {
                full_name: formData.name
            });

            console.log("Cadastro finalizado. User:", user?.id, "Session:", !!session);

            if (user && !session) {
                // Email confirmation required
                setSuccessMsg({
                    title: "Verifique seu email",
                    description: `Enviamos um link de confirmação para ${formData.email}. Por favor, clique no link para ativar sua conta antes de fazer login.`
                });
                toast.success('Cadastro realizado! Verifique seu email.');
            } else {
                toast.success('Conta criada com sucesso!');
                navigate('/login');
            }
        } catch (error) {
            console.error("Cadastro Error:", error);
            let msg = error.message || 'Erro ao criar conta';

            if (msg.includes('Password should be') || msg.includes('weak_password')) {
                msg = 'A senha é muito fraca. Use pelo menos 8 caracteres, maiúsculas, minúsculas, números e símbolos.';
            } else if (msg.includes('User already registered')) {
                msg = 'Este email já está cadastrado.';
            }

            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await signInWithGoogle();
            toast.success('Cadastro com Google realizado!');
        } catch (error) {
            toast.error(error.message || 'Erro ao cadastrar com Google');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="min-h-screen bg-gradient-to-br from-emerald-900/60 via-emerald-800/50 to-emerald-900/70 backdrop-blur-[2px] flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur border-emerald-500/20">
                    <CardHeader className="space-y-4 text-center pb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/login')}
                            className="absolute top-4 left-4 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar
                        </Button>

                        <div className="mx-auto bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center">
                            <Droplets className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold text-emerald-900">Criar Conta</CardTitle>
                            <CardDescription className="text-lg mt-2 text-slate-600">Bem-vindo ao Irriga-Cias</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {successMsg ? (
                            <Alert className="bg-emerald-50 border-emerald-200">
                                <AlertTitle className="text-emerald-800">{successMsg.title}</AlertTitle>
                                <AlertDescription className="text-emerald-700">
                                    {successMsg.description}
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                            onClick={() => navigate('/login')}
                                        >
                                            Ir para Login
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Nome Completo
                                    </label>
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="João Silva"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Senha
                                    </label>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white"
                                        minLength={8}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Confirmar Senha
                                    </label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Digite a senha novamente"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg hover:shadow-lg transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        'Criar Conta'
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 rounded-full">ou</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignup}
                            className="w-full h-12 border-2 hover:bg-slate-50 font-medium bg-white"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Cadastrar com Google
                        </Button>

                        <p className="text-center text-sm text-slate-600">
                            Já tem uma conta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-emerald-600 font-semibold hover:underline"
                            >
                                Fazer Login
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
