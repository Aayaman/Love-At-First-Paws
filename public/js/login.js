document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const messageEl = document.getElementById('login_message');

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const userNameInput = document.getElementById('user_name').value.trim();
    const passWordInput = document.getElementById('pass_word').value.trim();

    // Fetch login.txt (must be in same folder as login.html, i.e., views/)
    fetch('login.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch login.txt');
        }
        return response.text();
      })
      .then(data => {
        const lines = data.split('\n');
        let matchFound = false;

        for (let line of lines) {
          const [storedUser, storedPass] = line.trim().split(':');
          if (storedUser === userNameInput && storedPass === passWordInput) {
            matchFound = true;
            break;
          }
        }

        if (matchFound) {
          messageEl.style.color = 'green';
          messageEl.textContent = 'Login successful!';
        } else {
          messageEl.style.color = 'red';
          messageEl.textContent = 'Invalid username or password.';
        }

        // Clear the message after 5 seconds
        setTimeout(() => {
          messageEl.textContent = '';
        }, 5000);
      })
      .catch(error => {
        console.error('Login fetch error:', error);
        messageEl.style.color = 'red';
        messageEl.textContent = 'Error fetching login.txt.';
        setTimeout(() => {
          messageEl.textContent = '';
        }, 5000);
      });
  });
});
