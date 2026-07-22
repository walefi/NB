import { memo, useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, GripVertical, Save, Edit3, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { db, firebaseReady } from '@/lib/firebase/config'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import type { Service } from '@/types'

export const ServicesCrud = memo(function ServicesCrud() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', order: '' })

  const load = useCallback(async () => {
    if (!firebaseReady || !db) { setLoading(false); return }
    try {
      const q = query(collection(db, 'services'), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service))
      setServices(list)
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!firebaseReady || !db || !form.name) return
    try {
      await addDoc(collection(db, 'services'), {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        duration: Number(form.duration) || 60,
        isActive: true,
        order: Number(form.order) || services.length,
        createdAt: new Date().toISOString(),
      })
      setForm({ name: '', description: '', price: '', duration: '', order: '' })
      load()
    } catch { /* */ }
  }

  const handleUpdate = async (id: string) => {
    if (!firebaseReady || !db) return
    try {
      const ref = doc(db, 'services', id)
      await updateDoc(ref, {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        duration: Number(form.duration) || 60,
        order: Number(form.order) || 0,
      })
      setEditingId(null)
      setForm({ name: '', description: '', price: '', duration: '', order: '' })
      load()
    } catch { /* */ }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!firebaseReady || !db) return
    try {
      await updateDoc(doc(db, 'services', id), { isActive: !isActive })
      load()
    } catch { /* */ }
  }

  const handleDelete = async (id: string) => {
    if (!firebaseReady || !db) return
    if (!confirm('Tem certeza que deseja excluir este servico?')) return
    try {
      await deleteDoc(doc(db, 'services', id))
      load()
    } catch { /* */ }
  }

  const startEdit = (s: Service) => {
    setEditingId(s.id)
    setForm({ name: s.name, description: s.description, price: String(s.price), duration: String(s.duration), order: String(s.order || 0) })
  }

  if (loading) return <p className="text-sm text-gray-400 text-center py-8">Carregando servicos...</p>

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900">
        <h4 className="text-sm font-semibold text-black dark:text-white">
          {editingId ? 'Editar Servico' : 'Novo Servico'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="Nome do servico"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="Preco (R$)"
          />
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="Duracao (min)"
          />
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="Ordem"
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
          placeholder="Descricao"
          rows={2}
        />
        <div className="flex gap-2">
          {editingId ? (
            <>
              <Button onClick={() => handleUpdate(editingId)} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Salvar
              </Button>
              <Button variant="ghost" onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', duration: '', order: '' }) }}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={handleAdd} disabled={!form.name} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
          >
            <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black dark:text-white truncate">{s.name}</span>
                <span className="text-xs text-gray-400">R$ {s.price}</span>
                <span className="text-xs text-gray-400">{s.duration}min</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggle(s.id, s.isActive)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors"
                title={s.isActive ? 'Desativar' : 'Ativar'}
              >
                {s.isActive ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => startEdit(s)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-rose" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
