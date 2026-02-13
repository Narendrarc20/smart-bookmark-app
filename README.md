# Smart Bookmark App

A full-stack bookmark management application built using Next.js and Supabase.

Users can sign in with Google, add bookmarks, delete them, and manage them securely with per-user privacy and real-time updates.

---

## 🚀 Live Demo

https://smart-bookmark-app-zeta-lyart.vercel.app/

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- PostgreSQL
- Tailwind CSS
- Vercel (Deployment)

---

## Problems Faced & How I Solved Them

### 1. Row Level Security (RLS) Blocking Inserts

**Problem:**  
After enabling Row Level Security on the `bookmarks` table, insert operations started failing even though the user was logged in.

**Solution:**  
I created proper RLS policies for:
- SELECT
- INSERT
- DELETE
Using the condition:
auth.uid() = user_id

I also ensured that `user_id` was passed during insert and added a foreign key reference to `auth.users(id)` with `ON DELETE CASCADE` for proper data integrity.

---

### 2. Bookmarks Only Appearing After Refresh

**Problem:**  
Newly added bookmarks were not visible immediately and required a page refresh.

**Solution:**  
I implemented Supabase Realtime using `channel()` and subscribed to `postgres_changes` on the `bookmarks` table.  
Additionally, I updated the local state immediately after insert and delete operations to improve user experience.

---

### 3. Google OAuth Working Locally but Failing in Production

**Problem:**  
After deploying to Vercel, Google login kept loading and did not redirect back to the application.

**Solution:**  
I configured the correct **Site URL** and **Redirect URLs** inside Supabase Authentication settings to include the Vercel deployment domain.  
After updating the configuration, authentication worked correctly in production.

---

### 4. Git Repository Misconfiguration

**Problem:**  
Initially, Git was initialized in the wrong directory, causing the project to be treated as a submodule and preventing proper pushes to GitHub.

**Solution:**
I reinitialized Git in the correct project root, removed incorrect remotes, set the branch to `main`, and pushed the project structure successfully.

---

## Security Implementation

- Row Level Security (RLS) enabled
- Foreign key constraint on `user_id`
- Users can only access their own bookmarks

---


Using the condition:

