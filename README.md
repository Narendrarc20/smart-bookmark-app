# 🔖 Smart Bookmark App

A secure full-stack bookmark management application built using Next.js and Supabase.  
Users can sign in with Google, save bookmarks, and manage them privately with real-time updates.

---

## 🚀 Live Demo

🔗 https://smart-bookmark-app-zeta-lyart.vercel.app/

---

## 📌 Features

- ✅ Google OAuth Authentication (No email/password login)
- ✅ Add bookmarks (Title + URL)
- ✅ Delete bookmarks
- ✅ Private bookmarks per user (Row Level Security enabled)
- ✅ Real-time updates using Supabase Realtime
- ✅ Responsive and clean UI
- ✅ Deployed on Vercel

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Google OAuth
- **Realtime:** Supabase Realtime subscriptions
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 🔐 Security (Row Level Security - RLS)

Row Level Security is enabled on the `bookmarks` table.

### Policies Implemented:

- Users can view their own bookmarks  
  `auth.uid() = user_id`

- Users can insert their own bookmarks  
  `auth.uid() = user_id`

- Users can delete their own bookmarks  
  `auth.uid() = user_id`

This ensures that:
- User A cannot see User B’s bookmarks
- Users can only modify their own data

---

## ⚙️ Setup Instructions (Local Development)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Narendrarc20/smart-bookmark-app.git
cd smart-bookmark-app
