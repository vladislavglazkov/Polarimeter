let swVersion="1.0.0";
let online=false;
window.addEventListener('offline', () => {
  online=false;
});

window.addEventListener('online', () => {
  online=true;
});


self.addEventListener("activate",(event)=>{
  event.waitUntil(async ()=>{
    let keys=await caches.keys();
    keys.forEach(element=>{
      if (swVersion!=element){
        await caches.delete(element);
      }
    })
  })
})


self.addEventListener("fetch", fetchEvent => {
  
    if (!navigator.onLine){
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
    }
    else{
      console.log("online");
      fetchEvent.respondWith(fetch(fetchEvent.request));
    }
  })

 
  const assets = [
    "/manifest.json",
    "/portComm.html",
    "https://unpkg.com/react@18/umd/react.development.js",
    "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
    "https://unpkg.com/@babel/standalone/babel.min.js",
    "/csser.css",
    "/mainpol.jsx"
  ]
  
  self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
      caches.open(swVersion).then(cache => {
        cache.addAll(assets)
      })
    )
  })
  