import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    // Delete existing data
    await prisma.watchHistory.deleteMany({})
    await prisma.watchlist.deleteMany({})
    await prisma.episode.deleteMany({})
    await prisma.season.deleteMany({})
    await prisma.show.deleteMany({})
    await prisma.movie.deleteMany({})
    await prisma.subscription.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('Cleared existing data.')

    // Create dummy movies
    const movies = await Promise.all([
        prisma.movie.create({
            data: {
                title: 'The Silent Echo',
                description: 'In the year 2045, humanity\'s first interstellar transmission receives an answer.',
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
                backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
                genre: 'Sci-Fi,Thriller',
                releaseYear: '2024',
                duration: 124,
            }
        }),
        prisma.movie.create({
            data: {
                title: 'Desert Winds',
                description: 'A lone drifter must protect a desert settlement.',
                poster: 'https://images.unsplash.com/photo-1485848395964-6729582d1c68?q=80&w=600&auto=format&fit=crop',
                backdrop: 'https://images.unsplash.com/photo-1485848395964-6729582d1c68?q=80&w=2070&auto=format&fit=crop',
                genre: 'Action,Adventure',
                releaseYear: '2023',
                duration: 110,
            }
        })
    ])

    console.log(`Created ${movies.length} movies.`)

    // Create a Show with a Season and Episodes
    const podcastShow = await prisma.show.create({
        data: {
            title: 'Finjan Podcast',
            description: 'The most popular Arabic podcast.',
            poster: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=600&auto=format&fit=crop',
            backdrop: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=2070&auto=format&fit=crop',
            genre: 'Podcast,Talk Show',
            releaseYear: '2025',
            seasons: {
                create: [
                    {
                        seasonNumber: 1,
                        episodes: {
                            create: [
                                {
                                    episodeNumber: 1,
                                    title: 'The Future of AI',
                                    description: 'Discussing AI with industry leaders.',
                                    duration: 85,
                                    thumbnail: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?q=80&w=600&auto=format&fit=crop',
                                    streamUrl: 'https://cdn.plyr.io/static/blank.mp4'
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    console.log(`Created Show: ${podcastShow.title} with 1 season.`)
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
