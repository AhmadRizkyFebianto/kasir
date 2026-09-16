-- =====================================================
-- AUDIT TRIGGERS
-- =====================================================

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    user_role TEXT;
BEGIN
    -- Get current user info
    user_id := auth.uid();
    
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        user_id,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'INSERT'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE'
            ELSE TG_OP
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        to_jsonb(OLD),
        to_jsonb(NEW)
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR RESERVATIONS
-- =====================================================

CREATE TRIGGER audit_reservations_insert
    AFTER INSERT ON reservations
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_reservations_update
    AFTER UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- TRIGGERS FOR PAYMENTS
-- =====================================================

CREATE TRIGGER audit_payments_insert
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments_update
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- TRIGGERS FOR PLACES
-- =====================================================

CREATE TRIGGER audit_places_update
    AFTER UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- TRIGGERS FOR ORDERS
-- =====================================================

CREATE TRIGGER audit_orders_insert
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_orders_update
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- TRIGGERS FOR ORDER ITEMS
-- =====================================================

CREATE TRIGGER audit_order_items_insert
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_order_items_update
    AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
