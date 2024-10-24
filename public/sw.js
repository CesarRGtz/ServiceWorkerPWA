const STATIC_CACHE = "static-v1";

const APP_SHELL = [
    "/",
    "index.html",
    "style.css",
    "main.js",
    "counter.js",
    "vite.svg"
];

self.addEventListener("install", (e) => {
    const cacheStatic = caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(APP_SHELL);
    });
    e.waitUntil(cacheStatic);
});

self.addEventListener("fetch", (e) => {
    console.log("fetch: ", e.request);
    e.respondWith(
        caches.match(e.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Si no está en caché, intenta obtenerlo de la red
                return fetch(e.request).then((networkResponse) => {
                    // Verifica si la respuesta es válida antes de almacenarla en caché
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                        return networkResponse;
                    }
                    // Clona la respuesta para almacenarla en caché
                    const responseToCache = networkResponse.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                    return networkResponse;
                }).catch((error) => {
                    console.error("Error en la red:", error);
                    // Opcional: puedes devolver una respuesta de reserva si la red falla
                    return new Response("Error de red", { status: 408 });
                });
            })
            .catch((error) => {
                console.error("Error en caché o fetch:", error);
                return new Response("Contenido no disponible", {
                    status: 404,
                    statusText: "No encontrado"
                });
            })
    );
});
