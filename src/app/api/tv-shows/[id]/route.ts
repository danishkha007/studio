
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const showId = parseInt(params.id, 10);
        if (isNaN(showId)) {
            return NextResponse.json({ error: 'Invalid TV show ID' }, { status: 400 });
        }

        const showQuery = `
            SELECT * FROM tv_shows WHERE id = ?
        `;
        const showResult: any = await query(showQuery, [showId]);

        if (showResult.length === 0) {
            return NextResponse.json({ error: 'TV Show not found' }, { status: 404 });
        }
        
        const show = showResult[0];

        const castQuery = `
            SELECT 
                p.id, 
                p.name, 
                tc.character_name
            FROM tv_show_cast tc
            JOIN people p ON tc.person_id = p.id
            WHERE tc.tv_show_id = ?
            ORDER BY tc.cast_order ASC
            LIMIT 15;
        `;
        const cast = await query(castQuery, [showId]);

        const crewQuery = `
            SELECT 
                p.id, 
                p.name, 
                tc.job,
                tc.department
            FROM tv_show_crew tc
            JOIN people p ON tc.person_id = p.id
            WHERE tc.tv_show_id = ?
            ORDER BY tc.department, tc.job ASC
            LIMIT 20;
        `;
        const crew = await query(crewQuery, [showId]);
        
        const response = {
            ...show,
            cast,
            crew
        };

        return NextResponse.json({ data: response });

    } catch (error: any) {
        console.error(`API Error fetching TV show ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch TV show details.', details: error.message }, { status: 500 });
    }
}
