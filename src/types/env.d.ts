declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY?: string
      NODE_ENV: 'development' | 'production' | 'test'
      OPENAI_API_KEY?: string
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string
      SABRE_CLIENT_ID?: string
      SABRE_CLIENT_SECRET?: string
      SABRE_BASE_URL?: string
      SABRE_AUTH_PATH?: string
      SABRE_API_VERSION?: string
      SABRE_DEBUG?: string
      SABRE_DEBUG_PLAINTEXT?: string
      BACK_OFFIECE_SECRET_KEY?: string
      NEXT_PUBLIC_BASE_URL?: string
    }
  }
}

export {}
