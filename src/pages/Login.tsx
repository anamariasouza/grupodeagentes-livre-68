
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, User, RefreshCcw, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const { login, register } = useAuth();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    const question = `${num1} ${operation} ${num2}`;
    const answer = operation === '+' ? num1 + num2 : num1 - num2;
    return { question, answer };
  };

  const refreshCaptcha = () => {
    setCaptchaQuestion(generateCaptcha());
    setCaptchaAnswer('');
  };

  React.useEffect(() => {
    if (!isLoginMode) {
      setCaptchaQuestion(generateCaptcha());
      setCaptchaAnswer('');
    }
  }, [isLoginMode]);

  const isFormValid = useMemo(() => {
    if (isLoginMode) {
      return email.trim() && password.length >= 6;
    } else {
      const captchaValid = captchaAnswer.trim() !== '' && parseInt(captchaAnswer) === captchaQuestion.answer;
      return email.trim() && name.trim() && password.length >= 6 && termsAccepted && captchaValid;
    }
  }, [isLoginMode, email, name, password, termsAccepted, captchaAnswer, captchaQuestion.answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        const { error } = await login(email, password);
        if (error) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.success('Bem-vindo de volta!');
        }
      } else {
        if (!termsAccepted) {
          toast.error('Aceite os termos para continuar');
          return;
        }
        if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
          toast.error('Resposta do captcha incorreta');
          return;
        }
        const { error } = await register(email, name, password);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Conta criada com sucesso!');
        }
      }
    } catch {
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const dailyContent = useMemo(() => {
    const messages = [
      "Conecte-se com amigos através do Chathy! 🤖✨",
      "Converse em tempo real com seus amigos! 🚀💙",
      "Adicione contatos pelo email, igual ao MSN! 🌟💫",
      "Chat em tempo real, simples e rápido! 💝🧠",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return messages[dayOfYear % messages.length];
  }, []);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
          <div className="max-w-md text-center">
            <img src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" alt="Chathy" className="w-20 h-20 mx-auto mb-4 rounded-full bg-background/20 p-2" />
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Chathy</h1>
            <p className="text-lg opacity-90 leading-relaxed">{dailyContent}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" alt="Chathy Logo" className="w-12 h-12 mx-auto mb-4 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">
              {isLoginMode ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLoginMode ? 'Digite suas credenciais' : 'Preencha os campos para se cadastrar'}
            </p>
          </div>

          <Card className="border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg">{isLoginMode ? 'Login' : 'Cadastro'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required disabled={loading} className="pl-10 h-12" />
                  </div>
                </div>

                {!isLoginMode && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nome completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required disabled={loading} className="pl-10 h-12" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required disabled={loading} className="pl-10 h-12" minLength={6} />
                  </div>
                </div>

                {!isLoginMode && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Verificação de Segurança</label>
                      <div className="p-4 bg-muted rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-mono bg-background px-3 py-2 rounded border">{captchaQuestion.question} = ?</div>
                          <Input type="number" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} placeholder="?" className="w-24" required disabled={loading} />
                          <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha} disabled={loading} className="p-2 h-8 w-8">
                            <RefreshCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-1" />
                      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                        Aceito os{' '}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="text-primary underline font-medium">Termos e Políticas</button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Termos e Políticas - Chathy</DialogTitle></DialogHeader>
                            <div className="space-y-4 text-sm">
                              <section><h3 className="font-semibold mb-2">1. Responsabilidades</h3><p>Você é responsável por suas interações na plataforma.</p></section>
                              <section><h3 className="font-semibold mb-2">2. Privacidade</h3><p>Suas conversas são protegidas e armazenadas de forma segura.</p></section>
                              <section><h3 className="font-semibold mb-2">3. Uso Responsável</h3><p>Use o Chathy de forma ética e respeitosa.</p></section>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </label>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full h-12" disabled={!isFormValid || loading}>
                  {loading ? 'Aguarde...' : isLoginMode ? 'Entrar' : 'Criar Conta'}
                </Button>

                <div className="text-center">
                  <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm text-primary hover:underline">
                    {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
