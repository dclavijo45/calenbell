export interface RecoveryAccount {
    recovered: boolean,
    token: string
}

export interface RecoveryAttempt {
    recovering: boolean,
    token: string
}

export interface RecoveredStatus {
    recovered: boolean
}
