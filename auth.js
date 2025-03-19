async function checkUserStatus() {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/user', {
        method: 'GET',
        credentials: 'include'
      });
  
      if (response.status === 401) {
        console.log('User is not logged in');
        return null;
      }
  
      const data = await response.json();
      if (data && data.user) {
        // Update the username display
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
          usernameDisplay.innerText = `Hello, ${data.user.fullname}`;
        }
  
        // Hide the sign in nav item
        const signInNav = document.getElementById('signInNav');
        if (signInNav) signInNav.classList.add('d-none');
  
        // Show user info and logout button
        const userNav = document.getElementById('userNav');
        if (userNav) userNav.classList.remove('d-none');
  
        const logoutNav = document.getElementById('logoutNav');
        if (logoutNav) logoutNav.classList.remove('d-none');
  
        // Show the "My Meal Plan" link
        const myPlanNav = document.getElementById('myPlanNav');
        if (myPlanNav) myPlanNav.classList.remove('d-none');
  
        return data.user;
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      return null;
    }
  }
  
  async function logout() {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
  
      if (response.ok) {
        // Redirect to the sign in page upon logout
        window.location.href = 'signin.html';
      } else {
        const data = await response.json();
        alert(data.error || 'Logout failed!');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  async function enforceAuthentication() {
    // Get the current page (this might be something like "/index.html" or just "/")
    const currentPage = window.location.pathname.split('/').pop();
  
    // If the page is signin or signup, do nothing.
    if (currentPage === 'signin.html' || currentPage === 'signup.html') {
      return;
    }
  
    // For any other page, check if the user is logged in.
    const user = await checkUserStatus();
    if (!user) {
      // If not logged in, redirect to the signin page.
      window.location.href = 'signin.html';
    }
  }
  
  // Call enforceAuthentication when DOM content is loaded.
  document.addEventListener('DOMContentLoaded', enforceAuthentication);
  
  