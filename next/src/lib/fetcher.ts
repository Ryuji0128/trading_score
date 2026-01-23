export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
});

export const authFetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return Promise.resolve(null);

  return fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(res => {
    if (!res.ok) return null;
    return res.json();
  });
};
