export interface CategoryInput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  projectUrl?: string;
  children?: CategoryInput[];
}

export interface CategoryNode extends Omit<CategoryInput, "children"> {
  parentId: string | null;
  childIds: string[];
  depth: number;
  path: string;
}

export interface CategoryIndex {
  roots: string[];
  byId: Map<string, CategoryNode>;
  byPath: Map<string, CategoryNode>;
}
