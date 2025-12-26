
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  console.log("Login attempt:", username);

  login(username, password);

});
async function login(username, password) {
  try {
    const res = await fetch("http://192.168.0.138/api/method/frappetrack.api.auth_api.login_custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("Response:", data);
    if (data?.message?.success) {

      window.electronAPI.loginSuccess();
    } else {
      alert("Login failed");
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("Login error. Please try again.");
  }
}