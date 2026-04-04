-- Add more verified hotels with images to Supabase
-- Run this in your Supabase SQL Editor

-- First, ensure we have the system admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'system@hotelfinder.local',
    crypt('system123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "System Admin"}',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, is_verified)
VALUES ('00000000-0000-0000-0000-000000000001', 'System Admin', 'system@hotelfinder.local', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- Insert 12 more verified hotels with diverse locations
INSERT INTO public.hotels (
    id, owner_id, name, description, address, city, 
    latitude, longitude, price_per_night, num_rooms, 
    amenities, phone, email, status, average_rating, review_count
) VALUES 
-- Kathmandu Hotels
('d4e5f6a7-b8c9-0123-defa-456789012345', '00000000-0000-0000-0000-000000000001',
 'Hyatt Regency Kathmandu', 
 'Luxury 5-star hotel with stunning Boudhanath Stupa views, world-class spa, and international dining.',
 'Taragaon, Boudha, Kathmandu', 'Kathmandu',
 27.7219, 85.3613, 18500.00, 280,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Gym', 'Spa', 'Bar', 'Room Service'],
 '+977-1-4491234', 'kathmandu.regency@hyatt.com', 'verified', 4.7, 342),

('e5f6a7b8-c9d0-1234-efab-567890123456', '00000000-0000-0000-0000-000000000001',
 'Dwarikas Hotel Kathmandu',
 'Heritage boutique hotel featuring traditional Newari architecture and authentic Nepali cuisine.',
 'P.O. Box 459, Battisputali, Kathmandu', 'Kathmandu',
 27.7038, 85.3465, 22000.00, 87,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Spa', 'Bar', 'Heritage Tours'],
 '+977-1-4479488', 'info@dwarikas.com', 'verified', 4.9, 256),

('f6a7b8c9-d0e1-2345-fabc-678901234567', '00000000-0000-0000-0000-000000000001',
 'Hotel Shanker',
 'Historic palace-turned-hotel with Nepali architecture, beautiful gardens, and central location.',
 'Lazimpat, Kathmandu', 'Kathmandu',
 27.7156, 85.3208, 8500.00, 94,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Gym', 'Bar'],
 '+977-1-4410151', 'reservations@hotelshanker.com', 'verified', 4.5, 189),

('a7b8c9d0-e1f2-3456-abcd-789012345678', '00000000-0000-0000-0000-000000000001',
 'Aloft Kathmandu Thamel',
 'Modern hotel in the heart of Thamel with rooftop bar, live music, and contemporary design.',
 'Thamel, Kathmandu', 'Kathmandu',
 27.7152, 85.3123, 12000.00, 150,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Gym', 'Bar', 'Live Music'],
 '+977-1-5970200', 'alofthimalayankathmandu@marriott.com', 'verified', 4.6, 203),

-- Pokhara Hotels
('b8c9d0e1-f2a3-4567-bcde-890123456789', '00000000-0000-0000-0000-000000000001',
 'Fish Tail Lodge',
 'Iconic lakeside hotel with breathtaking Annapurna views, private lake access, and serene gardens.',
 'Lakeside, Pokhara', 'Pokhara',
 28.2112, 83.9567, 9500.00, 65,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Lake Access', 'Spa'],
 '+977-61-462001', 'fishtail@fish-tail.com', 'verified', 4.8, 178),

('c9d0e1f2-a3b4-5678-cdef-901234567890', '00000000-0000-0000-0000-000000000001',
 'Temple Tree Resort & Spa',
 'Boutique resort with traditional Nepali-style cottages, infinity pool, and mountain views.',
 'Gaurighat, Lakeside, Pokhara', 'Pokhara',
 28.2167, 83.9512, 14000.00, 45,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Spa', 'Yoga'],
 '+977-61-462161', 'info@temple-tree.com', 'verified', 4.7, 145),

('d0e1f2a3-b4c5-6789-defa-012345678901', '00000000-0000-0000-0000-000000000001',
 'Hotel Barahi',
 'Premium lakeside hotel featuring rooftop dining with panoramic Himalayan views.',
 'Lakeside Rd, Pokhara', 'Pokhara',
 28.2098, 83.9598, 11000.00, 85,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Rooftop Bar', 'Gym'],
 '+977-61-460617', 'reservation@hotelbarahi.com', 'verified', 4.6, 167),

-- Chitwan Hotels
('e1f2a3b4-c5d6-7890-efab-123456789012', '00000000-0000-0000-0000-000000000001',
 'Kasara Resort',
 'Luxury eco-resort with private villas, jungle views, and exceptional wildlife experiences.',
 'Patihani, Chitwan', 'Chitwan',
 27.5512, 84.5067, 18000.00, 35,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Spa', 'Safari', 'Nature Walks'],
 '+977-56-563737', 'reservations@kasararesort.com', 'verified', 4.8, 134),

('f2a3b4c5-d6e7-8901-fabc-234567890123', '00000000-0000-0000-0000-000000000001',
 'Meghauli Serai Chitwan',
 'Taj luxury safari lodge with thatched-roof suites, elephant interactions, and river views.',
 'Meghauli, Chitwan', 'Chitwan',
 27.5389, 84.4789, 25000.00, 30,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Spa', 'Safari', 'Elephant Experiences'],
 '+977-56-580777', 'meghauliserai.chitwan@tajhotels.com', 'verified', 4.9, 98),

('a3b4c5d6-e7f8-9012-abcd-345678901234', '00000000-0000-0000-0000-000000000001',
 'Sapana Village Lodge',
 'Community-based eco-lodge supporting local Tharu village with authentic cultural experiences.',
 'Kumroj, Chitwan', 'Chitwan',
 27.5234, 84.5123, 4500.00, 25,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'Cultural Programs', 'Nature Walks'],
 '+977-56-493045', 'info@sapana-lodge.com', 'verified', 4.4, 87),

-- Lumbini Hotels
('b4c5d6e7-f8a9-0123-bcde-456789012345', '00000000-0000-0000-0000-000000000001',
 'Tiger Palace Resort',
 'Nepal''s first 5-star resort casino with luxury accommodations near Lumbini.',
 'Bhairahawa, Lumbini', 'Lumbini',
 27.5056, 83.4198, 15000.00, 136,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Pool', 'Casino', 'Gym', 'Spa'],
 '+977-71-570444', 'reservations@tigerpalaceresort.com', 'verified', 4.5, 156),

('c5d6e7f8-a9b0-1234-cdef-567890123456', '00000000-0000-0000-0000-000000000001',
 'Lumbini Buddha Garden Resort',
 'Peaceful resort near Maya Devi Temple with meditation spaces and organic gardens.',
 'Lumbini Development Trust Area', 'Lumbini',
 27.4698, 83.2756, 5500.00, 40,
 ARRAY['WiFi', 'Parking', 'Restaurant', 'AC', 'Garden', 'Meditation Spaces'],
 '+977-71-580234', 'buddhagarden@lumbini.com', 'verified', 4.3, 76);

-- Add hotel images for all hotels
INSERT INTO public.hotel_images (hotel_id, image_url, is_primary) VALUES
-- Hyatt Regency Kathmandu images
('d4e5f6a7-b8c9-0123-defa-456789012345', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true),
('d4e5f6a7-b8c9-0123-defa-456789012345', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', false),
('d4e5f6a7-b8c9-0123-defa-456789012345', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', false),

-- Dwarikas Hotel images
('e5f6a7b8-c9d0-1234-efab-567890123456', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', true),
('e5f6a7b8-c9d0-1234-efab-567890123456', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', false),
('e5f6a7b8-c9d0-1234-efab-567890123456', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', false),

-- Hotel Shanker images
('f6a7b8c9-d0e1-2345-fabc-678901234567', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', true),
('f6a7b8c9-d0e1-2345-fabc-678901234567', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', false),

-- Aloft Kathmandu images
('a7b8c9d0-e1f2-3456-abcd-789012345678', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', true),
('a7b8c9d0-e1f2-3456-abcd-789012345678', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', false),

-- Fish Tail Lodge images
('b8c9d0e1-f2a3-4567-bcde-890123456789', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', true),
('b8c9d0e1-f2a3-4567-bcde-890123456789', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', false),
('b8c9d0e1-f2a3-4567-bcde-890123456789', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', false),

-- Temple Tree Resort images
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', true),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', false),

-- Hotel Barahi images
('d0e1f2a3-b4c5-6789-defa-012345678901', 'https://images.unsplash.com/photo-1618773928121-c32242e63f78?w=800', true),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', false),

-- Kasara Resort images
('e1f2a3b4-c5d6-7890-efab-123456789012', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', true),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', false),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', false),

-- Meghauli Serai images
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', false),

-- Sapana Village Lodge images
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', true),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', false),

-- Tiger Palace Resort images
('b4c5d6e7-f8a9-0123-bcde-456789012345', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', true),
('b4c5d6e7-f8a9-0123-bcde-456789012345', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', false),

-- Lumbini Buddha Garden images
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'https://images.unsplash.com/photo-1542640244-7e67286feb8f?w=800', true),
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', false),

-- Add images for original 3 hotels
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', false),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', true),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', false),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', true),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', false);

-- Verify results
SELECT 'Total verified hotels:' as info, COUNT(*) as total FROM public.hotels WHERE status = 'verified';
SELECT 'Total hotel images:' as info, COUNT(*) as total FROM public.hotel_images;
