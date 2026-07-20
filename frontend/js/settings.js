/* Settings Page */
async function loadProfile() {
  try {
    const data = await API.get('/auth/profile');
    document.getElementById('settingsName').value = data.full_name || '';
    document.getElementById('settingsEmail').value = data.email || '';
    document.getElementById('settingsDept').value = data.department || '';
  } catch(e) {}
}

async function saveProfile() {
  try {
    await API.put('/auth/profile', {
      full_name: document.getElementById('settingsName').value,
      email: document.getElementById('settingsEmail').value,
      department: document.getElementById('settingsDept').value
    });
    showToast('Profile updated');
  } catch(e) { showToast('Failed to update', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadProfile);