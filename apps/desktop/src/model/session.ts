export type Session = {
    id: string
    user_id: string
    clinet_id: string
    status: "active" | "revoked" | "ended" | "expired" | "removed" | "abandoned" | "replaced"
    last_active_at: number
    expire_at: number
    abandon_at: number
    updated_at: number
    created_at: number
}