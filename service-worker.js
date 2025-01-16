const CACHE_NAME = 'my-app-cache-v1';  

  
const urlsToCache = [  
    '/',  
    '/index.html',  
    '/styles.css',  
    '/script.js',  
    '/favicon.ico', // 
self.addEventListener('install', (event) => {  
    event.waitUntil(  
        caches.open(CACHE_NAME)  
            .then((cache) => {  
                console.log('Caching app shell');  
                return cache.addAll(urlsToCache);  
            })  
    );  
});  


self.addEventListener('activate', (event) => {  
    const cacheWhitelist = [CACHE_NAME]; 
    event.waitUntil(  
        caches.keys().then((cacheNames) => {  
            return Promise.all(  
                cacheNames.map((cacheName) => {  
                    if (cacheWhitelist.indexOf(cacheName) === -1) {  
                        console.log('Deleting old cache:', cacheName);  
                        return caches.delete(cacheName);  
                    }  
                })  
            );  
        })  
    );  
});  


self.addEventListener('fetch', (event) => {  
    event.respondWith(  
        caches.match(event.request)  
            .then((response) => {  
                 
                if (response) {  
                    return response;   
                }  
                return fetch(event.request); 
            })  
    );  
});
