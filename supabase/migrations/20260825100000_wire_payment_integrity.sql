CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.webhook_events TO service_role;

CREATE OR REPLACE FUNCTION public.place_order(
  p_order_id uuid,
  p_user_id uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_district text,
  p_notes text,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_payment_method text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  item_product_id uuid;
  item_color text;
  item_size text;
  item_quantity int;
  item_price numeric;
  calculated_subtotal numeric := 0;
  calculated_delivery numeric := CASE WHEN jsonb_array_length(p_items) > 0 THEN 5000 ELSE 0 END;
BEGIN
  IF p_user_id IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only place orders for your own account.';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your order cannot be empty.';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    item_product_id := (item->>'product_id')::uuid;
    item_color := item->>'color';
    item_size := item->>'size';
    item_quantity := (item->>'quantity')::int;
    IF item_quantity IS NULL OR item_quantity <= 0 THEN
      RAISE EXCEPTION 'Order quantities must be greater than zero.';
    END IF;

    SELECT COALESCE(NULLIF(p.sale_price, 0), p.price)
      INTO item_price
      FROM public.products p
      JOIN public.product_variants v ON v.product_id = p.id
     WHERE p.id = item_product_id AND p.active
       AND v.color = item_color AND v.size = item_size
       AND v.stock_quantity >= item_quantity
     FOR UPDATE OF v;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'This product variant is no longer available.';
    END IF;
    calculated_subtotal := calculated_subtotal + item_price * item_quantity;
  END LOOP;

  INSERT INTO public.orders (
    id, user_id, customer_name, phone, email, address, district, notes,
    subtotal, delivery_fee, total, payment_method, payment_status
  ) VALUES (
    p_order_id, p_user_id, p_customer_name, p_phone, p_email, p_address, p_district, p_notes,
    calculated_subtotal, calculated_delivery, calculated_subtotal + calculated_delivery,
    p_payment_method, CASE WHEN p_payment_method = 'wire' THEN 'unpaid' ELSE 'pending' END
  );

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    item_product_id := (item->>'product_id')::uuid;
    item_color := item->>'color';
    item_size := item->>'size';
    SELECT COALESCE(NULLIF(p.sale_price, 0), p.price) INTO item_price
      FROM public.products p WHERE p.id = item_product_id;
    INSERT INTO public.order_items (order_id, product_id, product_name, image_url, size, color, quantity, price)
    VALUES (p_order_id, item_product_id, item->>'product_name', item->>'image_url', item_size, item_color,
            (item->>'quantity')::int, item_price);
  END LOOP;
  RETURN p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_wire_order(p_event_id text, p_payment_intent_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_order public.orders%ROWTYPE;
  item record;
BEGIN
  INSERT INTO public.webhook_events (provider, event_id, event_type, processed)
  VALUES ('wire', p_event_id, 'payment_intent.succeeded', false)
  ON CONFLICT (provider, event_id) DO NOTHING;
  IF NOT FOUND THEN RETURN true; END IF;

  SELECT * INTO current_order FROM public.orders
   WHERE wire_payment_intent_id = p_payment_intent_id FOR UPDATE;
  IF NOT FOUND THEN
    UPDATE public.webhook_events SET processed = true WHERE provider = 'wire' AND event_id = p_event_id;
    RETURN false;
  END IF;
  IF current_order.payment_status <> 'paid' THEN
    FOR item IN SELECT * FROM public.order_items WHERE order_id = current_order.id
    LOOP
      UPDATE public.product_variants
         SET stock_quantity = stock_quantity - item.quantity
       WHERE product_id = item.product_id AND color = item.color AND size = item.size
         AND stock_quantity >= item.quantity;
      IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient stock while completing order.'; END IF;
    END LOOP;
    UPDATE public.orders SET payment_status = 'paid', status = 'confirmed'
     WHERE id = current_order.id;
  END IF;
  UPDATE public.webhook_events SET processed = true WHERE provider = 'wire' AND event_id = p_event_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(uuid, uuid, text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, uuid, text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_wire_order(text, text) TO service_role;
