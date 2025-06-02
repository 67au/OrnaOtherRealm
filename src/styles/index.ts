import { themes } from './themes'

export const themesName: Array<string> = Object.keys(themes)

export type Theme = (typeof themesName)[number]

export const defaultTheme = themesName[0]
