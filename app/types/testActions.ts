export type TestActionRequest = {
  chatPublicId?: string;
  sourcePublicId?: string;
  username?: string;
};

export type TestActionResponse = {
  chatPublicId?: string;
  docPublicId?: string;
  firstSourcePublicId?: string;
  ok: boolean;
};
