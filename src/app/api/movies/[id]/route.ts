
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const movieId = parseInt(params.id, 10);
        if (isNaN(movieId)) {
            return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
        }

        const movieQuery = `
            SELECT * FROM movies WHERE id = ?
        `;
        const movieResult: any = await query(movieQuery, [movieId]);

        if (movieResult.length === 0) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        
        const movie = movieResult[0];

        const castQuery = `
            SELECT 
                p.id, 
                p.name, 
                mc.character_name,
                p.profile_path
            FROM movie_cast mc
            JOIN people p ON mc.person_id = p.id
            WHERE mc.movie_id = ?
            ORDER BY mc.cast_order ASC
            LIMIT 15;
        `;
        const cast = await query(castQuery, [movieId]);

        const crewQuery = `
            SELECT 
                p.id, 
                p.name, 
                mc.job,
                mc.department,
                p.profile_path
            FROM movie_crew mc
            JOIN people p ON mc.person_id = p.id
            WHERE mc.movie_id = ?
            ORDER BY mc.department, mc.job ASC
            LIMIT 20;
        `;
        const crew = await query(crewQuery, [movieId]);
        
        const videosQuery = `
            SELECT * FROM videos WHERE entity_id = ? AND entity_type = 'movie' ORDER BY published_at DESC;
        `;
        const videos = await query(videosQuery, [movieId]);

        const imagesQuery = `
            SELECT * FROM images WHERE entity_id = ? AND entity_type = 'movie' ORDER BY vote_average DESC;
        `;
        const imagesResult: any = await query(imagesQuery, [movieId]);
        
        const images = {
            backdrops: imagesResult.filter((img: any) => img.image_type === 'backdrop'),
            posters: imagesResult.filter((img: any) => img.image_type === 'poster'),
        };

        const response = {
            ...movie,
            cast,
            crew,
            videos,
            images
        };

        return NextResponse.json({ data: response });

    } catch (error: any) {
        console.error(`API Error fetching movie ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch movie details.', details: error.message }, { status: 500 });
    }
}
