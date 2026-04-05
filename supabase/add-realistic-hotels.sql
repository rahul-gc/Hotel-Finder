-- Add 12 realistic hotels with real photos
-- Run this in Supabase SQL Editor

-- First add the hotels
INSERT INTO hotels (
  id, owner_id, name, description, address, city, 
  latitude, longitude, price_per_night, num_rooms, 
  amenities, phone, status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  t.name,
  t.description,
  t.address,
  t.city,
  t.latitude,
  t.longitude,
  t.price_per_night,
  t.num_rooms,
  t.amenities,
  t.phone,
  'verified',
  NOW(),
  NOW()
FROM users u, (
  VALUES
  ('Hotel Yak & Yeti', 'Heritage hotel in the heart of Kathmandu with traditional architecture and modern amenities', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7046, 85.3244, 180, 120, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'business_center'], '+977-1-4221715'),
  ('Hyatt Regency Kathmandu', 'Luxury 5-star hotel with stunning mountain views and world-class facilities', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 220, 280, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'business_center', 'casino'], '+977-1-4491234'),
  ('Fishtail Lodge', 'Iconic lakeside resort with breathtaking views of the Annapurna mountain range', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 160, 60, ARRAY['wifi', 'restaurant', 'bar', 'lake_view', 'spa', 'garden'], '+977-61-520066'),
  ('Temple Tree Resort', 'Boutique luxury resort offering traditional Nepali hospitality with modern comforts', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 180, 45, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'garden', 'yoga'], '+977-61-537100'),
  ('Hotel Jungle Safari', 'Premium wildlife resort located at the edge of Chitwan National Park', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 140, 80, ARRAY['wifi', 'pool', 'restaurant', 'bar', 'safari_tours', 'wildlife_viewing'], '+977-56-580144'),
  ('Tiger Top Lodge', 'Legendary jungle lodge offering authentic wildlife experiences in luxury tents', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 200, 45, ARRAY['wifi', 'restaurant', 'bar', 'wildlife_tours', 'swimming_pool'], '+977-56-580678'),
  ('Hotel Buddha Maya', 'Peaceful retreat in the birthplace of Lord Buddha with meditation facilities', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 120, 70, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room', 'garden', 'temple_visits'], '+977-71-580123'),
  ('Lumbini Garden Hotel', 'Tranquil hotel surrounded by beautiful gardens and monasteries', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 100, 50, ARRAY['wifi', 'restaurant', 'bar', 'garden', 'bicycle_rental'], '+977-71-580234'),
  ('Hotel Heritage Bhaktapur', 'Traditional Newari architecture hotel in the ancient city of Bhaktapur', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 110, 60, ARRAY['wifi', 'restaurant', 'bar', 'heritage_tours', 'pottery_workshop'], '+977-1-6611234'),
  ('Patan Museum Hotel', 'Artistic hotel featuring traditional Nepali art and craft exhibitions', 'Patan', 'Patan', 27.6588, 85.3247, 125, 70, ARRAY['wifi', 'restaurant', 'bar', 'art_gallery', 'craft_workshop'], '+977-1-5531234'),
  ('Shangri-La Village Resort', 'Eco-friendly mountain resort with organic gardens and yoga center', 'Dhulikhel', 'Other', 27.6167, 85.5428, 190, 85, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'yoga', 'organic_farm'], '+977-11-490000'),
  ('Mountain Horizon Hotel', 'Panoramic mountain views hotel perfect for Himalayan sunrise viewing', 'Nagarkot', 'Other', 27.7167, 85.5667, 150, 65, ARRAY['wifi', 'restaurant', 'bar', 'mountain_view', 'hiking_trails', 'bonfire_area'], '+977-11-491111')
) AS t(name, description, address, city, latitude, longitude, price_per_night, num_rooms, amenities, phone)
WHERE u.email = 'gcrahul561@gmail.com';

-- Get the hotel IDs that were just inserted
CREATE TEMPORARY TABLE temp_hotel_ids AS
SELECT id, name FROM hotels ORDER BY created_at DESC LIMIT 12;

-- Add realistic photos for each hotel
INSERT INTO hotel_images (id, hotel_id, url, alt_text, is_primary, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  h.id,
  t.url,
  t.alt_text,
  t.is_primary,
  NOW(),
  NOW()
FROM temp_hotel_ids h, (
  VALUES
  -- Hotel Yak & Yeti
  ('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Yak & Yeti exterior with traditional Nepali architecture', true),
  ('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Yak & Yeti luxury swimming pool', false),
  ('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Yak & Yeti elegant restaurant', false),
  
  -- Hyatt Regency Kathmandu
  ('https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hyatt Regency Kathmandu modern exterior', true),
  ('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hyatt Regency luxury bedroom with mountain view', false),
  ('https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hyatt Regency rooftop infinity pool', false),
  
  -- Fishtail Lodge
  ('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Fishtail Lodge with stunning lake and mountain views', true),
  ('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Fishtail Lodge beautiful garden area', false),
  ('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Fishtail Lodge lakeside dining area', false),
  
  -- Temple Tree Resort
  ('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Temple Tree Resort traditional Nepali architecture', true),
  ('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Temple Tree Resort swimming pool with mountain backdrop', false),
  ('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Temple Tree Resort elegant lobby', false),
  
  -- Hotel Jungle Safari
  ('https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Jungle Safari luxury tent accommodation', true),
  ('https://images.unsplash.com/photo-1584937135506-91e3e1e5c524?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Jungle Safari swimming pool in jungle setting', false),
  ('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Jungle Safari wildlife viewing area', false),
  
  -- Tiger Top Lodge
  ('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Tiger Top Lodge luxury tent rooms', true),
  ('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Tiger Top Lodge sunset view over the jungle', false),
  ('https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Tiger Top Lodge outdoor dining area', false),
  
  -- Hotel Buddha Maya
  ('https://images.unsplash.com/photo-1549819090-1a59c8a8b5c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Buddha Maya peaceful garden setting', true),
  ('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Buddha Maya meditation room', false),
  ('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Buddha Maya traditional architecture', false),
  
  -- Lumbini Garden Hotel
  ('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Lumbini Garden Hotel beautiful garden view', true),
  ('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Lumbini Garden Hotel peaceful courtyard', false),
  ('https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Lumbini Garden Hotel comfortable room', false),
  
  -- Hotel Heritage Bhaktapur
  ('https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Heritage Bhaktapur traditional Newari architecture', true),
  ('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Heritage Bhaktapur courtyard with traditional design', false),
  ('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Hotel Heritage Bhaktapur elegant restaurant', false),
  
  -- Patan Museum Hotel
  ('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Patan Museum Hotel artistic exterior', true),
  ('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Patan Museum Hotel art gallery', false),
  ('https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Patan Museum Hotel rooftop terrace', false),
  
  -- Shangri-La Village Resort
  ('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Shangri-La Village Resort mountain view', true),
  ('https://images.unsplash.com/photo-1549819090-1a59c8a8b5c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Shangri-La Village Resort organic garden', false),
  ('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Shangri-La Village Resort yoga pavilion', false),
  
  -- Mountain Horizon Hotel
  ('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Mountain Horizon Hotel panoramic Himalayan view', true),
  ('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Mountain Horizon Hotel sunrise viewing terrace', false),
  ('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 'Mountain Horizon Hotel cozy fireplace lounge', false)
) AS t(url, alt_text, is_primary)
WHERE h.name = CASE 
  WHEN t.url LIKE '%yak%' THEN 'Hotel Yak & Yeti'
  WHEN t.url LIKE '%hyatt%' THEN 'Hyatt Regency Kathmandu'
  WHEN t.url LIKE '%fishtail%' THEN 'Fishtail Lodge'
  WHEN t.url LIKE '%temple%' THEN 'Temple Tree Resort'
  WHEN t.url LIKE '%jungle%' THEN 'Hotel Jungle Safari'
  WHEN t.url LIKE '%tiger%' THEN 'Tiger Top Lodge'
  WHEN t.url LIKE '%buddha%' THEN 'Hotel Buddha Maya'
  WHEN t.url LIKE '%lumbini garden%' THEN 'Lumbini Garden Hotel'
  WHEN t.url LIKE '%heritage%' THEN 'Hotel Heritage Bhaktapur'
  WHEN t.url LIKE '%patan museum%' THEN 'Patan Museum Hotel'
  WHEN t.url LIKE '%shangri-la%' THEN 'Shangri-La Village Resort'
  WHEN t.url LIKE '%mountain horizon%' THEN 'Mountain Horizon Hotel'
END;

-- Add some reviews to make it realistic
INSERT INTO hotel_reviews (id, hotel_id, user_id, rating, comment, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  h.id,
  u.id,
  t.rating,
  t.comment,
  NOW() - (random() * 30 || ' days')::interval,
  NOW()
FROM hotels h, users u, (
  VALUES
  (5, 'Amazing experience! The staff was incredibly helpful and the views were breathtaking.'),
  (4, 'Great location and comfortable rooms. Would definitely stay here again.'),
  (5, 'Perfect blend of traditional Nepali hospitality and modern amenities.'),
  (4, 'Beautiful property with excellent service. Food was delicious.'),
  (5, 'Exceeded all expectations! The mountain views from our room were stunning.'),
  (3, 'Good hotel but a bit overpriced. Location is excellent though.'),
  (5, 'Absolutely loved it! The spa treatments were amazing.'),
  (4, 'Very clean and well-maintained. Staff was very friendly.'),
  (5, 'Best hotel experience in Nepal! Highly recommend to everyone.'),
  (4, 'Great value for money. Beautiful architecture and peaceful atmosphere.'),
  (5, 'Paradise found! The gardens are beautiful and rooms are spacious.'),
  (4, 'Excellent service and beautiful surroundings. Would come back.')
) AS t(rating, comment)
WHERE u.email = 'gcrahul561@gmail.com'
AND h.id IN (SELECT id FROM temp_hotel_ids)
ORDER BY h.id, random()
LIMIT 24;

-- Clean up
DROP TABLE temp_hotel_ids;

-- Verify results
SELECT COUNT(*) as total_hotels FROM hotels;
SELECT COUNT(*) as total_images FROM hotel_images;
SELECT COUNT(*) as total_reviews FROM hotel_reviews;

-- Show sample
SELECT h.name, h.city, h.price_per_night, COUNT(i.id) as image_count
FROM hotels h
LEFT JOIN hotel_images i ON h.id = i.hotel_id
GROUP BY h.id, h.name, h.city, h.price_per_night
ORDER BY h.name;
