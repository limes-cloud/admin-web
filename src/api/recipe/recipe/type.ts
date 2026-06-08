export interface RecipeClassify {
  id: number
  parentId: number
  name: string
  logo: string
  createdAt: number
  updatedAt: number
  children: RecipeClassify[]
}

export interface ListRecipeClassifyReply {
  list: RecipeClassify[]
}

export interface ListRecipeClassifyRequest {
  name?: string
}

export interface CreateRecipeClassifyRequest {
  name: string
  logo: string
}

export interface CreateRecipeClassifyReply {
  id: number
}

export interface UpdateRecipeClassifyRequest {
  id: number
  name: string
  logo: string
}

export interface DeleteRecipeClassifyRequest {
  id: number
}

export interface DeleteRecipeClassifyReply {
  total: number
}

export interface GetRecipeRequest {
  id: number
}

export interface GetRecipeReply {
  id: number
  classifyId: number
  name: string
  image: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
}

export interface ListRecipeRequest {
  page: number
  pageSize: number
  classifyId?: number
  name?: string
}

export interface Recipe {
  id: number
  classifyIds: number[]
  name: string
  images: string
  imageArr: string[]
  description: string
  guideArr: string[]
  guide: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
  classify: RecipeClassify
}

export interface ListRecipeReply {
  total: number
  list: Recipe[]
}

export interface CreateRecipeRequest {
  classifyIds: number[]
  name: string
  images: string
  description: string
  guide: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
}

export interface CreateRecipeReply {
  id: number
}

export interface UpdateRecipeRequest {
  id: number
  classifyIds?: number[]
  name?: string
  images?: string
  description?: string
  guide?: string
  extra?: string
  extraObject?: any
  createdAt?: number
  updatedAt?: number
}

export interface DeleteRecipeRequest {
  id: number
}
