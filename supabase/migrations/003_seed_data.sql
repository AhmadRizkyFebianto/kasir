-- =====================================================
-- SEED DATA
-- =====================================================

-- Note: Passwords will be hashed by Supabase Auth
-- Default password for demo accounts: "password123"
-- Admin email: admin@kasir.com
-- Kasir email: kasir@kasir.com

-- =====================================================
-- PLACE CATEGORIES
-- =====================================================

INSERT INTO place_categories (id, name, description, icon) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Meja Reguler', 'Meja untuk pelanggan reguler', 'table'),
    ('22222222-2222-2222-2222-222222222222', 'Booth VIP', 'Ruangan pribadi dengan fasilitas lengkap', 'door-closed'),
    ('33333333-3333-3333-3333-333333333333', 'Ruang Meeting', 'Ruangan untuk meeting atau acara', 'presentation'),
    ('44444444-4444-4444-4444-444444444444', 'Lapangan', 'Area untuk olahraga atau aktivitas luar', 'dribbble');

-- =====================================================
-- PLACES
-- =====================================================

INSERT INTO places (id, category_id, name, number, capacity, price_per_hour, description, facilities, status) VALUES
    -- Meja Reguler
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Meja 1', 'M01', 4, 50000.00, 'Meja reguler dekat jendela', ARRAY['Wi-Fi', 'Colokan Listrik'], 'available'),
    ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Meja 2', 'M02', 4, 50000.00, 'Meja reguler di tengah ruangan', ARRAY['Wi-Fi', 'Colokan Listrik'], 'available'),
    ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Meja 3', 'M03', 6, 75000.00, 'Meja besar untuk grup', ARRAY['Wi-Fi', 'Colokan Listrik'], 'available'),
    ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Meja 4', 'M04', 4, 50000.00, 'Meja reguler dekat pintu masuk', ARRAY['Wi-Fi', 'Colokan Listrik'], 'available'),
    ('a1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Meja 5', 'M05', 2, 35000.00, 'Meja kecil untuk 2 orang', ARRAY['Wi-Fi', 'Colokan Listrik'], 'available'),
    
    -- Booth VIP
    ('b2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'VIP Room 1', 'VIP01', 8, 200000.00, 'Ruangan VIP dengan AC dan TV', ARRAY['AC', 'TV', 'Sound System', 'Wi-Fi', 'Sofa'], 'available'),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'VIP Room 2', 'VIP02', 10, 250000.00, 'Ruangan VIP besar dengan karaoke', ARRAY['AC', 'TV', 'Karaoke', 'Sound System', 'Wi-Fi', 'Sofa'], 'available'),
    ('b2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'VIP Room 3', 'VIP03', 6, 175000.00, 'Ruangan VIP medium', ARRAY['AC', 'TV', 'Sound System', 'Wi-Fi', 'Sofa'], 'available'),
    
    -- Ruang Meeting
    ('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Meeting Room A', 'MTG-A', 12, 300000.00, 'Ruang meeting dengan proyektor', ARRAY['AC', 'Proyektor', 'Whiteboard', 'Wi-Fi', 'Kursi Kantor'], 'available'),
    ('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Meeting Room B', 'MTG-B', 8, 200000.00, 'Ruang meeting sedang', ARRAY['AC', 'TV', 'Whiteboard', 'Wi-Fi', 'Kursi Kantor'], 'available'),
    
    -- Lapangan
    ('d4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Lapangan Futsal A', 'LAP-A', 14, 150000.00, 'Lapangan futsal standar', ARRAY['Bola', 'Rompi', 'Air Minum'], 'available'),
    ('d4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Lapangan Futsal B', 'LAP-B', 14, 150000.00, 'Lapangan futsal standar', ARRAY['Bola', 'Rompi', 'Air Minum'], 'available');

-- =====================================================
-- PRODUCT CATEGORIES
-- =====================================================

INSERT INTO product_categories (id, name, description) VALUES
    ('55555555-5555-5555-5555-555555555551', 'Minuman', 'Berbagai jenis minuman'),
    ('55555555-5555-5555-5555-555555555552', 'Makanan', 'Menu makanan'),
    ('55555555-5555-5555-5555-555555555553', 'Snack', 'Camilan ringan'),
    ('55555555-5555-5555-5555-555555555554', 'Paket', 'Paket bundling');

-- =====================================================
-- PRODUCTS
-- =====================================================

INSERT INTO products (id, category_id, name, description, price, stock, is_active) VALUES
    -- Minuman
    ('p1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'Es Teh Manis', 'Teh manis dingin', 8000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111112', '55555555-5555-5555-5555-555555555551', 'Es Jeruk', 'Jeruk peras segar', 10000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111113', '55555555-5555-5555-5555-555555555551', 'Kopi Hitam', 'Kopi hitam panas', 12000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111114', '55555555-5555-5555-5555-555555555551', 'Kopi Susu', 'Kopi dengan susu', 15000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111115', '55555555-5555-5555-5555-555555555551', 'Cappuccino', 'Cappuccino premium', 22000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111116', '55555555-5555-5555-5555-555555555551', 'Es Coklat', 'Coklat dingin', 18000.00, 100, true),
    ('p1111111-1111-1111-1111-111111111117', '55555555-5555-5555-5555-555555555551', 'Jus Alpukat', 'Jus alpukat segar', 20000.00, 50, true),
    ('p1111111-1111-1111-1111-111111111118', '55555555-5555-5555-5555-555555555551', 'Air Mineral', 'Air mineral botol', 5000.00, 200, true),
    
    -- Makanan
    ('p2222222-2222-2222-2222-222222222221', '55555555-5555-5555-5555-555555555552', 'Nasi Goreng', 'Nasi goreng spesial', 25000.00, 50, true),
    ('p2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555552', 'Mie Goreng', 'Mie goreng spesial', 20000.00, 50, true),
    ('p2222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555552', 'Ayam Geprek', 'Ayam geprek pedas', 28000.00, 40, true),
    ('p2222222-2222-2222-2222-222222222224', '55555555-5555-5555-5555-555555555552', 'Ayam Bakar', 'Ayam bakar madu', 30000.00, 40, true),
    ('p2222222-2222-2222-2222-222222222225', '55555555-5555-5555-5555-555555555552', 'Soto Ayam', 'Soto ayam lamongan', 22000.00, 50, true),
    ('p2222222-2222-2222-2222-222222222226', '55555555-5555-5555-5555-555555555552', 'Sate Ayam', 'Sate ayam 10 tusuk', 35000.00, 30, true),
    
    -- Snack
    ('p3333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555553', 'Pisang Goreng', 'Pisang goreng crispy', 15000.00, 30, true),
    ('p3333333-3333-3333-3333-333333333332', '55555555-5555-5555-5555-555555555553', 'French Fries', 'Kentang goreng', 18000.00, 50, true),
    ('p3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555553', 'Onion Rings', 'Bawang bombai goreng', 20000.00, 40, true),
    ('p3333333-3333-3333-3333-333333333334', '55555555-5555-5555-5555-555555555553', 'Nachos', 'Nachos dengan keju', 25000.00, 30, true),
    
    -- Paket
    ('p4444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555554', 'Paket Hemat 1', 'Nasi Goreng + Es Teh', 30000.00, 50, true),
    ('p4444444-4444-4444-4444-444444444442', '55555555-5555-5555-5555-555555555554', 'Paket Hemat 2', 'Mie Goreng + Es Jeruk', 28000.00, 50, true),
    ('p4444444-4444-4444-4444-444444444443', '55555555-5555-5555-5555-555555555554', 'Paket VIP', 'Ayam Bakar + Jus Alpukat', 45000.00, 30, true);

-- =====================================================
-- NOTES
-- =====================================================

-- To create admin and kasir accounts, use Supabase Auth Dashboard or run:
-- After creating auth users, update their profiles:
-- 
-- UPDATE profiles SET role = 'admin', full_name = 'Admin User' WHERE email = 'admin@kasir.com';
-- UPDATE profiles SET role = 'kasir', full_name = 'Kasir User' WHERE email = 'kasir@kasir.com';