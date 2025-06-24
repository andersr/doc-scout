export type TestActionRequest = {
  chatPublicId?: string;
  email?: string;
  sourcePublicId?: string;
};

export type TestActionResponse = {
  chatPublicId?: string;
  docPublicId?: string;
  firstSourcePublicId?: string;
  ok: boolean;
  sourcePublicId?: string;
};
