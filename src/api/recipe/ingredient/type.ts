export interface IngredientClassify {
  id: number
  name: string
  logo: string
  createdAt: number
  updatedAt: number
}

export interface ListIngredientClassifyReply {
  total: number
  list: IngredientClassify[]
}

export interface ListIngredientClassifyRequest {
  page: number
  pageSize: number
  name?: string
}

export interface CreateIngredientClassifyRequest {
  name: string
  logo: string
}

export interface CreateIngredientClassifyReply {
  id: number
}

export interface UpdateIngredientClassifyRequest {
  id: number
  name: string
  logo: string
}

export interface DeleteIngredientClassifyRequest {
  id: number
}

export interface DeleteIngredientClassifyReply {
  total: number
}

export interface GetIngredientRequest {
  id: number
}

export interface GetIngredientReply {
  id: number
  classifyId: number
  name: string
  image: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
}

export interface ListIngredientRequest {
  page: number
  pageSize: number
  classifyId?: number
  name?: string
}

export interface Ingredient {
  id: number
  classifyId: number
  name: string
  image: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
  classify: IngredientClassify
}

export interface ListIngredientReply {
  total: number
  list: Ingredient[]
}

export interface CreateIngredientRequest {
  classifyId: number
  name: string
  image: string
  extra: string
  extraObject: any
  createdAt: number
  updatedAt: number
}

export interface CreateIngredientReply {
  id: number
}

export interface UpdateIngredientRequest {
  id: number
  classifyId?: number
  name?: string
  image?: string
  extra?: string
  extraObject?: any
  createdAt?: number
  updatedAt?: number
}

export interface DeleteIngredientRequest {
  id: number
}
