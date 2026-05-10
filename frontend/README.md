# MedMatch Frontend

Next.js frontend for the MedMatch Healthcare appointment platform.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` when the backend or socket server is not using the defaults.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Main UI Flows

- Patients browse doctors and submit appointment requests.
- New requests appear as `Pending` until admin confirmation.
- Admin appointments are filtered by buttons: `Pending`, `Confirmed`, `Completed`, `Cancelled`.
- Patient notification bell receives request, confirmation, completion, and cancellation messages.
- Bell messages are stored per patient in browser storage and can be cleared.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```
