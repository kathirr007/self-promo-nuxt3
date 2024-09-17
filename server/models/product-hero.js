import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productHeroSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  image: String,
  title: String,
  subtitle: String,
  createdAt: { type: Date, default: Date.now },
})

const ProductHeroModel = mongoose.model('ProductHero', productHeroSchema)

export default { ProductHeroModel }
