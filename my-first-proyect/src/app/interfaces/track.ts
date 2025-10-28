export interface Track {
    id: string,
    name: string,
    duration_ms: number,
    href: string,
    artists: {
        id: string,
        name: string
    }[],
    album?: {
        id: string,
        name: string,
        release_date?: string,
        images?: {
            url: string,
            height: number,
            width: number
        }[]
    },
    popularity?: number,
    explicit?: boolean,
    preview_url?: string | null,
    uri?: string,
    external_urls?: {
        spotify: string
    }
}
