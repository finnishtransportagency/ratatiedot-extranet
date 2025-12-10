/**
 * Converts a BigInt to a number.
 *
 * WARNING: This conversion is safe only if the BigInt value does not exceed
 * Number.MAX_SAFE_INTEGER (2^53 - 1 = 9,007,199,254,740,991).
 *
 * This exists because:
 * - PostgreSQL BIGINT (int8) can store values larger than JS number max.
 * - BigInt values are not serialized in JSON by default.
 * - Accept the risk that values exceeding Number.MAX_SAFE_INTEGER are not precisely represented.
 */
export function bigIntToNumber(value: bigint): number {
  return Number(value);
}
