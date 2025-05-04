export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date: string;
    genre_ids?: number[];
    genres?: Genre[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface MoviesResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}
