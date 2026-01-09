import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const connectionString = `${process.env.DATABASE_URL}`;

// Initialize Prisma Client with Neon adapter
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// CDN Upload function (adapted for Node.js environment)
async function uploadImageToCDN(filePath: string): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Create a Blob from the buffer for FormData
    const blob = new Blob([fileBuffer], { type: "image/png" });

    const formData = new FormData();
    formData.append("key", process.env.CDN_UPLOAD_API_KEY || "");
    formData.append("file", blob, fileName);

    const response = await fetch(process.env.CDN_UPLOAD_URL || "https://catgirlsare.sexy/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`CDN upload failed for ${fileName}: ${response.status}`);
      return null;
    }

    const result = await response.json();

    // Strip CDN base URL to store relative path
    const cdnBaseUrl = process.env.CDN_BASE_URL || "https://catgirlsare.sexy";
    let imageUrl = result.url || "";
    if (imageUrl.startsWith(cdnBaseUrl)) {
      imageUrl = imageUrl.substring(cdnBaseUrl.length);
    }

    console.log(`  ✓ Uploaded ${fileName} -> ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error);
    return null;
  }
}

// Image mapping: slug -> artifact image filename
const imageMap: Record<string, string> = {
  "future-of-react-server-components": "react_server_components_cover_1767996027724.png",
  "mastering-tailwind-css-gradients": "tailwind_gradients_cover_1767996044484.png",
  "why-typescript-is-essential-for-scale": "typescript_scale_cover_1767996061047.png",
  "optimizing-nextjs-for-performance": "nextjs_performance_cover_1767996081105.png",
  "rise-of-ai-in-software-development": "ai_development_cover_1767996098388.png",
  "joy-of-golden-retrievers": "golden_retriever_cover_1767996400128.png",
  "puppy-training-basics": "puppy_training_cover_1767996415962.png",
  "top-family-friendly-dog-breeds": "family_dogs_cover_1767996430287.png",
  "nutrition-guide-active-dogs": "dog_nutrition_cover_1767996446553.png",
  "decoding-canine-body-language": "dog_body_language_cover_1767996464606.png",
};

// Path to artifacts directory
const ARTIFACTS_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".gemini",
  "antigravity",
  "brain",
  "7c7d8180-4097-4a28-a656-b66f0297fa70"
);

async function main() {
  console.log("🌱 Start seeding...");
  console.log("PWD:", process.cwd());
  console.log("DATABASE_URL defined:", !!process.env.DATABASE_URL);
  console.log("CDN_UPLOAD_API_KEY defined:", !!process.env.CDN_UPLOAD_API_KEY);
  console.log("Artifacts dir:", ARTIFACTS_DIR);

  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    console.log("DB Host:", url.split("@")[1]?.split(":")[0]);
  }

  try {
    console.log("Connecting to Prisma...");
    await prisma.$connect();
    console.log("Connected!");

    // 1. Create Users
    const usersData = [
      {
        name: "Sarah Engineer",
        email: "sarah@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      {
        name: "Mike Design",
        email: "mike@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      },
      {
        name: "Alex Systems",
        email: "alex@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      {
        name: "Emily AI",
        email: "emily@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      },
      {
        name: "David Fast",
        email: "david@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      },
    ];

    const users = [];
    const passwordHash = await bcrypt.hash("password123", 10);

    for (const u of usersData) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          image: u.image,
          password: passwordHash,
          emailVerified: new Date(),
        },
      });
      console.log(`Created user: ${user.name}`);
      users.push(user);
    }

    // 2. Upload images and create posts
    console.log("\n📸 Uploading images to CDN...");

    const postsData = [
      {
        title: "The Future of React Server Components",
        slug: "future-of-react-server-components",
        excerpt:
          "Dive deep into how RSCs are changing the landscape of web development, from performance gains to architectural shifts.",
        content: `## The Paradigm Shift

React Server Components (RSC) represent one of the biggest shifts in the React ecosystem since hooks. They allow us to move data-fetching logic to the server while keeping our interactive components on the client.

### Key Benefits

1. **Zero Bundle Size**: Server components aren't sent to the client.
2. **Direct Backend Access**: Query databases directly.
3. **Automatic Code Splitting**: Client components are only loaded when needed.

This architecture simplifies how we build full-stack applications.`,
        published: true,
        authorIndex: 0,
      },
      {
        title: "Mastering Tailwind CSS Gradients",
        slug: "mastering-tailwind-css-gradients",
        excerpt:
          "Gradients can add depth and vibrancy to your UI. Learn how to create stunning, fluid gradients using Tailwind CSS utilities.",
        content: `## Unleashing Color

Gradients are more than just background-image properties. With Tailwind CSS, you can compose complex, multi-stop gradients directly in your HTML.

### The Basics

\`\`\`html
<div class="bg-gradient-to-r from-cyan-500 to-blue-500">
  Hello Gradient
</div>
\`\`\`

### Advanced Techniques

- **Text Gradients**: Use \`bg-clip-text\` to apply gradients to text.
- **Animation**: Animate hue-rotate filters for dynamic effects.
- **Overlay**: Use \`bg-gradient-to-t\` from black to transparent for text legibility over images.

Let's make our UIs pop!`,
        published: true,
        authorIndex: 1,
      },
      {
        title: "Why TypeScript is Essential for Scale",
        slug: "why-typescript-is-essential-for-scale",
        excerpt:
          "As codebases grow, maintainability becomes the bottleneck. See how TypeScript's type system acts as a guardrail for large teams.",
        content: `## Safety at Scale

JavaScript is flexible, but that flexibility becomes a liability in large systems. TypeScript adds a layer of safety that catches errors at compile time, not runtime.

### Refactoring with Confidence

Imagine renaming a core interface property. In JS, you grep and pray. In TS, you rename symbols and the compiler guides you to every usage.

> "Strict null checks are the single biggest value add of TypeScript."

Invest in your types, and your future self will thank you.`,
        published: true,
        authorIndex: 2,
      },
      {
        title: "Optimizing Next.js for Maximum Performance",
        slug: "optimizing-nextjs-for-performance",
        excerpt:
          "Speed is a feature. Learn technique like image optimization, script loading strategies, and dynamic imports to speed up your Next.js app.",
        content: `## Core Web Vitals

Performance isn't just a feeling; it's a metric. Google's Core Web Vitals define the success of your user experience.

### Checklist

- [x] **Next/Image**: Use it for automatic resizing and format selection.
- [x] **Font Optimization**: Use \`next/font\` to zero-out CLS.
- [x] **Dynamic Imports**: Lazy load heavy components.
- [x] **Metadata**: Preconnect to critical origins.

Performance engineering is an iterative process. Measure, optimize, repeat.`,
        published: true,
        authorIndex: 4,
      },
      {
        title: "The Rise of AI in Software Development",
        slug: "rise-of-ai-in-software-development",
        excerpt:
          "AI assistants are no longer just a novelty. They are becoming integral to the coding workflow. What does this mean for the developer role?",
        content: `## Augmented Intelligence

Tools like GitHub Copilot and Google's Gemini are transforming how we write code. It's not about replacing developers, but augmenting their capabilities.

### The New Workflow

1. **Ideation**: AI Brainstorming
2. **Boilerplate**: AI Generation
3. **Review**: Human Expertise
4. **Refinement**: Collaborative Iteration

The developer of the future is an architect of logic, guiding AI implementation details.`,
        published: true,
        authorIndex: 3,
      },
      {
        title: "The Joy of Golden Retrievers",
        slug: "joy-of-golden-retrievers",
        excerpt:
          "Golden Retrievers are more than just pets; they are loyal companions that bring endless joy. Learn why they are the perfect family dog.",
        content: `## A Heart of Gold

Golden Retrievers are renowned for their friendly and tolerant attitude. They are great family pets and essentially poor guard dogs because they love everyone.

### Why They Shine

- **Temperament**: Gentle, affectionate, and intelligent.
- **Trainability**: Eager to please and easy to train.
- **Energy**: They love to play and retrieve!

If you want a dog that smiles with its whole body, get a Goldie.`,
        published: true,
        authorIndex: 0,
      },
      {
        title: "Puppy Training 101: The Basics",
        slug: "puppy-training-basics",
        excerpt:
          "Start your puppy off on the right paw. Essential tips for obedience training, socialization, and building a strong bond.",
        content: `## Set Them Up for Success

Training starts the moment you bring your puppy home. Consistency and positive reinforcement are key.

### Core Commands

1. **Sit**: The foundation of impulse control.
2. **Stay**: Essential for safety.
3. **Recall**: Coming when called can save their life.

Remember, training is a lifelong journey, not a destination.`,
        published: true,
        authorIndex: 1,
      },
      {
        title: "Top 5 Family-Friendly Dog Breeds",
        slug: "top-family-friendly-dog-breeds",
        excerpt:
          "Looking for the perfect addition to your family? Detailed guide to the best breeds for households with children.",
        content: `## Finding the Perfect Match

Not all dogs are created equal when it comes to family life. You need a breed that is patient, sturdy, and loving.

### The Contenders

- **Labrador Retriever**: The classic family dog.
- **Beagle**: Merry and gentle, great for active kids.
- **Bulldog**: Calm and courageous, great for smaller homes.

Choose a breed that fits your family's lifestyle and energy level.`,
        published: true,
        authorIndex: 2,
      },
      {
        title: "Nutrition Guide for Active Dogs",
        slug: "nutrition-guide-active-dogs",
        excerpt:
          "Fueling your furry athlete. Understanding the nutritional needs of high-energy dogs to keep them healthy and performing their best.",
        content: `## Fueling the Machine

Active dogs burn a lot of calories. Their diet needs to support muscle repair and sustained energy.

### Macro Breakdown

- **Protein**: Building blocks for muscle. Look for named meat sources.
- **Fats**: The primary energy source for endurance.
- **Carbs**: Quick energy for bursts of activity.

Fresh, whole foods are always the gold standard. Consult your vet for a tailored plan.`,
        published: true,
        authorIndex: 4,
      },
      {
        title: "Decoding Canine Body Language",
        slug: "decoding-canine-body-language",
        excerpt:
          "What is your dog trying to tell you? Learn to read the subtle signs of comfort, stress, and happiness in your dog's posture.",
        content: `## Speaking Dog

Dogs communicate constantly, but they don't use words. They use their ears, tail, eyes, and posture.

### Key Signals

- **Tail Wag**: Doesn't always mean happy! Look at the height and speed.
- **Whale Eye**: Showing the whites of the eyes indicates stress.
- **Play Bow**: "I'm friendly and want to play!"

Understanding these signals prevents bites and builds trust.`,
        published: true,
        authorIndex: 3,
      },
    ];

    // Upload images and create posts
    for (const p of postsData) {
      const author = users[p.authorIndex] || users[0];

      // Check if we have an image to upload for this post
      let coverImageUrl: string | null = null;
      const imageFileName = imageMap[p.slug];

      if (imageFileName) {
        const imagePath = path.join(ARTIFACTS_DIR, imageFileName);
        if (fs.existsSync(imagePath)) {
          coverImageUrl = await uploadImageToCDN(imagePath);
        } else {
          console.log(`  ⚠ Image not found: ${imagePath}`);
        }
      }

      // Delete existing post first to allow update
      await prisma.post.deleteMany({ where: { slug: p.slug } });

      const post = await prisma.post.create({
        data: {
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          coverImage: coverImageUrl,
          published: p.published,
          authorId: author.id,
        },
      });
      console.log(`Created post: ${post.title}`);
    }

    console.log("\n✅ Seeding finished.");
  } catch (e) {
    console.error("Seeding failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
