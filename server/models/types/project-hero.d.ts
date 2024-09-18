import type { ObjectId } from 'mongoose'

export interface ProjectHero {
  product: ObjectId
  image: string
  title: string
  subtitle: string
  createdAt: Date
}
