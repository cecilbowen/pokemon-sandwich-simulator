console.debug('Service worker init...')
self.addEventListener('fetch', (e) => {
  console.log(`[Service Worker] Fetched resource ${e.request.url}`);
});