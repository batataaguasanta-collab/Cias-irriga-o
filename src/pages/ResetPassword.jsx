import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Droplets, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // The logic: When user clicks email link, Supabase redirects them here with a hash containing the access_token.
    // The Supabase client automatically detects this hash and sets up the session.
    // AuthContext listens to this and sets isAuthenticated = true.
    // However, the event type is 'PASSWORD_RECOVERY'.
    // We can just rely on the session being present to allow password update.

    useEffect(() => {
        // If we want to be strict, we could check event type, but essentially if they have a session here
        // and came from that link, they are authenticated as the user who wants to reset.
        if (!isAuthenticated) {
            // Maybe they are not authenticated yet (loading) or the link is invalid/expired.
            // We'll let the user see the form but submitting might fail if no session.
        }
    }, [isAuthenticated]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        if (password.length < 8) {
            setErrorMsg({ title: 'Senha muito curta', description: 'A senha deve ter pelo menos 8 caracteres.' });
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            toast.success('Senha atualizada com sucesso!');
            // Redirect to home or login
            setTimeout(() => navigate('/'), 2000);

        } catch (error) {
            console.error("Update Password Error:", error);
            setErrorMsg({
                title: "Erro ao atualizar",
                description: error.message || "Não foi possível atualizar a senha."
            });
            toast.error('Erro ao atualizar senha');
        } finally {
            setIsLoading(false);
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
                        <CardTitle className="text-3xl font-bold text-emerald-900">Nova Senha</CardTitle>
                        <CardDescription className="text-lg mt-2">Digite sua nova senha abaixo</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {errorMsg && (
                        <Alert variant="destructive">
                            <AlertTitle>{errorMsg.title}</AlertTitle>
                            <AlertDescription>{errorMsg.description}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Nova Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                    Atualizando...
                                </>
                            ) : (
                                'Atualizar Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
