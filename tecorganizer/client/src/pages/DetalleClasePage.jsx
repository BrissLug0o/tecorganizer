import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Circle,
  Pencil,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Download,
  X,
} from 'lucide-react'
import { classes, tasks, notes, apuntes, grades } from '../services/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function DetalleClasePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [classItem, setClassItem] = useState(null)
  const [activeTab, setActiveTab] = useState('tareas')

  const [taskList, setTaskList] = useState([])
  const [noteList, setNoteList] = useState([])
  const [apunteList, setApunteList] = useState([])
  const [gradeList, setGradeList] = useState([])

  // Modal tarea
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    score: '',
  })
  const [taskError, setTaskError] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  // Modal nota
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })

  // Modal calificación (crear examen)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [gradeForm, setGradeForm] = useState({
    name: '',
    weight: '',
    examDate: '',
  })
  const [gradeError, setGradeError] = useState('')

  // Modal para ingresar calificación (después de creado el examen)
  const [scoreModalOpen, setScoreModalOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [scoreInput, setScoreInput] = useState('')

  // Modal temario
  const [syllabusModalOpen, setSyllabusModalOpen] = useState(false)

  // Vista previa de apuntes
  const [previewApunte, setPreviewApunte] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (id) {
      loadClass()
      loadTasks()
      loadNotes()
      loadApuntes()
      loadGrades()
    }
  }, [id])

  const loadClass = async () => { const data = await classes.getById(id); setClassItem(data) }
  const loadTasks = async () => { const data = await tasks.getByClass(id); setTaskList(data) }
  const loadNotes = async () => { const data = await notes.getByClass(id); setNoteList(data) }
  const loadApuntes = async () => { const data = await apuntes.getByClass(id); setApunteList(data) }
  const loadGrades = async () => { const data = await grades.getByClass(id); setGradeList(data) }

  // Tareas
  const toggleTask = async (taskId, completed) => {
    setTaskList(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !completed } : t))
    )
    try {
      await tasks.update(taskId, { completed: !completed })
    } catch (err) {
      setTaskList(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: completed } : t))
      )
      alert('Error al actualizar la tarea')
    }
  }

  const openTaskModal = (task = null) => {
    setTaskError('')
    setEditingTask(task)
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate?.split('T')[0] || '',
        score: task.score || '',
      })
    } else {
      setTaskForm({ title: '', description: '', dueDate: '', score: '' })
    }
    setTaskModalOpen(true)
  }

  const saveTask = async () => {
    if (!taskForm.title.trim()) {
      setTaskError('El título es obligatorio')
      return
    }
    if (taskForm.dueDate) {
      const selectedDate = new Date(taskForm.dueDate + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        setTaskError('La fecha de entrega no puede ser anterior a hoy')
        return
      }
    }
    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      classId: id,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate + 'T00:00:00').toISOString() : undefined,
      score: taskForm.score ? parseFloat(taskForm.score) : undefined,
    }
    try {
      if (editingTask) await tasks.update(editingTask.id, payload)
      else await tasks.create(payload)
      setTaskModalOpen(false)
      loadTasks()
    } catch (err) {
      setTaskError('Error al guardar: ' + err.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (confirm('¿Eliminar tarea?')) { await tasks.delete(taskId); loadTasks() }
  }

  // Notas
  const openNoteModal = (note = null) => {
    setEditingNote(note)
    setNoteForm(note ? { title: note.title, content: note.content } : { title: '', content: '' })
    setNoteModalOpen(true)
  }
  const saveNote = async () => {
    if (!noteForm.title.trim()) return
    if (editingNote) await notes.update(editingNote.id, noteForm)
    else await notes.create({ ...noteForm, classId: id })
    setNoteModalOpen(false)
    loadNotes()
  }
  const deleteNote = async (noteId) => {
    if (confirm('¿Eliminar nota?')) { await notes.delete(noteId); loadNotes() }
  }

  // Apuntes
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await apuntes.upload(id, file)
      loadApuntes()
    } catch (err) { alert('Error al subir: ' + err.message) }
  }
  const deleteApunte = async (apunteId) => {
    if (confirm('¿Eliminar apunte?')) { await apuntes.delete(apunteId); loadApuntes() }
  }

  // Vista previa de apuntes
  const openPreview = (apunte) => {
    setPreviewApunte(apunte)
    setZoomLevel(1)
  }
  const closePreview = () => {
    setPreviewApunte(null)
    setZoomLevel(1)
  }
  const toggleZoom = () => {
    setZoomLevel(prev => prev === 1 ? 2 : 1)
  }
  const handleDownload = (url) => {
    window.open(`http://localhost:3000${url}`, '_blank')
  }

  // --- Calificaciones (exámenes) ---
  const openGradeCreateModal = () => {
    setGradeError('')
    setGradeForm({ name: '', weight: '', examDate: '' })
    setGradeModalOpen(true)
  }

  const saveGrade = async () => {
    setGradeError('')
    if (!gradeForm.name.trim()) {
      setGradeError('El nombre del examen es obligatorio')
      return
    }
    if (!gradeForm.examDate) {
      setGradeError('La fecha de presentación es obligatoria')
      return
    }
    const weightValue = gradeForm.weight ? parseFloat(gradeForm.weight) : undefined
    if (weightValue !== undefined && (isNaN(weightValue) || weightValue < 0 || weightValue > 100)) {
      setGradeError('La ponderación debe ser un número entre 0 y 100')
      return
    }
    try {
      await grades.create({
        name: gradeForm.name,
        weight: weightValue ? weightValue / 100 : null,
        score: 0, // 0 = pendiente de calificar
        classId: id,
        examDate: gradeForm.examDate, // <- se envía como string "YYYY-MM-DD"
      })
      setGradeModalOpen(false)
      loadGrades()
    } catch (err) {
      setGradeError('Error al guardar: ' + err.message)
    }
  }

  const openScoreModal = (grade) => {
    setSelectedGrade(grade)
    setScoreInput(grade.score !== 0 ? grade.score : '')
    setScoreModalOpen(true)
  }

  const saveScore = async () => {
    if (!selectedGrade) return
    const newScore = parseFloat(scoreInput)
    if (isNaN(newScore) || newScore < 0 || newScore > 10) {
      alert('Ingresa una calificación válida (0-10)')
      return
    }
    try {
      await grades.update(selectedGrade.id, { score: newScore })
      setScoreModalOpen(false)
      loadGrades()
    } catch (err) {
      alert('Error al guardar la calificación: ' + err.message)
    }
  }

  const deleteGrade = async (gradeId) => {
    if (confirm('¿Eliminar este examen?')) { await grades.delete(gradeId); loadGrades() }
  }

  const calculateAverage = () => {
    const graded = gradeList.filter(g => g.score !== 0 && g.weight != null)
    if (graded.length === 0) {
      const withScore = gradeList.filter(g => g.score !== 0)
      if (withScore.length === 0) return null
      const sum = withScore.reduce((acc, g) => acc + g.score, 0)
      return (sum / withScore.length).toFixed(2)
    }
    const totalWeight = graded.reduce((sum, g) => sum + g.weight, 0)
    const weightedSum = graded.reduce((sum, g) => sum + g.score * g.weight, 0)
    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : null
  }

  // Temario
  const handleSyllabusUpload = async (file) => {
    if (!file) return
    try {
      await classes.uploadSyllabus(id, file)
      await loadClass()
      setSyllabusModalOpen(false)
    } catch (err) { alert('Error al subir temario: ' + err.message) }
  }
  const handleSyllabusDelete = async () => {
    if (!confirm('¿Eliminar el temario?')) return
    try {
      await classes.deleteSyllabus(id)
      await loadClass()
    } catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (!classItem) return <div className="p-4 animate-fade-in">Cargando clase...</div>

  const tabs = ['tareas', 'apuntes', 'notas', 'temario', 'calificaciones']
  const pendingTasks = taskList.filter(t => !t.completed)
  const completedTasks = taskList.filter(t => t.completed)

  return (
    <div className="animate-fade-in-scale">
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1 hover:scale-110 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{classItem.name}</h2>
      </div>

      <div className="w-full h-32 bg-accent/20 rounded-xl mb-4 flex items-center justify-center text-accent font-semibold">
        {classItem.name}
      </div>

      {/* Subpestañas */}
      <div className="flex gap-2 border-b border-[var(--color-border)] mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab ? 'border-accent text-accent scale-105' : 'border-transparent text-[var(--color-text-secondary)] hover:scale-105'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tareas */}
      {activeTab === 'tareas' && (
        <div className="flex flex-col gap-3">
          {pendingTasks.map((task, idx) => (
            <div key={task.id} className="flex items-start gap-3 bg-[var(--color-bg-secondary)] rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
              <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5">
                <Circle size={22} className="text-[var(--color-text-secondary)]" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{task.title}</p>
                {task.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{task.description}</p>}
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</p>
              </div>
              {task.score && <span className="text-sm font-semibold text-accent">{task.score}</span>}
              <div className="flex gap-1">
                <button onClick={() => openTaskModal(task)} className="p-1 hover:text-accent"><Pencil size={14} /></button>
                <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}

          <Button onClick={() => openTaskModal()} className="self-start mt-2"><Plus size={18} className="mr-1" /> Añadir tarea</Button>

          {completedTasks.length > 0 && (
            <div className="mt-6">
              <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-accent transition-colors mb-2">
                {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Completadas ({completedTasks.length})
              </button>
              {showCompleted && (
                <div className="flex flex-col gap-2 opacity-80">
                  {completedTasks.map((task, idx) => (
                    <div key={task.id} className="flex items-start gap-3 bg-[var(--color-bg-secondary)] rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5">
                        <CheckCircle size={22} className="text-green-500" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="line-through text-[var(--color-text-secondary)]">{task.title}</p>
                        {task.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-through line-clamp-2">{task.description}</p>}
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</p>
                      </div>
                      {task.score && <span className="text-sm font-semibold text-accent">{task.score}</span>}
                      <div className="flex gap-1">
                        <button onClick={() => openTaskModal(task)} className="p-1 hover:text-accent"><Pencil size={14} /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {pendingTasks.length === 0 && completedTasks.length === 0 && (
            <p className="text-center text-[var(--color-text-secondary)] py-4">No hay tareas aún</p>
          )}

          {/* Modal tarea */}
          <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title={editingTask ? 'Editar tarea' : 'Nueva tarea'}>
            {taskError && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-3 text-sm">{taskError}</div>}
            <input type="text" placeholder="Título de la tarea" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" autoFocus />
            <textarea placeholder="Descripción (opcional)" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none resize-none" rows={2} />
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" />
            <input type="number" step="0.1" placeholder="Calificación (opcional)" value={taskForm.score} onChange={(e) => setTaskForm({ ...taskForm, score: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-4 outline-none" />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setTaskModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveTask}>{editingTask ? 'Actualizar' : 'Guardar'}</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Apuntes */}
      {activeTab === 'apuntes' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {apunteList.map((apunte) => (
              <div key={apunte.id} className="relative group">
                <div onClick={() => openPreview(apunte)} className="cursor-pointer">
                  <img
                    src={`http://localhost:3000${apunte.imageUrl}`}
                    alt="Apunte"
                    className="w-full h-24 object-cover rounded-xl border border-[var(--color-border)]"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>'
                      e.target.className = 'w-full h-24 object-contain bg-gray-200 rounded-xl'
                    }}
                  />
                </div>
                <button onClick={() => deleteApunte(apunte.id)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            <Upload size={18} /> Subir imagen
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

          {apunteList.length === 0 && <p className="text-sm text-[var(--color-text-secondary)] mt-2">Sin apuntes</p>}
        </div>
      )}

      {/* Notas */}
      {activeTab === 'notas' && (
        <div className="animate-fade-in">
          {noteList.map((note, idx) => (
            <div key={note.id} className="bg-[var(--color-bg-secondary)] rounded-xl p-3 mb-2 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{note.title}</h4>
                <div className="flex gap-1">
                  <button onClick={() => openNoteModal(note)} className="p-1 hover:text-accent"><Pencil size={14} /></button>
                  <button onClick={() => deleteNote(note.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{note.content}</p>
            </div>
          ))}
          <Button onClick={() => openNoteModal()} className="mt-2"><Plus size={18} className="mr-1" /> Nueva nota</Button>

          <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title={editingNote ? 'Editar nota' : 'Nueva nota'}>
            <input type="text" placeholder="Título" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" />
            <textarea placeholder="Contenido" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-4 outline-none resize-none" rows={4} />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setNoteModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveNote}>{editingNote ? 'Actualizar' : 'Guardar'}</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Temario */}
      {activeTab === 'temario' && (
        <div className="animate-fade-in space-y-4">
          {classItem.syllabusUrl ? (
            <>
              <div className="cursor-pointer" onClick={() => openPreview({ imageUrl: classItem.syllabusUrl })}>
                <img
                  src={`http://localhost:3000${classItem.syllabusUrl}`}
                  alt="Temario"
                  className="w-full h-64 object-cover rounded-xl border border-[var(--color-border)] hover:shadow-md transition-shadow"
                />
                <p className="text-xs text-center text-[var(--color-text-secondary)] mt-1">
                  Clic para ver con zoom
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => setSyllabusModalOpen(true)}>
                  <Upload size={16} className="mr-1" /> Cambiar temario
                </Button>
                <Button variant="ghost" onClick={handleSyllabusDelete} className="text-red-500 hover:bg-red-50">
                  <Trash2 size={16} className="mr-1" /> Eliminar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">No hay temario subido</p>
              <Button onClick={() => setSyllabusModalOpen(true)}>
                <Upload size={16} className="mr-1" /> Subir temario (imagen)
              </Button>
            </div>
          )}
          <Modal
            isOpen={syllabusModalOpen}
            onClose={() => setSyllabusModalOpen(false)}
            title={classItem.syllabusUrl ? 'Cambiar temario' : 'Subir temario'}
          >
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Selecciona una imagen para el temario.
            </p>
            <label className="cursor-pointer block w-full bg-accent text-white text-center rounded-xl py-3 font-medium hover:opacity-90 transition-opacity mb-4">
              <Upload size={18} className="inline mr-1" /> Seleccionar imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) handleSyllabusUpload(file)
                }}
              />
            </label>
            <Button variant="ghost" onClick={() => setSyllabusModalOpen(false)} className="w-full">
              Cancelar
            </Button>
          </Modal>
        </div>
      )}

      {/* Calificaciones */}
      {activeTab === 'calificaciones' && (
        <div className="animate-fade-in">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2">Examen</th>
                <th>Fecha</th>
                <th>Pond.</th>
                <th>Calificación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gradeList.map((grade) => (
                <tr key={grade.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2">{grade.name}</td>
                  <td>{grade.examDate ? new Date(grade.examDate).toLocaleDateString() : '-'}</td>
                  <td>{grade.weight != null ? `${Math.round(grade.weight * 100)}%` : '-'}</td>
                  <td>
                    {grade.score !== 0 ? (
                      <span className="font-semibold">{grade.score}</span>
                    ) : (
                      <button onClick={() => openScoreModal(grade)} className="text-accent text-xs hover:underline">
                        Ingresar nota
                      </button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => deleteGrade(grade.id)} className="text-red-500 hover:underline text-xs">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {gradeList.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} className="pt-2 text-right font-medium">
                    Promedio: {calculateAverage() ?? 'Pendiente'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          <Button onClick={openGradeCreateModal} className="mt-3">
            <Plus size={18} className="mr-1" /> Nuevo examen
          </Button>

          {/* Modal crear examen */}
          <Modal isOpen={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Nuevo examen">
            {gradeError && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-3 text-sm">{gradeError}</div>}
            <input type="text" placeholder="Nombre del examen (ej. Parcial 1)" value={gradeForm.name} onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" autoFocus />
            <input type="date" value={gradeForm.examDate} onChange={(e) => setGradeForm({ ...gradeForm, examDate: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" />
            <div>
              <input type="number" step="1" min="0" max="100" placeholder="Ponderación (ej. 60%)" value={gradeForm.weight} onChange={(e) => setGradeForm({ ...gradeForm, weight: e.target.value })} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-2 outline-none" />
              <p className="text-xs text-[var(--color-text-secondary)] -mt-1 mb-3">Ingresa el porcentaje (0-100)</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setGradeModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveGrade}>Guardar</Button>
            </div>
          </Modal>

          {/* Modal para ingresar calificación */}
          <Modal isOpen={scoreModalOpen} onClose={() => setScoreModalOpen(false)} title={`Calificar: ${selectedGrade?.name}`}>
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
              Fecha: {selectedGrade?.examDate ? new Date(selectedGrade.examDate).toLocaleDateString() : ''}
            </p>
            <input type="number" step="0.1" min="0" max="10" placeholder="Calificación (0-10)" value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-4 outline-none" autoFocus />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setScoreModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveScore}>Guardar calificación</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Modal vista previa de apuntes */}
      {previewApunte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:3000${previewApunte.imageUrl}`}
              alt="Vista previa"
              className="max-w-full max-h-[80vh] object-contain rounded-xl cursor-zoom-in"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-in-out' }}
              onDoubleClick={toggleZoom}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => handleDownload(previewApunte.imageUrl)} className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition-colors" title="Descargar">
                <Download size={20} />
              </button>
              <button onClick={closePreview} className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition-colors" title="Cerrar">
                <X size={20} />
              </button>
            </div>
            <p className="text-white text-center mt-2 text-sm select-none">
              Doble clic para zoom ({zoomLevel === 1 ? '1x' : '2x'})
            </p>
          </div>
        </div>
      )}
    </div>
  )
}