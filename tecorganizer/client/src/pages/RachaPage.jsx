import { useState, useEffect } from 'react'
import {
  Flame, Clock, Upload, Play, Pause, BookOpen, Brain,
  GitBranch, PenTool, ChevronDown, ChevronUp, Download, X
} from 'lucide-react'
import { study } from '../services/api'
import useStore from '../store/useStore'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const methods = [
  {
    id: 'pomodoro', name: 'Pomodoro', icon: Clock,
    desc: 'Ciclos de 25 minutos de concentración intensa seguidos de 5 minutos de descanso. El temporizador debe llegar a cero para completar la sesión.',
    duration: 25, needsQuestions: false, needsEvidence: true,
  },
  {
    id: 'feynman', name: 'Feynman', icon: BookOpen,
    desc: 'Explica el tema en voz alta como si se lo enseñaras a alguien que no sabe nada. Graba un audio o escribe la explicación para validar tu comprensión.',
    duration: 20, needsQuestions: false, needsEvidence: true,
  },
  {
    id: 'active_recall', name: 'Active Recall', icon: Brain,
    desc: 'Formula al menos 3 preguntas clave sobre el tema y respóndelas sin mirar tus apuntes. La sesión se completa cuando hayas ingresado las preguntas y respuestas.',
    duration: 0, needsQuestions: true, needsEvidence: false,
  },
  {
    id: 'mind_map', name: 'Mapa Mental', icon: GitBranch,
    desc: 'Dibuja un diagrama que conecte las ideas principales del tema. Usa colores y ramas. Sube una foto del resultado.',
    duration: 15, needsQuestions: false, needsEvidence: true,
  },
  {
    id: 'free_writing', name: 'Escritura Libre', icon: PenTool,
    desc: 'Escribe un resumen o ensayo corto sobre lo que aprendiste. No te preocupes por la ortografía, solo deja fluir las ideas.',
    duration: 15, needsQuestions: false, needsEvidence: true,
  },
]

export default function RachaPage() {
  const [streak, setStreak] = useState(0)
  const [record, setRecord] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [evidenceFile, setEvidenceFile] = useState(null)

  const [questions, setQuestions] = useState([{ q: '', a: '' }])
  const [showQuestionsForm, setShowQuestionsForm] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [historyMethod, setHistoryMethod] = useState(null)

  const [previewEvidencia, setPreviewEvidencia] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const user = useStore((s) => s.user)
  const updateUserRacha = useStore((s) => s.updateUserRacha)

  useEffect(() => {
    if (user) {
      setStreak(user.studyStreak || 0)
      setRecord(user.maxStreak || 0)
    }
  }, [user])

  // Temporizador
  useEffect(() => {
    let interval
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && timerRunning) {
      handleFinish()
    }
    return () => clearInterval(interval)
  }, [timerRunning, timeLeft])

  const handleStart = () => {
    const method = methods.find(m => m.id === selectedMethod)
    if (!method) { alert('Elige un método primero'); return }
    if (method.needsQuestions) {
      setShowQuestionsForm(true)
      return
    }
    setTimeLeft(method.duration * 60)
    setTimerRunning(true)
  }

  const handleFinish = () => {
    setTimerRunning(false)
    const method = methods.find(m => m.id === selectedMethod)
    setSessionDuration(method.duration || 0)
    setShowUpload(true)
  }

  const handleQuestionsDone = () => {
    const validQs = questions.filter(q => q.q.trim() && q.a.trim())
    if (validQs.length < 3) {
      alert('Debes agregar al menos 3 preguntas con sus respuestas')
      return
    }
    setShowQuestionsForm(false)
    setShowUpload(true)
  }

  const handleUploadEvidence = async () => {
    let evidenceUrl = ''
    if (evidenceFile) {
      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('evidence', evidenceFile)
        const res = await fetch('${BASE_URL}/api/study/upload-evidence', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const data = await res.json()
        if (res.ok) evidenceUrl = data.url
      } catch (err) { console.error(err) }
    }

    try {
      const payload = {
        method: selectedMethod,
        duration: sessionDuration || 0,
        evidenceUrl: evidenceUrl || null,
        questions: selectedMethod === 'active_recall'
          ? JSON.stringify(questions.filter(q => q.q.trim() && q.a.trim()))
          : undefined,
      }
      const result = await study.complete(payload)
      const newStreak = result.user?.studyStreak ?? streak
      const newMax = result.user?.maxStreak ?? record

      // Actualizar estado local
      setStreak(newStreak)
      setRecord(newMax)

      // Actualizar el store global (¡esta es la clave!)
      updateUserRacha(newStreak, newMax)

      setShowUpload(false)
      setEvidenceFile(null)
      setQuestions([{ q: '', a: '' }])
      alert('¡Sesión completada!')
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const loadHistory = async (methodId) => {
    try {
      const data = await study.getByMethod(methodId)
      setHistoryData(data)
      setHistoryMethod(methodId)
      setHistoryOpen(true)
    } catch (err) { alert('Error al cargar historial') }
  }

  const openPreview = (evidencia) => {
    setPreviewEvidencia(evidencia)
    setZoomLevel(1)
  }
  const closePreview = () => {
    setPreviewEvidencia(null)
    setZoomLevel(1)
  }
  const toggleZoom = () => {
    setZoomLevel(prev => prev === 1 ? 2 : 1)
  }
  const handleDownload = (url) => {
    window.open(`${BASE_URL}${url}`, '_blank')
  }

  const currentMethod = methods.find(m => m.id === selectedMethod)

  return (
    <div className="text-center animate-fade-in">
      {/* Racha */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 mb-6 animate-fade-in-scale">
        <div className="flex items-center justify-center gap-3">
          <Flame size={48} className="text-accent" />
          <span className="text-5xl font-bold text-accent animate-pulse-custom">{streak}</span>
        </div>
        <p className="text-[var(--color-text-secondary)] mt-2">días seguidos</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Récord: {record} días</p>
      </div>

      {/* Método de estudio */}
      <h3 className="font-semibold text-left mb-3">Elige método de estudio</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
        {methods.map((m, idx) => (
          <button key={m.id} onClick={() => setSelectedMethod(m.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 animate-fade-in ${selectedMethod === m.id ? 'border-accent bg-accent/10' : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <m.icon size={20} className="text-accent" />
            <span className="font-medium text-sm">{m.name}</span>
          </button>
        ))}
      </div>

      {currentMethod && (
        <p className="text-sm text-left text-[var(--color-text-secondary)] mb-4 animate-fade-in bg-[var(--color-bg-secondary)] rounded-xl p-3">
          {currentMethod.desc}
        </p>
      )}

      {/* Botón iniciar / temporizador / formulario Active Recall */}
      {!timerRunning && !showQuestionsForm && (
        <Button onClick={handleStart} className="w-full mb-6" disabled={!selectedMethod}>
          <Play size={18} className="mr-2" /> Iniciar sesión de estudio
        </Button>
      )}

      {timerRunning && (
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 mb-6 animate-fade-in-scale">
          <div className="text-4xl font-mono font-bold mb-4">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => setTimerRunning(false)}>
              <Pause size={18} className="mr-1" /> Pausar
            </Button>
          </div>
        </div>
      )}

      {/* Formulario Active Recall */}
      {showQuestionsForm && (
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 mb-6 animate-fade-in-scale text-left">
          <h4 className="font-semibold mb-3">Tus preguntas y respuestas</h4>
          {questions.map((item, idx) => (
            <div key={idx} className="mb-3">
              <input type="text" placeholder="Pregunta" value={item.q}
                onChange={e => {
                  const newQs = [...questions]
                  newQs[idx].q = e.target.value
                  setQuestions(newQs)
                }}
                className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 mb-1 outline-none"
              />
              <input type="text" placeholder="Respuesta" value={item.a}
                onChange={e => {
                  const newQs = [...questions]
                  newQs[idx].a = e.target.value
                  setQuestions(newQs)
                }}
                className="w-full bg-[var(--color-bg-primary)] rounded-xl px-4 py-2 outline-none"
              />
            </div>
          ))}
          <button onClick={() => setQuestions([...questions, { q: '', a: '' }])}
            className="text-accent text-sm hover:underline mb-3">
            + Agregar otra pregunta
          </button>
          <Button onClick={handleQuestionsDone} className="w-full">
            Terminar preguntas
          </Button>
        </div>
      )}

      {/* Modal subir evidencia (solo imágenes) */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="¡Sesión completada!">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {currentMethod?.needsEvidence ? 'Sube una foto de tu trabajo' : 'Confirma que has completado la sesión'}
        </p>
        {currentMethod?.needsEvidence && (
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center mb-4">
            <Upload size={32} className="mx-auto text-[var(--color-text-secondary)] mb-2" />
            <label className="cursor-pointer text-accent text-sm hover:underline">
              {evidenceFile ? evidenceFile.name : 'Seleccionar imagen'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEvidenceFile(e.target.files[0])}
              />
            </label>
          </div>
        )}
        <Button onClick={handleUploadEvidence} className="w-full">
          Guardar y sumar racha
        </Button>
      </Modal>

      {/* Historial de evidencias */}
      <div className="mt-8">
        <button onClick={() => setHistoryOpen(!historyOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-accent transition-colors mb-2">
          {historyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Mis evidencias
        </button>
        {historyOpen && (
          <div className="flex gap-2 mb-4">
            {methods.map(m => (
              <button key={m.id} onClick={() => loadHistory(m.id)}
                className={`text-xs bg-[var(--color-bg-secondary)] px-3 py-1 rounded-full hover:bg-accent/10 transition-colors ${historyMethod === m.id ? 'ring-2 ring-accent' : ''}`}>
                {m.name}
              </button>
            ))}
          </div>
        )}
        {historyOpen && historyData.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {historyData.map(item => (
              <div key={item.id}>
                {item.evidenceUrl ? (
                  <div className="cursor-pointer" onClick={() => openPreview(item)}>
                    <img
                      src={`${BASE_URL}${item.evidenceUrl}`}
                      alt="Evidencia"
                      className="w-full h-24 object-cover rounded-xl border border-[var(--color-border)]"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                ) : item.questions ? (
                  <details className="bg-[var(--color-bg-secondary)] rounded-xl p-2 text-left text-xs">
                    <summary className="cursor-pointer font-medium">Preguntas</summary>
                    <ul className="list-disc pl-3 mt-1">
                      {JSON.parse(item.questions).map((q, i) => (
                        <li key={i}><strong>{q.q}</strong>: {q.a}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        ) : historyOpen && historyMethod ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-4">
            Aún no hay evidencias para este método.
          </p>
        ) : null}
      </div>

      {/* Modal vista previa de evidencia (zoom) */}
      {previewEvidencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${BASE_URL}${previewEvidencia.evidenceUrl}`}
              alt="Vista previa"
              className="max-w-full max-h-[80vh] object-contain rounded-xl cursor-zoom-in"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-in-out' }}
              onDoubleClick={toggleZoom}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => handleDownload(previewEvidencia.evidenceUrl)} className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition-colors" title="Descargar">
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