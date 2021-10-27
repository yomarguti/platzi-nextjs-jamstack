import { getCategoryList, getPlant, getPlantList } from '@api'
import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next'

import { Grid } from '@ui/Grid'
import { RichText } from '@components/RichText'
import { AuthorCard } from '@components/AuthorCard'
import { Layout } from '@components/Layout'
import { Typography } from '@ui/Typography'
import { PlantEntryInline } from '@components/PlantCollection'
import Link from 'next/link'

type PlanEntryProps = {
  plant: Plant | null
  otherEntries: Plant[] | null
  categories: Category[] | null
}

type PathType = {
  params: {
    slug: string
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getPlantList({ limit: 10 })
  const paths: PathType[] = entries.map((plant) => ({
    params: { slug: plant.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<PlanEntryProps> = async ({
  params,
}) => {
  const slug = params?.slug
  if (typeof slug !== 'string') {
    return {
      notFound: true,
    }
  }
  try {
    const plant = await getPlant(slug)
    //Sidebar
    const otherEntries = await getPlantList({ limit: 5 })
    const categories = await getCategoryList({ limit: 10 })
    return {
      props: {
        plant,
        otherEntries,
        categories,
      },
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}

export default function PlanEntryPage({
  plant,
  otherEntries,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (plant == null) {
    return (
      <Layout>
        <main>An error ocurred! =(</main>
      </Layout>
    )
  }

  return (
    <Layout>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={9} component="article">
          <figure>
            <img width={952} src={plant.image.url} alt={plant.image.title} />
          </figure>
          <div className="px-12 pt-8">
            <Typography>{plant.plantName}</Typography>
          </div>
          <div className="p-10">
            <RichText richText={plant.description} />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3} component="aside">
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              Recent Posts
            </Typography>
            {otherEntries?.map((plantEntry) => {
              return (
                <article className="mb-4" key={plantEntry.id}>
                  <PlantEntryInline {...plantEntry} />
                </article>
              )
            })}
          </section>
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              Categories
            </Typography>
            {categories?.map((category) => {
              return (
                <li key={category.id}>
                  <Link passHref href={`/category/${category.slug}`}>
                    <Typography variant="h6" component="a">
                      {category.title}
                    </Typography>
                  </Link>
                </li>
              )
            })}
          </section>
        </Grid>
      </Grid>
      <section className="pt-12 my-4 border-t-2 border-b-2 border-gray-200 pb-7">
        <AuthorCard {...plant.author} />
      </section>
    </Layout>
  )
}
