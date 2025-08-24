
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const tvShows = await query(`
            SELECT 
                id, 
                name, 
                overview, 
                first_air_date, 
                poster_path, 
                vote_average 
            FROM tv_shows 
            ORDER BY popularity DESC 
            LIMIT 20
        `);

        return NextResponse.json({ data: tvShows });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tv shows.', details: error.message }, { status: 500 });
    }
}
