document.addEventListener('DOMContentLoaded', () => {

    emailjs.init('zwfMMyYMn7KEa7MGP');

    const apiUrl = 'http://localhost:3000';
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const saveBuildButton = document.getElementById('saveBuildButton');
    const chatHeader = document.querySelector('.chat-header');
    const chatContent = document.getElementById("chatContent");
    const closeButton = document.querySelector('.chat-close');

    chatContent.style.display = "none";
    closeButton.style.display = "none";

    chatHeader.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', closeChat);

    document.getElementById('messageForm').addEventListener('submit', function (event) {
        event.preventDefault();

        sendEmailWithChatContent();
    });

    function sendEmailWithChatContent() {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const message = document.getElementById('messageInput').value;

        const templateParams = {
            from_name: userName,
            user_name: userName,
            user_email: userEmail,
            message: message
        };

        emailjs.send('service_pclrz03', 'template_turrpps', templateParams)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('Your message has been sent!');
            }, function (error) {
                console.log('FAILED...', error);
                alert('Failed to send the message, please try again later.');
            });
    }


    // Event handlers for forms and buttons
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    if (saveBuildButton) {
        saveBuildButton.addEventListener('click', handleSaveBuild);
    }

    document.querySelectorAll(".tablink").forEach(tab => {
        tab.addEventListener('click', function () {
            openTab(this.textContent.trim());
            setActiveTab(this);
        });
    });

    const defaultOpen = document.getElementById("defaultOpen");
    if (defaultOpen) {
        defaultOpen.click();
    }
});

function toggleChat() {
    const chatContent = document.getElementById("chatContent");
    const closeButton = document.querySelector('.chat-close');
    chatContent.style.display = (chatContent.style.display === "none" ? "block" : "none");
    closeButton.style.display = (closeButton.style.display === "none" ? "block" : "none");
}

function closeChat() {
    const chatContent = document.getElementById("chatContent");
    const closeButton = document.querySelector('.chat-close');
    chatContent.style.display = "none";
    closeButton.style.display = "none";
}
function toggleSpecs(specId) {
    var specs = document.getElementById(specId);
    if (specs) {
        specs.style.display = specs.style.display === 'none' ? 'block' : 'none';
    } else {
        console.error('Specs element not found:', specId);
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('[name="username"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
        const response = await fetch(`${apiUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please log in.');
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
        const response = await fetch(`${apiUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login successful');
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}

async function handleSaveBuild() {
    const selectedCpu = document.getElementById("cpu-select").value;
    const selectedGpu = document.getElementById("gpu-select").value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You must be logged in to save a build.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/api/builds/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cpu: selectedCpu, gpu: selectedGpu })
        });
        if (response.ok) {
            alert('Build saved successfully!');
        } else {
            const data = await response.json();
            alert('Failed to save build: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving build:', error);
        alert('Error saving build. Please check your connection and try again.');
    }
}

function openTab(tabName) {
    document.querySelectorAll(".tabcontent").forEach(tabcontent => {
        tabcontent.style.display = "none";
    });
    document.getElementById(tabName).style.display = "block";
}

function setActiveTab(element) {
    document.querySelectorAll(".tablink").forEach(tab => {
        tab.className = tab.className.replace(" active", "");
    });
    element.className += " active";
}
