export const BACKGROUND_THEME_KEYS = {
  neural: "neural",
  wireframe: "wireframe",
  circuit: "circuit",
} as const

export const BACKGROUND_THEMES = Object.values(BACKGROUND_THEME_KEYS)

export type BackgroundTheme = (typeof BACKGROUND_THEMES)[number]

const capitalize = (value: string) => (value ? value[0].toUpperCase() + value.slice(1) : value)

export const getBackgroundThemeLabel = (theme: BackgroundTheme) =>
  theme
    .split("-")
    .map(capitalize)
    .join(" ")
