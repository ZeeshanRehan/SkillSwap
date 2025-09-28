export type Locale = "en" | "es"

const base: Record<Locale, any> = {
  en: {
    common: { you: "You" },
    filters: {
      filter: "Filter",
      all: "All",
      open: "Open",
      assigned: "Assigned",
      done: "Done",
      neighborhoods: "Neighborhoods",
      skills: "Skills",
      apply: "Apply",
      clear: "Clear",
    },
    actions: {
      createJawn: "Create a Jawn",
      createJawnTitle: "Create Jawn",
      apply: "Pitch in",
      markDone: "All set!",
      profile: "Profile",
    },
    labels: {
      name: "Name",
      description: "Description",
      skill: "Skill",
      neighborhood: "Neighborhood",
      timeMin: "Time (min)",
      estimatedEagle: "Estimated $EAGLE:",
      createdOn: "Created",
      doneOn: "Done",
    },
    availability: {
      weeknights: "Weeknights",
      weekends: "Weekends",
      afternoons: "Afternoons",
      mornings: "Mornings",
      evenings: "Evenings",
      anytime: "Anytime",
    },
    status: { OPEN: "OPEN", ASSIGNED: "ASSIGNED", DONE: "DONE" },
    toasts: {
      applied: "Applied",
      failedApply: "Failed to apply",
      markedDone: "Marked as done",
      failedDone: "Failed to mark done",
      created: "Created",
      reset: "Demo data reset",
    },
    report: { concern: "Report a concern?" },
  },
  es: {
    common: { you: "Tú" },
    filters: {
      filter: "Filtrar",
      all: "Todos",
      open: "Abierto",
      assigned: "Asignado",
      done: "Hecho",
      neighborhoods: "Barrios",
      skills: "Habilidades",
      apply: "Aplicar",
      clear: "Limpiar",
    },
    actions: {
      createJawn: "Crear un Jawn",
      createJawnTitle: "Crear Jawn",
      apply: "Echar una mano",
      markDone: "¡Listo!",
      profile: "Perfil",
    },
    labels: {
      name: "Nombre",
      description: "Descripción",
      skill: "Habilidad",
      neighborhood: "Barrio",
      timeMin: "Tiempo (min)",
      estimatedEagle: "Estimado $EAGLE:",
      createdOn: "Creado",
      doneOn: "Hecho",
    },
    availability: {
      weeknights: "Noches entre semana",
      weekends: "Fines de semana",
      afternoons: "Tardes",
      mornings: "Mañanas",
      evenings: "Tardes/noche",
      anytime: "Cuando sea",
    },
    status: { OPEN: "ABIERTO", ASSIGNED: "ASIGNADO", DONE: "HECHO" },
    toasts: {
      applied: "Aplicado",
      failedApply: "Error al aplicar",
      markedDone: "Marcado como hecho",
      failedDone: "Error al finalizar",
      created: "Creado",
      reset: "Datos restablecidos",
    },
    report: { concern: "¿Reportar un problema?" },
  },
} as const

export const dict: Record<Locale, typeof base["en"]> = base

export type Dict = typeof base.en

export function getDict(locale: Locale): Dict {
  return base[locale]
}
