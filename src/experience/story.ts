export const chapters = [
  { label: 'Только для тебя', lines: ['Любимая,', 'это для тебя.'], button: 'Открыть' },
  { label: 'Среди миллионов', lines: ['Среди миллионов людей…', 'Моё сердце выбрало тебя.'], button: 'Дальше' },
  { label: 'Ты особенная', lines: ['Ты делаешь мой мир', 'намного прекраснее.'], button: 'Ещё кое-что…' },
  { label: 'Самое главное', lines: ['И знаешь, что самое главное?', 'Я хочу сказать тебе кое-что…'], button: 'Узнать' },
  { label: 'Всегда. Без повода.', lines: ['Я тебя люблю,', 'Ильнара'], button: 'Пережить ещё раз' },
] as const;

export interface CinematicState {
  from: number;
  to: number;
  morph: number;
  reveal: number;
  light: number;
  camera: number;
  reduced: boolean;
}

export const createCinematicState = (): CinematicState => ({
  from: 0, to: 0, morph: 1, reveal: 0, light: 1, camera: 5.8, reduced: false,
});
