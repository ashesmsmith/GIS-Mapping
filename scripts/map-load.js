// Load map from Google Maps JavaScript API
// Fetches API key from server endpoint /api-key
// Returns a promise that resolves when the API is loaded

export default (async () => {
  let apiKey;

  try {
    const res = await fetch('/api-key');
    if (!res.ok) {
      throw new Error('API endpoint not found.');
    }
    const data = await res.json();
    apiKey = data.key;
  } catch (error) {
    console.error('Error fetching API key:', error);
  }

  // Bootlegged from Google
  return new Promise((resolve, reject) => {
    (g => {
      var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;
      b=b[c]||(b[c]={});
      var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));
        e.set("libraries",[...r]+"");
        for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);
        e.set("callback",c+".maps."+q);
        a.src=`https://maps.${c}apis.com/maps/api/js?`+e;
        d[q]=f;
        a.onerror=()=>h=n(Error(p+" could not load."));
        a.nonce=m.querySelector("script[nonce]")?.nonce||"";
        m.head.append(a)}));
      d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))
    })({
      key: apiKey,
      v: "weekly"
    });

    // Wait until google.maps is available before resolving
    const checkReady = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkReady);
        resolve();
      }
    }, 100);
  });
})();
