'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import ContactProfile from '@/components/admin/ContactProfile';
import ContactForm from '@/components/admin/ContactForm';
import ContactDeleteConfirm from '@/components/admin/ContactDeleteConfirm';

export type ContactListItem = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  guide_role?: 'user' | 'premium' | 'admin';
  lead_status?: 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';
  client_status?: 'active' | 'completed' | 'cancelled' | 'pending';
};

type Filter = 'all' | 'leads' | 'clients' | 'guide';
type PanelState = 'empty' | 'view' | 'edit' | 'new' | 'delete';

function getStatusDot(contact: ContactListItem): { color: string; title: string } {
  if (contact.client_status === 'active') return { color: 'bg-green-500', title: 'Ativo' };
  if (contact.client_status === 'completed') return { color: 'bg-blue-500', title: 'Abgeschlossen' };
  if (contact.lead_status === 'proposal_sent') return { color: 'bg-amber-400', title: 'Proposta enviada' };
  if (contact.lead_status === 'contacted') return { color: 'bg-amber-400', title: 'Em contato' };
  if (contact.lead_status === 'closed') return { color: 'bg-green-500', title: 'Fechado' };
  if (contact.lead_status === 'lost') return { color: 'bg-red-500', title: 'Perdido' };
  if (contact.lead_status === 'new') return { color: 'bg-gray-300', title: 'Novo lead' };
  if (contact.guide_role) return { color: 'bg-gray-300', title: 'Usuário Guide' };
  return { color: 'bg-gray-200', title: '' };
}

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'leads', label: 'Leads' },
  { key: 'clients', label: 'Clientes' },
  { key: 'guide', label: 'Guide' },
];

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  });
  const isError = message.toLowerCase().startsWith('erro');
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-white text-sm rounded-xl shadow-lg ${isError ? 'bg-red-700' : 'bg-gray-900'}`}>
      {message}
    </div>
  );
}

export default function ContactsPageClient({ contacts: initialContacts }: { contacts: ContactListItem[] }) {
  const [contacts, setContacts] = useState<ContactListItem[]>(initialContacts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>('empty');
  const [prevPanel, setPrevPanel] = useState<PanelState>('empty');
  const [toast, setToast] = useState<string | null>(null);
  const [profileKey, setProfileKey] = useState(0);

  const selected = contacts.find(c => c.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter === 'leads') list = list.filter(c => c.lead_status !== undefined);
    else if (filter === 'clients') list = list.filter(c => c.client_status !== undefined);
    else if (filter === 'guide') list = list.filter(c => c.guide_role !== undefined);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        c => c.email.toLowerCase().includes(q) || (c.name ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, filter, search]);

  const showToast = (msg: string) => setToast(msg);
  const clearToast = useCallback(() => setToast(null), []);

  const goTo = (next: PanelState) => {
    setPrevPanel(panel);
    setPanel(next);
  };

  const handleSelectContact = (id: string) => {
    setSelectedId(id);
    setPanel('view');
  };

  const handleNewContact = () => {
    goTo('new');
  };

  const handleEditContact = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo('edit');
  };

  const handleDeleteContact = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedId(id);
    goTo('delete');
  };

  const handleCancel = () => {
    if (prevPanel === 'view' || panel === 'edit' || panel === 'delete') {
      setPanel(selectedId ? 'view' : 'empty');
    } else {
      setPanel('empty');
    }
  };

  const handleCreateSave = async (form: { name: string; phone: string; email: string; source: string }) => {
    const res = await fetch('/api/admin/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao criar contato');

    const newContact: ContactListItem = {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      source: data.source,
      created_at: data.created_at,
    };

    setContacts(prev => {
      const exists = prev.find(c => c.id === data.id);
      if (exists) {
        return prev.map(c => c.id === data.id ? { ...c, ...newContact } : c);
      }
      return [newContact, ...prev];
    });

    setSelectedId(data.id);
    setPanel('view');
    setProfileKey(k => k + 1);
    showToast('Contato criado com sucesso');
  };

  const handleEditSave = async (form: { name: string; phone: string; email: string; source: string }) => {
    if (!selectedId) return;
    const res = await fetch(`/api/admin/contacts/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar');

    setContacts(prev => prev.map(c =>
      c.id === selectedId
        ? { ...c, name: data.name, phone: data.phone, email: data.email, source: data.source }
        : c
    ));

    setPanel('view');
    setProfileKey(k => k + 1);
    showToast('Alterações salvas');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    const res = await fetch(`/api/admin/contacts/${selectedId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao remover');

    setContacts(prev => prev.filter(c => c.id !== selectedId));
    setSelectedId(null);
    setPanel('empty');
    showToast('Contato removido');
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] md:h-screen overflow-hidden">
      {/* Left panel: contact list (no mobile some quando um painel está aberto) */}
      <div
        className={`w-full md:w-72 flex-shrink-0 border-r border-gray-200 flex-col bg-white ${
          panel === 'empty' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Contatos</h1>
            <button
              onClick={handleNewContact}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Novo
            </button>
          </div>
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === f.key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">Nenhum contato encontrado</p>
          ) : (
            <ul className="py-1">
              {filtered.map(contact => {
                const dot = getStatusDot(contact);
                const isSelected = contact.id === selectedId;

                return (
                  <li key={contact.id} className="group relative">
                    <button
                      onClick={() => handleSelectContact(contact.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-green-50 border-r-2 border-green-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 select-none">
                        {getInitials(contact.name, contact.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.name || contact.email}
                        </p>
                        {contact.name && (
                          <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          role="button"
                          onClick={e => { handleSelectContact(contact.id); handleEditContact(e); }}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </span>
                        <span
                          role="button"
                          onClick={e => handleDeleteContact(contact.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remover"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </span>
                      </div>

                      {/* Status dot — hidden on hover */}
                      <div
                        className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${dot.color} group-hover:opacity-0 transition-opacity absolute right-4`}
                        title={dot.title}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className={`flex-1 overflow-y-auto bg-gray-50 ${panel === 'empty' ? 'hidden md:block' : 'block'}`}>
        {panel !== 'empty' && (
          <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2">
            <button
              onClick={() => setPanel('empty')}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Contatos
            </button>
          </div>
        )}
        {panel === 'new' && (
          <ContactForm
            mode="new"
            onCancel={handleCancel}
            onSave={handleCreateSave}
          />
        )}

        {panel === 'edit' && selected && (
          <ContactForm
            key={`edit-${selected.id}`}
            mode="edit"
            initial={{
              name: selected.name ?? '',
              phone: selected.phone ?? '',
              email: selected.email,
              source: selected.source ?? '',
            }}
            onCancel={handleCancel}
            onSave={handleEditSave}
          />
        )}

        {panel === 'delete' && selected && (
          <ContactDeleteConfirm
            contactName={selected.name}
            contactEmail={selected.email}
            onCancel={handleCancel}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {panel === 'view' && selected && (
          <ContactProfile
            key={`${selected.id}-${profileKey}`}
            contactId={selected.id}
            contactEmail={selected.email}
            contactName={selected.name}
            onEdit={() => goTo('edit')}
            onDelete={() => goTo('delete')}
          />
        )}

        {panel === 'empty' && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-5xl mb-4">👤</p>
              <p className="text-sm">Wähle einen Kontakt aus der Liste aus</p>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  );
}
