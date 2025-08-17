-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  english_name VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  image VARCHAR(500),
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 10),
  reviews INTEGER DEFAULT 0,
  price VARCHAR(50),
  original_price VARCHAR(50),
  description TEXT,
  amenities TEXT[],
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  logo VARCHAR(500),
  description TEXT,
  website VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  description TEXT,
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  room_type VARCHAR(100),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hotel_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotels_brand ON hotels(name);
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_id ON reviews(hotel_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for brands
INSERT INTO brands (name, logo, description, website) VALUES
('Aman', '/brands/aman.png', 'Luxury resort brand known for exceptional service and stunning locations', 'https://www.aman.com'),
('Four Seasons', '/brands/four-seasons.png', 'World-renowned luxury hotel brand offering personalized service', 'https://www.fourseasons.com'),
('Ritz-Carlton', '/brands/ritz-carlton.png', 'Premium luxury hotel brand with iconic service standards', 'https://www.ritzcarlton.com'),
('Mandarin Oriental', '/brands/mandarin-oriental.png', 'Luxury hotel brand combining oriental heritage with modern luxury', 'https://www.mandarinoriental.com'),
('Park Hyatt', '/brands/park-hyatt.png', 'Ultra-luxury hotel brand offering sophisticated accommodations', 'https://www.hyatt.com/park-hyatt'),
('St. Regis', '/brands/st-regis.png', 'Luxury hotel brand known for bespoke service and elegant accommodations', 'https://www.marriott.com/st-regis'),
('Peninsula', '/brands/peninsula.png', 'Iconic luxury hotel brand with legendary service', 'https://www.peninsula.com'),
('Accor', '/brands/accor.png', 'Leading hotel group with diverse portfolio of brands', 'https://www.accor.com'),
('Hilton', '/brands/hilton.png', 'Global hospitality company with trusted brand portfolio', 'https://www.hilton.com'),
('Melia', '/brands/melia.png', 'Spanish hotel chain known for quality and innovation', 'https://www.melia.com'),
('Shangri-La', '/brands/shangri-la.png', 'Luxury hotel brand inspired by Asian hospitality', 'https://www.shangri-la.com'),
('Virtuoso', '/brands/virtuoso.png', 'Luxury travel network connecting travelers with exceptional experiences', 'https://www.virtuoso.com'),
('Heavens Portfolio', '/brands/heavens-portfolio.png', 'Curated collection of the world''s most exclusive properties', 'https://www.heavensportfolio.com'),
('LHW', '/brands/lhw.png', 'Leading Hotels of the World - collection of independent luxury hotels', 'https://www.lhw.com')
ON CONFLICT (name) DO NOTHING;

-- Insert sample data for destinations
INSERT INTO destinations (name, country, image, description) VALUES
('Bali', 'Indonesia', '/destinations/bali.png', 'Tropical paradise with rich culture and stunning beaches'),
('Tokyo', 'Japan', '/destinations/tokyo.png', 'Modern metropolis blending tradition with cutting-edge technology'),
('Paris', 'France', '/destinations/paris.png', 'City of Light offering art, culture, and romance'),
('New York', 'USA', '/destinations/newyork.png', 'The Big Apple - city that never sleeps'),
('Singapore', 'Singapore', '/destinations/singapore.png', 'Modern city-state with diverse culture and cuisine'),
('London', 'UK', '/destinations/london.png', 'Historic capital with royal heritage and modern culture'),
('Dubai', 'UAE', '/destinations/dubai.png', 'Luxury desert city with iconic architecture'),
('Sydney', 'Australia', '/destinations/sydney.png', 'Harbor city with stunning beaches and laid-back lifestyle')
ON CONFLICT DO NOTHING;

-- Insert sample data for hotels
INSERT INTO hotels (name, english_name, location, address, image, rating, reviews, price, original_price, description, amenities, coordinates) VALUES
('Aman Bali Resort', 'Aman Bali Resort', 'Bali, Indonesia', 'Jl. Raya Tjampuhan, Sayan, Ubud, Bali 80571, Indonesia', '/hotels/aman-bali-resort.png', 9.8, 1250, '₩2,500,000', '₩3,000,000', 'Luxurious resort nestled in the heart of Bali with stunning rice terrace views', ARRAY['Private Pool', 'Spa', 'Fine Dining', 'Yoga Classes', 'Cultural Tours'], '{"lat": -8.5069, "lng": 115.2625}'),
('Four Seasons George V Paris', 'Four Seasons George V Paris', 'Paris, France', '31 Avenue George V, 75008 Paris, France', '/hotels/four-seasons-george-v-paris.png', 9.6, 980, '€1,200', '€1,500', 'Iconic luxury hotel in the heart of Paris with Michelin-starred dining', ARRAY['Michelin Restaurant', 'Spa', 'Concierge', 'Luxury Suites', 'Art Collection'], '{"lat": 48.8698, "lng": 2.3077}'),
('Park Hyatt Tokyo', 'Park Hyatt Tokyo', 'Tokyo, Japan', '3-7-1-2 Nishi-Shinjuku, Shinjuku City, Tokyo 163-1055, Japan', '/hotels/park-hyatt-tokyo-city-view.png', 9.4, 1100, '¥85,000', '¥95,000', 'Ultra-luxury hotel with stunning city views and world-class service', ARRAY['City Views', 'Fine Dining', 'Spa', 'Fitness Center', 'Concierge'], '{"lat": 35.6762, "lng": 139.6503}'),
('Ritz-Carlton New York', 'Ritz-Carlton New York', 'New York, USA', '50 Central Park S, New York, NY 10019, USA', '/hotels/luxury-hotel-st-regis-new-york.png', 9.5, 1350, '$800', '$950', 'Luxury hotel overlooking Central Park with impeccable service', ARRAY['Central Park Views', 'Fine Dining', 'Spa', 'Concierge', 'Luxury Suites'], '{"lat": 40.7645, "lng": -73.9740}'),
('Mandarin Oriental Bangkok', 'Mandarin Oriental Bangkok', 'Bangkok, Thailand', '48 Oriental Ave, Bang Rak, Bangkok 10500, Thailand', '/hotels/mandarin-oriental-bangkok-riverside-view.png', 9.3, 890, '฿25,000', '฿30,000', 'Historic luxury hotel on the banks of the Chao Phraya River', ARRAY['Riverside Views', 'Traditional Spa', 'Fine Dining', 'Cultural Experiences', 'Luxury Suites'], '{"lat": 13.7246, "lng": 100.5133}')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Hotels: Anyone can read, only authenticated users can create/update
CREATE POLICY "Hotels are viewable by everyone" ON hotels FOR SELECT USING (true);
CREATE POLICY "Hotels are insertable by authenticated users" ON hotels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hotels are updatable by authenticated users" ON hotels FOR UPDATE USING (auth.role() = 'authenticated');

-- Brands: Anyone can read, only authenticated users can create/update
CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Brands are insertable by authenticated users" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Brands are updatable by authenticated users" ON brands FOR UPDATE USING (auth.role() = 'authenticated');

-- Destinations: Anyone can read, only authenticated users can create/update
CREATE POLICY "Destinations are viewable by everyone" ON destinations FOR SELECT USING (true);
CREATE POLICY "Destinations are insertable by authenticated users" ON destinations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Destinations are updatable by authenticated users" ON destinations FOR UPDATE USING (auth.role() = 'authenticated');

-- User profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings: Users can only access their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Users can only access their own reviews
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
