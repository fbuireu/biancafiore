import type { BaseDTO } from '@shared/application/dto/baseDTO.ts';
import { groupBy } from './utils/groupBy';
import type { ArticleDTO } from '@application/dto/article/articleDTO.ts';
import { slugify } from '@shared/ui/utils/slugify';

export enum TagType {
  TAG = 'tag',
  AUTHOR = 'author'
}

export interface TagDTOItem {
  name: string;
  type: TagType;
  count: number
}

export type TagDTO = Record<string, TagDTOItem[]>;

export const tagDTO: BaseDTO<ArticleDTO[], TagDTO> = {
  render: (raw: ArticleDTO[]): TagDTO => {
    const tags: TagDTOItem[] = raw.flatMap(article => ([
      ...article.data.tags.map((tag: string) => ({ name: tag, type: 'tag' })),
      { name: slugify(article.data.author.data.name), type: 'author' }
    ]));

    const uniqueTags: TagDTOItem[] = [...new Set(tags.map(tag => tag.name))].map(name => {
      const type = tags.find(tag => tag.name === name)?.type ?? TagType.TAG;
      const count = tags.filter(tag => tag.name === name).length;

      return { name, type, count };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    return groupBy(uniqueTags, item => item.name.charAt(0).toUpperCase());
  },
};