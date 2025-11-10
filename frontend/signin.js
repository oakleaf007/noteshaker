// Login


const API = "http://localhost:5000/auth";
document.getElementById("login-form").addEventListener("submit", async(e) =>{
    e.preventDefault();
    const email = document.getElementById("usr").value;
      const password = document.getElementById("pass").value;
try{
      const res = await fetch("/api/auth/login",{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });

      const data =  await res.json();
    
    document.getElementById("message").textContent =  data.message || data.error;

    if (res.ok){
        localStorage.setItem("user", JSON.stringify(data.user));
        const usrname =  data.user.name;
        localStorage.setItem("usrname",usrname);
        localStorage.setItem("loggedIn", "true");
        window.location.href = "/logged.html";
    }
}
catch (err){
    console.error("Error:", err);
}




});
function handleCredentialResponse(response){
  fetch(`/api/auth/google-login`,{
    method:"POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({token:response.credential})
  })
   
  .then(res =>res.json())

   
  .then(data =>{
    if(data.user){
document.getElementById("message").textContent =  data.message || data.error;
       localStorage.clear();
  localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("usrname", data.user.name);
      localStorage.setItem("loggedIn", "true");

      window.location.href = "/logged.html";
    } else{
      document.getElementById("message").textContent =  data.message || data.error;
    }
    
    
  })
  .catch(err => console.error("Google login error:", err));
  
}