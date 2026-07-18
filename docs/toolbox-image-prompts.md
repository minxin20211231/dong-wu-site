# 懂屋裝修工具箱｜生圖 Prompt 與尺寸規格

> 用途：`/toolbox/`、`/inventory-worksheet/`、`/budget-kit/` 的正式靜態視覺。  
> 管線：Bibo 執行生圖與挑圖；前端只接 WebP。  
> 參考圖：生成時一併附上 `character_resource.png`、`character_intuitive.png`、`character_planner.png`，鯨魚圖另附 `懂屋-Logo圖形-金.png`。

## 共用視覺前綴

每張 prompt 都先放這段：

```text
Premium C4D-style 3D chibi product scene from the same visual universe as the supplied Dong-Wu homeowner character references. Matte soft vinyl skin and objects, smooth rounded edges, finely knitted fabric texture on clothing, warm studio lighting, shallow depth of field, soft beige and milk-tea set, caramel-orange accents, dark coffee-brown details. Friendly, calm, professional, Taiwanese home-renovation context. Clean commercial art direction, generous negative space for website UI copy.

STRICTLY FORBIDDEN: NO polymer clay, NO plasticine, NO rough clay grain, NO handmade clay fingerprints, NO glossy toy plastic, NO mint green, NO pastel pink, NO lavender purple, NO rainbow palette, NO pure black background, NO neon, NO embedded text, NO letters, NO numbers, NO watermark, NO UI screenshot, NO distorted hands, NO extra fingers.
```

## 1. 工具箱 Hero 開箱場景

- 檔名：`toolbox-hero.webp`
- 原始輸出：1600 × 1200 px，4:3
- 前端裁切：桌機 `object-position: 50% 48%`；手機優先保留人物臉與打開的工具箱
- 建議品質：WebP quality 80–84，目標 220 KB 以下

```text
[共用視覺前綴]

Three supplied Dong-Wu chibi homeowner characters gathered around one open matte soft-vinyl renovation toolbox on a warm studio tabletop. The open toolbox contains three clear symbolic objects: a small diagnostic card deck, a tidy stack of daily email envelopes with a budget worksheet attachment, and a storage-inventory clipboard. One character points at the tools, one holds an envelope and worksheet, one checks the clipboard. Soft rounded toolbox, caramel-orange body, milk-tea handle, subtle gold whale-shaped detail without text. Layered beige studio set, gentle spotlight, clean foreground, balanced triangular composition. Leave calm negative space on the left for the website headline. All tools must look physically supported and correctly scaled.
```

## 2. 工具卡｜AI 裝修診斷書

- 檔名：`tool-card-diagnosis.webp`
- 原始輸出：1200 × 900 px，4:3
- 建議品質：WebP quality 80–84，目標 160 KB 以下

```text
[共用視覺前綴]

The five supplied Dong-Wu homeowner chibi characters arranged like a small team portrait around one thick rounded diagnostic report card. The central character holds the report toward camera; the other four react with calm curiosity. Use abstract charts, color blocks and check marks only, with absolutely no readable text. Warm beige studio room, soft vinyl card edges, knitted clothing details, caramel-orange accent tab, shallow depth of field. Keep the lower-right quarter visually quiet for a CTA overlay.
```

## 3. 工具卡｜裝修該花多少錢？信件課

- 檔名：`tool-card-budget.webp`
- 原始輸出：1200 × 900 px，4:3
- 建議品質：WebP quality 80–84，目標 160 KB 以下

```text
[共用視覺前綴]

The supplied planner-type Dong-Wu chibi character at a small warm-beige desk, opening the first lesson of a twelve-day renovation-cost email course. Show a tidy physical sequence of twelve rounded email envelopes or lesson cards flowing from a small mailbox tray, with one budget worksheet attachment and a tiny calculator beside the first card. Use abstract lines, grids and check marks only, no readable text and no visible numbers. Clear hierarchy: the first lesson and worksheet in front, the remaining daily envelopes arranged behind as a calm progression. Warm studio light, milk-tea backdrop, caramel-orange tabs, clean floor and tabletop, no floating unsupported objects.
```

## 4. 工具卡｜裝修前物品盤點工作表

- 檔名：`tool-card-inventory.webp`
- 原始輸出：1200 × 900 px，4:3
- 建議品質：WebP quality 80–84，目標 160 KB 以下

```text
[共用視覺前綴]

The supplied intuitive-type Dong-Wu chibi character using a large rounded inventory clipboard beside neatly grouped household objects: shoes, a suitcase, folded clothes, a compact appliance, cleaning supplies and one storage basket. The character checks one box on the clipboard. Use abstract rows and check marks only, no readable text. Every object rests on the tabletop or floor with believable scale. No full wardrobe scene is needed. Warm beige studio, milk-tea and caramel-orange palette, knitted clothing texture, soft vinyl props, shallow depth of field.
```

## 5. 15 站裝修導航鳥瞰圖＋鯨魚

- 檔名：`toolbox-route-map.webp`
- 原始輸出：1600 × 1200 px，4:3
- 建議品質：WebP quality 80–84，目標 240 KB 以下

```text
[共用視覺前綴]

Top-down three-quarter bird's-eye miniature diorama of a renovation journey, built entirely as premium matte soft-vinyl miniatures. One clearly readable S-shaped route with exactly 15 round station markers, grouped visually into four phases: planning before contract, construction, inspection, move-in. Use environmental cues instead of words: documents and calculator, construction tools and safety helmet, inspection flashlight and checklist, sofa and moving boxes. A friendly soft-vinyl humpback-whale guide follows the route near the final third. Warm beige terrain, milk-tea buildings, caramel-orange route, dark coffee-brown line details. Keep all 15 markers separated and visible. No text or numbers inside the image; the website will overlay labels.
```

## 6. 軟膠版品牌鯨魚（獨立透明素材）

- 檔名：`toolbox-whale.webp`
- 原始輸出：1200 × 1200 px，1:1，透明背景
- 建議品質：WebP lossless 或 quality 90，目標 220 KB 以下

```text
[共用視覺前綴]

Use the supplied Dong-Wu gold whale logo as the silhouette reference. Turn the abstract humpback-whale mark into one friendly 3D chibi guide mascot made of matte soft vinyl. Preserve the logo's elegant arched back and flowing fin rhythm while giving it a simple rounded face, tiny warm eyes and a calm smile. Deep coffee-brown body with subtle whale-gold edge highlights and one small caramel-orange accent. Three-quarter view, floating gently, centered, isolated transparent background, complete body fully inside frame.

STRICTLY FORBIDDEN: NO realistic whale skin, NO ocean background, NO water splash, NO blue palette, NO extra fins, NO logo text, NO badge, NO pedestal, NO drop shadow outside the canvas.
```

## 7. 軟裝圖鑑預告圖

- 檔名：`soft-furnishing-atlas.webp`
- 原始輸出：1200 × 900 px，4:3
- 建議品質：WebP quality 80–84，目標 170 KB 以下

```text
[共用視覺前綴]

An open thick interior-style atlas book resting on a warm studio tabletop. Four small soft-vinyl Taiwanese living-room scenes rise from the pages like a premium pop-up book: Scandinavian, warm cream, Japanese MUJI-inspired, and modern minimalist. Keep every room compact and believable for a Taiwanese apartment, with modest ceiling height, single-side daylight, visible window frames and correctly scaled furniture. A friendly supplied Dong-Wu soft-vinyl whale mascot rests on the book edge as if turning a page. Include small abstract material and color swatches beside each scene, with no readable text. Warm beige, milk-tea and caramel-orange palette, shallow depth of field, clean commercial composition, generous quiet area for an HTML label.

STRICTLY FORBIDDEN: NO luxury mansion scale, NO double-height ceiling, NO foreign oversized windows, NO wall artwork with fake text, NO kitchen, NO wardrobe, NO bathroom, NO readable labels, NO floating furniture.
```

## 驗收與輸出

1. 人物要與五型人物卡放在一起不違和：大頭身、大眼、霧面軟膠、衣服有針織細節。
2. 不接受黏土顆粒、指紋質感、亮面塑膠玩具感。
3. 不接受薄荷綠、粉紅、薰衣草紫或純黑背景。
4. 圖內不放文字；標題、數字、CTA 都由 HTML 疊上。
5. 鳥瞰圖必須能數到 15 個站點；少站、多站或重疊都退回重生。
6. 圖鑑預告的四個客廳要看得出風格差異，但不能變成四套外國豪宅。
7. 最終只放 WebP 到 `public/toolbox/assets/`，保留原始圖到專案 `_archive/`，不要另建 backup/temp 變體資料夾。
