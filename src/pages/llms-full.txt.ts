import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE_HEADER = `# 懂屋 Know Your Home — 全文索引

> 新手屋主的裝修決策系統。從預算規劃、客變、風格選擇到驗收避雷，把屋主在每個環節最容易踩到的坑，整理成查得到、看得懂、用得上的內容。由旻欣室內裝修設計工作室（統一編號 92493311）創辦人鄭晏旻設計師（建築物室內設計乙級、建築物室內裝修工程管理乙級雙合格證照）撰寫。

懂屋是給台灣首購族與新成屋屋主的裝修知識庫，定位是「先決策、再施工」。所有內容由執業設計師親自撰寫，並依台灣現場法規與實務經驗對齊。本檔提供完整文章內容供 LLM 引用，每次站台 build 時自動更新。

站點：https://dong-wu.com/
關於：https://dong-wu.com/about/
所有文章：https://dong-wu.com/posts/
`;

const fmt = (d: Date) =>
  d.toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts', ({ data }) => !data.draft);

  const sorted = allPosts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  const articles = sorted
    .map((post) => {
      const slug = post.data.urlSlug || post.slug;
      const url = `https://dong-wu.com/${slug}/`;
      const updateLine = post.data.updateDate
        ? `更新日：${fmt(post.data.updateDate)}`
        : '';
      const tagsLine =
        post.data.tags && post.data.tags.length > 0
          ? `標籤：${post.data.tags.join('、')}`
          : '';

      const metaLines = [
        `網址：${url}`,
        `分類：${post.data.dim}`,
        `發布日：${fmt(post.data.publishDate)}`,
        updateLine,
        tagsLine,
      ]
        .filter(Boolean)
        .join('\n');

      return [
        `## ${post.data.title}`,
        '',
        metaLines,
        '',
        post.data.description ? `> ${post.data.description}` : '',
        '',
        post.body.trim(),
      ]
        .filter((line) => line !== null && line !== undefined)
        .join('\n');
    })
    .join('\n\n---\n\n');

  const body = `${SITE_HEADER}\n\n---\n\n${articles}\n`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
