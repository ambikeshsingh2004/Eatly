# Database Update Required

You are receiving the error `Could not find the 'language' column` because the live database schema hasn't been updated to include the new **Preferred Language** feature we just added.

## 🚀 How to Fix (1 Minute)

1.  **Log in** to your Supabase Dashboard.
2.  Go to the **SQL Editor** (icon looking like `>_` on the left sidebar).
3.  **Paste and Run** the following SQL command:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';
```

✅ **That's it!**
Once you run this, the "Failed to save profile" error will disappear, and the Language Selection feature will start working immediately.
