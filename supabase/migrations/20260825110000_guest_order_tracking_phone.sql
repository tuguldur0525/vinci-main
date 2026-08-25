DROP FUNCTION IF EXISTS public.track_order(text);
DROP FUNCTION IF EXISTS public.track_order(text, text);

CREATE FUNCTION public.track_order(order_reference text, order_phone text)
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
  WHERE (
    (
      nullif(trim(track_order.order_reference), '') IS NOT NULL
      AND left(o.id::text, 8) = lower(regexp_replace(trim(track_order.order_reference), '^#', ''))
    )
    OR (
      nullif(regexp_replace(track_order.order_phone, '[^0-9]', '', 'g'), '') IS NOT NULL
      AND regexp_replace(o.phone, '[^0-9]', '', 'g') = regexp_replace(track_order.order_phone, '[^0-9]', '', 'g')
    )
  )
  GROUP BY o.id, o.status, o.created_at, o.total
  ORDER BY o.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;