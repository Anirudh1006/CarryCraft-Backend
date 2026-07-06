// Seeds the database with sample bag products for testing/demo purposes.
// Run with: node seed.js
// (Run this from inside the CarryCraft backend folder, with MongoDB running.)

const mongoose = require("mongoose");
const config = require("config");
const productModel = require("./models/product-model");

const sampleProducts = [
  {
    name: "Weekender Canvas Duffel",
    price: 2999,
    discount: 15,
    category: "Duffel",
    stock: 20,
    description: "A roomy waxed-canvas duffel with leather trim, built for short trips and gym days alike.",
    bgcolor: "#DDD3BC",
    panelcolor: "#EDE6D6",
    textcolor: "#211D1A",
    image: "https://placehold.co/500x500/DDD3BC/4E2F1B?text=Weekender+Duffel",
  },
  {
    name: "Everyday Leather Tote",
    price: 3499,
    discount: 0,
    category: "Tote",
    stock: 15,
    description: "Full-grain leather tote with an internal zip pocket, sized for a laptop and a change of clothes.",
    bgcolor: "#C9BBA0",
    panelcolor: "#EDE6D6",
    textcolor: "#211D1A",
    image: "https://placehold.co/500x500/C9BBA0/4E2F1B?text=Leather+Tote",
  },
  {
    name: "Trailhead Backpack",
    price: 2799,
    discount: 10,
    category: "Backpack",
    stock: 30,
    description: "Water-resistant 22L backpack with a padded laptop sleeve and daisy-chain webbing.",
    bgcolor: "#48583F",
    panelcolor: "#EDE6D6",
    textcolor: "#F7F3EA",
    image: "https://placehold.co/500x500/48583F/F7F3EA?text=Trailhead+Backpack",
  },
  {
    name: "Commuter Sling Bag",
    price: 1499,
    discount: 5,
    category: "Sling",
    stock: 40,
    description: "Compact cross-body sling with a quick-access front pocket, made for a phone, wallet, and keys.",
    bgcolor: "#A8461F",
    panelcolor: "#EDE6D6",
    textcolor: "#F7F3EA",
    image: "https://placehold.co/500x500/A8461F/F7F3EA?text=Sling+Bag",
  },
  {
    name: "Heritage Briefcase",
    price: 4999,
    discount: 0,
    category: "Briefcase",
    stock: 10,
    description: "Structured leather briefcase with brass hardware, built for the office and the airport alike.",
    bgcolor: "#6B4226",
    panelcolor: "#EDE6D6",
    textcolor: "#F7F3EA",
    image: "https://placehold.co/500x500/6B4226/F7F3EA?text=Heritage+Briefcase",
  },
  {
    name: "Traveler Wheeled Suitcase",
    price: 6999,
    discount: 20,
    category: "Suitcase",
    stock: 8,
    description: "Hard-shell 24-inch suitcase with 360° spinner wheels and a TSA-approved lock.",
    bgcolor: "#211D1A",
    panelcolor: "#EDE6D6",
    textcolor: "#F7F3EA",
    image: "https://placehold.co/500x500/211D1A/F7F3EA?text=Wheeled+Suitcase",
  },
  {
    name: "Mini Crossbody Purse",
    price: 1299,
    discount: 0,
    category: "Purse",
    stock: 25,
    description: "A small structured crossbody in pebbled leather, just big enough for the essentials.",
    bgcolor: "#B08D57",
    panelcolor: "#EDE6D6",
    textcolor: "#211D1A",
    image: "https://placehold.co/500x500/B08D57/211D1A?text=Mini+Purse",
  },
  {
    name: "Studio Laptop Sleeve",
    price: 999,
    discount: 0,
    category: "Sleeve",
    stock: 50,
    description: "Padded felt-and-leather sleeve that fits most 14-16 inch laptops.",
    bgcolor: "#EDE6D6",
    panelcolor: "#DDD3BC",
    textcolor: "#211D1A",
    image: "https://placehold.co/500x500/EDE6D6/6B4226?text=Laptop+Sleeve",
  },
];

async function seed() {
  await mongoose.connect(`${config.get("MONGODB_URL")}/bagshop`);
  console.log("Connected to MongoDB");

  const existingCount = await productModel.countDocuments();
  if (existingCount > 0) {
    console.log(`There are already ${existingCount} products in the database.`);
    console.log("Seeding anyway will add these as new, additional products.");
  }

  const inserted = await productModel.insertMany(sampleProducts);
  console.log(`Inserted ${inserted.length} sample products.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
