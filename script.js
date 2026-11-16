// keyian ward bursary website
// admin login functionality
document.addEventListener("DOMContentLoaded", function() {
    const loginform = document.getElementById("admin-login-form");
    if (loginform) {
        loginform.addEventListener("submit", function
            (event) {
                event.preventDefault();
                const username = 
                document.getElementById("username").value;
                const password =
                document.getElementById("password").value;
                if (username === "admin" && password === 
                    "12345") {
                        alert("Login successful!");
                        window.location.href = "admin-dashboard.html";
                    } else {
                        alert("incorrect username or password.");
                    }
            });
        }
    });