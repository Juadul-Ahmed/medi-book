# MediBook — Medical Appointment Booking Platform

**MediBook** is a full-stack medical appointment booking platform that connects patients with doctors through online appointment scheduling, doctor profiles, availability management, and role-based dashboards.

🌐 **Live Demo:** [medi-book-beige-ten.vercel.app](https://medi-book-beige-ten.vercel.app/)

📦 **Repository:** [Juadul-Ahmed/medi-book](https://github.com/Juadul-Ahmed/medi-book)

---

## ✨ Features

### 👤 Authentication & Accounts
- Patient registration and sign-in.
- Secure authentication and session management with Better Auth.
- Role-based access for patients, doctors, and administrators.
- Separate doctor registration and approval workflow.

### 🩺 Doctor Directory
- Browse registered doctors and their profiles.
- Explore medical specialties.
- View doctor details and professional information.
- Check available appointment slots.

### 📅 Appointment Management
- Browse available appointment times.
- Schedule medical appointments.
- Use 30-minute appointment slots.
- Manage appointments through dedicated dashboards.
- Cancel appointments subject to the 24-hour cancellation policy.

### 🧑‍⚕️ Doctor Dashboard
- Manage professional profile information.
- Manage availability and appointment schedules.
- View and manage patient appointments.
- Upload a profile image.

### 🛡️ Administration
- Manage user accounts.
- Review doctor registrations.
- Manage doctor approvals.
- View and manage appointments.

### 🔔 Additional Functionality
- Notifications.
- Specialty data and doctor filtering.
- Responsive interface for different screen sizes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Full-stack React framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| HeroUI v3 | UI components |
| Redux Toolkit | Client-side state management |
| Better Auth | Authentication and sessions |
| PostgreSQL | Relational database |
| Neon | Hosted PostgreSQL |
| Prisma ORM 7 | Database access and client generation |
| `@prisma/adapter-pg` | PostgreSQL driver adapter |
| React Hook Form | Form management |
| Zod | Data validation |
| Motion | UI animations |
| Vercel | Deployment |

---

## 🏗️ Architecture

MediBook uses the Next.js App Router for both the frontend and backend API routes.

- **Frontend:** React, TypeScript, Tailwind CSS, and HeroUI.
- **API layer:** Next.js Route Handlers.
- **Authentication:** Better Auth with role-based access control.
- **Database:** PostgreSQL hosted on Neon.
- **ORM:** Prisma 7 with the PostgreSQL driver adapter.
- **Deployment:** Vercel.

The application separates patient, doctor, and administrator workflows to support the different permissions and responsibilities of each role.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js compatible with your Next.js and Prisma versions.
- npm.
- Git.
- A PostgreSQL database, such as Neon.

### 1. Clone the repository

```bash
git clone https://github.com/Juadul-Ahmed/medi-book.git
cd medi-book
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Configure the variables required by your Prisma and Better Auth setup:

```env
DATABASE_URL="YOUR_NEON_POOLED_CONNECTION_STRING"
DIRECT_URL="YOUR_NEON_DIRECT_CONNECTION_STRING"

BETTER_AUTH_SECRET="YOUR_SECURE_AUTH_SECRET"
BETTER_AUTH_URL="http://localhost:3000"
```

Use the correct Neon connection strings from your database dashboard. Keep `.env` out of version control and never commit real database credentials or authentication secrets.

For production, configure the corresponding variables in your Vercel project settings. Set `BETTER_AUTH_URL` to your deployed application URL.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

The project generates Prisma Client into `src/generated/prisma`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
```

This command generates Prisma Client before creating the optimized Next.js production build.

---

## 📂 Project Structure

```text
medi-book/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── appointments/
│   │   ├── doctor/
│   │   ├── doctors/
│   │   ├── login/
│   │   └── register/
│   ├── generated/
│   │   └── prisma/
│   └── lib/
│       ├── auth.ts
│       ├── auth-client.ts
│       └── prisma.ts
├── prisma7.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

*This is a simplified overview of the project structure.*

---

## 🔐 Security Considerations

- Keep database credentials and authentication secrets private.
- Use server-side authorization checks for protected operations.
- Validate incoming API data before processing it.
- Restrict administrative actions to authorized administrators.
- Protect doctor approval and account management workflows.
- Enforce appointment cancellation rules on the server.

---

## 🌍 Deployment

MediBook is deployed on Vercel.

**Production URL:** https://medi-book-beige-ten.vercel.app/

The deployment uses environment variables for database connectivity and authentication configuration.

---

## 🎯 Project Goals

MediBook is designed as a production-oriented full-stack portfolio project to demonstrate practical software engineering skills, including:

- Building a full-stack application with Next.js and TypeScript.
- Designing and integrating a PostgreSQL database.
- Implementing authentication and role-based authorization.
- Developing REST-style API endpoints.
- Managing appointment scheduling and availability.
- Creating reusable UI components and responsive interfaces.
- Deploying a web application to a production environment.

---

## 👨‍💻 Author

**Jaadul Ahmed**

Software Engineering student interested in full-stack development, modern web technologies, and building practical software products.

- GitHub: [@Juadul-Ahmed](https://github.com/Juadul-Ahmed)
- Portfolio: [jaadul.dev](https://juadul-ahmed.vercel.app/)

---

## 📄 License

A license has not yet been specified for this repository. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
