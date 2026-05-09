import { defineCollection, z } from 'astro:content';

const DIMENSIONS = [
  '格局動線', '收納規劃', '色彩配色', '預算費用',
  '找設計師', '建材選擇', '風格選擇', '採光通風',
  '衛浴設計', '廚房設計', '設備機電', '施工監工',
  '設計溝通', '合約法律', '裝修流程', '結構安全',
  '軟裝搭配', '買房知識',
] as const;

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    slug: z.string().optional(),
    title: z.string(),
    dim: z.enum(DIMENSIONS),
    src: z.string().optional(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).min(1).max(3).optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
  }),
});

export const collections = { posts };
export { DIMENSIONS };
