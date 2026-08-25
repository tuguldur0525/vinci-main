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
  variant_stock int;
  item_quantity int;
  item_product_id uuid;
  item_color text;
  item_size text;
BEGIN
  IF p_user_id IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only place orders for your own account.';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your order cannot be empty.';
  END IF;

  INSERT INTO public.orders (
    id, user_id, customer_name, phone, email, address, district, notes,
    subtotal, delivery_fee, total, payment_method
  ) VALUES (
    p_order_id, p_user_id, p_customer_name, p_phone, p_email, p_address, p_district, p_notes,
    p_subtotal, p_delivery_fee, p_total, p_payment_method
  );

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    item_product_id := (item->>'product_id')::uuid;
    item_color := item->>'color';
    item_size := item->>'size';
    item_quantity := (item->>'quantity')::int;

    IF item_quantity IS NULL OR item_quantity <= 0 THEN
      RAISE EXCEPTION 'Order quantities must be greater than zero.';
    END IF;

    SELECT stock_quantity INTO variant_stock
    FROM public.product_variants
    WHERE product_id = item_product_id
      AND color = item_color
      AND size = item_size
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'This product variant is no longer available.';
    END IF;

    IF variant_stock < item_quantity THEN
      RAISE EXCEPTION 'Only % item(s) remain for % in size %.', variant_stock, item_color, item_size;
    END IF;

    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - item_quantity
    WHERE product_id = item_product_id
      AND color = item_color
      AND size = item_size;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, image_url, size, color, quantity, price
    ) VALUES (
      p_order_id,
      item_product_id,
      item->>'product_name',
      item->>'image_url',
      item_size,
      item_color,
      item_quantity,
      (item->>'price')::numeric
    );
  END LOOP;

  RETURN p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(uuid, uuid, text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, uuid, text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb) TO anon, authenticated;

REVOKE INSERT ON public.orders, public.order_items FROM anon, authenticated;