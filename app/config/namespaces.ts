export const NAMESPACES = {
  user: "user",
} as const;

export const getNameSpace = (type: keyof typeof NAMESPACES, id: string) =>
  `${NAMESPACES[type]}_${id}`;
