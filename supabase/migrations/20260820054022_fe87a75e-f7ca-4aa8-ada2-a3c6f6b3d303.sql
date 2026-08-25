
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products anon read" ON public.products FOR SELECT TO anon USING (active);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (active OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.categories (name, slug, image_url, sort_order) VALUES
 ('Heels','heels','/__l5e/assets-v1/f1897807-cfe1-47c9-aac1-a4adcef0ea46/p-red-pump.jpg',1),
 ('Pumps','pumps','/__l5e/assets-v1/b53cca06-a11b-44fb-b466-063a47809bae/p-black-pump.jpg',2),
 ('Boots','boots','/__l5e/assets-v1/eeda84ce-9b9e-4b90-9fdb-1270b38f0f17/p-black-boot.jpg',3),
 ('Flats','flats','/__l5e/assets-v1/bb7ed85f-29c9-4769-a0b7-925f71000df3/p-nude-flat.jpg',4),
 ('Sandals','sandals','/__l5e/assets-v1/35377d44-f0d2-468a-bd81-259a514bccde/p-black-sandal.jpg',5);

INSERT INTO public.products (name, slug, description, price, sale_price, category_id, material, care, featured, new_arrival)
VALUES
 ('Vinci Classic Pump','vinci-classic-pump','A sharpened point, a poised 90mm stiletto. The pump that anchors every Vinci wardrobe.',289000,NULL,(SELECT id FROM public.categories WHERE slug='pumps'),'Italian patent calfskin, leather lining','Wipe with a soft dry cloth. Store in the dust bag provided.',true,true),
 ('Vinci Rouge Stiletto','vinci-rouge-stiletto','Our signature burgundy, cut into a high 100mm stiletto with a lacquered finish.',329000,299000,(SELECT id FROM public.categories WHERE slug='heels'),'Patent leather, leather sole','Avoid prolonged moisture. Polish gently.',true,true),
 ('Vinci Slingback 75','vinci-slingback-75','A softly flared 75mm heel and an elastic slingback made for long days.',269000,NULL,(SELECT id FROM public.categories WHERE slug='heels'),'Nappa leather','Clean with a damp cloth, dry naturally.',true,false),
 ('Vinci Knee Boot','vinci-knee-boot','A polished knee-high silhouette on a fine 105mm heel. Made to be noticed.',529000,NULL,(SELECT id FROM public.categories WHERE slug='boots'),'Box calf leather, full zip','Keep upright with boot shapers.',true,true),
 ('Vinci Point Flat','vinci-point-flat','The elongated flat. Quiet, precise, endlessly wearable.',199000,169000,(SELECT id FROM public.categories WHERE slug='flats'),'Soft nappa leather','Condition leather seasonally.',false,false),
 ('Vinci Strap Sandal','vinci-strap-sandal','A single strap, an ankle line, a 90mm heel. Evening, simplified.',249000,NULL,(SELECT id FROM public.categories WHERE slug='sandals'),'Smooth calf leather','Store away from direct sunlight.',false,true);

INSERT INTO public.product_images (product_id, image_url, sort_order) VALUES
 ((SELECT id FROM public.products WHERE slug='vinci-classic-pump'),'/__l5e/assets-v1/b53cca06-a11b-44fb-b466-063a47809bae/p-black-pump.jpg',0),
 ((SELECT id FROM public.products WHERE slug='vinci-classic-pump'),'/__l5e/assets-v1/58e4cf3a-c2f7-471c-9c6d-50a5a2162b09/campaign-red-heels.png',1),
 ((SELECT id FROM public.products WHERE slug='vinci-rouge-stiletto'),'/__l5e/assets-v1/f1897807-cfe1-47c9-aac1-a4adcef0ea46/p-red-pump.jpg',0),
 ((SELECT id FROM public.products WHERE slug='vinci-rouge-stiletto'),'/__l5e/assets-v1/58e4cf3a-c2f7-471c-9c6d-50a5a2162b09/campaign-red-heels.png',1),
 ((SELECT id FROM public.products WHERE slug='vinci-slingback-75'),'/__l5e/assets-v1/e87580f5-be48-42ea-b452-bbe11803a453/p-white-sling.jpg',0),
 ((SELECT id FROM public.products WHERE slug='vinci-knee-boot'),'/__l5e/assets-v1/eeda84ce-9b9e-4b90-9fdb-1270b38f0f17/p-black-boot.jpg',0),
 ((SELECT id FROM public.products WHERE slug='vinci-point-flat'),'/__l5e/assets-v1/bb7ed85f-29c9-4769-a0b7-925f71000df3/p-nude-flat.jpg',0),
 ((SELECT id FROM public.products WHERE slug='vinci-strap-sandal'),'/__l5e/assets-v1/35377d44-f0d2-468a-bd81-259a514bccde/p-black-sandal.jpg',0);

INSERT INTO public.product_variants (product_id, color, size, stock_quantity)
SELECT p.id, c.color, s.size, (3 + (random()*8)::int)
FROM public.products p
CROSS JOIN (VALUES ('Black'),('Red'),('White')) AS c(color)
CROSS JOIN (VALUES ('35'),('36'),('37'),('38'),('39'),('40')) AS s(size);
