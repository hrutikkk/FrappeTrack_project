async function getCurrentUserInfo() {
  try {

    const res = await fetch(
      "http://192.168.0.138/api/method/frappetrack.api.user.get_employee_profile",
      {
        method: "GET",
        credentials:"include",
      }
    );

    const json = await res.json();
    console.log("Profile Response:", json);


    return json.user;

  } catch (error) {
    console.error("Error while getting user info:", error.message);
    return null;
  }
}

function renderProfile(user) {
  console.log(user)
  document.getElementById("name").innerText = user.name;
  document.getElementById("email").innerText = user.email;
  document.getElementById("username").innerText = user.username;

  document.getElementById("employeeId").innerText =
    user.employee?.name || "N/A";

  document.getElementById("designation").innerText =
    user.employee?.designation || "N/A"; 

  document.getElementById("dob").innerText =
    user.employee?.date_of_birth || "N/A";

  const img = document.getElementById("profileImage");
  // if (user.employee?.image) {
  //   img.src = `http://192.168.0.138${user.employee.image}`;
  // } else {
  //   img.style.display = "none";
  // }
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getCurrentUserInfo();

  if (!user) {
    console.log("user not found")
    return;
  }

  renderProfile(user);
});
