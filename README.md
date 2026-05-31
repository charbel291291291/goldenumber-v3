# Golden Number 👑

A premium, luxury-themed progressive web application (PWA) designed for simple raffle and table reservation.

Inspired by premium black and gold raffle cards, **Golden Number** provides an easy, ultra-clean mobile-first workflow allowing public users to choose slots on active tables in real-time, while giving table hosts robust tools to lock/unlock tables, verify guest payments, trace weekly/overall profits, and reset raffle boards.

---

## 🚀 Key Features

* **Visual Identity**: High-contrast, custom black aesthetic with luxury gold gradients, paired with pristine fonts (*Cinzel* serif for games, *Inter* for inputs & states).
* **Grid Layout**: Auto-adapts strictly to a $7 \times 6$ square grid showing 42 numbers, staying responsive and complete down to $360\text{px}$ screens with zero horizontal overflow.
* **Real-time Database**: Direct Supabase engine support mapping real-time sync listeners for guest list updates, slot reservations, and locks.
* **Interactive Fallback Developer Mode**: Out-of-the-box local storage database mockup when Supabase secrets are not specified.
* **PWA Standalone Shell**: Native Manifest configurations allowing simple installation on Android and iOS devices, with custom Service Worker caching to run flawlessly offline.

---

## ⚙️ Fast Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create `.env` or edit directly:
```env
# Supabase secrets
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Access code to open the admin panel
VITE_ADMIN_PIN="1234"
```

### 3. Star Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your mobile browser emulator or physical device.

---

## 🗄️ Supabase Production Setup

Deploying Golden Number securely with a real Supabase backend requires these quick steps:

### A. Run Database SQL Schema
1. Open your **Supabase Dashboard** and navigate to the **SQL Editor**.
2. Click **New Query**, and paste the full script code from the `/supabase-schema.sql` file in the project.
3. Click **Run** to execute. This creates:
   * `tables` (1-10 rows representing raffles)
   * `reservations` (containing bookings, unique tables index constraints)
   * `profit_ledger` (recording locked verified payments)

### B. Deploy Admin Security (Edge Function)
To secure the PIN comparison on the serverless backend instead of parsing strings on the client device:
1. Initialize Supabase CLI in your project with `supabase init`.
2. Login using `supabase login`.
3. Set your production secret comparison pin on Supabase:
   ```bash
   supabase secrets set ADMIN_PIN="YOUR_PIN_CODE"
   ```
4. Deploy the check verification function:
   ```bash
   supabase functions deploy verify-admin-pin
   ```

---

## 🌐 Production Deployment (Vercel / GitHub)

Deploying to custom hosts like Vercel or Netlify is straightforward:
1. Build static production bundle files:
   ```bash
   npm run build
   ```
2. Deploy the generated `/dist` build outputs using Vercel CLI:
   ```bash
   vercel --prod
   ```
3. Attach env variables on Vercel Dashboard Settings:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_ADMIN_PIN`

---

## ✨ Design & Visual Decisions

* **Luxury Gold Borders**: Frames the screen inside an elegant luxury card.
* **Cream Grid Slots**: High contrast ivory-cream background with rich black typography ensuring instant legibility.
* **Golden X Paint**: Smooth cross line ribbon with partial transparency, keeping numerical slots easily readable while showing beautiful visual validation.
* **Offline Safe**: Displays a clean, non-intrusive warning header `Connection lost. Data will refresh when online` if the network disconnects.
