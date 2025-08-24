
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// --- IMPORTANT ---
// Database connection details are read from environment variables
// for security. Create a `.env.local` file in your project root
// and add your credentials there.
// See `.env.local.example` for a template.
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASSWORD || 'admin',
    database: process.env.MYSQL_DATABASE || 'tmdb_movies_db'
};

async function safeQuery(connection: mysql.Connection, sql: string, values: any[]) {
    try {
        const [results] = await connection.execute(sql, values);
        return results;
    } catch (error) {
        console.error("Database query failed:", error);
        // In a real app, you'd have more robust error handling
        return null; 
    }
}

async function ingestPeople(connection: mysql.Connection, people: any[]) {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const person of people) {
        const personSql = `
            INSERT INTO people (id, name, gender, popularity, profile_path, adult, known_for_department)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            popularity = VALUES(popularity),
            profile_path = VALUES(profile_path),
            adult = VALUES(adult),
            known_for_department = VALUES(known_for_department);
        `;
        // Use known_for_department from the main person object, fallback to department from credits
        const department = person.known_for_department || person.department;
        const personValues = [person.id, person.name, person.gender, person.popularity, person.profile_path, person.adult, department];
        const result: any = await safeQuery(connection, personSql, personValues);
        if (result?.affectedRows) {
            // MySQL returns 1 for INSERT, 2 for UPDATE on ON DUPLICATE KEY UPDATE
            if (result.affectedRows === 1) insertedCount++;
            if (result.affectedRows === 2) updatedCount++;
        }
    }
    return { insertedCount, updatedCount };
}


export async function POST(request: Request) {
    let connection: mysql.Connection | null = null;
    try {
        if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
            throw new Error("Database credentials are not configured. Please check your environment variables.");
        }

        const { type, data } = await request.json();
        
        connection = await mysql.createConnection(dbConfig);

        let insertedCount = 0;
        let updatedCount = 0;
        let relatedInsertedCount = 0;
        let relatedUpdatedCount = 0;

        if (type === 'movies') {
            for (const movie of data) {
                 // 1. Ingest People (Cast & Crew) first
                const people = [...(movie.credits?.cast ?? []), ...(movie.credits?.crew ?? [])];
                const peopleResult = await ingestPeople(connection, people);
                relatedInsertedCount += peopleResult.insertedCount;
                relatedUpdatedCount += peopleResult.updatedCount;

                // 2. Ingest Movie
                const movieSql = `
                    INSERT INTO movies (id, title, overview, release_date, popularity, vote_average, vote_count, poster_path, backdrop_path, adult, original_language)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    overview = VALUES(overview),
                    release_date = VALUES(release_date),
                    popularity = VALUES(popularity),
                    vote_average = VALUES(vote_average),
                    vote_count = VALUES(vote_count),
                    poster_path = VALUES(poster_path),
                    backdrop_path = VALUES(backdrop_path);
                `;
                const movieValues = [movie.id, movie.title, movie.overview, movie.release_date, movie.popularity, movie.vote_average, movie.vote_count, movie.poster_path, movie.backdrop_path, movie.adult, movie.original_language];
                const movieResult: any = await safeQuery(connection, movieSql, movieValues);
                 if (movieResult?.affectedRows) {
                    if (movieResult.affectedRows === 1) insertedCount++;
                    if (movieResult.affectedRows === 2) updatedCount++;
                }

                // 3. Link Cast & Crew
                for (const castMember of movie.credits?.cast ?? []) {
                    const castSql = `INSERT IGNORE INTO movie_cast (movie_id, person_id, character_name, cast_order) VALUES (?, ?, ?, ?);`;
                    await safeQuery(connection, castSql, [movie.id, castMember.id, castMember.character, castMember.order]);
                }
                 for (const crewMember of movie.credits?.crew ?? []) {
                    const crewSql = `INSERT IGNORE INTO movie_crew (movie_id, person_id, job, department) VALUES (?, ?, ?, ?);`;
                    await safeQuery(connection, crewSql, [movie.id, crewMember.id, crewMember.job, crewMember.department]);
                }
            }
        } else if (type === 'tv_shows') {
            for (const show of data) {
                // 1. Ingest People from TV show credits
                const people = [...(show.credits?.cast ?? []), ...(show.credits?.crew ?? [])];
                const peopleResult = await ingestPeople(connection, people);
                relatedInsertedCount += peopleResult.insertedCount;
                relatedUpdatedCount += peopleResult.updatedCount;

                // 2. Ingest TV Show
                 const sql = `
                    INSERT INTO tv_shows (id, name, overview, first_air_date, popularity, vote_average, vote_count, poster_path, backdrop_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    overview = VALUES(overview),
                    first_air_date = VALUES(first_air_date),
                    popularity = VALUES(popularity),
                    vote_average = VALUES(vote_average),
                    vote_count = VALUES(vote_count),
                    poster_path = VALUES(poster_path),
                    backdrop_path = VALUES(backdrop_path);
                `;
                const values = [show.id, show.name, show.overview, show.first_air_date, show.popularity, show.vote_average, show.vote_count, show.poster_path, show.backdrop_path];
                const result: any = await safeQuery(connection, sql, values);
                 if (result?.affectedRows > 0) {
                    if (result.affectedRows === 1) insertedCount++;
                    if (result.affectedRows === 2) updatedCount++;
                }

                // 3. Link TV Cast & Crew
                for (const castMember of show.credits?.cast ?? []) {
                    const castSql = `INSERT IGNORE INTO tv_show_cast (tv_show_id, person_id, character_name, cast_order) VALUES (?, ?, ?, ?);`;
                    await safeQuery(connection, castSql, [show.id, castMember.id, castMember.character, castMember.order]);
                }
                for (const crewMember of show.credits?.crew ?? []) {
                    const crewSql = `INSERT IGNORE INTO tv_show_crew (tv_show_id, person_id, job, department) VALUES (?, ?, ?, ?);`;
                    await safeQuery(connection, crewSql, [show.id, crewMember.id, crewMember.job, crewMember.department]);
                }
            }
        } else if (type === 'people') {
             const peopleResult = await ingestPeople(connection, data);
             insertedCount = peopleResult.insertedCount;
             updatedCount = peopleResult.updatedCount;
        } else {
            return NextResponse.json({ error: 'Invalid ingestion type' }, { status: 400 });
        }

        await connection.end();
        
        let message = `Ingestion successful for ${type}. Inserted: ${insertedCount}, Updated: ${updatedCount}.`;
        if(relatedInsertedCount > 0 || relatedUpdatedCount > 0) {
            message += ` Related People Records - Inserted: ${relatedInsertedCount}, Updated: ${relatedUpdatedCount}.`
        }

        return NextResponse.json({ 
            message: message
        });

    } catch (error: any) {
        if (connection) await connection.end();
        console.error('Ingestion Error:', error);
        return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
