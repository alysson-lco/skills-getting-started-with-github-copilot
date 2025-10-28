document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and select options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list" style="list-style-type: none; padding-left: 0;">
                ${details.participants
                  .map(
                    (email) =>
                      `<li style="display: flex; align-items: center; margin-bottom: 4px;">
                        <span class="participant-email">${email}</span>
                        <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}" style="cursor:pointer; margin-left:8px; color:#c62828; font-size:1.2em;">&#128465;</span>
                      </li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <p class="no-participants">No participants yet.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Adiciona evento de remoção para cada ícone de exclusão
      setTimeout(function() {
        document.querySelectorAll('.delete-participant').forEach(function(icon) {
          icon.addEventListener('click', function(e) {
            var activity = icon.getAttribute('data-activity');
            var email = icon.getAttribute('data-email');
            if (confirm('Remove ' + email + ' from ' + activity + '?')) {
              fetch('/activities/' + encodeURIComponent(activity) + '/participants/' + encodeURIComponent(email), {
                method: 'DELETE'
              })
              .then(function(res) {
                if (res.ok) {
                  fetchActivities();
                } else {
                  return res.json().then(function(data) {
                    alert(data.detail || 'Error removing participant');
                  });
                }
              })
              .catch(function() {
                alert('Network error');
              });
            }
          });
        });
      }, 0);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, activity: activity })
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.detail || 'Signed up successfully!';
        messageDiv.className = 'success';
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || 'An error occurred';
        messageDiv.className = 'error';
      }

      messageDiv.classList.remove('hidden');

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);
    } catch (error) {
      messageDiv.textContent = 'Failed to sign up. Please try again.';
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
      console.error('Error signing up:', error);
    }
  });

  // Initialize app
  fetchActivities();
});
