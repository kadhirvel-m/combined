// Extracted from ui/hod/hod_change_password.html (inline <script> #2).
    (function(){
      const $ = (s, r = document) => r.querySelector(s);
      const msgEl = document.getElementById('formMsg');
      const submitBtn = document.getElementById('submitBtn');
      const submitLabel = document.getElementById('submitLabel');

      function showMsg(text, tone){
        msgEl.textContent = text || '';
        msgEl.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'dark:bg-red-500/20', 'dark:text-red-200', 'bg-emerald-100', 'text-emerald-700', 'dark:bg-emerald-500/20', 'dark:text-emerald-200');
        if (tone === 'success') {
          msgEl.classList.add('bg-emerald-100', 'text-emerald-700', 'dark:bg-emerald-500/20', 'dark:text-emerald-200');
        } else {
          msgEl.classList.add('bg-red-100', 'text-red-700', 'dark:bg-red-500/20', 'dark:text-red-200');
        }
      }

      function setSubmitting(isSubmitting){
        submitBtn.disabled = !!isSubmitting;
        submitLabel.textContent = isSubmitting ? 'Updating...' : 'Update Password';
      }

      async function init(){
        HOD.bindThemeToggle();
        HOD.mountNav('password');
        await HOD.requireHod();
      }

      document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        msgEl.classList.add('hidden');

        const currentPassword = ($('#currentPassword').value || '');
        const newPassword = ($('#newPassword').value || '');
        const confirmNewPassword = ($('#confirmNewPassword').value || '');

        if (!currentPassword) {
          showMsg('Current password is required.', 'error');
          return;
        }
        if (newPassword.length < 8) {
          showMsg('New password must be at least 8 characters.', 'error');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showMsg('New password and confirm password do not match.', 'error');
          return;
        }

        setSubmitting(true);
        try {
          const token = HOD.getToken();
          await HOD.fetchJSON(HOD.API_BASE + '/api/hod/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
              current_password: currentPassword,
              new_password: newPassword,
              confirm_new_password: confirmNewPassword,
            }),
          });

          showMsg('Password changed successfully.', 'success');
          document.getElementById('changePasswordForm').reset();
        } catch (err) {
          showMsg((err && err.message) ? err.message : 'Failed to change password.', 'error');
        } finally {
          setSubmitting(false);
        }
      });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
      else init();
    })();
