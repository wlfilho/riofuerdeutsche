'use client';

// Troca de senha do próprio motorista, sem e-mail no meio: ele está logado,
// então supabase.auth.updateUser basta. Depois disso a senha que o Will criou
// no cadastro deixa de valer — que é exatamente a ideia.

import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha precisa de pelo menos 6 caracteres.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'As duas senhas não são iguais.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      // "New password should be different from the old password" é o caso
      // mais provável; o resto é raro e a mensagem crua não ajudaria.
      setMessage({
        type: 'error',
        text: error.message.includes('different')
          ? 'A senha nova precisa ser diferente da atual.'
          : 'Não foi possível trocar a senha. Tente de novo.',
      });
      return;
    }
    setPassword('');
    setConfirm('');
    setMessage({ type: 'success', text: 'Senha trocada! Use a nova no próximo login.' });
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <KeyRound className="w-4 h-4" />
        Trocar minha senha
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 max-w-md">
      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
        <KeyRound className="w-4 h-4 text-gray-400" />
        Trocar minha senha
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Nova senha
          </label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              title={show ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Repita a nova senha
          </label>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar nova senha'}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setMessage(null);
              setPassword('');
              setConfirm('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
