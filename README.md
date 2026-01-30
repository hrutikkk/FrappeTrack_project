### 📁 api/

Handles **all HTTP and backend communication**.

#### `axiosinstance.js`
- Centralized Axios configuration
- Sets base URL (`/api`), headers, and credentials
- Ensures consistent API usage across the app
---

### 📁 components/

Reusable **UI and routing components**.

#### `ProtectedRoutes.js`
- Restricts access to authenticated users
- Redirects unauthenticated users to login

#### `sidebar.jsx`
- Main navigation sidebar
- Provides consistent layout across protected pages

---
### 📁 pages/

Contains **route-level React components** (screens).

#### `login.jsx`
- User authentication screen
- Handles login flow and session initialization

#### `profile.jsx`
- Displays logged-in user information
- Provides profile-related actions

#### `tracker.jsx`
- Core time tracking screen
- Controls start, pause, resume, and stop actions
- Integrates timer, projects, and screenshots

---
### 📁 store/

Manages **global application state** using Zustand.

#### `authstore.js`
- Handles authentication state
- Stores user and session data

#### `createstore.js`
- Manages project-related data
- Fetches and stores assigned projects

#### `timestore.js`
- Contains all timer logic
- Tracks session time and pause durations

#### `screenshotstore.js`
- Captures and uploads screenshots
- Attaches metadata like time and project

---

