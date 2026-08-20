/**
 * Vercel Serverless Function: Content API Endpoint
 * Path: /api/content
 */

const DEFAULT_STORIES = [
  { id: 1, title: "Scene 1: Festival Budaya", desc: "Budi dan Sisi pergi ke Festival Budaya Nusantara bersama ibu dan ayah. Ada banyak kebudayaan indah dari seluruh Indonesia!", icon: "🎡" },
  { id: 2, title: "Scene 2: Melihat Reog Pertama Kali", desc: "Tiba-tiba terdengar suara musik yang meriah! Budi kaget melihat topeng singa raksasa bermahkota bulu merak yang sangat megah. Itulah Reog Ponorogo!", icon: "🦁" },
  { id: 3, title: "Scene 3: Mengenal Kostum Reog", desc: "Penari Reog memakai kostum Singo Barong yang beratnya bisa mencapai 50 kilogram! Penari mengangkatnya hanya dengan menggunakan kekuatan gigi dan rahang.", icon: "👑" },
  { id: 4, title: "Scene 4: Mendengarkan Musik Tradisional", desc: "Suara gamelan, kendang, dan suling berbunyi nyaring. Ritme musiknya membuat semua orang ingin menari dengan gembira!", icon: "🪘" },
  { id: 5, title: "Scene 5: Berbincang dengan Penari", desc: "Budi bertanya kepada Pak Penari, 'Bagaimana cara melestarikan Reog?' Pak Penari tersenyum dan menjawab, 'Dengan rajin belajar dan mencintai budaya kita!'", icon: "🎭" },
  { id: 6, title: "Scene 6: Janji Menjaga Budaya", desc: "Budi dan Sisi berjanji akan terus mengenalkan kebudayaan Indonesia kepada teman-teman lainnya agar budaya Nusantara tetap lestari.", icon: "🤝" },
  { id: 7, title: "Scene 7: Lencana Sahabat Budaya", desc: "Selamat! Kamu telah membaca cerita hingga selesai dan berhak mendapatkan Lencana Sahabat Budaya!", icon: "🏆" }
];

const DEFAULT_QUIZZES = [
  { id: 1, question: "Reog berasal dari daerah mana ya?", options: ["Ponorogo", "Jakarta", "Bali"], answer: 0, icon: "🗺️" },
  { id: 2, question: "Reog Ponorogo merupakan apa?", options: ["Kesenian Tradisional", "Makanan", "Baju"], answer: 0, icon: "🦁" },
  { id: 3, question: "Mana perbuatan yang menjaga budaya kita?", options: ["Cinta Budaya", "Merusak Alat Musik", "Melupakan Tradisi"], answer: 0, icon: "❤️" },
  { id: 4, question: "Musik pengiring Reog dimainkan dengan alat apa?", options: ["Gamelan & Kendang", "Gitar Listrik", "Drum Modern"], answer: 0, icon: "🪘" },
  { id: 5, question: "Apa nama mahkota bulu merak di atas Reog?", options: ["Dadak Merak", "Topeng Kertas", "Topeng Kayu"], answer: 0, icon: "🦚" }
];

const DEFAULT_LEARN_CARDS = [
  { id: 1, title: "Reog Ponorogo", text: "Kesenian tradisional Indonesia yang sangat megah dan terkenal di dunia!", icon: "🦁" },
  { id: 2, title: "Asal Daerah", text: "Reog berasal dari Kabupaten Ponorogo, Jawa Timur, Indonesia.", icon: "🗺️" },
  { id: 3, title: "Singo Barong", text: "Kepala singa raksasa yang diangkat penari hanya dengan menggunakan gigi dan rahang!", icon: "👑" },
  { id: 4, title: "Dadak Merak", text: "Hiasan bulu merak yang sangat cantik dan megah berdiri tinggi di atas Reog.", icon: "🦚" },
  { id: 5, title: "Musik Pengiring", text: "Reog diiringi oleh instrumen gamelan, kendang, terompet, dan suling yang bersemangat!", icon: "🪘" }
];

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  res.status(200).json({
    appName: "Jelajah Budaya Nusantara - Petualangan Si Reog",
    version: "1.0.0",
    stories: DEFAULT_STORIES,
    quizzes: DEFAULT_QUIZZES,
    learnCards: DEFAULT_LEARN_CARDS
  });
};
