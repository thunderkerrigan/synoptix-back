import { model } from 'mongoose'
import { IWordDocument, IWordModel } from './Word.types'
import WordSchema from './Word.schema'

export const WordModel = model<IWordDocument, IWordModel>('Word', WordSchema)
