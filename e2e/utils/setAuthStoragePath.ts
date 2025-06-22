export function setAuthStoragePath(username: string) {
  return `playwright/.auth/${username}.json`;
}
