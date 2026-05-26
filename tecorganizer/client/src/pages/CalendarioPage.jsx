import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Pencil,
  Trash2,
} from 'lucide-react'
import { events } from '../services/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import useStore from '../store/useStore'

const EMOJIS = ['🎉', '📅', '📚', '⚡', '🎓', '💪', '🔥', '❤️']

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [eventList, setEventList] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    eventDate: format(new Date(), 'yyyy-MM-dd'),
    eventTime: '',
    description: '',
    emoji: '',
    notify: false,
  })

  const searchQuery = useStore((s) => s.searchQuery)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await events.getAll()
      setEventList(data)
    } catch (err) {
      console.error('Error al cargar eventos:', err)
    }
  }

  const filteredEvents = eventList.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Navegación del mes
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))

  // Construir cuadrícula del mes
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const toLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
  }

  const days = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Eventos del día seleccionado
  const eventsOnSelected = filteredEvents.filter((ev) =>
    isSameDay(toLocalDate(ev.eventDate), selectedDate)
  )

  // Próximos 7 días
  const today = new Date()
  const sevenDaysFromNow = addDays(today, 7)
  const upcomingEvents = filteredEvents
    .filter((ev) => {
      const date = toLocalDate(ev.eventDate)
      return date >= today && date <= sevenDaysFromNow
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

  // Agrupar próximos eventos por día
  const groupedUpcoming = {}
  upcomingEvents.forEach((ev) => {
    const dateKey = format(toLocalDate(ev.eventDate), 'yyyy-MM-dd')
    if (!groupedUpcoming[dateKey]) groupedUpcoming[dateKey] = []
    groupedUpcoming[dateKey].push(ev)
  })

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      eventDate: format(selectedDate, 'yyyy-MM-dd'),
      eventTime: '',
      description: '',
      emoji: '',
      notify: false,
    })
    setModalOpen(true)
  }

  // Abrir modal para editar
  const openEditModal = (ev) => {
    setEditingEvent(ev)
    setFormData({
      title: ev.title,
      eventDate: format(toLocalDate(ev.eventDate), 'yyyy-MM-dd'),
      eventTime: ev.eventTime || '',
      description: ev.description || '',
      emoji: ev.emoji || '',
      notify: ev.notify,
    })
    setModalOpen(true)
  }

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    if (!formData.title.trim()) return
    try {
      if (editingEvent) {
        await events.update(editingEvent.id, formData)
      } else {
        await events.create(formData)
      }
      setModalOpen(false)
      loadEvents()
    } catch (err) {
      alert('Error al guardar evento: ' + err.message)
    }
  }

  // Eliminar evento
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return
    try {
      await events.delete(id)
      loadEvents()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div className="relative pb-20 space-y-4 animate-fade-in">
      {/* Calendario mensual */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 hover:bg-accent/10 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-semibold text-lg capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <button onClick={nextMonth} className="p-1 hover:bg-accent/10 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-[var(--color-text-secondary)] mb-2">
          {dayNames.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center gap-y-2">
          {days.map((d, idx) => {
            const isCurrentMonth = isSameMonth(d, currentMonth)
            const isSelected = isSameDay(d, selectedDate)
            const hasEvent = filteredEvents.some((ev) =>
              isSameDay(toLocalDate(ev.eventDate), d)
            )
            const isTodayDate = isToday(d)

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(d)
                  setFormData((prev) => ({
                    ...prev,
                    eventDate: format(d, 'yyyy-MM-dd'),
                  }))
                }}
                disabled={!isCurrentMonth}
                className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm relative transition-all duration-200
                  ${!isCurrentMonth ? 'invisible' : ''}
                  ${isSelected ? 'bg-accent text-white font-bold scale-110' : ''}
                  ${isTodayDate && !isSelected ? 'border border-accent' : ''}
                  hover:bg-accent/20
                `}
              >
                {format(d, 'd')}
                {hasEvent && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Eventos del día seleccionado */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-fade-in-scale">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Star size={18} className="text-accent" />
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </h4>
        {eventsOnSelected.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {searchQuery ? 'Sin resultados de búsqueda' : 'Sin eventos'}
          </p>
        ) : (
          eventsOnSelected.map((ev) => (
            <div
              key={ev.id}
              className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0 animate-fade-in"
            >
              <div className="flex items-center gap-2 flex-1">
                {ev.emoji && <span className="text-lg">{ev.emoji}</span>}
                <div>
                  <span className="font-medium">{ev.title}</span>
                  {ev.description && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {ev.description}
                    </p>
                  )}
                  {ev.eventTime && (
                    <span className="text-xs text-accent ml-2">{ev.eventTime}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(ev)}
                  className="p-1 hover:text-accent transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Próximos 7 días */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-slide-up">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Star size={18} className="text-accent" />
          Próximos 7 días
        </h4>
        {Object.keys(groupedUpcoming).length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {searchQuery ? 'Sin resultados de búsqueda' : 'No hay eventos próximos'}
          </p>
        ) : (
          Object.entries(groupedUpcoming).map(([dateKey, evts]) => {
            const date = parseISO(dateKey)
            const displayDate = isToday(date)
              ? 'Hoy'
              : format(date, "EEEE d 'de' MMMM", { locale: es })
            return (
              <div key={dateKey} className="mb-4 last:mb-0">
                <h5 className="text-sm font-medium text-accent mb-2 capitalize">
                  {displayDate}
                </h5>
                {evts.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0 animate-fade-in"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {ev.emoji && <span className="text-lg">{ev.emoji}</span>}
                      <div>
                        <span className="font-medium">{ev.title}</span>
                        {ev.eventTime && (
                          <span className="text-xs text-accent ml-2">{ev.eventTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1 hover:text-accent transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-1 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-300 z-10"
      >
        <Plus size={28} />
      </button>

      {/* Modal crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Editar evento' : 'Nuevo evento'}
      >
        <input
          type="text"
          placeholder="Título del evento"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 mb-2 outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
        <div className="mb-2">
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
            Emoji (opcional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() =>
                  setFormData({
                    ...formData,
                    emoji: formData.emoji === emoji ? '' : emoji,
                  })
                }
                className={`text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  formData.emoji === emoji
                    ? 'bg-accent/20 ring-2 ring-accent'
                    : 'hover:bg-[var(--color-bg-secondary)]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <input
          type="date"
          value={formData.eventDate}
          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
          className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 mb-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="time"
          value={formData.eventTime}
          onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
          className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 mb-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 mb-2 outline-none focus:ring-2 focus:ring-accent resize-none"
          rows={2}
        />
        <label className="flex items-center gap-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={formData.notify}
            onChange={(e) => setFormData({ ...formData, notify: e.target.checked })}
            className="accent-accent"
          />
          Recordarme
        </label>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingEvent ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}