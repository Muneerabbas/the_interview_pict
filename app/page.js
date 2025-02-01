import Head from 'next/head';
import styles from './Home.module.scss';
import Link from 'next/link'; // Import Link

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>PICT Interview Experience - Prepare for Your Next Interview</title>
        <meta name="description" content="Get insights into the PICT interview process, tips, and experiences shared by alumni. Prepare effectively for your next interview with our comprehensive guide." />
        <meta name="keywords" content="PICT interview, PICT interview experience, PICT placement, interview tips, PICT alumni" />
        <meta name="author" content="Your Name" />
        <link rel="canonical" href="https://www.yourwebsite.com/pict-interview-experience" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          PICT Interview Experience
        </h1>

        <p className={styles.description}>
          Insights, Tips, and Experiences from PICT Alumni
        </p>

        <div className={styles.grid}>
          <Link href="/home" className={styles.card}> {/* Changed to Link */}
            <h2>Overview &rarr;</h2>
            <p>Get a comprehensive overview of the PICT interview process.</p>
          </Link>

          <Link href="/home" className={styles.card}> {/* Changed to Link */}
            <h2>Interview Tips &rarr;</h2>
            <p>Learn valuable tips to ace your PICT interview.</p>
          </Link>

          <Link href="/home" className={styles.card}> {/* Changed to Link */}
            <h2>Alumni Experiences &rarr;</h2>
            <p>Read real experiences shared by PICT alumni.</p>
          </Link>

          <Link href="/home" className={styles.card}> {/* Changed to Link */}
            <h2>Resources &rarr;</h2>
            <p>Access curated resources to prepare effectively.</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 The Interview PICT Life. All rights reserved.</p>
      </footer>
    </div>
  );
}
