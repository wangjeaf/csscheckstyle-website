javascript:(function(win,doc){if(win.location.href==''){return;} var div=document.createElement('div');div.id = 'ckservice-loading';div.style.cssText = 'position:fixed;left:1px;top:1px;border:1px solid black;box-shadow:1px 1px 3px rgba(0,0,0,.3);padding:5px 20px;font-size:16px;';div.innerHTML = 'Loading CKService...';document.body.appendChild(div);var s = doc.createElement('script');s.async=true;s.defer=true;s.src='http://www.csscheckstyle.com/js/webservice.js';doc.body.appendChild(s);})(this, document);