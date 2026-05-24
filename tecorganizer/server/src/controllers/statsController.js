import prisma from '../prisma.js'

export const getStats = async (req, res) => {
  try {
    const userId = req.userId

    // Total de clases
    const totalClasses = await prisma.class.count({ where: { userId } })

    // Total horas de estudio (suma de duraciones en minutos)
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      select: { duration: true },
    })
    const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0)
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10 // redondeado a 1 decimal

    // Promedio general (promedio de promedios de cada clase)
    const classes = await prisma.class.findMany({
      where: { userId },
      include: { grades: true },
    })
    let overallAverage = 0
    let classCountWithGrades = 0
    for (const cls of classes) {
      if (cls.grades.length > 0) {
        const withWeights = cls.grades.filter(g => g.weight != null)
        let classAvg
        if (withWeights.length > 0) {
          const totalWeight = withWeights.reduce((sum, g) => sum + g.weight, 0)
          const weightedSum = withWeights.reduce((sum, g) => sum + g.score * g.weight, 0)
          classAvg = totalWeight > 0 ? weightedSum / totalWeight : null
        } else {
          const sum = cls.grades.reduce((acc, g) => acc + g.score, 0)
          classAvg = sum / cls.grades.length
        }
        if (classAvg != null) {
          overallAverage += classAvg
          classCountWithGrades++
        }
      }
    }
    const averageGrade = classCountWithGrades > 0
      ? Math.round((overallAverage / classCountWithGrades) * 10) / 10
      : null

    res.json({
      totalClasses,
      totalStudyHours,
      averageGrade,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
}