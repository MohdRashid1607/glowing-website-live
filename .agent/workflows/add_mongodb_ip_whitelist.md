---
description: Add current IP to MongoDB Atlas whitelist and configure .env
---

## Steps to resolve MongoDB Atlas connection error

1. **Identify your current public IP address**
   - Open a browser and go to https://www.whatismyip.com/ (or any IP‑lookup site).
   - Copy the displayed IP address (e.g., `203.0.113.45`).

2. **Add the IP address to MongoDB Atlas**
   - Log in to your MongoDB Atlas account.
   - Navigate to **Network Access → IP Whitelist**.
   - Click **Add IP Address**.
   - Paste the IP you copied, give it a descriptive comment (e.g., `dev machine 2026-01-16`), and save.
   - *Optional*: If you want to allow any IP during development, you can add `0.0.0.0/0`, but be aware this is less secure.

3. **Verify the connection string in your `.env` file**
   - Open `backend/.env` (it is ignored by git, so you can edit it locally).
   - Ensure it contains a line like:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
     ```
   - Replace `<username>`, `<password>`, `<cluster>`, and `<dbname>` with your actual credentials.
   - Save the file.

4. **Restart the backend**
   ```
   cd backend
   npm run dev
   ```
   - The server should now start without the *Could not connect to any servers* error.

5. **If the error persists**
   - Double‑check that the IP you added matches the one shown by the IP‑lookup site.
   - Ensure there are no extra spaces or line‑breaks in the `MONGODB_URI` value.
   - Verify that the Atlas cluster is in **Running** state and not paused.
   - Look at the console output for any additional error messages.

---

**Note**: This workflow is safe to run automatically (`// turbo-all` not needed). It only involves documentation; no commands are executed.
