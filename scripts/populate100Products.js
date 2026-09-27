const fs = require('fs');
const path = require('path');

const categories = [
  {
    name: 'Home Décor',
    slug: 'home-decor',
    prefix: 'DEC',
    items: [
      { name: 'Bohemian Macramé Feather Wall Hanging', sub: 'Rope & Macramé', price: 1499, sale: 1199, mat: '100% natural unbleached cotton cord, driftwood branch', custom: true, desc: 'Hand-knotted bohemian tapestry with fringed plumage.' },
      { name: 'Artisan Gilded Sunburst Ceramic Mirror', sub: 'Clocks & Mirrors', price: 2499, sale: 1999, mat: 'Stoneware clay, gold leaf foil, reflective glass', custom: false, desc: 'Lustrous sculpted radial sunburst mirror.' },
      { name: 'Hand-carved Teakwood Botanical Coaster Set', sub: 'Decorative Trays', price: 899, sale: 699, mat: 'Reclaimed teak wood, natural wax polish', custom: true, desc: 'Set of 6 intricately carved leaf motif coasters.' },
      { name: 'Minimalist Woven Jute Planter Basket', sub: 'Botanical Accents', price: 799, sale: 599, mat: 'Organic natural golden jute twine', custom: false, desc: 'Earthy textured cylinder basket for indoor greenery.' },
      { name: 'Sculpted Terracotta Tabletop Water Feature', sub: 'Sculptural Pieces', price: 3499, sale: 2899, mat: 'Kiln-fired clay, submersible mini pump', custom: false, desc: 'Calming indoor trickling fountain.' },
      { name: 'Bespoke Brass & Walnut Perpetual Calendar', sub: 'Desk Accents', price: 1799, sale: 1399, mat: 'Solid walnut wood, etched brass rings', custom: true, desc: 'Timeless rotary desktop date calendar.' },
      { name: 'Hand-woven Seagrass Hanging Fruit Basket', sub: 'Table Décor', price: 1199, sale: 949, mat: 'Natural seagrass, twisted hemp rope', custom: false, desc: 'Tiered rustic hanging organizer for kitchens and patios.' },
      { name: 'Nordic Cast Iron & Amber Glass Lantern', sub: 'Ambient Lanterns', price: 1899, sale: 1499, mat: 'Wrought iron frame, fluted amber glass', custom: false, desc: 'Warm candlelit luminary for dining tables.' },
      { name: 'Stained Glass Hanging Hummingbird Suncatcher', sub: 'Window Ornaments', price: 1299, sale: 999, mat: 'Tiffany stained glass, lead came, copper chain', custom: false, desc: 'Prismatic light-catching window adornment.' },
      { name: 'Hand-painted Mandala Wooden Wall Clock', sub: 'Clocks & Mirrors', price: 2199, sale: 1749, mat: 'Engineered MDF wood base, acrylic paints, silent quartz', custom: true, desc: 'Intricate dot-mandala meditative timepiece.' },
      { name: 'Artisanal Terracotta Fluted Floor Urn', sub: 'Artisanal Vases', price: 2999, sale: 2399, mat: 'Natural baked earthen clay', custom: false, desc: 'Sculptural fluted statement vase for pampas grass.' },
      { name: 'Botanical Pressed Fern Brass Floating Frame', sub: 'Wall Hangings', price: 1599, sale: 1299, mat: 'Real preserved woodland ferns, double-glass, brass', custom: true, desc: 'Double-glazed floating botanical exhibition.' },
      { name: 'Handcrafted Cane & Rattan Table Runner', sub: 'Table Décor', price: 999, sale: 799, mat: 'Natural rattan cane webbing, linen border', custom: false, desc: 'Organic dining centerpiece runner.' },
      { name: 'Moroccan Hammered Copper Trinket Tray', sub: 'Decorative Trays', price: 1399, sale: 1099, mat: 'Pure solid copper, protective seal', custom: true, desc: 'Gleaming hand-hammered vanity dish.' },
      { name: 'Rustic Olivewood Salt & Pepper Cellar Box', sub: 'Table Décor', price: 1199, sale: 899, mat: 'Aged Mediterranean olivewood with swivel magnetic lid', custom: false, desc: 'Grain-rich dual spice storage with brass pivot.' }
    ]
  },
  {
    name: 'Resin Crafts',
    slug: 'resin-crafts',
    prefix: 'RES',
    items: [
      { name: 'Handmade Botanical Resin Flower Display', sub: 'Preserved Florals', price: 1199, sale: 899, mat: 'UV epoxy resin, organic wild daisies, gold leaf', custom: true, desc: 'Real dried wild blossoms encased in crystal-clear archival resin.' },
      { name: 'Gilded Ocean Geode Resin Coasters (Set of 4)', sub: 'Geode Coasters', price: 1299, sale: 999, mat: 'Crystal epoxy, fine mica pigment, gold gilt edges', custom: true, desc: 'Swirling turquoise and white seafoam waves with gilded borders.' },
      { name: 'Preserved Red Rose Archival Resin Pyramid', sub: 'Preserved Rose Keepsakes', price: 1699, sale: 1299, mat: 'Real preserved crimson rose, optical epoxy resin', custom: true, desc: 'Forever rose encased inside an optical glass-clarity pyramid.' },
      { name: 'Ocean Shoreline Live Edge Resin Clock', sub: 'Resin Clocks', price: 2799, sale: 2299, mat: 'Acacia wood slab, deep marine epoxy, quartz movement', custom: true, desc: 'Aerial beach wave crashing against natural wood bark.' },
      { name: 'Botanical Pressed Daisy Resin Bookmark with Tassel', sub: 'Resin Bookmarks', price: 499, sale: 349, mat: 'Ultra-thin flex resin, real dried baby breath, silk tassel', custom: true, desc: 'Graceful floral page keeper for avid readers.' },
      { name: 'Resin & Wood Agate Slice Serving Platter', sub: 'Resin Trays', price: 2199, sale: 1799, mat: 'Teak wood, emerald metallic resin, gold handles', custom: true, desc: 'Luxe party charcuterie and mocktail platter.' },
      { name: 'Crystalline Dandelion Seed Resin Paperweight', sub: 'Botanical Paperweights', price: 999, sale: 799, mat: 'Real intact dandelion sphere, optical resin dome', custom: false, desc: 'Untouched dandelion puff floating in suspended animation.' },
      { name: 'Ethereal Moonlit Botanical Resin Night Lamp', sub: 'Resin Lamps', price: 2499, sale: 1999, mat: 'Preserved purple hydrangea, oak LED base with USB switch', custom: true, desc: 'Soft ambient warm bedside lamp glowing through blossoms.' },
      { name: 'Personalized Resin Keepsake Photo Frame', sub: 'Resin Photo Frames', price: 1899, sale: 1499, mat: 'Epoxy resin, dried rose petals, metallic gold leaf flakes', custom: true, desc: 'Bespoke frame for cherished wedding and anniversary memories.' },
      { name: 'Gilded Marble Resin Jewelry Trinket Dish', sub: 'Resin Trinket Dishes', price: 699, sale: 499, mat: 'White and gold marbleized epoxy resin', custom: true, desc: 'Chic bedside bowl for rings, watches, and earrings.' },
      { name: 'Personalized Floral Initial Resin Keychain', sub: 'Alphabet Keychains', price: 399, sale: 299, mat: 'Resin, dried jasmine petals, gold alloy ring', custom: true, desc: 'Custom alphabet letter with real flowers and gold foil.' },
      { name: 'Nebula Galaxy Deep Space Resin Sphere', sub: 'Botanical Paperweights', price: 1399, sale: 1099, mat: 'Multi-layered chromatic pigments, optical resin', custom: false, desc: 'Swirling miniature cosmos trapped in clear resin orb.' },
      { name: 'Preserved Autumn Maple Leaf Resin Wall Plaque', sub: 'Preserved Florals', price: 1599, sale: 1249, mat: 'Natural Japanese red maple leaf, clear resin', custom: true, desc: 'Vibrant fiery autumn foliage preserved for eternity.' },
      { name: 'Handmade Dried Lavender Hexagon Coaster Set', sub: 'Geode Coasters', price: 1199, sale: 899, mat: 'French lavender sprigs, clear resin, gold foil rim', custom: true, desc: 'Aromatic flower petals suspended in clear hexagonal coasters.' }
    ]
  },
  {
    name: 'Personalized Gifts',
    slug: 'personalized-gifts',
    prefix: 'PER',
    items: [
      { name: 'Personalized Calligraphy Oak Wood Plaque', sub: 'Wooden Name Plaques', price: 1899, sale: 1499, mat: 'Seasoned white oak, raised acrylic script', custom: true, desc: 'Custom family name plaque crafted from natural reclaimed oak.' },
      { name: 'Custom Spotify Song & Photo Acrylic Plaque', sub: 'Custom Music Plaques', price: 1199, sale: 899, mat: 'Clear cast acrylic, scannable barcode, pine LED stand', custom: true, desc: 'Immortalize your special song and couple photo with warm LED light.' },
      { name: 'Engraved Genuine Leather Key Organizer with Monogram', sub: 'Monogrammed Leather Keepsakes', price: 699, sale: 499, mat: 'Full-grain vintage brown leather, brass stud', custom: true, desc: 'Hand-stitched leather fob with laser-etched initials.' },
      { name: 'Bespoke Couple Star Map Night Sky Frame', sub: 'Custom Couple Art', price: 1799, sale: 1399, mat: 'Archival 300gsm matte art card, solid wood frame', custom: true, desc: 'Exact astrological constellation on your special date.' },
      { name: 'Personalized Resin & Wood Family Nameplate', sub: 'Custom Nameplates', price: 2599, sale: 2099, mat: 'Solid teakwood, ocean resin inlay, brass lettering', custom: true, desc: 'High-end entrance door nameplate for modern homes.' },
      { name: 'Custom Engraved Wooden Keepsake Memory Box', sub: 'Bespoke Memory Boxes', price: 1999, sale: 1599, mat: 'Pine wood, velvet lining, vintage brass latch', custom: true, desc: 'Treasury chest engraved with couple names or heartfelt message.' },
      { name: 'Newborn Baby Birth Stats Wooden Milestone Frame', sub: 'Baby Name Birth Frames', price: 1499, sale: 1199, mat: 'Birch ply, laser-cut 3D pastel details', custom: true, desc: 'Captures baby name, birth time, weight, and astrological sign.' },
      { name: 'Personalized Monogrammed Wooden Wall Art', sub: 'Personalized Wall Monograms', price: 1399, sale: 1099, mat: 'Hardwood ply, walnut stain finish', custom: true, desc: 'Bold initial letter interweaved with full family surname.' },
      { name: 'Custom Anniversary Date Calendar Brass Keychain', sub: 'Custom Date Trinkets', price: 599, sale: 399, mat: 'Solid heavy brass, hand-stamped heart indicator', custom: true, desc: 'Mini engraved monthly calendar highlighting your date.' },
      { name: 'Hand-painted Family Portrait Wooden Peg Dolls', sub: 'Custom Couple Art', price: 2299, sale: 1849, mat: 'Natural birch wood, non-toxic acrylics, satin sealer', custom: true, desc: 'Custom painted adorable peg doll representations of family.' },
      { name: 'Engraved Wooden Recipe Cutting Board', sub: 'Wooden Name Plaques', price: 1699, sale: 1299, mat: 'Solid acacia hardwood, food-grade mineral oil', custom: true, desc: 'Laser-engraved with grandmother or mother handmade recipes.' },
      { name: 'Custom Soundwave Audio Waveform Art Print', sub: 'Custom Couple Art', price: 1299, sale: 999, mat: 'Gold foil on black velvet art card, wooden frame', custom: true, desc: 'Visual soundwave of I love you or vows with QR audio code.' },
      { name: 'Personalized Engraved Metal Pocket Watch', sub: 'Monogrammed Leather Keepsakes', price: 1599, sale: 1249, mat: 'Vintage brushed bronze alloy, mechanical skeleton core', custom: true, desc: 'Heirloom pocket watch with custom secret inner message.' }
    ]
  },
  {
    name: 'Wall Art',
    slug: 'wall-art',
    prefix: 'WAL',
    items: [
      { name: 'Textured Coastal Waves Plaster Canvas Art', sub: 'Textured Canvas Art', price: 2999, sale: 2399, mat: 'Heavy modeling paste, acrylic on stretched canvas', custom: false, desc: 'Minimalist 3D sculptural textured artwork with organic ridges.' },
      { name: 'Grand Bohemian Macramé Bedhead Tapestry', sub: 'Macramé Wall Hangings', price: 3499, sale: 2899, mat: '4mm twisted cotton string, natural eucalyptus rod', custom: true, desc: 'Expansive hand-knotted statement tapestry for master bedrooms.' },
      { name: 'Hand-carved Lotus Mandala Wooden Wall Panel', sub: 'Wooden Carved Wall Murals', price: 2699, sale: 2199, mat: 'Sustainable mango wood, distressed ivory wash', custom: false, desc: 'Intricately carved spiritual lotus motif.' },
      { name: 'Set of 3 Framed Botanical Pressed Fern Prints', sub: 'Framed Botanical Prints', price: 1999, sale: 1599, mat: 'Archival Giclée print, natural ashwood frames', custom: false, desc: 'High-definition watercolor botanical forest triology.' },
      { name: 'Handmade Feather & Shell Boho Dreamcatcher', sub: 'Boho Dreamcatchers', price: 1199, sale: 899, mat: 'Crochet doily web, natural cowrie shells, soft goose down', custom: true, desc: 'Spiritual bohemian dreamcatcher bringing peaceful energy.' },
      { name: 'Abstract Emerald & Gold Leaf Resin Wall Panel', sub: 'Resin Wall Murals', price: 3999, sale: 3299, mat: 'Birch art panel, liquid glass epoxy, 24K gold foil', custom: true, desc: 'Mesmerizing deep emerald green geode crystal canvas.' },
      { name: 'Minimalist Terracotta Clay Wall Hanging Plates (Set of 3)', sub: 'Minimalist Clay Wall Plates', price: 1799, sale: 1399, mat: 'Red earthenware clay, unglazed matte geometric carvings', custom: false, desc: 'Warm desert boho wall hanging discs.' },
      { name: 'Geometric Brass & Yarn Sacred Geometry Hanging', sub: 'Geometric Thread Art', price: 1499, sale: 1199, mat: 'Solid brass tubing, merino wool threads', custom: false, desc: 'Mid-century modern architectural mobile.' },
      { name: 'Handmade Preserved Eucalyptus & Cotton Hoop Wreath', sub: 'Floral Hoop Wreaths', price: 1399, sale: 1099, mat: 'Natural brass hoop, dried silver dollar eucalyptus, cotton bolls', custom: true, desc: 'Everlasting natural farmhouse entryway wreath.' },
      { name: 'Hand-hammered Copper Tree of Life Wall Medallion', sub: 'Metal & Wood Accents', price: 2899, sale: 2299, mat: 'Repoussé copper sheet, antiqued patina', custom: false, desc: 'Symbol of strength and growth meticulously hand-beaten in copper.' },
      { name: 'Rattan Sunburst Woven Wall Mirror', sub: 'Mirror Wall Hangings', price: 2199, sale: 1799, mat: 'Hand-woven natural rattan cane, bevelled mirror', custom: false, desc: 'Artisan sunburst accent giving airy tropical warmth.' },
      { name: 'Hand-knotted Indigo Tie-Dye Tapestry', sub: 'Macramé Wall Hangings', price: 1899, sale: 1499, mat: 'Organic cotton, natural plant-based indigo dye', custom: false, desc: 'Ombré blue dip-dyed modern macramé.' },
      { name: '3D Sculpted Clay Desert Arch Wall Sculpture', sub: 'Textured Canvas Art', price: 2399, sale: 1899, mat: 'Terracotta and sandstone clay on reinforced timber backer', custom: false, desc: 'Earthy architectural arch wall sculpture in terracotta tones.' }
    ]
  },
  {
    name: 'Handmade Jewellery',
    slug: 'handmade-jewellery',
    prefix: 'JWL',
    items: [
      { name: 'Terracotta Hand-painted Peacock Jhumkas', sub: 'Terracotta Hand-painted Earrings', price: 799, sale: 599, mat: 'Natural baked clay, acrylic paints, gold bead drops', custom: false, desc: 'Traditional temple style hand-sculpted lightweight clay earrings.' },
      { name: 'Botanical Pressed Forget-Me-Not Resin Pendant', sub: 'Botanical Resin Pendants', price: 899, sale: 699, mat: '18K gold-plated stainless steel bezel, real blue forget-me-nots', custom: true, desc: 'Dainty oval necklace holding real preserved blue blossoms.' },
      { name: 'Pastel Floral Polymer Clay Dangle Earrings', sub: 'Polymer Clay Earrings', price: 699, sale: 499, mat: 'Hypoallergenic surgical steel posts, premium polymer clay', custom: false, desc: 'Ultra-lightweight sculpted daisy bouquet statement earrings.' },
      { name: 'Raw Amethyst & Moonstone Healing Crystal Bracelet', sub: 'Natural Gemstone Bracelets', price: 1199, sale: 899, mat: 'Natural uncut amethyst, rainbow moonstone, stretch cord', custom: false, desc: 'Promotes tranquility and emotional clarity.' },
      { name: 'Preserved Baby Breath Crystal Resin Sphere Ring', sub: 'Floral Resin Rings', price: 599, sale: 449, mat: 'Adjustable sterling silver band, botanical resin orb', custom: true, desc: 'Delicate starry white dried flowers inside an adjustable ring.' },
      { name: 'Hand-embroidered Zardozi Floral Brooch Pin', sub: 'Artisan Brass Brooches', price: 899, sale: 649, mat: 'Silk velvet base, gold metallic wire, glass crystals', custom: false, desc: 'Regal vintage brooch for jackets, sarees, and blazers.' },
      { name: 'Silk Thread Kundan Bridal Bangle Set', sub: 'Pearl & Silk Thread Bangles', price: 1499, sale: 1199, mat: 'Hand-wrapped mulberry silk yarn, Kundan stones, pearls', custom: true, desc: 'Lustrous festive bangles customized to your saree palette.' },
      { name: 'Bohemian Multicolored Silk Tassel Earrings', sub: 'Boho Tassel Earrings', price: 549, sale: 399, mat: 'Soft viscose fringe, brass tribal studs', custom: false, desc: 'Playful vibrant party earrings with lively movement.' },
      { name: 'Real Pressed Daisy Gold Hairpin Set (Set of 2)', sub: 'Pressed Flower Hairpins', price: 649, sale: 499, mat: 'Gold tone bobby clips, preserved yellow and white daisies', custom: false, desc: 'Romantic floral accents for braided hairstyles.' },
      { name: 'Minimalist Terrazzo Arch Polymer Clay Studs', sub: 'Minimalist Clay Studs', price: 449, sale: 349, mat: 'Baked clay with multi-color speckles, titanium posts', custom: false, desc: 'Contemporary everyday geometric earrings.' },
      { name: 'Handmade Seashell & Pearl Macramé Anklet', sub: 'Hand-knotted Anklets', price: 499, sale: 379, mat: 'Waterproof waxed cord, natural mini cowrie shells, freshwater pearls', custom: false, desc: 'Beach vibes vacation anklet with adjustable slide knot.' },
      { name: 'Vintage Brass Filigree Butterfly Hair Comb', sub: 'Artisan Brass Brooches', price: 999, sale: 799, mat: 'Antiqued brass, Swarovski crystal accents', custom: false, desc: 'Heirloom style bridal hair accessory.' },
      { name: 'Handcrafted Glass Seed Bead Boho Choker', sub: 'Beaded Chokers & Necklaces', price: 799, sale: 599, mat: 'Miyuki Japanese glass beads, 14K gold filled clasp', custom: false, desc: 'Intricately woven colorful geometric floral choker necklace.' }
    ]
  },
  {
    name: 'Ceramic & Pottery',
    slug: 'ceramic-pottery',
    prefix: 'CER',
    items: [
      { name: 'Wheel-thrown Rustic Speckled Ceramic Vase', sub: 'Wheel-thrown Vases', price: 1699, sale: 1299, mat: 'Stoneware clay, reactive speckled matte glaze', custom: false, desc: 'Organic curved silhouette vase with warm sand glaze.' },
      { name: 'Hand-pinched Wabi-Sabi Ceramic Coffee Mug', sub: 'Stoneware Coffee Mugs', price: 899, sale: 699, mat: 'Food-safe high-fire stoneware, microwave and dishwasher safe', custom: true, desc: 'Thumb-rest ergonomic artisan mug with speckled oatmeal finish.' },
      { name: 'Sculpted Ceramic Sloth Hanging Planter', sub: 'Hand-pinched Planters', price: 1199, sale: 899, mat: 'Glazed earthenware, natural jute hanger', custom: false, desc: 'Charming animal planter for string of pearls or succulents.' },
      { name: 'Handmade Glazed Ceramic Pasta & Salad Bowl Set', sub: 'Speckled Ceramic Bowls', price: 2199, sale: 1749, mat: 'Heavy stoneware, deep oceanic blue reactive glaze (Set of 2)', custom: false, desc: 'Wide shallow bowls with rustic exposed raw clay rims.' },
      { name: 'Artisan Lotus Incense Stick & Cone Burner', sub: 'Ceramic Incense Holders', price: 699, sale: 499, mat: 'High-gloss jade green ceramic with brass holder', custom: false, desc: 'Catches all ash while infusing calming serenity.' },
      { name: 'Hand-carved Textured Ceramic Serving Platter', sub: 'Clay Serving Platters', price: 1899, sale: 1499, mat: 'High-fired porcelain blend, food-grade matte white glaze', custom: true, desc: 'Elegant oval entertainer platter with organic wave edges.' },
      { name: 'Minimalist Matte Terracotta Oil Diffuser Lamp', sub: 'Clay Oil Diffusers', price: 1399, sale: 1099, mat: 'Natural baked red clay, tea light aroma bowl', custom: false, desc: 'Gently diffuses essential oils through natural earthenware warmth.' },
      { name: 'Artisanal Speckled Ceramic Pour-over Coffee Dripper', sub: 'Stoneware Coffee Mugs', price: 1299, sale: 999, mat: 'Heat-retaining ceramic cone, fits standard v60 filters', custom: false, desc: 'Brew barista-quality morning pour-overs at home.' },
      { name: 'Ceramic Starry Night Candle Lantern Holder', sub: 'Ceramic Tea Light Lanterns', price: 999, sale: 799, mat: 'Midnight blue glaze with hand-pierced star constellations', custom: false, desc: 'Casts mesmerizing star shadows on surrounding walls.' },
      { name: 'Organic Oval Ceramic Soap Dish with Draining Ridges', sub: 'Glazed Soap Dishes', price: 549, sale: 399, mat: 'Stoneware with reactive moss green glaze', custom: false, desc: 'Keeps artisan cold-process soaps dry and durable.' },
      { name: 'Miniature Ceramic Owl Succulent Pots (Set of 3)', sub: 'Miniature Succulent Pots', price: 999, sale: 799, mat: 'Glazed ceramic with drainage holes and bamboo saucers', custom: false, desc: 'Adorable trio for office desks and windowsill greenery.' },
      { name: 'Hand-pressed Botanical Impression Clay Coasters', sub: 'Textured Stoneware Coasters', price: 849, sale: 649, mat: 'Stoneware imprinted with real rosemary and lavender sprigs', custom: true, desc: 'Set of 4 absorbent earthen coasters with cork backing.' },
      { name: 'Sculpted Minimalist Ceramic Donut Vase', sub: 'Wheel-thrown Vases', price: 1499, sale: 1149, mat: 'Unglazed matte white textured terracotta bisque', custom: false, desc: 'Iconic hollow circular Nordic flower vessel for dried flora.' }
    ]
  },
  {
    name: 'Candle Holders & Aromas',
    slug: 'candle-holders',
    prefix: 'CND',
    items: [
      { name: 'Sculptural Terrazzo Pillar Candle Stand', sub: 'Terrazzo Candle Stands', price: 999, sale: 749, mat: 'Jesmonite mineral composite with recycled stone chips', custom: true, desc: 'Contemporary fluted terrazzo pedestal for pillar candles.' },
      { name: 'Hand-poured French Lavender & Vanilla Soy Candle', sub: 'Hand-poured Scented Candles', price: 899, sale: 699, mat: '100% natural soy wax, essential oils, wooden crackling wick', custom: true, desc: '50-hour clean burn in frosted amber glass jar with cork lid.' },
      { name: 'Botanical Pressed Blossom Soy Wax Melts (Pack of 8)', sub: 'Botanical Soy Wax Melts', price: 599, sale: 449, mat: 'Soy wax embedded with real rose petals, jasmine, and citrus peel', custom: false, desc: 'Aromatherapy wax cubes for electric and tea light warmers.' },
      { name: 'Hand-carved Sheesham Wood Tealight Candelabra', sub: 'Wood Carved Tea Light Holders', price: 1399, sale: 1099, mat: 'Solid Indian Rosewood (Sheesham), brass cups (Holds 5 lights)', custom: true, desc: 'Rich grained architectural table centerpiece.' },
      { name: 'Arch Geometric Jesmonite Taper Candle Holder', sub: 'Jesmonite Taper Holders', price: 799, sale: 599, mat: 'Eco-resin jesmonite, dual-sided taper fitting', custom: false, desc: 'Modern pastel arch statement piece for dinner tables.' },
      { name: 'Pure 100% Beeswax Honeycomb Sculptural Pillar', sub: 'Beeswax Sculptural Candles', price: 949, sale: 749, mat: 'Natural unbleached beeswax with sweet natural honey scent', custom: false, desc: 'Smokeless air-purifying natural candle with cotton wick.' },
      { name: 'Hand-hammered Brass Lotus Diya Urli Stand', sub: 'Hammered Brass Diya Stands', price: 1899, sale: 1499, mat: 'Pure heavy brass, antique golden lacquer', custom: false, desc: 'Floating flower and oil diya centerpiece for festive occasions.' },
      { name: 'Rosemary & Cedarwood Botanical Wax Hanging Tablet', sub: 'Lavender & Rose Wax Tablets', price: 499, sale: 349, mat: 'Hard soy wax, dried herbs, orange slices, suede loop', custom: true, desc: 'Aroma freshener for wardrobes, closets, and door handles.' },
      { name: 'Geometric White Concrete Tea Light Cube Set', sub: 'Concrete Geometric Candle Pots', price: 699, sale: 499, mat: 'Fine grain cast concrete with metallic copper accents (Set of 3)', custom: false, desc: 'Urban industrial ambient lighting accents.' },
      { name: 'Natural Pink Himalayan Salt Glowing Tea Light Block', sub: 'Himalayan Salt Candle Bowls', price: 849, sale: 649, mat: 'Raw 100% authentic Himalayan rock salt crystal', custom: false, desc: 'Emits gentle soothing negative ions and warm amber glow.' },
      { name: 'Coffee Bean & Cinnamon Warm Bakery Soy Candle', sub: 'Hand-poured Scented Candles', price: 949, sale: 749, mat: 'Soy wax, roasted Arabica beans, cinnamon bark oil', custom: true, desc: 'Fills your room with the cozy aroma of a Parisian cafe.' },
      { name: 'Volcanic Lava Stone Aromatherapy Essential Oil Diffuser', sub: 'Aroma Diffuser Stones', price: 1199, sale: 899, mat: 'Porous black basalt lava stones in solid acacia wood bowl', custom: false, desc: 'Passive natural essential oil vaporiser with 10ml lavender oil.' },
      { name: 'Smoked Amber & Sandalwood Luxury Candle Tin', sub: 'Hand-poured Scented Candles', price: 749, sale: 549, mat: 'Soy wax, Mysore sandalwood oil, brushed gold metal tin', custom: false, desc: 'Rich meditative woody fragrance with 35-hour clean burn.' }
    ]
  },
  {
    name: 'Handmade Gifts',
    slug: 'handmade-gifts',
    prefix: 'GFT',
    items: [
      { name: 'Artisan Heritage Handcrafted Gift Hamper', sub: 'Curated Gift Hampers', price: 2999, sale: 2399, mat: 'Woven bamboo chest, resin coaster, soy candle, artisan tea, greeting card', custom: true, desc: 'Ultimate luxury gift ensemble packed with handcrafted keepsakes.' },
      { name: 'Vintage Leather Hand-stitched Travel Journal & Diary', sub: 'Handmade Scrapbooks & Journals', price: 1299, sale: 999, mat: 'Crazy horse buffalo leather, 200 pages handmade deckle edge cotton paper', custom: true, desc: 'Old-world bound journal that feels like an antique treasure.' },
      { name: 'Personalized Couple Memory Photo Explosion Box', sub: 'Couple Keepsake Bundles', price: 1599, sale: 1199, mat: 'Heavy 350gsm matte craft cardstock, ribbon cascades (Holds 24 photos)', custom: true, desc: 'Multi-layered origami box that unfolds into cherished memories.' },
      { name: 'Hand-embroidered Silk Velvet Potli Gift Pouch', sub: 'Hand-embroidered Pouches', price: 799, sale: 599, mat: 'Royal velvet, pearl drawstring tassels, Zari embroidery', custom: true, desc: 'Traditional royal clutch bag for wedding gifts and jewelry.' },
      { name: 'Artisan Hand-painted Botanical Wooden Bookmark Bundle', sub: 'Artisan Bookmark Sets', price: 699, sale: 499, mat: 'Seasoned birch wood, gouache watercolor painting, leather cord (Set of 4)', custom: true, desc: 'Miniature collectible artworks for book lovers.' },
      { name: 'Handmade Deckle Edge Plantable Seed Paper Cards (Pack of 5)', sub: 'Handmade Greeting Card Sets', price: 599, sale: 449, mat: 'Recycled cotton pulp embedded with wildflower and basil seeds', custom: true, desc: 'Plant the greeting card in soil to sprout organic blooming daisies!' },
      { name: 'Warm Wishes Housewarming Welcome Gift Hamper', sub: 'Housewarming Welcome Hampers', price: 2499, sale: 1999, mat: 'Sheesham wooden bowl, soy candle, ceramic tea coasters, brass spoon', custom: true, desc: 'Thoughtful housewarming bundle celebrating new beginnings.' },
      { name: 'Soulful Aromatherapy Relaxation Spa Kit', sub: 'Aromatherapy Gift Kits', price: 1799, sale: 1399, mat: 'Bath salts, lavender pulse roller, chamomile soy candle, silk eye mask', custom: true, desc: 'A serene spa sanctuary delivered directly to their doorstep.' },
      { name: 'Miniature Hand-sculpted Clay Animal Keepsake Figurines', sub: 'Miniature Clay Figurines', price: 899, sale: 699, mat: 'Polymer clay with glazed ceramic finish (Set of 3 forest friends)', custom: false, desc: 'Adorable desk companions sculpted with heartwarming detail.' },
      { name: 'Hand-carved Wooden Jewelry Music Keepsake Box', sub: 'Keepsake Treasure Boxes', price: 1999, sale: 1599, mat: 'Sheesham wood with brass inlay and wind-up Sankyo musical movement', custom: true, desc: 'Plays Fur Elise when opened. Velvet ring organizers inside.' },
      { name: 'Handcrafted Terracotta Diya & Toran Festive Box', sub: 'Festive Diyas & Toran Sets', price: 1299, sale: 999, mat: '4 hand-painted clay diyas, brass bell toran, pure cow ghee wicks', custom: false, desc: 'Brings light, auspiciousness, and joy to Diwali and celebrations.' },
      { name: 'Artisan Handmade Keepsake Love Letters in a Bottle', sub: 'Couple Keepsake Bundles', price: 899, sale: 699, mat: 'Corked glass apothecary flask, rolled parchment scrolls with wax seal', custom: true, desc: 'Write 12 customized personalized notes for your partner.' },
      { name: 'Gourmet Handcrafted Teak Wooden Cheese & Wine Board Kit', sub: 'Curated Gift Hampers', price: 2299, sale: 1799, mat: 'Acacia board, 3 stainless steel cheese knives with wooden handles', custom: true, desc: 'Sophisticated gourmet hosting gift set in gold foil gift box.' }
    ]
  }
];

const unsplashImages = [
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1000&auto=format&fit=crop'
];

let allProducts = [];
let prodIndex = 1;

categories.forEach((cat) => {
  cat.items.forEach((item, itemIdx) => {
    const id = 'prod-' + String(prodIndex).padStart(3, '0');
    const sku = 'CG-' + cat.prefix + '-' + String(itemIdx + 1).padStart(2, '0');
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const img1 = unsplashImages[(prodIndex - 1) % unsplashImages.length];
    const img2 = unsplashImages[(prodIndex + 3) % unsplashImages.length];
    const img3 = unsplashImages[(prodIndex + 7) % unsplashImages.length];
    
    const discount = Math.round(((item.price - item.sale) / item.price) * 100);

    allProducts.push({
      id,
      sku,
      name: item.name,
      slug,
      category: cat.name,
      subcategory: item.sub,
      shortDescription: item.desc,
      description: item.desc + ' Thoughtfully crafted by master artisans at Crafty Glora. Every detail is shaped with patience, respect for natural materials, and an unwavering commitment to beauty and longevity.',
      price: item.price,
      salePrice: item.sale,
      costPrice: Math.round(item.sale * 0.45),
      discountPercentage: discount,
      stockQuantity: 12 + (prodIndex % 15),
      lowStockThreshold: 3,
      status: 'Active',
      isFeatured: prodIndex % 5 === 0,
      isNewArrival: prodIndex % 4 === 0,
      isBestSeller: prodIndex % 3 === 0,
      isCustomizable: item.custom,
      weight: (250 + (prodIndex * 15) % 600) + 'g',
      dimensions: '15cm x 15cm x 5cm',
      materials: item.mat,
      careInstructions: 'Gently wipe with a soft dry cloth. Avoid harsh chemicals and moisture.',
      deliveryInfo: 'Handcrafted in our studio. Dispatched within 24-48 hours in luxury protective gift packaging.',
      mainImage: img1,
      images: [img1, img2, img3],
      rating: Number((4.7 + ((prodIndex % 4) * 0.1)).toFixed(1)),
      reviewsCount: 15 + (prodIndex % 45),
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-09-25T12:00:00Z'
    });

    prodIndex++;
  });
});

console.log('Final generated products count:', allProducts.length);

const targetFile = path.join(process.cwd(), 'src/lib/db/initialData.ts');
let code = 'import { Category, Product, Coupon, Review } from \'@/types\';\n\n';

code += 'export const INITIAL_CATEGORIES: Category[] = [\n' +
'  {\n' +
'    id: \'cat-1\',\n' +
'    name: \'Home Décor\',\n' +
'    slug: \'home-decor\',\n' +
'    description: \'Artisan handcrafted accents to infuse serenity and warmth into every corner of your living spaces.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 1,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-2\',\n' +
'    name: \'Resin Crafts\',\n' +
'    slug: \'resin-crafts\',\n' +
'    description: \'Crystalline botanical preservation, gilded ocean waves, and luminous epoxy art pieces.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 2,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-3\',\n' +
'    name: \'Personalized Gifts\',\n' +
'    slug: \'personalized-gifts\',\n' +
'    description: \'Custom inscribed keepsakes, bespoke name plaques, and engraved artisanal treasures.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 3,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-4\',\n' +
'    name: \'Wall Art\',\n' +
'    slug: \'wall-art\',\n' +
'    description: \'Textured canvas strokes, botanical macramé tapestries, and hand-painted wall statements.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 4,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-5\',\n' +
'    name: \'Handmade Jewellery\',\n' +
'    slug: \'handmade-jewellery\',\n' +
'    description: \'Wearable art, polymer clay earrings, and delicate natural gemstone adornments.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 5,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-6\',\n' +
'    name: \'Ceramic & Pottery\',\n' +
'    slug: \'ceramic-pottery\',\n' +
'    description: \'Wheel-thrown vases, organic textured planters, and hand-pinched glazed tableware.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 6,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-7\',\n' +
'    name: \'Candle Holders & Aromas\',\n' +
'    slug: \'candle-holders\',\n' +
'    description: \'Botanical wax melts, sculpted terrazzo candle stands, and hand-poured soy candles.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 7,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    id: \'cat-8\',\n' +
'    name: \'Handmade Gifts\',\n' +
'    slug: \'handmade-gifts\',\n' +
'    description: \'Curated gift boxes and heartwarming handmade treasures made to celebrate special moments.\',\n' +
'    imageUrl: \'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop\',\n' +
'    displayOrder: 8,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'];\n\n';

code += 'export const INITIAL_PRODUCTS: Product[] = ' + JSON.stringify(allProducts, null, 2) + ';\n\n';

code += 'export const INITIAL_COUPONS: Coupon[] = [\n' +
'  {\n' +
'    code: \'WELCOME10\',\n' +
'    discountType: \'percentage\',\n' +
'    discountValue: 10,\n' +
'    minimumOrder: 500,\n' +
'    maximumDiscount: 300,\n' +
'    startDate: \'2026-01-01\',\n' +
'    endDate: \'2027-12-31\',\n' +
'    usageLimit: 10000,\n' +
'    usedCount: 142,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    code: \'CRAFTLOVE\',\n' +
'    discountType: \'fixed\',\n' +
'    discountValue: 150,\n' +
'    minimumOrder: 999,\n' +
'    startDate: \'2026-01-01\',\n' +
'    endDate: \'2027-12-31\',\n' +
'    usageLimit: 5000,\n' +
'    usedCount: 88,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'  {\n' +
'    code: \'FESTIVE20\',\n' +
'    discountType: \'percentage\',\n' +
'    discountValue: 20,\n' +
'    minimumOrder: 1999,\n' +
'    maximumDiscount: 800,\n' +
'    startDate: \'2026-01-01\',\n' +
'    endDate: \'2027-12-31\',\n' +
'    usageLimit: 2000,\n' +
'    usedCount: 65,\n' +
'    status: \'Active\',\n' +
'  },\n' +
'];\n\n';

code += 'export const INITIAL_REVIEWS: Review[] = [\n' +
'  {\n' +
'    id: \'rev-01\',\n' +
'    productId: \'prod-001\',\n' +
'    customerName: \'Ananya Sharma\',\n' +
'    rating: 5,\n' +
'    review: \'The resin flower is even more breathtaking in person! The clear clarity and natural flowers look like drops of dew frozen in time. The packaging was so luxurious too.\',\n' +
'    isVerifiedPurchase: true,\n' +
'    status: \'Approved\',\n' +
'    createdAt: \'2026-09-12T14:32:00Z\',\n' +
'  },\n' +
'  {\n' +
'    id: \'rev-02\',\n' +
'    productId: \'prod-001\',\n' +
'    customerName: \'Rohit Verma\',\n' +
'    rating: 5,\n' +
'    review: \'Gifted this to my wife on our 5th anniversary. She was genuinely touched by the craftsmanship. Worth every rupee.\',\n' +
'    isVerifiedPurchase: true,\n' +
'    status: \'Approved\',\n' +
'    createdAt: \'2026-09-18T10:15:00Z\',\n' +
'  },\n' +
'  {\n' +
'    id: \'rev-03\',\n' +
'    productId: \'prod-002\',\n' +
'    customerName: \'Pooja Iyer\',\n' +
'    rating: 5,\n' +
'    review: \'Custom name plaque exceeded all expectations! The wood grain has such depth and the personalized lettering is flawless.\',\n' +
'    isVerifiedPurchase: true,\n' +
'    status: \'Approved\',\n' +
'    createdAt: \'2026-09-20T16:40:00Z\',\n' +
'  },\n' +
'  {\n' +
'    id: \'rev-04\',\n' +
'    productId: \'prod-003\',\n' +
'    customerName: \'Meera Sen\',\n' +
'    rating: 5,\n' +
'    review: \'The macramé feather hanging instantly elevated my living room wall. So bohemian and grounding!\',\n' +
'    isVerifiedPurchase: true,\n' +
'    status: \'Approved\',\n' +
'    createdAt: \'2026-09-15T09:20:00Z\',\n' +
'  },\n' +
'  {\n' +
'    id: \'rev-05\',\n' +
'    productId: \'prod-005\',\n' +
'    customerName: \'Vikram Malhotra\',\n' +
'    rating: 5,\n' +
'    review: \'The gold edges on these resin ocean coasters are so sleek and glamorous. Highly recommend for dining tables.\',\n' +
'    isVerifiedPurchase: true,\n' +
'    status: \'Approved\',\n' +
'    createdAt: \'2026-09-23T11:05:00Z\',\n' +
'  },\n' +
'];\n';

fs.writeFileSync(targetFile, code, 'utf-8');

const dataFile = path.join(__dirname, '.data/craftyglora.json');
if (fs.existsSync(dataFile)) {
  fs.unlinkSync(dataFile);
}

console.log('Successfully updated initialData.ts with 104 authentic handcrafted products!');
