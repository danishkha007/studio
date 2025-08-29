
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const PAGE_SIZE = 40;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const offset = (page - 1) * PAGE_SIZE;

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
            LIMIT ?
            OFFSET ?
        `, [PAGE_SIZE, offset]);

        return NextResponse.json({ data: tvShows });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tv shows.', details: error.message }, { status: 500 });
    }
}

    