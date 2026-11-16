export type Id = string
/** Rupiah, bilangan bulat. */
export type Money = number
export type StaffRoleName = "admin_kasir" | "owner" | "super_admin"
export type Role = StaffRoleName | "customer" | "barber"
export type IsoDateTime = string
/** Format YYYY-MM-DD dalam WIB. */
export type YmdString = string
/** Format HH:mm. */
export type HhmmString = string

export * from "./entities"
