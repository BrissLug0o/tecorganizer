import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import useStore from '../store/useStore'
import Button from '../components/ui/Button'
import { colorPalettes } from '../constants/colors'
import { auth } from '../services/api'

export default function AjustesPage() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const accentColor = useStore((s) => s.accentColor)
  const setAccentColor = useStore((s) => s.setAccentColor)

  const [selectedColor, setSelectedColor] = useState(accentColor)

  const handleColorSelect = (hex) => {
    setSelectedColor(hex)
    document.documentElement.style.setProperty('--accent', hex)
  }

  const handleSave = async () => {
    setAccentColor(selectedColor)
    try {
      await auth.update({ accentColor: selectedColor })
    } catch (err) {
      console.error('No se pudo guardar el color en el perfil', err)
    }
    alert('Color guardado correctamente')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-fade-in-scale">
        <h3 className="font-semibold mb-3">Tema</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              theme === 'light' ? 'border-accent bg-accent/10' : 'border-[var(--color-border)]'
            }`}
          >
            <Sun size={18} /> Claro
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              theme === 'dark' ? 'border-accent bg-accent/10' : 'border-[var(--color-border)]'
            }`}
          >
            <Moon size={18} /> Oscuro
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-fade-in-scale">
        <h3 className="font-semibold mb-4">Color de fuente</h3>

        {colorPalettes.map((palette) => (
          <div key={palette.category} className="mb-4">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {palette.category}
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {palette.colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleColorSelect(color.hex)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedColor === color.hex
                        ? 'border-[var(--color-text-primary)] scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => useStore.getState().logout()}
      >
        Cerrar sesión
      </Button>
    </div>
  )
}