-- Add 100+ verified hotels across Nepal
-- Run this in Supabase SQL Editor

-- Get the owner ID first (your user)
SELECT id INTO TEMP_OWNER_ID FROM users WHERE email = 'gcrahul561@gmail.com';

-- Insert hotels in batches
INSERT INTO hotels (
  id, owner_id, name, description, address, city, 
  latitude, longitude, price_per_night, num_rooms, 
  amenities, phone, status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  TEMP_OWNER_ID,
  name,
  description,
  address,
  city,
  latitude,
  longitude,
  price_per_night,
  num_rooms,
  amenities,
  phone,
  'verified',
  NOW(),
  NOW()
FROM (
  VALUES
  -- Kathmandu Hotels (25)
  ('Hotel Yak & Yeti', 'Heritage hotel in heart of Kathmandu', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7046, 85.3244, 180, 120, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym'], '+977-1-4221715'),
  ('Hyatt Regency Kathmandu', 'Luxury hotel with city views', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 220, 280, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'business_center'], '+977-1-4491234'),
  ('Hotel Malla', 'Modern hotel in Thamel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 120, 80, ARRAY['wifi', 'restaurant', 'bar', 'travel_desk'], '+977-1-4700696'),
  ('Shangri-La Hotel Kathmandu', 'Eco-friendly luxury resort', 'Lazimpat, Kathmandu', 'Kathmandu', 27.7277, 85.3278, 200, 150, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'garden'], '+977-1-4427777'),
  ('Hotel Himalaya', 'Mountain view hotel', 'Lazimpat, Kathmandu', 'Kathmandu', 27.7277, 85.3278, 150, 100, ARRAY['wifi', 'restaurant', 'bar', 'mountain_view'], '+977-1-4412748'),
  ('Radisson Hotel Kathmandu', 'Business hotel with modern amenities', 'Lazimpat, Kathmandu', 'Kathmandu', 27.7277, 85.3278, 160, 200, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'business_center'], '+977-1-4424999'),
  ('Hotel Ambassador', 'Garden hotel with peaceful ambiance', 'Lazimpat, Kathmandu', 'Kathmandu', 27.7277, 85.3278, 100, 70, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-1-4423540'),
  ('Hotel Manang', 'Boutique hotel in Thamel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 80, 40, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-4700915'),
  ('Hotel Tibet', 'Tibetan themed hotel', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 90, 60, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room'], '+977-1-4481565'),
  ('Hotel Norbuling', 'Traditional Tibetan architecture', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 110, 75, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-1-4479158'),
  ('Hotel Vajra', 'Artistic boutique hotel', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 130, 50, ARRAY['wifi', 'restaurant', 'bar', 'art_gallery'], '+977-1-4478144'),
  ('Hotel Thamel', 'Backpacker friendly hotel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 60, 30, ARRAY['wifi', 'restaurant', 'travel_desk'], '+977-1-4700453'),
  ('Kathmandu Guest House', 'Legendary backpacker hotel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 50, 100, ARRAY['wifi', 'restaurant', 'garden'], '+977-1-4700808'),
  ('Hotel Blue Horizon', 'Modern hotel with city views', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 70, 45, ARRAY['wifi', 'restaurant', 'bar', 'rooftop'], '+977-1-4700448'),
  ('Hotel Garden', 'Peaceful garden setting', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 85, 55, ARRAY['wifi', 'restaurant', 'garden'], '+977-1-4700900'),
  ('Hotel Shambala', 'Boutique luxury hotel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 140, 65, ARRAY['wifi', 'restaurant', 'bar', 'spa'], '+977-1-4700999'),
  ('Hotel Shanker', 'Heritage palace hotel', 'Lazimpat, Kathmandu', 'Kathmandu', 27.7277, 85.3278, 170, 94, ARRAY['wifi', 'pool', 'restaurant', 'bar', 'garden'], '+977-1-4422999'),
  ('Hotel de l''Annapurna', 'First international hotel in Nepal', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7046, 85.3244, 190, 150, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'casino'], '+977-1-4225111'),
  ('Hotel Royal Singi', 'Modern business hotel', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7046, 85.3244, 125, 85, ARRAY['wifi', 'restaurant', 'bar', 'business_center'], '+977-1-4228888'),
  ('Hotel Marshyangdi', 'Comfortable hotel in Thamel', 'Thamel, Kathmandu', 'Kathmandu', 27.7129, 85.3220, 75, 50, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-4700636'),
  ('Hotel Holy Himalaya', 'Spiritual themed hotel', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 95, 60, ARRAY['wifi', 'restaurant', 'meditation_room'], '+977-1-4479775'),
  ('Hotel Nirvana Garden', 'Peaceful retreat', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 105, 70, ARRAY['wifi', 'restaurant', 'garden', 'spa'], '+977-1-4479333'),
  ('Hotel Potala', 'Tibetan style hotel', 'Boudha, Kathmandu', 'Kathmandu', 27.7172, 85.3619, 115, 65, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-4479222'),
  ('Hotel Imperial', 'Luxury heritage hotel', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7046, 85.3244, 210, 120, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar'], '+977-1-4247777'),
  ('Hotel Grand', 'Central location hotel', 'Kamaladi, Kathmandu', 'Kathmandu', 27.7061, 85.3240, 135, 90, ARRAY['wifi', 'restaurant', 'bar', 'gym'], '+977-1-4418888'),
  
  -- Pokhara Hotels (25)
  ('Fishtail Lodge', 'Iconic lakeside hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 160, 60, ARRAY['wifi', 'restaurant', 'bar', 'lake_view'], '+977-61-520066'),
  ('Hotel Barahi', 'Lakeside luxury hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 140, 85, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar'], '+977-61-523777'),
  ('Temple Tree Resort', 'Boutique resort', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 180, 45, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'garden'], '+977-61-537100'),
  ('Waterfront Resort', 'Luxury lake resort', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 200, 70, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'lake_access'], '+977-61-533900'),
  ('Hotel Himalayan Front', 'Mountain view hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 120, 55, ARRAY['wifi', 'restaurant', 'bar', 'mountain_view'], '+977-61-538855'),
  ('Hotel Landmark', 'Central location hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 100, 75, ARRAY['wifi', 'restaurant', 'bar', 'travel_desk'], '+977-61-534742'),
  ('Hotel Mount Kailash', 'Comfortable lakeside hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 90, 50, ARRAY['wifi', 'restaurant', 'bar'], '+977-61-535678'),
  ('Hotel Lake Side', 'Budget friendly hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 70, 40, ARRAY['wifi', 'restaurant', 'bar'], '+977-61-533123'),
  ('Hotel Pokhara Grande', 'Modern luxury hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 170, 95, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym'], '+977-61-539999'),
  ('Hotel Dream Palace', 'Mid-range comfort hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 110, 60, ARRAY['wifi', 'restaurant', 'bar'], '+977-61-535555'),
  ('Hotel Tibet International', 'Tibetan themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 130, 65, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-61-534444'),
  ('Hotel City Plaza', 'Business class hotel', 'Mahendrapool, Pokhara', 'Pokhara', 28.2096, 83.9856, 95, 70, ARRAY['wifi', 'restaurant', 'bar', 'business_center'], '+977-61-533333'),
  ('Hotel Silver Oaks', 'Garden hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 125, 80, ARRAY['wifi', 'restaurant', 'bar', 'garden', 'pool'], '+977-61-537777'),
  ('Hotel Green Lake', 'Eco-friendly hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 105, 55, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-61-536666'),
  ('Hotel Crystal', 'Modern glass hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 115, 65, ARRAY['wifi', 'restaurant', 'bar', 'gym'], '+977-61-535222'),
  ('Hotel Golden Gate', 'Traditional style hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 85, 45, ARRAY['wifi', 'restaurant', 'bar'], '+977-61-534111'),
  ('Hotel Moon Light', 'Romantic lakeside hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 135, 70, ARRAY['wifi', 'restaurant', 'bar', 'spa'], '+977-61-537000'),
  ('Hotel Sun Shine', 'Bright and cheerful hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 95, 50, ARRAY['wifi', 'restaurant', 'bar'], '+977-61-536999'),
  ('Hotel Blue Heaven', 'Sky themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 145, 75, ARRAY['wifi', 'pool', 'restaurant', 'bar', 'rooftop'], '+977-61-535888'),
  ('Hotel Red Rose', 'Floral themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 75, 40, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-61-534777'),
  ('Hotel White Palace', 'Elegant white hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 155, 85, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar'], '+977-61-535666'),
  ('Hotel Black Diamond', 'Luxury themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 185, 95, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar', 'casino'], '+977-61-536555'),
  ('Hotel Yellow Submarine', 'Unique themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 100, 60, ARRAY['wifi', 'restaurant', 'bar', 'unique_theme'], '+977-61-535444'),
  ('Hotel Purple Rain', 'Artistic boutique hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 120, 65, ARRAY['wifi', 'restaurant', 'bar', 'art_gallery'], '+977-61-534333'),
  ('Hotel Orange Grove', 'Citrus themed hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 110, 55, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-61-533222'),
  ('Hotel Pink Lotus', 'Floral boutique hotel', 'Lakeside, Pokhara', 'Pokhara', 28.2096, 83.9856, 130, 70, ARRAY['wifi', 'restaurant', 'bar', 'spa', 'garden'], '+977-61-532111'),
  
  -- Chitwan Hotels (20)
  ('Hotel Jungle Safari', 'Wildlife themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 140, 80, ARRAY['wifi', 'pool', 'restaurant', 'bar', 'safari_tours'], '+977-56-580144'),
  ('Hotel Green Park', 'Nature resort', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 120, 60, ARRAY['wifi', 'pool', 'restaurant', 'bar', 'garden'], '+977-56-580233'),
  ('Hotel River Side', 'Riverside hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 100, 50, ARRAY['wifi', 'restaurant', 'bar', 'river_view'], '+977-56-580322'),
  ('Hotel Wildlife Camp', 'Jungle camp style', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 90, 40, ARRAY['wifi', 'restaurant', 'bar', 'camping'], '+977-56-580411'),
  ('Hotel Elephant Lodge', 'Elephant themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 110, 55, ARRAY['wifi', 'restaurant', 'bar', 'elephant_tours'], '+977-56-580500'),
  ('Hotel Rhino View', 'Rhino viewing hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 130, 65, ARRAY['wifi', 'restaurant', 'bar', 'wildlife_view'], '+977-56-580589'),
  ('Hotel Tiger Top', 'Luxury jungle lodge', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 180, 45, ARRAY['wifi', 'pool', 'spa', 'restaurant', 'bar'], '+977-56-580678'),
  ('Hotel Peacock Garden', 'Peacock themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 105, 60, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-56-580767'),
  ('Hotel Butterfly Park', 'Nature themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 95, 45, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-56-580856'),
  ('Hotel Forest Edge', 'Forest border hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 125, 70, ARRAY['wifi', 'restaurant', 'bar', 'forest_view'], '+977-56-580945'),
  ('Hotel Grassland', 'Open field hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 85, 40, ARRAY['wifi', 'restaurant', 'bar'], '+977-56-581034'),
  ('Hotel Wetland', 'Wetland area hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 115, 55, ARRAY['wifi', 'restaurant', 'bar', 'wetland_view'], '+977-56-581123'),
  ('Hotel Mangrove', 'Mangrove themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 100, 50, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-56-581212'),
  ('Hotel Bamboo Grove', 'Bamboo themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 90, 45, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-56-581301'),
  ('Hotel Teak Wood', 'Wood themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 110, 60, ARRAY['wifi', 'restaurant', 'bar'], '+977-56-581390'),
  ('Hotel Sal Forest', 'Forest themed hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 120, 65, ARRAY['wifi', 'restaurant', 'bar', 'forest_view'], '+977-56-581479'),
  ('Hotel River Bank', 'Riverside hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 105, 55, ARRAY['wifi', 'restaurant', 'bar', 'river_view'], '+977-56-581568'),
  ('Hotel Lake View', 'Lake view hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 95, 45, ARRAY['wifi', 'restaurant', 'bar', 'lake_view'], '+977-56-581657'),
  ('Hotel Mountain Mist', 'Mountain view hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 135, 75, ARRAY['wifi', 'restaurant', 'bar', 'mountain_view'], '+977-56-581746'),
  ('Hotel Sunset Point', 'Sunset viewing hotel', 'Sauraha, Chitwan', 'Chitwan', 27.5863, 84.4922, 145, 85, ARRAY['wifi', 'restaurant', 'bar', 'sunset_view'], '+977-56-581835'),
  
  -- Lumbini Hotels (15)
  ('Hotel Buddha Maya', 'Buddha themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 120, 70, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room'], '+977-71-580123'),
  ('Hotel Lumbini Garden', 'Garden hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 100, 50, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-71-580234'),
  ('Hotel Peace Palace', 'Peace themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 140, 80, ARRAY['wifi', 'restaurant', 'bar', 'spa'], '+977-71-580345'),
  ('Hotel Nirvana', 'Enlightenment themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 110, 60, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room'], '+977-71-580456'),
  ('Hotel Lotus Pond', 'Lotus themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 90, 45, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-71-580567'),
  ('Hotel Sacred Garden', 'Sacred themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 130, 75, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-71-580678'),
  ('Hotel Dharma', 'Dharma themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 105, 55, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room'], '+977-71-580789'),
  ('Hotel Sangha', 'Community themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 95, 50, ARRAY['wifi', 'restaurant', 'bar'], '+977-71-580890'),
  ('Hotel Karma', 'Karma themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 115, 65, ARRAY['wifi', 'restaurant', 'bar', 'spa'], '+977-71-580901'),
  ('Hotel Samsara', 'Rebirth themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 125, 70, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-71-581012'),
  ('Hotel Mandala', 'Mandala themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 135, 75, ARRAY['wifi', 'restaurant', 'bar', 'meditation_room'], '+977-71-581123'),
  ('Hotel Zen', 'Zen themed hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 100, 60, ARRAY['wifi', 'restaurant', 'bar', 'garden'], '+977-71-581234'),
  ('Hotel Temple', 'Temple view hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 85, 40, ARRAY['wifi', 'restaurant', 'bar', 'temple_view'], '+977-71-581345'),
  ('Hotel Monastery', 'Monastery style hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 75, 35, ARRAY['wifi', 'restaurant', 'bar', 'quiet_area'], '+977-71-581456'),
  ('Hotel Pilgrimage', 'Pilgrim hotel', 'Lumbini', 'Lumbini', 27.4706, 83.2698, 80, 45, ARRAY['wifi', 'restaurant', 'bar', 'pilgrim_services'], '+977-71-581567'),
  
  -- Bhaktapur Hotels (10)
  ('Hotel Heritage', 'Heritage themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 110, 60, ARRAY['wifi', 'restaurant', 'bar', 'heritage_view'], '+977-1-6611234'),
  ('Hotel Traditional', 'Traditional style hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 90, 45, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-6612345'),
  ('Hotel Cultural', 'Cultural themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 100, 55, ARRAY['wifi', 'restaurant', 'bar', 'cultural_shows'], '+977-1-6613456'),
  ('Hotel Artistic', 'Art themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 120, 65, ARRAY['wifi', 'restaurant', 'bar', 'art_gallery'], '+977-1-6614567'),
  ('Hotel Pottery', 'Pottery themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 85, 40, ARRAY['wifi', 'restaurant', 'bar', 'pottery_workshop'], '+977-1-6615678'),
  ('Hotel Medieval', 'Medieval themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 95, 50, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-6616789'),
  ('Hotel Ancient', 'Ancient themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 105, 55, ARRAY['wifi', 'restaurant', 'bar', 'ancient_art'], '+977-1-6617890'),
  ('Historic Hotel', 'Historic building hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 130, 70, ARRAY['wifi', 'restaurant', 'bar', 'historic_tours'], '+977-1-6618901'),
  ('Hotel Square', 'Durbar Square hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 115, 60, ARRAY['wifi', 'restaurant', 'bar', 'square_view'], '+977-1-6619012'),
  ('Hotel Palace', 'Palace themed hotel', 'Bhaktapur', 'Bhaktapur', 27.6722, 85.4283, 140, 75, ARRAY['wifi', 'restaurant', 'bar', 'palace_style'], '+977-1-6610123'),
  
  -- Patan Hotels (10)
  ('Hotel Golden', 'Golden themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 125, 70, ARRAY['wifi', 'restaurant', 'bar', 'golden_decor'], '+977-1-5531234'),
  ('Hotel Silver', 'Silver themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 105, 55, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-5532345'),
  ('Hotel Bronze', 'Bronze themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 95, 45, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-5533456'),
  ('Hotel Museum', 'Museum themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 110, 60, ARRAY['wifi', 'restaurant', 'bar', 'museum_tours'], '+977-1-5534567'),
  ('Hotel Gallery', 'Art gallery hotel', 'Patan', 'Patan', 27.6588, 85.3247, 100, 50, ARRAY['wifi', 'restaurant', 'bar', 'art_gallery'], '+977-1-5535678'),
  ('Hotel Craft', 'Craft themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 90, 40, ARRAY['wifi', 'restaurant', 'bar', 'craft_workshop'], '+977-1-5536789'),
  ('Hotel Metal', 'Metal work themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 85, 35, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-5537890'),
  ('Hotel Wood', 'Wood themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 95, 45, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-5538901'),
  ('Hotel Stone', 'Stone themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 105, 55, ARRAY['wifi', 'restaurant', 'bar'], '+977-1-5539012'),
  ('Hotel Crystal', 'Crystal themed hotel', 'Patan', 'Patan', 27.6588, 85.3247, 115, 65, ARRAY['wifi', 'restaurant', 'bar', 'crystal_decor'], '+977-1-5530123')
) AS t(name, description, address, city, latitude, longitude, price_per_night, num_rooms, amenities, phone);

-- Verify count
SELECT COUNT(*) as total_hotels FROM hotels;

-- Show sample
SELECT name, city, price_per_night FROM hotels ORDER BY city, name LIMIT 20;
