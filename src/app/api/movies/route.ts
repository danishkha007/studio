import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const movies = await query(`
            SELECT 
                id, 
                title, 
                overview, 
                release_date, 
                poster_path, 
                vote_average 
            FROM movies 
            ORDER BY popularity DESC 
            LIMIT 20
        `);

        return NextResponse.json({ data: movies });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch movies.', details: error.message }, { status: 500 });
    }
}
