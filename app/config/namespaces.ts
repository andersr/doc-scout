export const NAMESPACES = {
  user: "user",
} as const;

export const setNameSpace = ({
  prefix,
  userPublicId,
}: {
  prefix: keyof typeof NAMESPACES;
  userPublicId: string;
}) => `${NAMESPACES[prefix]}_${userPublicId}`;
