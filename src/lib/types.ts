export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Forklift {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  short_description: string;
  image_url: string | null;
  catalog_pdf_url: string | null;
  available_for_sale: boolean;
  available_for_rental: boolean;
  available_as_used: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ForkliftSpec {
  id: string;
  forklift_id: string;
  spec_name: string;
  spec_value: string;
  spec_unit: string | null;
  sort_order: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  forklift_id: string | null;
  is_read: boolean;
  created_at: string;
  forklift?: Pick<Forklift, 'id' | 'name' | 'slug'>;
}
