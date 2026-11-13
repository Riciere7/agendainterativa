import React, { useState } from 'react';
import { LoveNote, WhatsAppConfig } from '../types';
import { X, Heart, Plus, Pin, Trash2, Send, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { getDirectWhatsAppUrl } from '../utils/whatsapp';

interface LoveNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: LoveNote[];
  config: WhatsAppConfig;
  onSaveNotes: (notes: LoveNote[]) => void;
}

export const LoveNotesModal: React.FC<LoveNotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  config,
  onSaveNotes,
}) => {
  const [newText, setNewText] = useState('');
  const [author, setAuthor] = useState(config.husbandName || 'Seu Amor ❤️');
  const [selectedColor, setSelectedColor] = useState('#FFE4E6'); // rose-100

  if (!isOpen) return null;

  const colorOptions = [
    { color: '#FFE4E6', label: 'Rosa Romântico' },
    { color: '#EDE9FE', label: 'Lavanda' },
    { color: '#FEF3C7', label: 'Baunilha' },
    { color: '#D1FAE5', label: 'Menta' },
    { color: '#E0F2FE', label: 'Céu Azul' },
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newNote: LoveNote = {
      id: `note-${Date.now()}`,
      text: newText.trim(),
      author: author.trim() || 'Com amor ❤️',
      createdAt: Date.now(),
      color: selectedColor,
      pinned: false,
    };

    onSaveNotes([newNote, ...notes]);
    setNewText('');
    soundEffects.playSuccess();
  };

  const togglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
    onSaveNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);
  };

  const sendNoteToWhatsApp = (note: LoveNote) => {
    if (!config.wifePhone) {
      alert('Configure o número de WhatsApp nas configurações primeiro!');
      return;
    }
    const message = `💌 *BILHETINHO DE AMOR PRA VOCÊ* 💌\n\n"${note.text}"\n\n— ${note.author}`;
    const url = getDirectWhatsAppUrl(config.wifePhone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Mural de Bilhetinhos com Amor 💕</h3>
              <p className="text-xs text-gray-500">
                Recados e declarações de carinho deixados para ela
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create new sticky note */}
          <form
            onSubmit={handleAddNote}
            className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Deixar um novo recadinho
              </span>

              {/* Color circles */}
              <div className="flex items-center gap-1.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.color}
                    type="button"
                    onClick={() => setSelectedColor(opt.color)}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      selectedColor === opt.color ? 'scale-125 border-gray-900 shadow-sm' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: opt.color }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            <textarea
              required
              rows={3}
              placeholder="Escreva algo carinhoso, uma mensagem de força para a prova ou um lembrete fofo..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Assinatura (Ex: Seu Maridinho ❤️)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Fixar no Mural</span>
              </button>
            </div>
          </form>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl p-4 shadow-sm border border-black/5 relative flex flex-col justify-between transition-transform hover:-translate-y-1"
                style={{ backgroundColor: note.color }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePin(note.id)}
                        className={`p-1 rounded-lg text-gray-500 hover:text-gray-800 cursor-pointer ${
                          note.pinned ? 'text-rose-600 font-bold' : ''
                        }`}
                        title={note.pinned ? 'Desafixar' : 'Fixar no topo'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => sendNoteToWhatsApp(note)}
                        className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        title="Enviar este recado para o WhatsApp dela"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed italic mb-3">
                    "{note.text}"
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-gray-600 font-semibold">
                  <span>{note.author}</span>
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
