CREATE OR REPLACE FUNCTION public.track_order(order_reference text)
RETURNS TABLE (
  order_reference text,
  status text,
  created_at timestamptz,
  total numeric,
  item_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    '#' || upper(left(o.id::text, 8)),
    o.status::text,
    o.created_at,
    o.total,
    count(oi.id)
  FROM public.orders o
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  WHERE left(o.id::text, 8) = lower(regexp_replace(trim(track_order.order_reference), '^#', ''))
  GROUP BY o.id, o.status, o.created_at, o.total;
$$;

REVOKE ALL ON FUNCTION public.track_order(text) FROM public;
GRANT EXECUTE ON FUNCTION public.track_order(text) TO anon, authenticated;