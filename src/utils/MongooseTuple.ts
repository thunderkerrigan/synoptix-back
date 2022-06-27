import { AnyObject, SchemaType } from 'mongoose'
import { type } from 'os'

export const TupleValidation = (candidateTuple: unknown): boolean => {
    if (
        Array.isArray(candidateTuple) &&
        candidateTuple.length === 2 &&
        typeof candidateTuple[0] === 'string' &&
        typeof candidateTuple[1] === 'string'
    ) {
        return true
    }
    return false
}
