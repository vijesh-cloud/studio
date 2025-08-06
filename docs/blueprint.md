# **App Name**: EcoVerse

## Core Features:

- Home Dashboard: Home dashboard displaying user stats (points, streak, level), environmental impact, recent activity, and quick actions. Real data only. Welcome message should update from location.
- Camera + Location: Camera interface with location detection. Should use navigator.geolocation to detect user location. Generates Google Maps URL. Display address from location as user-readable address. Includes item photo upload, AI classification via the Gemini API with the AI acting as a tool.
- Profile Dashboard: Profile dashboard showing user avatar, level progress, achievement badges, detailed stats, and environmental impact visualization with real user data only.
- Leaderboard & Social: Leaderboard with rankings (Friends, Neighborhood, City-wide), user highlighting, weekly challenges, social features (challenge friend, share achievement).  The location based leaderboard sections should automatically update with new address info captured in Camera + Location.
- History & Tracking: History of user submissions with photos, status tracking (Submitted → Picked Up → Recycled), organizer details, Google Maps links for pickup locations.
- Personalized Recycling Tips: AI powered recycling tips to encourage environmental best practices
- AI Item Classification: Integration with Gemini API for item classification with realistic accuracy, suggestions for recycling.

## Style Guidelines:

- Primary color: Forest green (#388E3C) to evoke nature and sustainability.
- Background color: Very light green (#F1F8E9), almost white, to provide a clean and fresh backdrop.
- Accent color: Lime green (#A5D6A7), a lighter shade of green, used sparingly for interactive elements and highlights.
- Body and headline font: 'PT Sans' (sans-serif) for a modern, readable, and friendly look.
- Code font: 'Source Code Pro' for any code snippets (monospace).
- Use flat, vector icons related to recycling, waste management, and environmental themes.
- Use smooth, subtle animations for transitions and feedback, such as slide-in, fade-in, and progress bar updates.