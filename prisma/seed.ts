import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    // Delete existing data to prevent duplicates on re-run
    await prisma.watchProgress.deleteMany({})
    await prisma.favorites.deleteMany({})
    await prisma.episode.deleteMany({})
    await prisma.content.deleteMany({})

    console.log('Cleared existing data.')

    // Create dummy movies
    const movies = await Promise.all([
        prisma.content.create({
            data: {
                type: 'movie',
                title: 'The Silent Echo',
                description: 'In the year 2045, humanity\'s first interstellar transmission receives an answer. But the message isn\'t a greeting—it\'s a warning.',
                posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
                backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
                imdbRating: 8.4,
                genre: 'Sci-Fi,Thriller',
                releaseYear: '2024',
                runtime: 124,
                director: 'Jane Doe',
                cast: 'Actor One,Actor Two,Actor Three',
            }
        }),
        prisma.content.create({
            data: {
                type: 'movie',
                title: 'Desert Winds',
                description: 'A lone drifter must protect a desert settlement from an impending storm and the marauders hiding within it.',
                posterUrl: 'https://images.unsplash.com/photo-1485848395964-6729582d1c68?q=80&w=600&auto=format&fit=crop',
                backdropUrl: 'https://images.unsplash.com/photo-1485848395964-6729582d1c68?q=80&w=2070&auto=format&fit=crop',
                imdbRating: 7.9,
                genre: 'Action,Adventure',
                releaseYear: '2023',
                runtime: 110,
                director: 'John Smith',
                cast: 'Actor Four,Actor Five',
            }
        }),
        prisma.content.create({
            data: {
                type: 'movie',
                title: 'Midnight Walk',
                description: 'A detective with a mysterious past hunts a killer who only strikes during a full moon.',
                posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop',
                backdropUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
                imdbRating: 8.8,
                genre: 'Thriller,Crime',
                releaseYear: '2025',
                runtime: 145,
                director: 'Alice Johnson',
                cast: 'Actor Six,Actor Seven',
            }
        }),
        prisma.content.create({
            data: {
                type: 'movie',
                title: 'Beyond the Stars',
                description: 'A captivating documentary exploring the edges of our known universe and the pioneers who want to take us there.',
                posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop',
                backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2070&auto=format&fit=crop',
                imdbRating: 9.1,
                genre: 'Documentary,Space',
                releaseYear: '2024',
                runtime: 95,
            }
        }),
        prisma.content.create({
            data: {
                type: 'movie',
                title: 'City Lights',
                description: 'Two struggling artists find love and inspiration in the bustling heart of a metropolis.',
                posterUrl: 'https://images.unsplash.com/photo-1518672051939-2a953e5eafcf?q=80&w=600&auto=format&fit=crop',
                backdropUrl: 'https://images.unsplash.com/photo-1518672051939-2a953e5eafcf?q=80&w=2070&auto=format&fit=crop',
                imdbRating: 7.5,
                genre: 'Romance,Drama',
                releaseYear: '2023',
                runtime: 105,
            }
        })
    ])

    console.log(`Created ${movies.length} movies.`)

    // Create Podcasts (Series type)
    const podcastSeries = await prisma.content.create({
        data: {
            type: 'series',
            title: 'Finjan Podcast',
            titleAr: 'بودكاست فنجان',
            description: 'The most popular Arabic podcast featuring in-depth conversations on tech, culture, and startups.',
            posterUrl: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=600&auto=format&fit=crop',
            backdropUrl: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=2070&auto=format&fit=crop',
            imdbRating: 9.6,
            genre: 'Podcast,Talk Show',
            releaseYear: '2025',
            language: 'ar',
            episodes: {
                create: [
                    {
                        seasonNumber: 1,
                        episodeNumber: 105,
                        title: 'The Future of AI',
                        description: 'Discussing how AI will shape our future with industry leaders.',
                        duration: 85 * 60, // 85 mins
                        thumbnailUrl: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=600&auto=format&fit=crop',
                        videoUrl: 'https://cdn.plyr.io/static/blank.mp4' // Dummy playback URL
                    },
                    {
                        seasonNumber: 1,
                        episodeNumber: 104,
                        title: 'Startup Lessons',
                        description: 'Lessons learned from building million-dollar startups from scratch.',
                        duration: 110 * 60, // 110 mins
                        thumbnailUrl: 'https://images.unsplash.com/photo-1581333104612-4017647240a5?q=80&w=600&auto=format&fit=crop',
                        videoUrl: 'https://cdn.plyr.io/static/blank.mp4'
                    }
                ]
            }
        }
    })

    console.log(`Created Series: ${podcastSeries.title} with 2 episodes.`)

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
