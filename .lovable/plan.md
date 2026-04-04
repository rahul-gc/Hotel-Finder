

# Nepal Verified Stay Finder — Phase 1

## Overview
A clean, minimal hotel discovery and registration platform for Nepal. Airbnb-inspired design with white backgrounds, subtle shadows, and clear typography. Mobile-first. Supabase for backend (auth, database, storage).

## Pages & Features

### 1. Landing Page
- Hero section with Nepal imagery/gradient background
- Two prominent CTA cards: **"Find Hotels Near Me"** and **"Register My Hotel"**
- Brief value proposition: "Trusted, verified stays across Nepal"
- Featured cities section (Kathmandu, Pokhara) with images
- Footer with links

### 2. Hotel Search Page (`/search`)
- **Location detection**: Request GPS permission on entry; fallback to manual city/area input
- **Interactive map** (Leaflet + OpenStreetMap) showing:
  - User location marker
  - Hotel markers with popups
- **Filter sidebar/sheet** (mobile-friendly):
  - Price range slider (NPR)
  - Star rating filter
  - Distance radius (1km, 5km, 10km)
  - Amenities checkboxes (WiFi, AC, Parking, Pool, Restaurant)
- **Hotel cards list** alongside map:
  - Hotel name, star rating, distance, price/night (रु), verified badge ✅, thumbnail
  - "View Details" button
- **Smart ranking**: sort by distance + rating + verification status
- Pagination / infinite scroll

### 3. Hotel Detail Page (`/hotel/:id`)
- Image gallery/carousel
- Hotel name, verified badge, rating summary
- Full description, amenities list, address
- Map showing exact location
- Reviews section with category ratings (Cleanliness, Location, Service)
- "Write a Review" button (auth required)
- Contact info (phone, email)

### 4. Hotel Registration Page (`/register-hotel`)
- Auth-gated (must be logged in)
- Multi-step form:
  - **Step 1**: Hotel name, owner name, contact (Nepali phone validation), email
  - **Step 2**: Map pin selector for exact GPS location, full address, city selection
  - **Step 3**: Rooms count, price/night, amenities multi-select
  - **Step 4**: Upload min. 3 images + government registration document
  - **Step 5**: Review & submit
- All validation enforced per step
- Submission creates hotel with "Pending" status
- Success screen with status tracker

### 5. Authentication
- Login / Signup pages with Supabase Auth (email + password)
- Role stored in `user_roles` table (user, hotel_owner)
- Protected routes for registration and reviews

### 6. User Review System
- Star ratings for Cleanliness, Location, Service (averaged)
- Text review with character limit
- One review per user per hotel (enforced via DB unique constraint)
- Reviews displayed on hotel detail page

## Database Schema (Supabase/PostgreSQL)
- **profiles**: id, full_name, phone, avatar_url, created_at
- **user_roles**: id, user_id, role (enum: user, hotel_owner, admin)
- **hotels**: id, name, owner_id, description, address, city, latitude, longitude, price_per_night, num_rooms, amenities (array), phone, email, status (pending/verified/rejected), verified_at, created_at
- **hotel_images**: id, hotel_id, image_url, is_primary, created_at
- **reviews**: id, hotel_id, user_id, cleanliness_rating, location_rating, service_rating, overall_rating, comment, created_at (unique on hotel_id + user_id)

## Design System
- **Colors**: White background, dark text, blue primary accent (#2563EB), green for verified (#16A34A), warm gray neutrals
- **Typography**: Clean sans-serif (Inter)
- **Cards**: White with subtle shadow, rounded corners
- **Mobile-first**: Bottom sheet filters, stacked layout, large touch targets
- **Localization**: NPR currency display (रु), English UI (Nepali language support deferred)

## Tech Decisions
- Leaflet + react-leaflet for maps
- Supabase Auth for authentication
- Supabase Storage for hotel images
- Geolocation API for user position
- Haversine formula (client-side) for distance calculation initially

