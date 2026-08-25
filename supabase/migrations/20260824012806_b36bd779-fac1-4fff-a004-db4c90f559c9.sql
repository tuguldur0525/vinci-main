ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS color text;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS wire_payment_intent_id text;

CREATE INDEX IF NOT EXISTS orders_wire_pi_idx ON public.orders (wire_payment_intent_id);

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.product_images TO service_role;
GRANT ALL ON public.product_variants TO service_role;