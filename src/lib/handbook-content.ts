import type { HandbookToc, TocItem } from '@/types/handbook';
import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

type MdxFrontmatter = {
  title: string;
  section?: string;
  subsection?: string;
  category?: string;
  order?: number;
  status?: string;
  [key: string]: any;
};

function getContentDirectory(): string {
  return path.join(process.cwd(), 'content', 'handbook');
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseMdxFile(filePath: string): { frontmatter: MdxFrontmatter; relativePath: string } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    const contentDir = getContentDirectory();
    const relativePath = path.relative(contentDir, filePath);

    return {
      frontmatter: data as MdxFrontmatter,
      relativePath: relativePath.replace(/\\/g, '/').replace('.mdx', ''),
    };
  } catch (error) {
    console.error(`Error parsing MDX file ${filePath}:`, error);
    return null;
  }
}

function buildHref(locale: string, relativePath: string): string {
  return `/${locale}/handbook/${relativePath}`;
}

function organizeContentByHandbook(mdxData: Array<{ frontmatter: MdxFrontmatter; relativePath: string }>): HandbookToc {
  const handbooks: HandbookToc = {};

  for (const { frontmatter, relativePath } of mdxData) {
    const pathParts = relativePath.split('/');
    const handbookType = pathParts[0];

    if (!handbooks[handbookType]) {
      handbooks[handbookType] = {
        title: formatHandbookTitle(handbookType),
        items: [],
      };
    }

    const item: TocItem = {
      title: frontmatter.title,
      href: buildHref('en', relativePath),
      items: [],
      order: frontmatter.order || 999,
      category: frontmatter.category || frontmatter.section,
      section: frontmatter.section,
      subsection: frontmatter.subsection,
    };

    if (pathParts.length === 1) {
      handbooks[handbookType].items.push(item);
    } else {
      const sectionName = pathParts[1];
      let section = handbooks[handbookType].items.find(s => s.category === sectionName);

      if (!section) {
        section = {
          title: formatSectionTitle(sectionName),
          href: buildHref('en', `${handbookType}/${sectionName}`),
          items: [],
          order: 0,
          category: sectionName,
        };
        handbooks[handbookType].items.push(section);
      }

      if (pathParts.length === 2) {
        section.items.push(item);
      } else {
        const subsectionName = pathParts[2];
        let subsection = section.items.find(s => s.category === subsectionName);

        if (!subsection) {
          subsection = {
            title: formatSectionTitle(subsectionName),
            href: buildHref('en', `${handbookType}/${sectionName}/${subsectionName}`),
            items: [],
            order: 0,
            category: subsectionName,
          };
          section.items.push(subsection);
        }

        subsection.items.push(item);
      }
    }
  }

  for (const handbook of Object.values(handbooks)) {
    sortTocItems(handbook.items);
  }

  return handbooks;
}

function sortTocItems(items: TocItem[]): void {
  items.sort((a, b) => (a.order || 999) - (b.order || 999));

  for (const item of items) {
    if (item.items.length > 0) {
      sortTocItems(item.items);
    }
  }
}

function formatHandbookTitle(handbookType: string): string {
  return handbookType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatSectionTitle(sectionName: string): string {
  return sectionName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateHandbookToc(): Promise<HandbookToc> {
  const contentDir = getContentDirectory();
  const mdxFiles = getAllMdxFiles(contentDir);

  const mdxData = mdxFiles
    .map(parseMdxFile)
    .filter((data): data is NonNullable<typeof data> => data !== null)
    .filter(({ frontmatter }) => frontmatter.status !== 'draft');

  return organizeContentByHandbook(mdxData);
}

export function getHandbookTypeFromPath(pathname: string): string | null {
  const match = pathname.match(/\/handbook\/([^/]+)/);
  return match ? match[1] : null;
}

export type { HandbookToc, TocItem };
