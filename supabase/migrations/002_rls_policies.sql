-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is kasir
CREATE OR REPLACE FUNCTION is_kasir()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'kasir')
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
    ON profiles FOR UPDATE
    USING (is_admin());

-- Admin can insert profiles
CREATE POLICY "Admin can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin());

-- Auto-create profile on signup
CREATE POLICY "Users can insert own profile on signup"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PLACE CATEGORIES POLICIES
-- =====================================================

-- Everyone can view place categories
CREATE POLICY "Anyone can view place categories"
    ON place_categories FOR SELECT
    USING (true);

-- Only admin can manage place categories
CREATE POLICY "Admin can manage place categories"
    ON place_categories FOR ALL
    USING (is_admin());

-- =====================================================
-- PLACES POLICIES
-- =====================================================

-- Everyone can view available places
CREATE POLICY "Anyone can view places"
    ON places FOR SELECT
    USING (true);

-- Admin can manage places
CREATE POLICY "Admin can manage places"
    ON places FOR ALL
    USING (is_admin());

-- Kasir can update place status
CREATE POLICY "Kasir can update place status"
    ON places FOR UPDATE
    USING (is_kasir())
    WITH CHECK (is_kasir());

-- =====================================================
-- RESERVATIONS POLICIES
-- =====================================================

-- Customers can view their own reservations
CREATE POLICY "Customers can view own reservations"
    ON reservations FOR SELECT
    USING (customer_id = auth.uid());

-- Admin and kasir can view all reservations
CREATE POLICY "Admin and kasir can view all reservations"
    ON reservations FOR SELECT
    USING (is_kasir());

-- Customers can create reservations for themselves
CREATE POLICY "Customers can create own reservations"
    ON reservations FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Customers can update their pending reservations
CREATE POLICY "Customers can update own pending reservations"
    ON reservations FOR UPDATE
    USING (
        customer_id = auth.uid() AND
        status = 'pending'
    )
    WITH CHECK (
        customer_id = auth.uid() AND
        status IN ('pending', 'cancelled')
    );

-- Admin and kasir can manage all reservations
CREATE POLICY "Admin and kasir can manage reservations"
    ON reservations FOR ALL
    USING (is_kasir());

-- =====================================================
-- PRODUCT CATEGORIES POLICIES
-- =====================================================

-- Everyone can view product categories
CREATE POLICY "Anyone can view product categories"
    ON product_categories FOR SELECT
    USING (true);

-- Only admin can manage product categories
CREATE POLICY "Admin can manage product categories"
    ON product_categories FOR ALL
    USING (is_admin());

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Everyone can view active products
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = true OR is_kasir());

-- Admin can manage products
CREATE POLICY "Admin can manage products"
    ON products FOR ALL
    USING (is_admin());

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
    ON orders FOR SELECT
    USING (customer_id = auth.uid());

-- Admin and kasir can view all orders
CREATE POLICY "Admin and kasir can view all orders"
    ON orders FOR SELECT
    USING (is_kasir());

-- Customers can create orders for themselves
CREATE POLICY "Customers can create own orders"
    ON orders FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Kasir can create orders for any customer
CREATE POLICY "Kasir can create orders"
    ON orders FOR INSERT
    WITH CHECK (is_kasir());

-- Admin and kasir can update orders
CREATE POLICY "Admin and kasir can update orders"
    ON orders FOR UPDATE
    USING (is_kasir());

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

-- Customers can view their own order items
CREATE POLICY "Customers can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.customer_id = auth.uid()
        )
    );

-- Admin and kasir can view all order items
CREATE POLICY "Admin and kasir can view all order items"
    ON order_items FOR SELECT
    USING (is_kasir());

-- Customers can create order items for their orders
CREATE POLICY "Customers can create own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.customer_id = auth.uid()
        )
    );

-- Kasir can manage order items
CREATE POLICY "Kasir can manage order items"
    ON order_items FOR ALL
    USING (is_kasir());

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reservations
            WHERE reservations.id = payments.reservation_id
            AND reservations.customer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = payments.order_id
            AND orders.customer_id = auth.uid()
        )
    );

-- Admin and kasir can view all payments
CREATE POLICY "Admin and kasir can view all payments"
    ON payments FOR SELECT
    USING (is_kasir());

-- System can create payments (via service role)
CREATE POLICY "Kasir can create payments"
    ON payments FOR INSERT
    WITH CHECK (is_kasir());

-- Admin and kasir can update payments
CREATE POLICY "Admin and kasir can update payments"
    ON payments FOR UPDATE
    USING (is_kasir());

-- =====================================================
-- CASHIER SESSIONS POLICIES
-- =====================================================

-- Kasir can view their own sessions
CREATE POLICY "Kasir can view own sessions"
    ON cashier_sessions FOR SELECT
    USING (kasir_id = auth.uid() OR is_admin());

-- Admin can view all sessions
CREATE POLICY "Admin can view all sessions"
    ON cashier_sessions FOR SELECT
    USING (is_admin());

-- Kasir can create their own sessions
CREATE POLICY "Kasir can create own sessions"
    ON cashier_sessions FOR INSERT
    WITH CHECK (kasir_id = auth.uid() AND is_kasir());

-- Kasir can update their own active sessions
CREATE POLICY "Kasir can update own sessions"
    ON cashier_sessions FOR UPDATE
    USING (kasir_id = auth.uid() AND is_kasir())
    WITH CHECK (kasir_id = auth.uid() AND is_kasir());

-- Admin can manage all sessions
CREATE POLICY "Admin can manage all sessions"
    ON cashier_sessions FOR ALL
    USING (is_admin());

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Admin can view all audit logs
CREATE POLICY "Admin can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- System can insert audit logs (via trigger)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- FUNCTIONS FOR AUTO-CREATING PROFILE
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Enable realtime for places (for live availability updates)
ALTER PUBLICATION supabase_realtime ADD TABLE places;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;