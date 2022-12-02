let swVersion="2.0.0";
let online=false;


self.addEventListener("activate",(event)=>{
  event.waitUntil(async ()=>{
    let keys=await caches.keys();
    for (let i=0;i<keys.length;i++){
      await caches.delete(keys[i]);
    }

  })
})


self.addEventListener("fetch", fetchEvent => {
  
    
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
    
    /*else{
      console.log("online");
      fetchEvent.respondWith(fetch(fetchEvent.request));
    }*/
  })

 
  const assets = [
    "/",
    "/manifest.json",
    "/index.html",
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
  