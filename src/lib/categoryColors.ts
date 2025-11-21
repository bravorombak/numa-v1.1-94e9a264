export interface CategoryColorPreset {
  id: string;
  label: string;
  bg_color: string;
  text_color: string;
  border_color: string;
}

export const CATEGORY_COLOR_PALETTE: CategoryColorPreset[] = [
  {
    id: 'white',
    label: 'White',
    bg_color: '#f2f1f0',
    text_color: '#2b2b2b',
    border_color: '#D1D1D1',
  },
  {
    id: 'gray',
    label: 'Gray',
    bg_color: '#D1D1D1',
    text_color: '#2b2b2b',
    border_color: '#ADADAD',
  },
  {
    id: 'brown',
    label: 'Brown',
    bg_color: '#ede3dd',
    text_color: '#2b2b2b',
    border_color: '#dbc7bc',
  },
  {
    id: 'orange',
    label: 'Orange',
    bg_color: '#f5e0d5',
    text_color: '#2b2b2b',
    border_color: '#e7c0ab',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    bg_color: '#f3e4c6',
    text_color: '#2b2b2b',
    border_color: '#e6ce9b',
  },
  {
    id: 'green',
    label: 'Green',
    bg_color: '#dfe8e1',
    text_color: '#2b2b2b',
    border_color: '#b3cab8',
  },
  {
    id: 'blue',
    label: 'Blue',
    bg_color: '#d7e5f8',
    text_color: '#2b2b2b',
    border_color: '#b2cbf2',
  },
  {
    id: 'purple',
    label: 'Purple',
    bg_color: '#eae2f3',
    text_color: '#2b2b2b',
    border_color: '#d1bee1',
  },
  {
    id: 'pink',
    label: 'Pink',
    bg_color: '#f5e0e6',
    text_color: '#2b2b2b',
    border_color: '#e5b9c5',
  },
  {
    id: 'red',
    label: 'Red',
    bg_color: '#f9e0dc',
    text_color: '#2b2b2b',
    border_color: '#eeb8b0',
  },
  {
    id: 'teal',
    label: 'Teal',
    bg_color: '#d9eee9',
    text_color: '#2b2b2b',
    border_color: '#b3d6cd',
  },
  {
    id: 'mint',
    label: 'Mint',
    bg_color: '#e3f5e8',
    text_color: '#2b2b2b',
    border_color: '#c3e6cc',
  },
  {
    id: 'aqua',
    label: 'Aqua',
    bg_color: '#e0f3f7',
    text_color: '#2b2b2b',
    border_color: '#b8dce6',
  },
  {
    id: 'olive',
    label: 'Olive',
    bg_color: '#ecefdd',
    text_color: '#2b2b2b',
    border_color: '#d2d8bf',
  },
  {
    id: 'sand',
    label: 'Sand',
    bg_color: '#f2eddf',
    text_color: '#2b2b2b',
    border_color: '#e1d7c0',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    bg_color: '#f1e8f9',
    text_color: '#2b2b2b',
    border_color: '#d8c8e9',
  },
  {
    id: 'gold',
    label: 'Gold',
    bg_color: '#f7edcf',
    text_color: '#2b2b2b',
    border_color: '#e9d8a9',
  },
  {
    id: 'rose',
    label: 'Rose',
    bg_color: '#f4d3ce',
    text_color: '#2b2b2b',
    border_color: '#e0b1ab',
  },
];

// Helper to find a preset by its color values
export const findPresetByColors = (
  bg: string | null,
  text: string | null,
  border: string | null
): CategoryColorPreset | undefined => {
  if (!bg || !text || !border) return undefined;
  
  return CATEGORY_COLOR_PALETTE.find(
    (preset) =>
      preset.bg_color.toLowerCase() === bg.toLowerCase() &&
      preset.text_color.toLowerCase() === text.toLowerCase() &&
      preset.border_color.toLowerCase() === border.toLowerCase()
  );
};

// Get default preset (first one = White)
export const getDefaultPreset = (): CategoryColorPreset => {
  return CATEGORY_COLOR_PALETTE[0];
};
