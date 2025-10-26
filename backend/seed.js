const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LearningContent = require('./models/LearningContent');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const learningData = [
  {
    title: 'How to Make Organic Compost at Home',
    category: 'MANURE_MAKING',
    content: `
      <h3>Materials Needed:</h3>
      <ul>
        <li>Kitchen waste (vegetable peels, fruit scraps)</li>
        <li>Dry leaves</li>
        <li>Cow dung</li>
        <li>Water</li>
        <li>A large container or pit</li>
      </ul>
      <h3>Steps:</h3>
      <ol>
        <li>Collect kitchen waste in a container</li>
        <li>Add equal parts dry leaves</li>
        <li>Mix in cow dung (1:10 ratio)</li>
        <li>Keep moist and turn every 3 days</li>
        <li>Ready in 45-60 days</li>
        <li>Dark, soil-like compost ready!</li>
      </ol>
      <h3>Benefits:</h3>
      <ul>
        <li>Improves soil fertility</li>
        <li>Enhances water retention</li>
        <li>Reduces dependency on chemical fertilizers</li>
        <li>Environment friendly</li>
      </ul>
    `,
    language: 'en',
    difficulty: 'BEGINNER',
    estimatedReadTime: 5,
    tags: ['compost', 'organic', 'beginner', 'home-farming', 'waste-management']
  },
  {
    title: 'Vermicompost Production Guide',
    category: 'MANURE_MAKING',
    content: `
      <h3>What is Vermicompost?</h3>
      <p>Vermicompost is organic fertilizer made by decomposing organic waste using earthworms.</p>
      
      <h3>Materials Required:</h3>
      <ul>
        <li>Earthworms (Eisenia fetida or Red Wigglers)</li>
        <li>Plastic or wooden box</li>
        <li>Coco peat or soil</li>
        <li>Organic waste</li>
      </ul>
      
      <h3>Process:</h3>
      <ol>
        <li>Spread coco peat layer in box</li>
        <li>Add earthworms (500-1000 per sq meter)</li>
        <li>Gradually add organic waste</li>
        <li>Maintain moisture (60-70%)</li>
        <li>Keep in shade</li>
        <li>Ready in 45-50 days</li>
      </ol>
      
      <h3>Quality:</h3>
      <p>NPK content: 2-1-1, Organic Carbon: 15-20%, pH: 6.5-7.5</p>
    `,
    language: 'en',
    difficulty: 'INTERMEDIATE',
    estimatedReadTime: 8,
    tags: ['vermicompost', 'earthworms', 'organic', 'advanced']
  },
  {
    title: 'Rice Cultivation: Fertilizer Management',
    category: 'FERTILIZER_GUIDE',
    crop: 'Rice',
    content: `
      <h3>Recommended NPK Ratio:</h3>
      <p>120:60:40 kg/hectare for high-yielding varieties</p>
      
      <h3>Fertilizer Schedule:</h3>
      <ul>
        <li><strong>At sowing:</strong> DAP 60 kg + MOP 20 kg</li>
        <li><strong>After 21 days:</strong> Urea 60 kg</li>
        <li><strong>After 42 days:</strong> Urea 40 kg + MOP 20 kg</li>
      </ul>
      
      <h3>Organic Alternatives:</h3>
      <ul>
        <li>Vermicompost: 5 tons/hectare</li>
        <li>Green manure (Dhaincha): Before sowing</li>
        <li>Azotobacter: 5 kg/hectare</li>
      </ul>
    `,
    language: 'en',
    difficulty: 'INTERMEDIATE',
    estimatedReadTime: 6,
    tags: ['rice', 'npk', 'fertilizer', 'schedule']
  },
  {
    title: 'Wheat Farming Best Practices',
    category: 'CROP_GUIDE',
    crop: 'Wheat',
    content: `
      <h3>Soil Preparation:</h3>
      <p>Loamy or clay loam soil is most suitable. pH 6-7.5 is ideal.</p>
      
      <h3>Sowing Time:</h3>
      <p>Second week of November to first week of December (North India)</p>
      
      <h3>Seed Rate:</h3>
      <p>100-125 kg/hectare for normal conditions</p>
      
      <h3>Irrigation:</h3>
      <ul>
        <li>First irrigation: 20-25 days after sowing (CRI stage)</li>
        <li>Second irrigation: Late tillering stage</li>
        <li>Third irrigation: Flowering stage</li>
        <li>Fourth irrigation: Milk stage</li>
        <li>Fifth irrigation: Dough stage</li>
      </ul>
    `,
    language: 'en',
    difficulty: 'INTERMEDIATE',
    estimatedReadTime: 7,
    tags: ['wheat', 'cultivation', 'irrigation', 'best-practices']
  },
  {
    title: 'Integrated Pest Management (IPM)',
    category: 'PEST_MANAGEMENT',
    content: `
      <h3>What is IPM?</h3>
      <p>IPM is a combination of biological, chemical and physical methods for pest control.</p>
      
      <h3>IPM Principles:</h3>
      <ol>
        <li>Monitoring and identification</li>
        <li>Preventive measures</li>
        <li>Control methods</li>
        <li>Evaluation</li>
      </ol>
      
      <h3>Biological Control:</h3>
      <ul>
        <li>Ladybird beetle: For aphids</li>
        <li>Trichogramma: For borers</li>
        <li>Chrysopa: For whitefly</li>
      </ul>
      
      <h3>Organic Pesticides:</h3>
      <ul>
        <li>Neem oil: 5ml/liter</li>
        <li>Garlic-chili solution</li>
        <li>Cow urine</li>
      </ul>
    `,
    language: 'en',
    difficulty: 'ADVANCED',
    estimatedReadTime: 10,
    tags: ['ipm', 'pest-control', 'organic', 'biological']
  }
];

const productData = [
  {
    name: 'Premium Organic Vermicompost',
    description: 'High-quality vermicompost enriched with essential nutrients suitable for all crops.',
    category: 'ORGANIC_MANURE',
    price: 250,
    mrp: 350,
    unit: 'KG',
    quantity: 25,
    suitableFor: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Vegetables'],
    composition: 'NPK 2-1-1, Organic Carbon 15%, Moisture 25%, Beneficial microbes',
    applicationMethod: 'Mix well with soil. 5-10 tons/hectare.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 25,
    stock: 500,
    manufacturer: 'Bharat Organics',
    isOrganic: true,
    isCertified: true,
    certifications: ['Organic India', 'FSSAI', 'FCO'],
    rating: 4.5,
    reviewCount: 127
  },
  {
    name: 'Bio-NPK Complex Fertilizer',
    description: 'Environment-friendly NPK fertilizer for all crops.',
    category: 'ORGANIC_FERTILIZER',
    price: 450,
    mrp: 600,
    unit: 'KG',
    quantity: 25,
    suitableFor: ['All Crops'],
    composition: 'Nitrogen 12%, Phosphorus 32%, Potassium 16%, Organic matter 20%',
    applicationMethod: 'At sowing or as top dressing. 100-150 kg/hectare.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 20,
    stock: 300,
    manufacturer: 'Green Valley Agro',
    isOrganic: true,
    isCertified: true,
    certifications: ['FSSAI', 'FCO'],
    rating: 4.3,
    reviewCount: 89
  },
  {
    name: 'Neem-based Organic Pesticide',
    description: 'Natural pest control solution derived from neem. Safe for all crops.',
    category: 'BIO_PESTICIDE',
    price: 180,
    mrp: 250,
    unit: 'LITER',
    quantity: 1,
    suitableFor: ['Rice', 'Cotton', 'Vegetables', 'Fruits'],
    composition: 'Azadirachtin 1500 ppm, Neem oil 95%',
    applicationMethod: 'Dilute 5ml per liter of water and spray on affected areas.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 30,
    stock: 200,
    manufacturer: 'Neem India Ltd',
    isOrganic: true,
    isCertified: true,
    certifications: ['CIB', 'Organic India'],
    rating: 4.7,
    reviewCount: 156
  },
  {
    name: 'Cow Dung Manure',
    description: 'Traditional cow dung manure improving soil structure and fertility.',
    category: 'ORGANIC_MANURE',
    price: 150,
    mrp: 200,
    unit: 'KG',
    quantity: 40,
    suitableFor: ['All Crops', 'Kitchen Garden'],
    composition: 'Organic Carbon 12%, NPK 0.5-0.3-0.5, Moisture 30%',
    applicationMethod: '15-20 tons/hectare 2-3 weeks before sowing.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 15,
    stock: 800,
    manufacturer: 'Local Dairy Cooperative',
    isOrganic: true,
    isCertified: false,
    rating: 4.2,
    reviewCount: 234
  },
  {
    name: 'Azotobacter Biofertilizer',
    description: 'Nitrogen-fixing bacteria reducing chemical fertilizer need by 25%.',
    category: 'ORGANIC_FERTILIZER',
    price: 120,
    mrp: 150,
    unit: 'KG',
    quantity: 1,
    suitableFor: ['Rice', 'Wheat', 'Sugarcane', 'Cotton'],
    composition: 'Azotobacter chroococcum 10^8 CFU/gm',
    applicationMethod: 'Seed treatment or soil application. 5 kg/hectare.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 50,
    stock: 150,
    manufacturer: 'BioTech Solutions',
    isOrganic: true,
    isCertified: true,
    certifications: ['FCO', 'ICAR'],
    rating: 4.6,
    reviewCount: 98
  },
  {
    name: 'Hybrid Wheat Seeds HD-3086',
    description: 'High-yielding wheat variety. 50-55 quintals/hectare.',
    category: 'SEEDS',
    price: 800,
    mrp: 1000,
    unit: 'KG',
    quantity: 10,
    suitableFor: ['Wheat'],
    composition: 'Germination: 85%, Physical Purity: 98%',
    applicationMethod: '100-125 kg/hectare. Sowing in Nov-Dec.',
    governmentSubsidyEligible: true,
    subsidyPercentage: 50,
    stock: 100,
    manufacturer: 'National Seeds Corporation',
    isOrganic: false,
    isCertified: true,
    certifications: ['NSC', 'ICAR Approved'],
    rating: 4.8,
    reviewCount: 67
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await LearningContent.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Insert learning content
    console.log('📚 Inserting learning content...');
    const insertedContent = await LearningContent.insertMany(learningData);
    console.log(`✅ ${insertedContent.length} learning content items seeded\n`);
    
    // Insert products
    console.log('🛒 Inserting products...');
    const insertedProducts = await Product.insertMany(productData);
    console.log(`✅ ${insertedProducts.length} products seeded\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Summary:');
    console.log(`   - Learning Content: ${insertedContent.length} items`);
    console.log(`   - Products: ${insertedProducts.length} items`);
    console.log('\n🚀 You can now start using the Learning Module and Shop!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
