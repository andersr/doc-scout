export const NAMESPACE_TYPES = {
  USER: "user",
} as const;

export const getNameSpace = (type: keyof typeof NAMESPACE_TYPES, id: string) =>
  `${NAMESPACE_TYPES[type]}_${id}`;
