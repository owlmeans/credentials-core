import { MaybeArray } from "../vc";

export const normalizeValue = <Type>(value: MaybeArray<Type>) => {
  return Array.isArray(value) ? value : [value]
}

export const mapValue = async <Type, Res>(
  value: MaybeArray<Type>,
  callback: (value: Type) => Promise<Res>
): Promise<Res[]> => {
  return Promise.all(normalizeValue(value).map(callback))
}